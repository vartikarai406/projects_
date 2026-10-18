import {
  User,
  Workflow,
  WorkflowRun,
  PlannedTask,
  PlanResponse,
  ApprovalRequest,
  ToolRegistration,
  Artifact,
  AuditLog,
  DashboardStats
} from '../types';

const API_BASE = '/api';

export class ApiService {
  getToken(): string | null {
    return localStorage.getItem('autopilot_token');
  }

  setToken(token: string) {
    localStorage.setItem('autopilot_token', token);
  }

  clearToken() {
    localStorage.removeItem('autopilot_token');
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      let errorMsg = `API Error ${res.status}: ${res.statusText}`;
      try {
        const errorJson = await res.json();
        if (errorJson.detail) errorMsg = errorJson.detail;
      } catch (_) {}
      throw new Error(errorMsg);
    }

    return res.json() as Promise<T>;
  }

  // Auth
  async login(email: string, password: string): Promise<{ access_token: string; user: User }> {
    const data = await this.request<{ access_token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.access_token);
    return data;
  }

  async register(email: string, password: string, full_name: string): Promise<{ access_token: string; user: User }> {
    const data = await this.request<{ access_token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name }),
    });
    this.setToken(data.access_token);
    return data;
  }

  async getMe(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  // Planner
  async generatePlan(goal: string, provider: string = 'auto'): Promise<PlanResponse> {
    return this.request<PlanResponse>('/planner/generate', {
      method: 'POST',
      body: JSON.stringify({ goal, provider }),
    });
  }

  // Workflows
  async listWorkflows(isTemplate?: boolean): Promise<Workflow[]> {
    const query = isTemplate !== undefined ? `?is_template=${isTemplate}` : '';
    return this.request<Workflow[]>(`/workflows${query}`);
  }

  async createWorkflow(payload: {
    title: string;
    description?: string;
    natural_language_goal: string;
    is_template?: boolean;
    tags?: string[];
  }): Promise<Workflow> {
    return this.request<Workflow>('/workflows', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getWorkflow(id: string): Promise<Workflow> {
    return this.request<Workflow>(`/workflows/${id}`);
  }

  async cloneWorkflow(id: string): Promise<Workflow> {
    return this.request<Workflow>(`/workflows/${id}/clone`, {
      method: 'POST',
    });
  }

  async deleteWorkflow(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/workflows/${id}`, {
      method: 'DELETE',
    });
  }

  // Execution Runs
  async launchRun(workflow_id: string, tasks?: PlannedTask[]): Promise<WorkflowRun> {
    return this.request<WorkflowRun>('/runs', {
      method: 'POST',
      body: JSON.stringify({ workflow_id, tasks }),
    });
  }

  async getRun(id: string): Promise<WorkflowRun> {
    return this.request<WorkflowRun>(`/runs/${id}`);
  }

  async cancelRun(id: string): Promise<WorkflowRun> {
    return this.request<WorkflowRun>(`/runs/${id}/cancel`, {
      method: 'POST',
    });
  }

  async retryRun(id: string): Promise<WorkflowRun> {
    return this.request<WorkflowRun>(`/runs/${id}/retry`, {
      method: 'POST',
    });
  }

  // Approvals
  async listApprovals(status?: string): Promise<ApprovalRequest[]> {
    const query = status ? `?status=${status}` : '';
    return this.request<ApprovalRequest[]>(`/approvals${query}`);
  }

  async decideApproval(id: string, decision: 'approved' | 'rejected', comments?: string): Promise<ApprovalRequest> {
    return this.request<ApprovalRequest>(`/approvals/${id}/decide`, {
      method: 'POST',
      body: JSON.stringify({ decision, comments }),
    });
  }

  // Tools
  async listTools(): Promise<ToolRegistration[]> {
    return this.request<ToolRegistration[]>('/tools');
  }

  async updateTool(name: string, payload: { is_enabled?: boolean; is_mock?: boolean; requires_approval_default?: boolean }): Promise<ToolRegistration> {
    return this.request<ToolRegistration>(`/tools/${name}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  // Artifacts
  getArtifactDownloadUrl(id: string): string {
    return `${API_BASE}/artifacts/${id}/download`;
  }

  async getArtifactContent(id: string): Promise<string> {
    const token = this.getToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}/artifacts/${id}/content`, { headers });
    if (!res.ok) throw new Error("Could not fetch artifact content");
    return res.text();
  }

  // Audit Logs
  async getAuditLogs(runId?: string, eventType?: string): Promise<AuditLog[]> {
    const params = new URLSearchParams();
    if (runId) params.append('run_id', runId);
    if (eventType) params.append('event_type', eventType);
    return this.request<AuditLog[]>(`/audit-logs?${params.toString()}`);
  }

  // Dashboard Stats
  async getDashboardStats(): Promise<DashboardStats> {
    return this.request<DashboardStats>('/stats/dashboard');
  }
}

export const api = new ApiService();
