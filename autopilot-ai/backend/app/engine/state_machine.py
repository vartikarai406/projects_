from typing import Set

class WorkflowRunState:
    PENDING = "pending"
    RUNNING = "running"
    AWAITING_APPROVAL = "awaiting_approval"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class TaskState:
    PENDING = "pending"
    RUNNING = "running"
    AWAITING_APPROVAL = "awaiting_approval"
    COMPLETED = "completed"
    FAILED = "failed"
    SKIPPED = "skipped"

RUN_TRANSITIONS = {
    WorkflowRunState.PENDING: {WorkflowRunState.RUNNING, WorkflowRunState.CANCELLED},
    WorkflowRunState.RUNNING: {WorkflowRunState.AWAITING_APPROVAL, WorkflowRunState.COMPLETED, WorkflowRunState.FAILED, WorkflowRunState.CANCELLED},
    WorkflowRunState.AWAITING_APPROVAL: {WorkflowRunState.RUNNING, WorkflowRunState.FAILED, WorkflowRunState.CANCELLED},
    WorkflowRunState.FAILED: {WorkflowRunState.RUNNING, WorkflowRunState.CANCELLED},
    WorkflowRunState.CANCELLED: set(),
    WorkflowRunState.COMPLETED: set()
}

def can_transition_run(current_state: str, new_state: str) -> bool:
    allowed: Set[str] = RUN_TRANSITIONS.get(current_state, set())
    return new_state in allowed
