import re
import os
from pathlib import Path
from typing import Tuple
from app.core.config import settings

# Suspicious prompt injection phrases to sanitize / flag
INJECTION_PATTERNS = [
    re.compile(r"ignore\s+(all\s+)?(previous|above)\s+instructions", re.IGNORECASE),
    re.compile(r"system\s*prompt\s*override", re.IGNORECASE),
    re.compile(r"you\s+are\s+now\s+in\s+developer\s+mode", re.IGNORECASE),
    re.compile(r"<\s*script[^>]*>.*?<\s*/\s*script\s*>", re.IGNORECASE | re.DOTALL),
    re.compile(r"\[SYSTEM\]|\[AGENT\]|\[ADMIN\]", re.IGNORECASE),
    re.compile(r"curl\s+http|\bwget\s+http", re.IGNORECASE),
]

def sanitize_external_content(content: str) -> Tuple[str, bool]:
    """
    Sanitizes external content retrieved from websites or user documents.
    Returns (sanitized_content, was_injection_detected).
    """
    detected = False
    cleaned = content
    for pattern in INJECTION_PATTERNS:
        if pattern.search(cleaned):
            detected = True
            cleaned = pattern.sub("[REDACTED_SECURITY_RISK]", cleaned)
    return cleaned, detected

def resolve_safe_path(requested_path: str, must_exist: bool = False) -> Path:
    """
    Resolves a requested path and guarantees it resides strictly within WORKSPACE_ROOT.
    Raises PermissionError or FileNotFoundError if validation fails.
    """
    # Clean string
    cleaned = requested_path.strip().replace("\\", "/")
    
    # Check for direct path traversal tricks
    if ".." in cleaned:
        # Check normalized path
        pass
    
    workspace_root = settings.WORKSPACE_ROOT.resolve()
    
    # If absolute or relative, resolve relative to workspace_root if not starting from root
    if os.path.isabs(cleaned):
        target = Path(cleaned).resolve()
    else:
        target = (workspace_root / cleaned).resolve()
    
    # Ensure containment
    try:
        target.relative_to(workspace_root)
    except ValueError:
        raise PermissionError(f"Access Denied: Path '{requested_path}' escapes sandbox boundary '{workspace_root}'.")
    
    if must_exist and not target.exists():
        raise FileNotFoundError(f"Requested file does not exist: {target.name}")
        
    return target

def mask_sensitive_keys(data: str) -> str:
    """
    Redacts keys or tokens from logs and outputs.
    """
    patterns = [
        (r"(AIza[0-9A-Za-z-_]{35})", r"AIza...[REDACTED]"),
        (r"(sk-[a-zA-Z0-9]{32,})", r"sk-...[REDACTED]"),
        (r"(tvly-[a-zA-Z0-9]{20,})", r"tvly-...[REDACTED]"),
        (r"(Bearer\s+)[A-Za-z0-9\-\._~\+\/]+=*", r"\1[REDACTED_TOKEN]"),
    ]
    res = data
    for pat, repl in patterns:
        res = re.sub(pat, repl, res)
    return res
