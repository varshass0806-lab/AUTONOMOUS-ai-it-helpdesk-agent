export interface Employee {
  id: number;
  employee_id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  manager: string;
  laptop_asset_tag: string;
  os: string;
  phone: string;
  status: 'Active' | 'On Leave' | 'Suspended';
}

export interface ITTicket {
  id: number;
  ticket_id: string;
  employee_id: string;
  employee_name: string;
  title: string;
  description: string;
  category: 'Hardware' | 'Network' | 'Software' | 'Security' | 'Workplace Apps' | 'DevOps';
  priority: 'P1-Critical' | 'P2-High' | 'P3-Medium' | 'P4-Low';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  assigned_team: string;
  created_at: string;
  resolved_at: string | null;
}

export interface SystemLog {
  id: number;
  timestamp: string;
  event_type: string;
  actor: string;
  details: string;
  severity: 'INFO' | 'WARN' | 'ERROR';
  status: string;
}

export interface ReActStep {
  phase: 'PERCEIVE' | 'PLAN' | 'ACT' | 'ITERATE';
  thought: string;
  tool_name?: string;
  tool_input?: Record<string, any>;
  tool_output?: string;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent' | 'system';
  content: string;
  timestamp: string;
  thought_steps?: ReActStep[];
  employee_context?: Partial<Employee>;
}

export interface ServiceTelemetry {
  id: string;
  name: string;
  category: string;
  endpoints: string[];
  status: 'Operational' | 'Degraded' | 'Outage';
  latency_ms: number;
  capacity: string;
  incident: string | null;
  notes: string;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  category: string;
  tags: string[];
  content: string;
}
