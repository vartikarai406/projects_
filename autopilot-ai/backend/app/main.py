from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.database import Base, engine, SessionLocal
from app.models import *
from app.api.auth import router as auth_router
from app.api.workflows import router as workflows_router
from app.api.planner import router as planner_router
from app.api.execution import router as execution_router
from app.api.approvals import router as approvals_router
from app.api.tools import router as tools_router
from app.api.artifacts import router as artifacts_router
from app.api.audit import router as audit_router
from app.api.stats import router as stats_router
from app.tools.registry import registry
from app.core.security import get_password_hash

def init_db_and_seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # 1. Seed Default Admin User
        admin = db.query(User).filter(User.email == "admin@autopilot.ai").first()
        if not admin:
            admin = User(
                email="admin@autopilot.ai",
                hashed_password=get_password_hash("admin123"),
                full_name="Admin Director",
                role="admin"
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)

        # Seed Demo Analyst User
        analyst = db.query(User).filter(User.email == "analyst@autopilot.ai").first()
        if not analyst:
            analyst = User(
                email="analyst@autopilot.ai",
                hashed_password=get_password_hash("analyst123"),
                full_name="Data Analyst",
                role="analyst"
            )
            db.add(analyst)
            db.commit()

        # 2. Sync Tools with ToolRegistration table
        for tool_def in registry.list_tools():
            existing = db.query(ToolRegistration).filter(ToolRegistration.name == tool_def.name).first()
            if not existing:
                t = ToolRegistration(
                    name=tool_def.name,
                    display_name=tool_def.display_name,
                    category=tool_def.category,
                    description=tool_def.description,
                    parameters_schema=tool_def.parameters_schema,
                    requires_approval_default=tool_def.requires_approval_default,
                    is_mock=tool_def.is_mock,
                    is_enabled=True
                )
                db.add(t)
        db.commit()

        # 3. Seed Default Workflow Templates if none exist
        tpl_count = db.query(Workflow).filter(Workflow.is_template == True).count()
        if tpl_count == 0:
            t1 = Workflow(
                user_id=admin.id,
                title="Sales CSV Analytics & Executive Briefing",
                description="End-to-end audit: parses sales datasets, generates visual performance charts, conducts market benchmark research, and compiles a comprehensive PDF/Markdown executive report.",
                natural_language_goal="Analyze sales records in CSV, generate visual breakdown charts, benchmark against current market trends, and produce an executive PDF report.",
                is_template=True,
                tags=["Sales", "Analytics", "Executive Report", "PDF"]
            )
            t2 = Workflow(
                user_id=admin.id,
                title="Competitive Intelligence & Market Research",
                description="Synthesizes online competitive analysis, extracts key positioning vectors, and compiles an intelligence briefing.",
                natural_language_goal="Conduct in-depth market research on enterprise workflow automation competitors, extract pricing benchmarks, and produce a strategic brief.",
                is_template=True,
                tags=["Research", "Market Intelligence", "Competitor"]
            )
            t3 = Workflow(
                user_id=admin.id,
                title="Customer Feedback Sentiment & Stakeholder Alert",
                description="Processes customer satisfaction feedback, identifies sentiment risks, generates visual distributions, and drafts an executive alert email requiring explicit sign-off.",
                natural_language_goal="Analyze customer feedback CSV, plot rating distributions, compile summary findings, and prepare an alert email for management sign-off.",
                is_template=True,
                tags=["Customer Success", "Email Alert", "Human Approval", "Safety"]
            )
            db.add_all([t1, t2, t3])
            db.commit()

    finally:
        db.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB schema and seed baseline items
    init_db_and_seed()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Intelligent Workflow Automation Platform with DAG Planner, Output Verification, and Human Approval Guards.",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_router, prefix=settings.API_V1_PREFIX)
app.include_router(workflows_router, prefix=settings.API_V1_PREFIX)
app.include_router(planner_router, prefix=settings.API_V1_PREFIX)
app.include_router(execution_router, prefix=settings.API_V1_PREFIX)
app.include_router(approvals_router, prefix=settings.API_V1_PREFIX)
app.include_router(tools_router, prefix=settings.API_V1_PREFIX)
app.include_router(artifacts_router, prefix=settings.API_V1_PREFIX)
app.include_router(audit_router, prefix=settings.API_V1_PREFIX)
app.include_router(stats_router, prefix=settings.API_V1_PREFIX)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION
    }
