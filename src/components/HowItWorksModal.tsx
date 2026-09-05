import { X, ShieldCheck, Cpu, Database, AlertOctagon, CheckCircle2, Lock } from 'lucide-react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HowItWorksModal({ isOpen, onClose }: HowItWorksModalProps) {
  if (!isOpen) return null;

  return (
    <div
      id="how-it-works-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs"
    >
      <div
        id="how-it-works-modal"
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-zinc-950 border border-zinc-800 p-6 md:p-8 text-zinc-100 shadow-2xl"
      >
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-mono">
                TrustMesh • System Architecture & Threat Model
              </h2>
              <p className="text-xs text-zinc-400">
                Hackathon Technical Overview & Production Readiness Specification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 text-xs text-zinc-300 leading-relaxed font-sans">
          {/* Section 1: The Problem */}
          <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/40">
            <h3 className="text-sm font-semibold text-rose-300 mb-1 flex items-center gap-1.5 font-mono">
              <AlertOctagon className="w-4 h-4 text-rose-400" />
              The AI-to-Actuator Safety Dilemma
            </h3>
            <p>
              Large Language Models and autonomous reasoning agents (like Gemini) excel at complex multi-sensor trend synthesis, but they are inherently non-deterministic, probabilistic, and vulnerable to prompt injection, hallucination, or adversarial sensor manipulation.
              <strong> Never grant an AI agent raw, unmediated write access to physical hardware</strong> (e.g. industrial valves, chemical pumps, electrical switches, or coolant lines).
            </p>
          </div>

          {/* Section 2: TrustMesh Design */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-2 font-mono flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              1. The Deterministic Policy Engine (Zero-Trust)
            </h3>
            <p className="text-zinc-400 mb-2">
              TrustMesh acts as a rigorous gateway filter. Crucially, the Policy Engine is written in <strong>plain, deterministic code</strong> — not another LLM call. The safety invariants cannot be overridden by conversational jailbreaks:
            </p>
            <ul className="space-y-1.5 pl-3 border-l-2 border-zinc-800 text-zinc-300 font-mono text-[11px]">
              <li>• <span className="text-cyan-300">Absolute Bounds:</span> Actuator position must never exceed 85% or fall below 0% (prevents pipe blowout / water hammer).</li>
              <li>• <span className="text-cyan-300">Slew Rate Limit:</span> No single step may exceed ±30 percentage points (protects servos and fluid cavitation).</li>
              <li>• <span className="text-cyan-300">Fluidic Physics & Anti-Spoofing:</span> Detects instantaneous pressure jumps (&gt;40% in &lt;2s) that violate physical laws of hydraulics.</li>
            </ul>
          </div>

          {/* Section 3: SHA-256 Audit Chain */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-2 font-mono flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-indigo-400" />
              2. Cryptographic SHA-256 Audit Chaining
            </h3>
            <p className="text-zinc-400">
              Every decision (whether allowed or blocked) is permanently inscribed in an append-only ledger. Each block's cryptographic hash incorporates the previous block's hash. If an attacker or corrupted operator attempts to alter historical incident logs, the chain breaks immediately upon cryptographic verification.
            </p>
          </div>

          {/* Section 4: Production Deployment Context */}
          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-2 font-mono flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              Production Deployment Note
            </h3>
            <p className="text-zinc-400 text-[11px]">
              For this hackathon demonstration, sensor telemetry (pressure, flow rate, temperature) is simulated with real-time fluctuations and attack triggers. In a production industrial environment, TrustMesh is deployed on an embedded edge gateway (e.g. Linux RT / Raspberry Pi CM4) communicating upstream with the AI control cloud and downstream via industrial protocols (Modbus TCP, OPC-UA, or CANbus) directly to a Programmable Logic Controller (PLC).
            </p>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-xs font-semibold transition-colors"
            >
              Close Guide
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
