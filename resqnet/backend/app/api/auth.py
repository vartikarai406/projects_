from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserOut, LoginRequest, TokenResponse, RoleSwitchRequest
from app.services.auth_service import hash_password, verify_password, create_access_token, get_current_user, require_roles
from app.services.audit_logger import log_audit_event

router = APIRouter(prefix="/auth", tags=["Authentication & RBAC"])

@router.post("/register", response_model=UserOut)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter((User.username == user_in.username) | (User.email == user_in.email)).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email is already registered."
        )

    user = User(
        username=user_in.username,
        email=user_in.email,
        hashed_password=hash_password(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role,
        phone_number=user_in.phone_number
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    log_audit_event(db, action="USER_REGISTERED", resource_type="USER", resource_id=str(user.id), user=user)
    return user

@router.post("/token", response_model=TokenResponse)
def login(login_req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == login_req.username).first()
    if not user or not verify_password(login_req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password."
        )

    token = create_access_token(data={"sub": user.username, "role": user.role.value, "user_id": user.id})
    return TokenResponse(access_token=token, token_type="bearer", user=UserOut.model_validate(user))

@router.get("/me", response_model=UserOut)
def get_current_user_profile(user: User = Depends(get_current_user)):
    return user

@router.post("/switch-role", response_model=TokenResponse)
def switch_role(
    req: RoleSwitchRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Demo/Evaluation utility: Allows active testers to switch persona roles
    (ADMIN, EMERGENCY_COORDINATOR, INCIDENT_VERIFIER, RESOURCE_MANAGER, VOLUNTEER, COMMUNITY_REPORTER)
    to inspect role-based views and permissions.
    """
    current_user.role = req.target_role
    db.commit()
    db.refresh(current_user)

    new_token = create_access_token(data={"sub": current_user.username, "role": current_user.role.value, "user_id": current_user.id})
    log_audit_event(
        db,
        action="ROLE_SWITCHED",
        resource_type="USER",
        resource_id=str(current_user.id),
        user=current_user,
        details={"new_role": req.target_role.value}
    )
    return TokenResponse(access_token=new_token, token_type="bearer", user=UserOut.model_validate(current_user))
