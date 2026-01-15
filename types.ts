export enum AgentState {
  IDLE = 'IDLE',
  MONITORING = 'MONITORING',
  ANALYZING = 'ANALYZING',
  PLANNING = 'PLANNING',
  EXECUTING = 'EXECUTING',
  VERIFYING = 'VERIFYING',
  RESOLVED = 'RESOLVED',
  FAILED = 'FAILED'
}

export type FixAction = 'REVERT' | 'HOTFIX';

export interface IncidentArtifact {
  incident_id: string;
  detected_at: string;
  root_cause_analysis: string;
  thought_signature: string; // Hash of the logic/RCA
  bad_commit_hash: string | null;
  reproduction_script: string;
  fix_action: FixAction | null;
  verification_result: boolean | null;
  status_message: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  service: string;
  message: string;
}

export interface GeminiAnalysisResponse {
  root_cause: string;
  bad_commit: string;
  fix_type: FixAction;
  repro_script: string;
  reasoning_summary: string;
}

// Simulating the Pydantic model response structure from the backend
export interface AgentResponseSchema {
  root_cause_analysis: string;
  bad_commit_hash: string;
  recommended_action: FixAction;
  reproduction_code: string;
}
