from typing import Dict, Any, Tuple
from pathlib import Path
from app.core.config import settings

class OutputVerifier:
    @staticmethod
    def verify_tool_output(tool_name: str, output: Any) -> Tuple[bool, str]:
        """
        Rigorous verification of tool execution results.
        Returns (is_valid, reason).
        """
        if output is None:
            return False, "Output is null/empty."
            
        if not isinstance(output, dict):
            return False, f"Expected dict output, received {type(output).__name__}."

        if tool_name == "read_file":
            if "content" not in output:
                return False, "Missing 'content' key in file read output."
            return True, "File content verified."

        elif tool_name == "summarize_document":
            if "executive_summary" not in output or not output["executive_summary"]:
                return False, "Executive summary was not produced."
            return True, "Document summary verified."

        elif tool_name == "analyze_csv":
            if "row_count" not in output or output["row_count"] < 0:
                return False, "Invalid or missing row count in CSV analytics output."
            return True, "Dataset metrics verified."

        elif tool_name == "generate_chart":
            art_name = output.get("artifact_name")
            if not art_name:
                return False, "Chart artifact filename missing."
            expected_file = settings.DATA_PATH / art_name
            if not expected_file.exists() or expected_file.stat().st_size == 0:
                return False, f"Generated chart file '{art_name}' not found on disk or 0 bytes."
            return True, "Chart image artifact confirmed on disk."

        elif tool_name == "web_research":
            if "results" not in output or not isinstance(output["results"], list):
                return False, "Missing research results collection."
            return True, "Web research entries verified."

        elif tool_name == "generate_report":
            md_art = output.get("markdown_artifact")
            if not md_art:
                return False, "Report markdown artifact missing."
            # Verify file exists on disk
            rel_name = Path(md_art).name
            expected_md = settings.DATA_PATH / rel_name
            if not expected_md.exists() or expected_md.stat().st_size == 0:
                return False, f"Report markdown file '{rel_name}' missing or empty on disk."
            return True, "Report artifacts verified on disk."

        elif tool_name == "draft_email":
            if output.get("status") != "drafted" or not output.get("body"):
                return False, "Email draft generation failed or empty."
            return True, "Email draft structure verified."

        elif tool_name == "send_email":
            if output.get("status") != "sent":
                return False, "Email dispatch status is not 'sent'."
            if not output.get("message_id"):
                return False, "Missing transmission receipt message_id."
            return True, "Authenticated email delivery receipt confirmed."

        elif tool_name == "call_api":
            if "status_code" not in output:
                return False, "Missing HTTP status code."
            return True, "API response verified."

        return True, "General output verified."

verifier = OutputVerifier()
