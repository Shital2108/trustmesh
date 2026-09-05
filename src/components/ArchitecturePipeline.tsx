import { Cpu, ShieldCheck, Database, ArrowRight, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { PolicyVerdict } from '../types';

interface ArchitecturePipelineProps {
  lastVerdict?: PolicyVerdict;
  isEvaluating: boolean;
  isSpoofedReading: boolean;
}

export function ArchitecturePipeline({
  lastVerdict,
  isEvaluating,
  isSpoofedReading,
}: ArchitecturePipelineProps) {
  const isBlocked = lastVerdict?.verdict === 'BLOCKED';
  const isAllowed = lastVerdict?.verdict === 'ALLOWED';

  return (
    <div
      id="architecture-pipeline-card"
      className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 mb-6"
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        {/* Stage 1: IoT Sensor Layer */}
        <div
          id="stage-sensors"
          className={`flex-1 w-full md:w-auto p-3 rounded-lg border transition-all ${
            isSpoofedReading
              ? 'bg-rose-950/40 border-rose-600/70 text-rose-300 ring-1 ring-rose-500/30'
              : 'bg-zinc-950/80 border-zinc-800 text-zinc-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">Step 1</span>
            {isSpoofedReading && (
              <span className="inline-flex items-center gap-1 text-[10px] text-rose-400 font-mono bg-rose-950 px-1.5 py-0.5 rounded border border-rose-800">
                <AlertTriangle className="w-2.5 h-2.5" /> SPOOFED
              </span>
            )}
          </div>
          <div className="font-semibold text-zinc-100 flex items-center gap-1.5">
            <span>Sensors & Telemetry</span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Pressure, Flow, Temp (Fluctuating every ~1.5s)
          </p>
        </div>

        <ArrowRight className="w-4 h-4 text-zinc-600 hidden md:block shrink-0" />

        {/* Stage 2: AI Agent (Gemini) */}
        <div
          id="stage-ai-agent"
          className={`flex-1 w-full md:w-auto p-3 rounded-lg border transition-all ${
            isEvaluating
              ? 'bg-cyan-950/40 border-cyan-500/60 text-cyan-200 animate-pulse'
              : 'bg-zinc-950/80 border-zinc-800 text-zinc-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">Step 2</span>
            <span className="font-mono text-[10px] text-cyan-400">Gemini 3.8</span>
          </div>
          <div className="font-semibold text-zinc-100 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI Reasoning Agent</span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Generates unverified candidate command JSON
          </p>
        </div>

        <ArrowRight className="w-4 h-4 text-zinc-600 hidden md:block shrink-0" />

        {/* Stage 3: TrustMesh Policy Engine */}
        <div
          id="stage-policy-engine"
          className={`flex-1 w-full md:w-auto p-3 rounded-lg border relative transition-all ${
            isBlocked
              ? 'bg-rose-950/50 border-rose-500 text-rose-200 ring-1 ring-rose-500/50'
              : isAllowed
              ? 'bg-emerald-950/50 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500/50'
              : 'bg-zinc-950/80 border-zinc-800 text-zinc-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">Step 3 • Zero-Trust</span>
            {isBlocked ? (
              <span className="inline-flex items-center gap-1 text-[10px] text-rose-400 font-mono font-bold bg-rose-950 px-1.5 py-0.5 rounded border border-rose-800">
                <XCircle className="w-3 h-3" /> INTERCEPTED
              </span>
            ) : isAllowed ? (
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-mono font-bold bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">
                <CheckCircle2 className="w-3 h-3" /> VERIFIED
              </span>
            ) : null}
          </div>
          <div className="font-semibold text-zinc-100 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Deterministic Policy Engine</span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Hardcoded safety envelope (NO LLM TRUST)
          </p>
        </div>

        <ArrowRight className="w-4 h-4 text-zinc-600 hidden md:block shrink-0" />

        {/* Stage 4: Actuator Execution OR Blocked Hold */}
        <div
          id="stage-actuator-execution"
          className="flex-1 w-full md:w-auto p-3 rounded-lg bg-zinc-950/80 border border-zinc-800 text-zinc-300"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">Step 4</span>
            <Database className="w-3 h-3 text-indigo-400" />
          </div>
          <div className="font-semibold text-zinc-100 flex items-center gap-1.5">
            <span>Actuator + SHA-256 Log</span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Safe valve adjust & immutable chained record
          </p>
        </div>
      </div>
    </div>
  );
}
