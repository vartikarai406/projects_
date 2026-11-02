export type UserRole =
  | 'ADMIN'
  | 'INCIDENT_VERIFIER'
  | 'EMERGENCY_COORDINATOR'
  | 'RESOURCE_MANAGER'
  | 'VOLUNTEER'
  | 'COMMUNITY_REPORTER';

export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone_number?: string;
  is_active: boolean;
  created_at: string;
}

export type IncidentCategory =
  | 'FLOOD'
  | 'EARTHQUAKE'
  | 'MEDICAL'
  | 'STRUCTURAL_COLLAPSE'
  | 'FIRE'
  | 'STORM'
  | 'HAZMAT'
  | 'OTHER';

export type VerificationStatus =
  | 'UNVERIFIED'
  | 'VERIFIED'
  | 'DUPLICATE'
  | 'REJECTED'
  | 'RESOLVED';

export type UrgencyLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type PriorityLevel = 'P1_CRITICAL' | 'P2_HIGH' | 'P3_MEDIUM' | 'P4_LOW';

export interface ScoreFactorBreakdown {
  score: number;
  priority_level: string;
  threat_to_life?: { value: boolean; points: number; weight: number };
  people_affected?: { count: number; points: number; weight: number };
  urgency?: { level: string; points: number; weight: number };
  time_elapsed?: { hours_elapsed: number; points: number; weight: number };
  assistance_complexity?: { requested_count: number; points: number; weight: number };
  disclaimer?: string;
}

export interface Incident {
  id: number;
  incident_code: string;
  title: string;
  category: IncidentCategory;
  description: string;
  latitude: number;
  longitude: number;
  location_name: string;
  zone_name: string;
  people_affected: number;
  requested_assistance: string[];
  immediate_threat_to_life: boolean;
  urgency_level: UrgencyLevel;
  priority_score: number;
  priority_level: PriorityLevel;
  score_breakdown: ScoreFactorBreakdown;
  verification_status: VerificationStatus;
  reporter_id?: number;
  reporter_contact?: string;
  image_url?: string;
  is_duplicate: boolean;
  duplicate_of_id?: number;
  potential_duplicate_ids: number[];
  created_at: string;
  updated_at: string;
}

export type ResourceType =
  | 'DRINKING_WATER'
  | 'FOOD_PACKETS'
  | 'FIRST_AID_KITS'
  | 'MEDICINES'
  | 'RESCUE_EQUIPMENT'
  | 'TRANSPORT_VEHICLES'
  | 'TEMPORARY_SHELTER';

export interface InventoryItem {
  id: number;
  depot_id: number;
  resource_type: ResourceType;
  unit: string;
  quantity_available: number;
  quantity_reserved: number;
  minimum_threshold: number;
  last_restocked_at: string;
  updated_at: string;
}

export interface Depot {
  id: number;
  name: string;
  code: string;
  latitude: number;
  longitude: number;
  address: string;
  contact_person: string;
  phone: string;
  capacity_sqm: number;
  is_active: boolean;
  inventory_items: InventoryItem[];
}

export type PlanStatus = 'DRAFT' | 'APPROVED' | 'DISPATCHED' | 'COMPLETED' | 'CANCELLED';

export interface AllocationItem {
  id: number;
  plan_id: number;
  incident_id: number;
  depot_id?: number;
  resource_type: ResourceType;
  quantity: number;
  distance_km: number;
  estimated_transit_mins: number;
  status: 'PENDING' | 'IN_TRANSIT' | 'DELIVERED' | 'UNFULFILLED';
  incident_code?: string;
  incident_title?: string;
  depot_name?: string;
}

export interface ComparisonReport {
  baseline_algorithm: string;
  optimized_algorithm: string;
  baseline_travel_distance_km: number;
  optimized_travel_distance_km: number;
  distance_reduction_pct: number;
  baseline_unmet_demand_items: number;
  optimized_unmet_demand_items: number;
  unmet_demand_reduction: number;
  baseline_avg_response_mins: number;
  optimized_avg_response_mins: number;
  time_saved_mins: number;
  execution_time_ms: number;
  explanation: string;
}

export interface AllocationPlan {
  id: number;
  plan_code: string;
  scenario_name: string;
  created_by_id?: number;
  algorithm_used: string;
  total_items_allocated: number;
  total_unmet_demand: number;
  total_travel_cost_km: number;
  response_time_estimate_mins: number;
  execution_time_ms: number;
  comparison_metrics: ComparisonReport;
  status: PlanStatus;
  created_at: string;
  items: AllocationItem[];
}

export type ShelterStatus = 'OPEN' | 'FULL' | 'CLOSING' | 'CLOSED';

export interface Shelter {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  max_capacity: number;
  current_occupancy: number;
  facilities: string[];
  status: ShelterStatus;
  contact_phone: string;
  last_updated_at: string;
  occupancy_percentage: number;
}

export type VolunteerAvailability = 'AVAILABLE' | 'DEPLOYED' | 'RESTING' | 'UNAVAILABLE';

export interface VolunteerAssignment {
  id: number;
  volunteer_id: number;
  incident_id?: number;
  shelter_id?: number;
  depot_id?: number;
  task_description: string;
  role_type: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  assigned_at: string;
  completed_at?: string;
}

export interface Volunteer {
  id: number;
  user_id?: number;
  full_name: string;
  phone: string;
  email: string;
  skills: string[];
  availability_status: VolunteerAvailability;
  current_latitude?: number;
  current_longitude?: number;
  created_at: string;
  active_assignment?: VolunteerAssignment;
}

export interface RoadHazard {
  id: number;
  road_name: string;
  hazard_type: 'FLOODED' | 'DEBRIS_BLOCKED' | 'BRIDGE_COLLAPSE' | 'LANDSLIDE' | 'DOWNED_POWERLINE';
  severity: 'WARNING' | 'PASSABLE_4X4' | 'IMPASSABLE';
  start_lat: number;
  start_lon: number;
  end_lat: number;
  end_lon: number;
  buffer_radius_meters: number;
  source_authority: string;
  is_active: boolean;
  reported_at: string;
}

export interface RouteResponse {
  origin_name: string;
  destination_name: string;
  total_distance_km: number;
  estimated_time_mins: number;
  avoids_hazards: boolean;
  hazards_avoided_count: number;
  hazards_affecting_direct_path: string[];
  route_geometry: [number, number][];
  route_source: string;
  uncertainty_level: string;
  last_updated: string;
  disclaimer: string;
}

export interface DemandForecast {
  id: number;
  zone_name: string;
  resource_type: ResourceType;
  forecast_horizon_hours: number;
  predicted_demand: number;
  confidence_interval_lower: number;
  confidence_interval_upper: number;
  current_depot_stock: number;
  projected_shortage: number;
  model_name: string;
  r2_score: number;
  generated_at: string;
}

export interface AuditEvent {
  id: number;
  timestamp: string;
  user_id?: number;
  username: string;
  role: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  client_ip: string;
  details: Record<string, any>;
}

export interface SystemSetting {
  id: number;
  key: string;
  value: Record<string, any>;
  description?: string;
  updated_at: string;
}
