import { Bot, ShieldCheck, ShieldAlert, CheckCircle2, XCircle, Terminal, Cpu, ArrowRight } from 'lucide-react';
import { AgentCommand, PolicyVerdict, SensorReading } from '../types';

interface DecisionPanelProps {
  command?: AgentCommand;
  verdict?: PolicyVerdict;
  currentSensor: SensorReading;
  isEvaluating: boolean;
}

export function DecisionPanel({
  command,
  verdict,
  currentSensor,
  isEvaluating,
}: DecisionPanelProps) {
  const isBlocked = verdict?.verdict === 'BLOCKED';
  const isAllowed = verdict?.verdict === 'ALLOWED';

  return (
    <section
      id="decision-comparison-panel"
      className="grid grid-cols-1 lg:grid-cols-2 gap-4"
    >
      {/* LEFT COLUMN: AI AGENT (GEMINI) DECISION */}
      <div
        id="ai-agent-card"
        className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-zinc-100 flex flex-col justify-between shadow-lg relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-zinc-800/80 mb-4">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-semibold tracking-tight text-white uppercase font-mono">
                2. AI Agent Proposed Setpoint
              </h2>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 text-[11px] font-mono">
              <Cpu className="w-3 h-3" />
              {command?.modelUsed || 'gemini-3.8-flash (Function Calling)'}
            </span>
          </div>

          {/* Target Percent & Actuator Delta */}
          {command ? (
            <div>
              <div className="p-4 rounded-xl bg-zinc-950/90 border border-zinc-800/90 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-zinc-400 font-mono uppercase">
                    Proposed Actuator Command
                  </span>
                  <span className="text-[11px] font-mono text-zinc-400">
                    Latency: {command.latencyMs ?? 140}ms
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold font-mono text-white flex items-baseline gap-2">
                      <span>{command.target_percent.toFixed(1)}%</span>
                      <span className="text-xs text-zinc-400 font-normal">target valve</span>
                    </div>
                    <div className="text-xs text-zinc-400 font-mono mt-1 flex items-center gap-1.5">
                      <span>From {currentSensor.valvePosition.toFixed(1)}%</span>
                      <ArrowRight className="w-3 h-3 text-zinc-500" />
                      <span
                        className={
                          Math.abs(command.target_percent - currentSensor.valvePosition) > 30
                            ? 'text-rose-400 font-bold'
                            : 'text-cyan-400'
                        }
                      >
                        Δ {(command.target_percent - currentSensor.valvePosition > 0 ? '+' : '')}
                        {(command.target_percent - currentSensor.valvePosition).toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-mono px-2 py-1 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                      action: "{command.action}"
                    </span>
                  </div>
                </div>
              </div>

              {/* Technical Reasoning */}
              <div className="mb-4">
                <div className="text-xs font-mono text-zinc-400 mb-1.5 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Agent Operational Reasoning</span>
                </div>
                <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 text-xs text-zinc-300 font-mono leading-relaxed max-h-28 overflow-y-auto">
                  {command.reasoning}
                </div>
              </div>

              {/* Structured JSON view */}
              <div className="text-[11px] font-mono bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/60 text-zinc-400">
                <span className="text-zinc-400">Function Payload: </span>
                <span className="text-cyan-300">
                  {JSON.stringify({
                    action: command.action,
                    target_percent: command.target_percent,
                    reasoning: command.reasoning.slice(0, 55) + '...',
                  })}
                </span>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-zinc-500 text-xs font-mono">
              {isEvaluating ? 'Awaiting Gemini structured function evaluation...' : 'Idle. Start telemetry stream.'}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: POLICY ENGINE VERDICT */}
      <div
        id="policy-engine-card"
        className={`p-5 rounded-2xl border text-zinc-100 flex flex-col justify-between shadow-lg relative overflow-hidden transition-all duration-300 ${
          isBlocked
            ? 'bg-rose-950/20 border-rose-600/70 ring-1 ring-rose-500/40'
            : isAllowed
            ? 'bg-emerald-950/20 border-emerald-600/70 ring-1 ring-emerald-500/40'
            : 'bg-zinc-900/80 border-zinc-800'
        }`}
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-zinc-800/80 mb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-semibold tracking-tight text-white uppercase font-mono">
                3. Deterministic Policy Engine
              </h2>
            </div>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-zinc-800 text-amber-300 border border-amber-500/30">
              Hardcoded Rules • Zero-Trust
            </span>
          </div>

          {/* Verdict Banner */}
          {verdict ? (
            <div>
              <div
                id="policy-verdict-banner"
                className={`p-3.5 rounded-xl border mb-4 flex items-center justify-between ${
                  isBlocked
                    ? 'bg-rose-950/80 border-rose-500 text-rose-100 shadow-md shadow-rose-950/60'
                    : 'bg-emerald-950/80 border-emerald-500 text-emerald-100 shadow-md shadow-emerald-950/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {isBlocked ? (
                    <div className="p-1.5 rounded-lg bg-rose-900/90 text-rose-200">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="p-1.5 rounded-lg bg-emerald-900/90 text-emerald-200">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <div className="font-mono text-sm font-bold tracking-wide">
                      VERDICT: {verdict.verdict}
                    </div>
                    <div className="text-xs opacity-90">
                      {isBlocked
                        ? 'Safety Envelope Interception Triggered'
                        : 'Permitted. Command forwarded to PLC actuator.'}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`font-mono text-xs font-bold px-2.5 py-1 rounded-md uppercase ${
                      isBlocked ? 'bg-rose-900 text-rose-100' : 'bg-emerald-900 text-emerald-100'
                    }`}
                  >
                    {isBlocked ? 'DROP COMMAND' : 'PASS THRU'}
                  </span>
                </div>
              </div>

              {/* Checklist of the 4 Safety Invariants */}
              <div className="space-y-2 mb-4">
                <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">
                  Safety Invariants Evaluated:
                </div>

                {verdict.ruleResults.map((rule) => (
                  <div
                    key={rule.ruleId}
                    id={`rule-check-${rule.ruleId}`}
                    className={`p-2.5 rounded-lg border text-xs font-mono flex items-start justify-between gap-2 transition-colors ${
                      rule.passed
                        ? 'bg-zinc-950/70 border-zinc-800/80 text-zinc-300'
                        : 'bg-rose-950/50 border-rose-600 text-rose-200 font-medium'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {rule.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <span className="text-white font-semibold">{rule.name}</span>
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          {rule.passed ? rule.limitDescription : rule.reason}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                          rule.passed
                            ? 'bg-zinc-800 text-zinc-400'
                            : 'bg-rose-900 text-rose-100 border border-rose-700'
                        }`}
                      >
                        {rule.passed ? 'PASS' : 'FAIL'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Actuator Safe State Readout */}
              <div className="p-3 rounded-lg bg-zinc-950/80 border border-zinc-800 text-xs font-mono flex items-center justify-between text-zinc-300">
                <span className="text-zinc-400">Actuator Enforced Position:</span>
                <span className="font-bold text-white">
                  {verdict.actuatorExecutedPosition.toFixed(1)}%
                  {isBlocked && (
                    <span className="ml-2 text-[10px] text-rose-400 bg-rose-950 px-1.5 py-0.5 rounded border border-rose-800">
                      FAIL-SAFE HOLD
                    </span>
                  )}
                </span>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-zinc-500 text-xs font-mono">
              Awaiting candidate command evaluation...
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
