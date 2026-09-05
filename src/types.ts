/**
 * TrustMesh Core Types
 */

export interface SensorReading {
  pressure: number; // PSI (normal: 45 - 50 PSI)
  flowRate: number; // L/min (normal: 120 - 130 L/min)
  temperature: number; // °C (normal: 65 - 72 °C)
  valvePosition: number; // 0 - 100% current physical actuator position
  timestamp: number;
  isSpoofed?: boolean;
  spoofReason?: string;
  previousReading?: {
    pressure: number;
    timestamp: number;
  };
}

export interface AgentCommand {
  action: 'set_valve';
  target_percent: number;
  reasoning: string;
  modelUsed?: string;
  rawJson?: string;
  latencyMs?: number;
}

export interface PolicyRuleResult {
  ruleId: 'RANGE_BOUNDS' | 'RATE_OF_CHANGE' | 'SENSOR_DYNAMICS_SPOOF' | 'PHYSICAL_BOUNDS';
  name: string;
  passed: boolean;
  reason: string;
  limitDescription: string;
  actualValue: string;
}

export interface PolicyVerdict {
  verdict: 'ALLOWED' | 'BLOCKED';
  reason: string;
  violatedRuleId?: string;
  ruleResults: PolicyRuleResult[];
  evaluatedAt: number;
  actuatorExecutedPosition: number; // If ALLOWED -> target_percent, if BLOCKED -> retained prior position
}

export interface AuditLogEntry {
  id: string;
  sequence: number;
  timestamp: number;
  sensors: {
    pressure: number;
    flowRate: number;
    temperature: number;
    valvePosition: number;
    isSpoofed?: boolean;
  };
  command: AgentCommand;
  verdict: 'ALLOWED' | 'BLOCKED';
  reason: string;
  violatedRuleId?: string;
  actuatorPositionBefore: number;
  actuatorPositionAfter: number;
  previousHash: string;
  hash: string;
  isCorruptedForDemo?: boolean;
}

export interface ChainVerificationResult {
  isValid: boolean;
  totalEntries: number;
  verifiedEntries: number;
  corruptedIndex?: number;
  corruptedId?: string;
  verifiedAt: number;
  message: string;
}
