export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface PlannedTask {
  id?: string;
  step_number: number;
  title: string;
  description: string;
  tool_name: string;
  tool_input: Record<string, any>;
  dependencies: number[];
  requires_approval: boolean;
  approval_reason?: string | null;
}

export interface PlanResponse {
  title: string;
  description: string;
  tasks: PlannedTask[];
  estimated_duration_sec: number;
  approval_needed_count: number;
  safety_notes: string[];
}

export interface Task {
  id: string;
  run_id: string;
  title: string;
  description?: string;
  step_number: number;
  tool_name: string;
  tool_input: Record<string, any>;
  tool_output?: Record<string, any> | null;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'awaiting_approval' | 'skipped';
  dependencies: number[];
  requires_approval: boolean;
  approval_reason?: string | null;
  retry_count: number;
  max_retries: number;
  timeout_seconds: number;
  duration_ms: number;
  started_at?: string | null;
  completed_at?: string | null;
  error_message?: string | null;
}

export interface ApprovalRequest {
  id: string;
  run_id: string;
  task_id: string;
  action_type: string;
  action_description: string;
  payload_summary: Record<string, any>;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  decided_at?: string | null;
  decided_by?: string | null;
  comments?: string | null;
}

export interface Artifact {
  id: string;
  run_id: string;
  task_id?: string | null;
  name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  meta_info: Record<string, any>;
  created_at: string;
}

export interface WorkflowRun {
  id: string;
  workflow_id: string;
  user_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'awaiting_approval' | 'cancelled';
  started_at?: string | null;
  completed_at?: string | null;
  error_message?: string | null;
  execution_context: Record<string, any>;
  final_report?: Record<string, any> | null;
  created_at: string;
  tasks: Task[];
  approvals: ApprovalRequest[];
  artifacts: Artifact[];
}

export interface Workflow {
  id: string;
  user_id: string;
  title: string;
  description: string;
  natural_language_goal: string;
  is_template: boolean;
  status: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface ToolRegistration {
  id: string;
  name: string;
  display_name: string;
  category: string;
  description: string;
  parameters_schema: Record<string, any>;
  requires_approval_default: boolean;
  is_mock: boolean;
  is_enabled: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id?: string | null;
  run_id?: string | null;
  task_id?: string | null;
  event_type: string;
  details: Record<string, any>;
  ip_address?: string | null;
  timestamp: string;
}

export interface DashboardStats {
  total_workflows: number;
  total_runs: number;
  completed_runs: number;
  failed_runs: number;
  pending_approvals: number;
  success_rate: number;
  average_duration_sec: number;
  recent_runs: WorkflowRun[];
}
