import { ShieldAlert, Play, Pause, FastForward, RotateCcw, Flame, Zap, ArrowUpRight } from 'lucide-react';

interface AttackControlsProps {
  onSimulateSpoofing: () => void;
  onSimulateUnboundedSpike: () => void;
  onSimulateRapidSlew: () => void;
  onManualTick: () => void;
  onReset: () => void;
  isEvaluating: boolean;
  isStreaming: boolean;
  onToggleStreaming: () => void;
}

export function AttackControls({
  onSimulateSpoofing,
  onSimulateUnboundedSpike,
  onSimulateRapidSlew,
  onManualTick,
  onReset,
  isEvaluating,
  isStreaming,
  onToggleStreaming,
}: AttackControlsProps) {
  return (
    <div
      id="attack-simulation-bar"
      className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-lg"
    >
      {/* Left: Primary Centerpiece Demo Attack Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <button
          id="simulate-sensor-spoofing-attack-btn"
          onClick={onSimulateSpoofing}
          disabled={isEvaluating}
          className="relative group inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-gradient-to-r from-rose-700 via-rose-600 to-red-600 hover:from-rose-600 hover:to-red-500 text-white font-mono text-xs font-bold tracking-wider uppercase shadow-lg shadow-rose-950/60 border border-rose-400/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
        >
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
          </span>
          <ShieldAlert className="w-4 h-4 text-white" />
          <span>Simulate Sensor Spoofing Attack</span>
        </button>

        <span className="hidden sm:inline text-zinc-600">|</span>

        {/* Secondary attack presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            id="simulate-unbounded-spike-btn"
            onClick={onSimulateUnboundedSpike}
            disabled={isEvaluating}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-mono text-zinc-300 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 transition-colors shrink-0 disabled:opacity-50"
            title="Tests Rule 1: Command valve above maximum 85% envelope ceiling"
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />
            <span>Test Max Envelope (&gt;85%)</span>
          </button>

          <button
            id="simulate-rapid-slew-btn"
            onClick={onSimulateRapidSlew}
            disabled={isEvaluating}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-mono text-zinc-300 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 transition-colors shrink-0 disabled:opacity-50"
            title="Tests Rule 2: Command slew step delta > 30%"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Test Slew Delta (&gt;30%)</span>
          </button>
        </div>
      </div>

      {/* Right: Operational Controls (Tick, Stream, Reset) */}
      <div className="flex items-center justify-end gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-zinc-800">
        <button
          id="manual-step-tick-btn"
          onClick={onManualTick}
          disabled={isEvaluating}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-colors disabled:opacity-50"
          title="Perform one single telemetry evaluation cycle"
        >
          <FastForward className="w-3.5 h-3.5 text-cyan-400" />
          <span>Step Cycle</span>
        </button>

        <button
          id="toggle-stream-btn"
          onClick={onToggleStreaming}
          disabled={isEvaluating}
          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono font-medium border transition-colors ${
            isStreaming
              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700 hover:bg-emerald-900/60'
              : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
          }`}
          title={isStreaming ? 'Pause autonomous loop' : 'Start autonomous loop'}
        >
          {isStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{isStreaming ? 'Pause Loop' : 'Live Auto'}</span>
        </button>

        <button
          id="reset-simulation-btn"
          onClick={onReset}
          disabled={isEvaluating}
          className="p-2 rounded-lg text-zinc-400 hover:text-zinc-200 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 transition-colors"
          title="Reset telemetry and actuator back to baseline"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
