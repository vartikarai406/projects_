const API_BASE = '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('resqnet_token');
}

export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem('resqnet_token', token);
  } else {
    localStorage.removeItem('resqnet_token');
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `HTTP Error ${response.status}: ${response.statusText}`;
    try {
      const errJson = await response.json();
      if (errJson.detail) {
        errorMsg = typeof errJson.detail === 'string' ? errJson.detail : JSON.stringify(errJson.detail);
      }
    } catch (_) {}
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Auth
  login: (username: string, password: string) =>
    request<any>('/auth/token', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  getMe: () => request<any>('/auth/me'),
  switchRole: (targetRole: string) =>
    request<any>('/auth/switch-role', {
      method: 'POST',
      body: JSON.stringify({ target_role: targetRole }),
    }),

  // Incidents
  getIncidents: (params?: {
    status?: string;
    category?: string;
    priority?: string;
    zone?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status_filter', params.status);
    if (params?.category) query.append('category_filter', params.category);
    if (params?.priority) query.append('priority_filter', params.priority);
    if (params?.zone) query.append('zone_filter', params.zone);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<any[]>(`/incidents${qs}`);
  },
  getIncident: (id: number) => request<any>(`/incidents/${id}`),
  createIncident: (data: any) =>
    request<any>('/incidents', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  verifyIncident: (id: number, data: { new_status: string; notes: string; confidence_rating: number; duplicate_of_id?: number }) =>
    request<any>(`/incidents/${id}/verify`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  addIncidentUpdate: (id: number, data: { comment: string; status_change?: string }) =>
    request<any>(`/incidents/${id}/updates`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  checkDuplicate: (lat: number, lon: number, category: string) =>
    request<any>(`/incidents/check-duplicate?lat=${lat}&lon=${lon}&category=${category}`, {
      method: 'POST',
    }),
  syncOfflineIncidents: (reports: any[]) =>
    request<any>('/incidents/sync', {
      method: 'POST',
      body: JSON.stringify({ reports }),
    }),
  uploadIncidentImage: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const token = getAuthToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/incidents/upload-image`, {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!res.ok) throw new Error('Image upload failed.');
    return res.json();
  },

  // Inventory & Depots
  getDepots: () => request<any[]>('/inventory/depots'),
  createDepot: (data: any) =>
    request<any>('/inventory/depots', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getInventoryItems: (depotId?: number) =>
    request<any[]>(`/inventory/items${depotId ? `?depot_id=${depotId}` : ''}`),
  restockItem: (depotId: number, data: { resource_type: string; quantity_to_add: number; reason?: string }) =>
    request<any>(`/inventory/restock?depot_id=${depotId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getInventorySummary: () => request<any>('/inventory/summary'),

  // Allocation Optimizer
  runOptimization: (data: { scenario_name: string; algorithm: string; max_distance_km?: number; include_unverified?: boolean }) =>
    request<any>('/allocation/optimize', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getAllocationPlans: () => request<any[]>('/allocation/plans'),
  getAllocationPlan: (id: number) => request<any>(`/allocation/plans/${id}`),
  updatePlanStatus: (id: number, data: { status: string; notes?: string }) =>
    request<any>(`/allocation/plans/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  getLatestComparison: () => request<any>('/allocation/latest-comparison'),

  // Shelters
  getShelters: () => request<any[]>('/shelters'),
  createShelter: (data: any) =>
    request<any>('/shelters', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateOccupancy: (id: number, data: { new_occupancy: number; notes?: string }) =>
    request<any>(`/shelters/${id}/occupancy`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  getShelterOccupancyLogs: (id: number) => request<any[]>(`/shelters/${id}/occupancy-logs`),

  // Volunteers
  getVolunteers: (params?: { skill?: string; status?: string }) => {
    const q = new URLSearchParams();
    if (params?.skill) q.append('skill', params.skill);
    if (params?.status) q.append('status_filter', params.status);
    const qs = q.toString() ? `?${q.toString()}` : '';
    return request<any[]>(`/volunteers${qs}`);
  },
  registerVolunteer: (data: any) =>
    request<any>('/volunteers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  assignVolunteer: (data: { volunteer_id: number; incident_id?: number; shelter_id?: number; depot_id?: number; task_description: string; role_type: string }) =>
    request<any>('/volunteers/assign', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  completeVolunteerAssignment: (id: number) =>
    request<any>(`/volunteers/assignments/${id}/complete`, {
      method: 'PUT',
    }),

  // Routing
  calculateRoute: (data: { origin_name: string; origin_lat: number; origin_lon: number; destination_name: string; destination_lat: number; destination_lon: number; avoid_hazards: boolean }) =>
    request<any>('/routes/calculate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getHazards: (activeOnly = true) => request<any[]>(`/routes/hazards?active_only=${activeOnly}`),
  reportHazard: (data: any) =>
    request<any>('/routes/hazards', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  clearHazard: (id: number) =>
    request<any>(`/routes/hazards/${id}/deactivate`, {
      method: 'PUT',
    }),

  // Forecasts
  getForecasts: (zoneName?: string, horizonHours?: number) => {
    const q = new URLSearchParams();
    if (zoneName) q.append('zone_name', zoneName);
    if (horizonHours) q.append('horizon_hours', horizonHours.toString());
    const qs = q.toString() ? `?${q.toString()}` : '';
    return request<any[]>(`/forecasts${qs}`);
  },
  generateForecast: (data: { zone_name?: string; horizon_hours: number }) =>
    request<any>('/forecasts/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getForecastMetrics: () => request<any>('/forecasts/metrics'),

  // Audit & Settings
  getAuditLogs: (action?: string) =>
    request<any[]>(`/audit/logs${action ? `?action=${action}` : ''}`),
  getSystemSettings: () => request<any[]>('/audit/settings'),
  updateSystemSetting: (key: string, data: { value: any; description?: string }) =>
    request<any>(`/audit/settings/${key}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Scenarios
  resetDemoScenario: () =>
    request<any>('/scenarios/reset-demo', {
      method: 'POST',
    }),
  getScenarioInfo: () => request<any>('/scenarios/info'),
};
