import sys
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base, get_db
from app.main import app
from app.seed_data import seed_complete_database
from app.services.auth_service import create_access_token

# Use SQLite in-memory or temporary test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_resqnet.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    seed_complete_database(db)
    db.close()
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def db():
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    try:
        yield session
    finally:
        session.close()
        transaction.rollback()
        connection.close()

@pytest.fixture
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture
def admin_headers():
    token = create_access_token({"sub": "admin", "role": "ADMIN", "user_id": 1})
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def verifier_headers():
    token = create_access_token({"sub": "verifier", "role": "INCIDENT_VERIFIER", "user_id": 2})
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def coordinator_headers():
    token = create_access_token({"sub": "coordinator", "role": "EMERGENCY_COORDINATOR", "user_id": 3})
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def citizen_headers():
    token = create_access_token({"sub": "citizen", "role": "COMMUNITY_REPORTER", "user_id": 6})
    return {"Authorization": f"Bearer {token}"}
