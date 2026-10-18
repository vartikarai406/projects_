from typing import Dict, Any, List, Optional
from app.core.config import settings
from app.tools.registry import registry
from app.schemas.workflow import PlanResponse, GoalPlanRequest
from app.schemas.task import PlannedTask
from app.planner.llm_provider import GeminiLLMProvider, OpenAIProvider, HeuristicPlanner

class PlannerService:
    def __init__(self):
        self.heuristic_planner = HeuristicPlanner()

    def generate_plan(self, request: GoalPlanRequest) -> PlanResponse:
        tools = registry.list_tools()
        tools_metadata = [
            {
                "name": t.name,
                "display_name": t.display_name,
                "category": t.category,
                "description": t.description,
                "requires_approval_default": t.requires_approval_default
            }
            for t in tools
        ]

        provider_choice = request.provider or "auto"
        raw_plan = None

        if provider_choice in ["auto", "gemini"] and settings.GEMINI_API_KEY:
            gemini = GeminiLLMProvider(settings.GEMINI_API_KEY)
            raw_plan = gemini.generate_plan(request.goal, tools_metadata)

        if not raw_plan and provider_choice in ["auto", "openai"] and settings.OPENAI_API_KEY:
            openai_p = OpenAIProvider(settings.OPENAI_API_KEY)
            raw_plan = openai_p.generate_plan(request.goal, tools_metadata)

        # Fallback to intelligent deterministic heuristic planner
        if not raw_plan:
            raw_plan = self.heuristic_planner.generate_plan(request.goal, tools_metadata)

        # Validate and enrich the plan
        tasks: List[PlannedTask] = []
        approval_count = 0
        
        for idx, t_raw in enumerate(raw_plan.get("tasks", []), start=1):
            tool_name = t_raw.get("tool_name", "")
            tool_def = registry.get_tool(tool_name)
            
            # If tool requires approval or prompt demands it
            requires_approval = t_raw.get("requires_approval", False)
            approval_reason = t_raw.get("approval_reason")
            
            if tool_def and tool_def.requires_approval_default:
                requires_approval = True
                if not approval_reason:
                    approval_reason = f"Consequential action '{tool_def.display_name}' requires human sign-off."

            if requires_approval:
                approval_count += 1

            # Sanitize dependencies (ensure they are integers < current step)
            raw_deps = t_raw.get("dependencies", [])
            valid_deps = [d for d in raw_deps if isinstance(d, int) and d < idx]

            tasks.append(PlannedTask(
                step_number=idx,
                title=t_raw.get("title", f"Step {idx}"),
                description=t_raw.get("description", ""),
                tool_name=tool_name if tool_def else "summarize_document",
                tool_input=t_raw.get("tool_input", {}),
                dependencies=valid_deps,
                requires_approval=requires_approval,
                approval_reason=approval_reason
            ))

        return PlanResponse(
            title=raw_plan.get("title", f"Workflow: {request.goal[:30]}"),
            description=raw_plan.get("description", "Generated execution plan"),
            tasks=tasks,
            estimated_duration_sec=raw_plan.get("estimated_duration_sec", len(tasks) * 5),
            approval_needed_count=approval_count,
            safety_notes=raw_plan.get("safety_notes", [])
        )

planner_service = PlannerService()
