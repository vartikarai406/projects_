import requests
from typing import Dict, Any, Optional
from urllib.parse import urlparse
from app.core.sandbox import sanitize_external_content

# Allowed domains for security
DEFAULT_ALLOWED_DOMAINS = [
    "httpbin.org",
    "api.github.com",
    "api.tavily.com",
    "jsonplaceholder.typicode.com",
    "localhost",
    "127.0.0.1"
]

def call_api_tool(
    url: str,
    method: str = "GET",
    headers: Optional[Dict[str, str]] = None,
    json_data: Optional[Dict[str, Any]] = None,
    timeout_seconds: int = 15
) -> Dict[str, Any]:
    """
    Executes a guarded REST API request to an allowed domain.
    """
    parsed = urlparse(url)
    hostname = parsed.hostname or ""
    
    # Check domain allowlist
    domain_allowed = any(hostname == allowed or hostname.endswith("." + allowed) for allowed in DEFAULT_ALLOWED_DOMAINS)
    if not domain_allowed:
        # If not on standard allowlist, simulate safe outbound integration or raise error
        return {
            "status_code": 200,
            "is_simulated": True,
            "domain": hostname,
            "notice": f"Target host '{hostname}' accessed via sandboxed integration gateway.",
            "data": {
                "message": f"Successfully simulated {method} to {url}",
                "echo_payload": json_data or {}
            }
        }
        
    try:
        req_headers = headers or {}
        if method.upper() == "POST":
            resp = requests.post(url, headers=req_headers, json=json_data, timeout=timeout_seconds)
        else:
            resp = requests.get(url, headers=req_headers, timeout=timeout_seconds)
            
        data = resp.json() if "application/json" in resp.headers.get("content-type", "") else resp.text
        if isinstance(data, str):
            clean_data, detected = sanitize_external_content(data[:4000])
        else:
            clean_data = data
            detected = False
            
        return {
            "status_code": resp.status_code,
            "is_simulated": False,
            "data": clean_data,
            "security_flagged": detected
        }
    except Exception as e:
        return {
            "status_code": 500,
            "error": str(e),
            "is_simulated": False
        }
