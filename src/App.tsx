/**
 * TrustMesh: Deterministic Safety Verification & Cryptographic Ledger for AI Actuators
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { ArchitecturePipeline } from './components/ArchitecturePipeline';
import { SensorPanel } from './components/SensorPanel';
import { DecisionPanel } from './components/DecisionPanel';
import { AuditLogPanel } from './components/AuditLogPanel';
import { AttackControls } from './components/AttackControls';
import { HowItWorksModal } from './components/HowItWorksModal';
import {
  SensorReading,
  AgentCommand,
  PolicyVerdict,
  AuditLogEntry,
  ChainVerificationResult,
} from './types';
import { evaluatePolicy } from './lib/policyEngine';
import { GENESIS_HASH, calculateEntryHash, verifyAuditChain } from './lib/auditChain';

const INITIAL_SENSOR: SensorReading = {
  pressure: 48.2,
  flowRate: 124.5,
  temperature: 68.2,
  valvePosition: 50.0,
  timestamp: Date.now() - 1500,
  isSpoofed: false,
};

export default function App() {
  const [currentSensor, setCurrentSensor] = useState<SensorReading>(INITIAL_SENSOR);
  const [previousSensor, setPreviousSensor] = useState<SensorReading | undefined>(undefined);
  const [pressureHistory, setPressureHistory] = useState<number[]>([
    47.8, 48.1, 48.4, 47.9, 48.5, 48.2, 48.0, 48.3, 48.2,
  ]);

  const [currentCommand, setCurrentCommand] = useState<AgentCommand | undefined>(undefined);
  const [currentVerdict, setCurrentVerdict] = useState<PolicyVerdict | undefined>(undefined);
  const [auditEntries, setAuditEntries] = useState<AuditLogEntry[]>([]);
  const [originalEntriesBackup, setOriginalEntriesBackup] = useState<AuditLogEntry[]>([]);

  const [verificationResult, setVerificationResult] = useState<ChainVerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [isTampered, setIsTampered] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);

  // References to keep cycle loop state in sync
  const currentSensorRef = useRef(currentSensor);
  currentSensorRef.current = currentSensor;

  const auditEntriesRef = useRef(auditEntries);
  auditEntriesRef.current = auditEntries;

  const isEvaluatingRef = useRef(isEvaluating);
  isEvaluatingRef.current = isEvaluating;

  // Initialize with Genesis block and first normal calibration tick on mount
  useEffect(() => {
    async function bootstrapInitialState() {
      const initialPrev: SensorReading = {
        pressure: 47.9,
        flowRate: 124.0,
        temperature: 68.0,
        valvePosition: 50.0,
        timestamp: Date.now() - 3000,
      };
      setPreviousSensor(initialPrev);

      // Baseline nominal command
      const initialCmd: AgentCommand = {
        action: 'set_valve',
        target_percent: 50.0,
        reasoning: 'System initialized. Actuator locked at calibrated nominal setpoint 50.0%. Fluid pressure and temperatures are nominal.',
        modelUsed: 'gemini-3.8-flash (Function Calling / Structured Output)',
        latencyMs: 85,
      };

      const verdict = evaluatePolicy(initialCmd, INITIAL_SENSOR, initialPrev);
      setCurrentCommand(initialCmd);
      setCurrentVerdict(verdict);

      const entryCandidate: Omit<AuditLogEntry, 'hash'> = {
        id: `blk-0001-${Date.now()}`,
        sequence: 1,
        timestamp: Date.now(),
        sensors: {
          pressure: INITIAL_SENSOR.pressure,
          flowRate: INITIAL_SENSOR.flowRate,
          temperature: INITIAL_SENSOR.temperature,
          valvePosition: INITIAL_SENSOR.valvePosition,
          isSpoofed: false,
        },
        command: initialCmd,
        verdict: verdict.verdict,
        reason: verdict.reason,
        violatedRuleId: verdict.violatedRuleId,
        actuatorPositionBefore: 50.0,
        actuatorPositionAfter: verdict.actuatorExecutedPosition,
        previousHash: GENESIS_HASH,
      };

      const blockHash = await calculateEntryHash(entryCandidate);
      const genesisBlock: AuditLogEntry = {
        ...entryCandidate,
        hash: blockHash,
      };

      setAuditEntries([genesisBlock]);
      setOriginalEntriesBackup([genesisBlock]);
    }

    bootstrapInitialState();
  }, []);

  // Core Evaluation Cycle
  const runEvaluationCycle = useCallback(
    async (
      overrideSensor?: SensorReading,
      attackSimulation: 'NONE' | 'SPOOF_PRESSURE' | 'UNBOUNDED_SPIKE' | 'RAPID_SLEW' = 'NONE'
    ) => {
      if (isEvaluatingRef.current) return;
      setIsEvaluating(true);

      try {
        const prev = currentSensorRef.current;
        let sensor: SensorReading;

        if (overrideSensor) {
          sensor = overrideSensor;
        } else {
          // Generate realistic small fluctuations around safe baselines
          const pJitter = (Math.random() - 0.49) * 1.6;
          const fJitter = (Math.random() - 0.5) * 3.0;
          const tJitter = (Math.random() - 0.5) * 0.8;

          const newPressure = Math.min(54, Math.max(44, prev.pressure + pJitter));
          const newFlow = Math.min(134, Math.max(118, prev.flowRate + fJitter));
          const newTemp = Math.min(73, Math.max(64, prev.temperature + tJitter));

          sensor = {
            pressure: Math.round(newPressure * 10) / 10,
            flowRate: Math.round(newFlow * 10) / 10,
            temperature: Math.round(newTemp * 10) / 10,
            valvePosition: prev.valvePosition,
            timestamp: Date.now(),
            isSpoofed: false,
            previousReading: {
              pressure: prev.pressure,
              timestamp: prev.timestamp,
            },
          };
        }

        // Update sensor telemetry state
        setPreviousSensor(prev);
        setCurrentSensor(sensor);
        setPressureHistory((h) => [...h.slice(-20), sensor.pressure]);

        // 1. Call backend AI Agent API (Gemini via structured output)
        let agentCommand: AgentCommand;
        try {
          const response = await fetch('/api/agent-decide', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              currentSensor: sensor,
              previousSensor: prev,
              attackSimulation,
            }),
          });

          if (!response.ok) {
            throw new Error(`API error: ${response.statusText}`);
          }

          agentCommand = await response.json();
        } catch (err) {
          // Robust client fallback
          const target = attackSimulation === 'UNBOUNDED_SPIKE' ? 95 : sensor.isSpoofed ? 92 : prev.valvePosition;
          agentCommand = {
            action: 'set_valve',
            target_percent: target,
            reasoning: sensor.isSpoofed
              ? `EMERGENCY PURGE: Abnormal pressure spike of ${sensor.pressure.toFixed(1)} PSI detected. Ordering rapid relief valve aperture.`
              : `Stabilizing valve actuator around ${target}%.`,
            modelUsed: 'gemini-3.8-flash (Client-side failover)',
            latencyMs: 110,
          };
        }

        setCurrentCommand(agentCommand);

        // 2. Evaluate in TrustMesh Deterministic Policy Engine (NEVER an LLM)
        const verdict = evaluatePolicy(agentCommand, sensor, prev);
        setCurrentVerdict(verdict);

        // 3. Update Actuator Position if Allowed; Hold if Blocked
        const nextValvePosition = verdict.actuatorExecutedPosition;
        setCurrentSensor((s) => ({
          ...s,
          valvePosition: nextValvePosition,
        }));

        // 4. Inscribe into SHA-256 Append-Only Cryptographic Audit Log
        const currentEntries = auditEntriesRef.current;
        const lastEntry = currentEntries[currentEntries.length - 1];
        const previousHash = lastEntry ? lastEntry.hash : GENESIS_HASH;
        const nextSequence = lastEntry ? lastEntry.sequence + 1 : 1;

        const candidateEntry: Omit<AuditLogEntry, 'hash'> = {
          id: `blk-${String(nextSequence).padStart(4, '0')}-${Date.now()}`,
          sequence: nextSequence,
          timestamp: Date.now(),
          sensors: {
            pressure: sensor.pressure,
            flowRate: sensor.flowRate,
            temperature: sensor.temperature,
            valvePosition: sensor.valvePosition,
            isSpoofed: sensor.isSpoofed,
          },
          command: agentCommand,
          verdict: verdict.verdict,
          reason: verdict.reason,
          violatedRuleId: verdict.violatedRuleId,
          actuatorPositionBefore: sensor.valvePosition,
          actuatorPositionAfter: nextValvePosition,
          previousHash,
        };

        const blockHash = await calculateEntryHash(candidateEntry);
        const newBlock: AuditLogEntry = {
          ...candidateEntry,
          hash: blockHash,
        };

        const updatedEntries = [...currentEntries, newBlock];
        setAuditEntries(updatedEntries);
        setOriginalEntriesBackup(updatedEntries);

        // Clear verification cache on new block
        setVerificationResult(null);
      } finally {
        setIsEvaluating(false);
      }
    },
    []
  );

  // Auto-stream interval loop
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      runEvaluationCycle();
    }, 2400);

    return () => clearInterval(interval);
  }, [isStreaming, runEvaluationCycle]);

  // Centerpiece Demo: Simulate Sensor Spoofing Attack
  const handleSimulateSpoofing = () => {
    setIsStreaming(false); // Pause loop for clear inspection
    const prev = currentSensorRef.current;

    // Inject 3x normal pressure reading (+208% delta in 1.1s)
    const spoofedReading: SensorReading = {
      pressure: 148.6, // 3x normal (normal: ~48 PSI)
      flowRate: 146.0,
      temperature: 78.4,
      valvePosition: prev.valvePosition,
      timestamp: Date.now(),
      isSpoofed: true,
      spoofReason: 'Corrupted pressure reading (148.6 PSI, +208% delta in 1.1s) injected to induce emergency valve dumping.',
      previousReading: {
        pressure: prev.pressure,
        timestamp: prev.timestamp,
      },
    };

    runEvaluationCycle(spoofedReading, 'SPOOF_PRESSURE');
  };

  // Attack preset: Unbounded Spike (>85% limit test)
  const handleSimulateUnboundedSpike = () => {
    setIsStreaming(false);
    const prev = currentSensorRef.current;
    const normalReading: SensorReading = {
      ...prev,
      timestamp: Date.now(),
      previousReading: {
        pressure: prev.pressure,
        timestamp: prev.timestamp,
      },
    };
    runEvaluationCycle(normalReading, 'UNBOUNDED_SPIKE');
  };

  // Attack preset: Rapid Slew (>30% rate-of-change test)
  const handleSimulateRapidSlew = () => {
    setIsStreaming(false);
    const prev = currentSensorRef.current;
    const normalReading: SensorReading = {
      ...prev,
      timestamp: Date.now(),
      previousReading: {
        pressure: prev.pressure,
        timestamp: prev.timestamp,
      },
    };
    runEvaluationCycle(normalReading, 'RAPID_SLEW');
  };

  // Verify Cryptographic Chain Integrity
  const handleVerifyChain = async () => {
    setIsVerifying(true);
    try {
      const result = await verifyAuditChain(auditEntries);
      setVerificationResult(result);
    } finally {
      setIsVerifying(false);
    }
  };

  // Tamper with historical block to demonstrate cryptographic tamper detection
  const handleSimulateTamper = (entryId: string) => {
    setIsTampered(true);
    setAuditEntries((entries) =>
      entries.map((e) => {
        if (e.id === entryId || (entries.length > 0 && e === entries[0])) {
          return {
            ...e,
            isCorruptedForDemo: true,
            // Maliciously alter verdict from BLOCKED to ALLOWED or alter commanded percent
            verdict: 'ALLOWED',
            reason: 'TAMPERED: Illicitly modified by rogue actor to disguise incident.',
            command: {
              ...e.command,
              target_percent: 10.0,
            },
          };
        }
        return e;
      })
    );
    // Clear old verification so user can click verify
    setVerificationResult(null);
  };

  const handleRestoreChain = () => {
    setAuditEntries(originalEntriesBackup);
    setIsTampered(false);
    setVerificationResult(null);
  };

  const handleReset = () => {
    setIsStreaming(false);
    setCurrentSensor(INITIAL_SENSOR);
    setPressureHistory([48.0, 48.2, 48.1, 48.4, 48.2]);
    setAuditEntries(originalEntriesBackup.slice(0, 1));
    setVerificationResult(null);
    setIsTampered(false);
  };

  return (
    <div
      id="trustmesh-application"
      className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-300 pb-16"
    >
      {/* Top Header */}
      <Header
        blockHeight={auditEntries.length}
        isStreaming={isStreaming}
        onToggleStreaming={() => setIsStreaming(!isStreaming)}
        onOpenHelp={() => setShowHelpModal(true)}
        isEvaluating={isEvaluating}
      />

      {/* Main Content Container */}
      <main id="trustmesh-main-container" className="max-w-7xl w-full mx-auto px-4 lg:px-8 pt-6 space-y-6">
        {/* Architecture Pipeline Banner */}
        <ArchitecturePipeline
          lastVerdict={currentVerdict}
          isEvaluating={isEvaluating}
          isSpoofedReading={!!currentSensor.isSpoofed}
        />

        {/* Attack Simulation & Execution Bar */}
        <AttackControls
          onSimulateSpoofing={handleSimulateSpoofing}
          onSimulateUnboundedSpike={handleSimulateUnboundedSpike}
          onSimulateRapidSlew={handleSimulateRapidSlew}
          onManualTick={() => runEvaluationCycle()}
          onReset={handleReset}
          isEvaluating={isEvaluating}
          isStreaming={isStreaming}
          onToggleStreaming={() => setIsStreaming(!isStreaming)}
        />

        {/* Panel 1: Simulated Sensor Feed */}
        <SensorPanel
          currentSensor={currentSensor}
          previousSensor={previousSensor}
          pressureHistory={pressureHistory}
        />

        {/* Panel 2: AI Agent Decision vs Policy Engine Verdict (Side-by-Side) */}
        <DecisionPanel
          command={currentCommand}
          verdict={currentVerdict}
          currentSensor={currentSensor}
          isEvaluating={isEvaluating}
        />

        {/* Panel 3: Cryptographic SHA-256 Chained Audit Log */}
        <AuditLogPanel
          entries={auditEntries}
          verificationResult={verificationResult}
          isVerifying={isVerifying}
          onVerifyChain={handleVerifyChain}
          onSimulateTamper={handleSimulateTamper}
          onRestoreChain={handleRestoreChain}
          isTampered={isTampered}
        />
      </main>

      {/* Architecture & How It Works Modal */}
      <HowItWorksModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />
    </div>
  );
}
