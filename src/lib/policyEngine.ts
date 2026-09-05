/**
 * TrustMesh Deterministic Policy Engine
 * 
 * CRITICAL SAFETY ENVELOPE:
 * This module is executed strictly in deterministic code (NEVER an LLM).
 * It enforces hard safety invariants before any command can be transmitted
 * to the physical PLC / valve actuator.
 */

import { AgentCommand, PolicyRuleResult, PolicyVerdict, SensorReading } from '../types';

export const SAFETY_LIMITS = {
  MIN_VALVE_PERCENT: 0,
  MAX_VALVE_PERCENT: 85,
  MAX_SINGLE_STEP_DELTA: 30, // Max 30 percentage points in a single step
  MAX_PRESSURE_DELTA_PERCENT: 0.40, // 40% pressure change limit
  MAX_SPOOF_WINDOW_MS: 2000, // 2 seconds window
  PHYSICAL_MIN_PRESSURE: 5, // PSI
  PHYSICAL_MAX_PRESSURE: 110, // PSI
  PHYSICAL_MIN_TEMP: 10, // °C
  PHYSICAL_MAX_TEMP: 105, // °C
} as const;

export function evaluatePolicy(
  command: AgentCommand,
  currentSensor: SensorReading,
  previousSensor?: SensorReading
): PolicyVerdict {
  const currentValve = currentSensor.valvePosition;
  const target = command.target_percent;
  const ruleResults: PolicyRuleResult[] = [];

  // 1. Range Bounds Check: Reject target_percent above 85 or below 0
  const rangePassed = target >= SAFETY_LIMITS.MIN_VALVE_PERCENT && target <= SAFETY_LIMITS.MAX_VALVE_PERCENT;
  ruleResults.push({
    ruleId: 'RANGE_BOUNDS',
    name: 'Actuator Envelope Boundary',
    passed: rangePassed,
    limitDescription: `Must be between ${SAFETY_LIMITS.MIN_VALVE_PERCENT}% and ${SAFETY_LIMITS.MAX_VALVE_PERCENT}%`,
    actualValue: `${target}%`,
    reason: rangePassed
      ? `Target position ${target}% is within safe range [${SAFETY_LIMITS.MIN_VALVE_PERCENT}%, ${SAFETY_LIMITS.MAX_VALVE_PERCENT}%]`
      : target > SAFETY_LIMITS.MAX_VALVE_PERCENT
        ? `SAFETY VIOLATION: Target ${target}% exceeds maximum structural ceiling of ${SAFETY_LIMITS.MAX_VALVE_PERCENT}% (risk of hydraulic water hammer or seal blowout)`
        : `SAFETY VIOLATION: Target ${target}% is below minimum permissible floor of ${SAFETY_LIMITS.MIN_VALVE_PERCENT}%`,
  });

  // 2. Rate of Change Limit: Reject any change > 30 percentage points in a single step
  const delta = Math.abs(target - currentValve);
  const ratePassed = delta <= SAFETY_LIMITS.MAX_SINGLE_STEP_DELTA;
  ruleResults.push({
    ruleId: 'RATE_OF_CHANGE',
    name: 'Actuator Slew Rate Limiter',
    passed: ratePassed,
    limitDescription: `Maximum step change ≤ ${SAFETY_LIMITS.MAX_SINGLE_STEP_DELTA}%`,
    actualValue: `Δ ${delta.toFixed(1)}% (from ${currentValve}% to ${target}%)`,
    reason: ratePassed
      ? `Step delta of ${delta.toFixed(1)}% satisfies rate-of-change limit (≤ ${SAFETY_LIMITS.MAX_SINGLE_STEP_DELTA}%)`
      : `SAFETY VIOLATION: Slew rate of ${delta.toFixed(1)}% exceeds single-step limit of ${SAFETY_LIMITS.MAX_SINGLE_STEP_DELTA}% (risk of mechanical cavitation and actuator servo overload)`,
  });

  // 3. Sensor Dynamics / Spoofing & Injection Check:
  // Reject any command issued when incoming sensor reading changed > 40% in < 2 seconds
  let spoofPassed = true;
  let spoofReason = 'Sensor pressure dynamics are within realistic fluidic physics bounds';
  let spoofActual = 'Δ < 40%';

  const prev = previousSensor || (currentSensor.previousReading ? {
    pressure: currentSensor.previousReading.pressure,
    timestamp: currentSensor.previousReading.timestamp,
    flowRate: 0,
    temperature: 0,
    valvePosition: currentValve,
  } as SensorReading : undefined);

  if (prev && prev.pressure > 0) {
    const timeDeltaMs = currentSensor.timestamp - prev.timestamp;
    const pressureDeltaAbs = Math.abs(currentSensor.pressure - prev.pressure);
    const pressureDeltaRatio = pressureDeltaAbs / prev.pressure;

    if (timeDeltaMs <= SAFETY_LIMITS.MAX_SPOOF_WINDOW_MS && pressureDeltaRatio > SAFETY_LIMITS.MAX_PRESSURE_DELTA_PERCENT) {
      spoofPassed = false;
      const pctChange = (pressureDeltaRatio * 100).toFixed(1);
      spoofActual = `+${pctChange}% in ${(timeDeltaMs / 1000).toFixed(2)}s`;
      spoofReason = `INTEGRITY VIOLATION: Pressure shifted by ${pctChange}% (from ${prev.pressure.toFixed(1)} to ${currentSensor.pressure.toFixed(1)} PSI) in ${(timeDeltaMs / 1000).toFixed(2)}s. Violates physical fluid dynamics; potential sensor spoofing / telemetry injection attack detected.`;
    } else {
      spoofActual = `${((pressureDeltaAbs / prev.pressure) * 100).toFixed(1)}% change in ${(timeDeltaMs / 1000).toFixed(1)}s`;
    }
  }

  // Also catch explicitly tagged spoofing flags if simulation injected
  if (currentSensor.isSpoofed) {
    spoofPassed = false;
    spoofReason = `INTEGRITY VIOLATION: ${currentSensor.spoofReason || 'Deliberately corrupted telemetry detected by physical telemetry envelope validation.'}`;
    spoofActual = `Corrupted sensor stream (${currentSensor.pressure.toFixed(1)} PSI)`;
  }

  ruleResults.push({
    ruleId: 'SENSOR_DYNAMICS_SPOOF',
    name: 'Telemetry Physics & Anti-Spoofing',
    passed: spoofPassed,
    limitDescription: `Pressure change must be ≤ 40% within 2.0s window`,
    actualValue: spoofActual,
    reason: spoofReason,
  });

  // 4. Hard Physical Sensor Envelope
  const physicalPassed =
    currentSensor.pressure >= SAFETY_LIMITS.PHYSICAL_MIN_PRESSURE &&
    currentSensor.pressure <= SAFETY_LIMITS.PHYSICAL_MAX_PRESSURE &&
    currentSensor.temperature >= SAFETY_LIMITS.PHYSICAL_MIN_TEMP &&
    currentSensor.temperature <= SAFETY_LIMITS.PHYSICAL_MAX_TEMP;

  ruleResults.push({
    ruleId: 'PHYSICAL_BOUNDS',
    name: 'Transducer Physical Envelope',
    passed: physicalPassed,
    limitDescription: `Pressure [${SAFETY_LIMITS.PHYSICAL_MIN_PRESSURE}-${SAFETY_LIMITS.PHYSICAL_MAX_PRESSURE} PSI], Temp [${SAFETY_LIMITS.PHYSICAL_MIN_TEMP}-${SAFETY_LIMITS.PHYSICAL_MAX_TEMP} °C]`,
    actualValue: `${currentSensor.pressure.toFixed(1)} PSI, ${currentSensor.temperature.toFixed(1)} °C`,
    reason: physicalPassed
      ? 'All transducer signals fall within plausible operating ranges'
      : `SAFETY VIOLATION: Sensor metrics fall outside physical equipment tolerances (indicates offline sensor, wiring severed, or malicious tampering)`,
  });

  // Overall Decision: All rules must pass for ALLOWED
  const failedRule = ruleResults.find((r) => !r.passed);

  if (failedRule) {
    return {
      verdict: 'BLOCKED',
      reason: failedRule.reason,
      violatedRuleId: failedRule.ruleId,
      ruleResults,
      evaluatedAt: Date.now(),
      actuatorExecutedPosition: currentValve, // Retain safe previous position
    };
  }

  return {
    verdict: 'ALLOWED',
    reason: `All 4 safety invariants verified. Command permitted: adjust valve to ${target}%.`,
    ruleResults,
    evaluatedAt: Date.now(),
    actuatorExecutedPosition: target, // Move valve to requested position
  };
}
