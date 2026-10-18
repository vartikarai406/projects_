from typing import Dict, Any, Callable, List, Optional
from app.tools.file_tools import read_file_tool, summarize_document_tool
from app.tools.data_tools import analyze_csv_tool, generate_chart_tool
from app.tools.search_tools import web_research_tool
from app.tools.report_tools import generate_report_tool
from app.tools.email_tools import draft_email_tool, send_email_tool
from app.tools.api_adapter import call_api_tool

class ToolDefinition:
    def __init__(
        self,
        name: str,
        display_name: str,
        category: str,
        description: str,
        func: Callable,
        parameters_schema: Dict[str, Any],
        requires_approval_default: bool = False,
        is_mock: bool = False
    ):
        self.name = name
        self.display_name = display_name
        self.category = category
        self.description = description
        self.func = func
        self.parameters_schema = parameters_schema
        self.requires_approval_default = requires_approval_default
        self.is_mock = is_mock

class ToolRegistry:
    def __init__(self):
        self._tools: Dict[str, ToolDefinition] = {}
        self._register_default_tools()

    def register(self, tool: ToolDefinition):
        self._tools[tool.name] = tool

    def get_tool(self, name: str) -> Optional[ToolDefinition]:
        return self._tools.get(name)

    def list_tools(self) -> List[ToolDefinition]:
        return list(self._tools.values())

    def execute(self, name: str, params: Dict[str, Any], is_approved: bool = False) -> Dict[str, Any]:
        tool = self.get_tool(name)
        if not tool:
            raise ValueError(f"Tool '{name}' is not registered in the tool registry.")

        # If tool requires approval and is not approved
        if tool.requires_approval_default and not is_approved:
            raise PermissionError(f"Action '{tool.display_name}' requires explicit human approval before execution.")

        # If send_email, pass approved flag
        if name == "send_email":
            params["approved"] = is_approved

        return tool.func(**params)

    def _register_default_tools(self):
        # 1. Read File
        self.register(ToolDefinition(
            name="read_file",
            display_name="Secure File Reader",
            category="File Management",
            description="Safely reads text, logs, or structured files within the authorized workspace.",
            func=read_file_tool,
            parameters_schema={
                "type": "object",
                "properties": {
                    "file_path": {"type": "string", "description": "Relative path to file in workspace"}
                },
                "required": ["file_path"]
            }
        ))

        # 2. Summarize Document
        self.register(ToolDefinition(
            name="summarize_document",
            display_name="Document Summarizer",
            category="Intelligence",
            description="Extracts executive summary, key highlights, and structure from a document.",
            func=summarize_document_tool,
            parameters_schema={
                "type": "object",
                "properties": {
                    "file_path": {"type": "string", "description": "Relative path to file"},
                    "focus_area": {"type": "string", "description": "Specific focus of the summary"}
                },
                "required": ["file_path"]
            }
        ))

        # 3. Analyze CSV
        self.register(ToolDefinition(
            name="analyze_csv",
            display_name="CSV / Excel Analytics",
            category="Data Processing",
            description="Calculates summary statistics, distributions, row counts, and numerical aggregates.",
            func=analyze_csv_tool,
            parameters_schema={
                "type": "object",
                "properties": {
                    "file_path": {"type": "string", "description": "Relative path to CSV/Excel"},
                    "target_column": {"type": "string", "description": "Optional column to focus analysis"}
                },
                "required": ["file_path"]
            }
        ))

        # 4. Generate Chart
        self.register(ToolDefinition(
            name="generate_chart",
            display_name="Visual Chart Generator",
            category="Data Processing",
            description="Generates visual bar, line, or pie chart images persisted as artifacts.",
            func=generate_chart_tool,
            parameters_schema={
                "type": "object",
                "properties": {
                    "file_path": {"type": "string", "description": "Path to CSV dataset"},
                    "x_column": {"type": "string", "description": "Category or X-axis column"},
                    "y_column": {"type": "string", "description": "Value or Y-axis column"},
                    "chart_type": {"type": "string", "enum": ["bar", "line", "pie", "scatter"], "default": "bar"},
                    "title": {"type": "string", "description": "Chart title"}
                },
                "required": ["file_path", "x_column", "y_column"]
            }
        ))

        # 5. Web Research
        self.register(ToolDefinition(
            name="web_research",
            display_name="Web Research Engine",
            category="Research",
            description="Searches online sources or verified research knowledge base for market & competitive data.",
            func=web_research_tool,
            parameters_schema={
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Research query or topic"}
                },
                "required": ["query"]
            }
        ))

        # 6. Generate Report
        self.register(ToolDefinition(
            name="generate_report",
            display_name="Report Generator (PDF & Markdown)",
            category="Reporting",
            description="Compiles findings into downloadable Markdown and styled PDF executive reports.",
            func=generate_report_tool,
            parameters_schema={
                "type": "object",
                "properties": {
                    "title": {"type": "string", "description": "Report title"},
                    "executive_summary": {"type": "string", "description": "Executive abstract"},
                    "sections": {"type": "array", "description": "List of report sections"},
                    "chart_artifact_path": {"type": "string", "description": "Optional chart artifact to embed"}
                },
                "required": ["title", "executive_summary", "sections"]
            }
        ))

        # 7. Draft Email
        self.register(ToolDefinition(
            name="draft_email",
            display_name="Email Drafter",
            category="Communication",
            description="Prepares a targeted email summary with recipient and subject. Non-consequential.",
            func=draft_email_tool,
            parameters_schema={
                "type": "object",
                "properties": {
                    "recipient": {"type": "string", "description": "Target email address"},
                    "subject": {"type": "string", "description": "Email subject line"},
                    "body": {"type": "string", "description": "Email body content"}
                },
                "required": ["recipient", "subject", "body"]
            }
        ))

        # 8. Send Email (Consequential!)
        self.register(ToolDefinition(
            name="send_email",
            display_name="Email Dispatcher (Approval Required)",
            category="Communication",
            description="Dispatches external email notification. Consequential action strictly requiring human approval.",
            func=send_email_tool,
            parameters_schema={
                "type": "object",
                "properties": {
                    "recipient": {"type": "string", "description": "Target email address"},
                    "subject": {"type": "string", "description": "Email subject line"},
                    "body": {"type": "string", "description": "Email body content"}
                },
                "required": ["recipient", "subject", "body"]
            },
            requires_approval_default=True
        ))

        # 9. Call External API
        self.register(ToolDefinition(
            name="call_api",
            display_name="API Integration Gateway",
            category="Integration",
            description="Interacts with external REST endpoints with domain allowlisting and rate limits.",
            func=call_api_tool,
            parameters_schema={
                "type": "object",
                "properties": {
                    "url": {"type": "string", "description": "Target URL"},
                    "method": {"type": "string", "enum": ["GET", "POST"], "default": "GET"}
                },
                "required": ["url"]
            }
        ))

registry = ToolRegistry()
