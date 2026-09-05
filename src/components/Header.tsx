import { Shield, ShieldAlert, Cpu, Activity, HelpCircle, RefreshCw } from 'lucide-react';

interface HeaderProps {
  blockHeight: number;
  isStreaming: boolean;
  onToggleStreaming: () => void;
  onOpenHelp: () => void;
  isEvaluating: boolean;
}

export function Header({
  blockHeight,
  isStreaming,
  onToggleStreaming,
  onOpenHelp,
  isEvaluating,
}: HeaderProps) {
  return (
    <header
      id="trustmesh-header"
      className="border-b border-zinc-800 bg-zinc-950/90 backdrop-blur sticky top-0 z-40 px-4 lg:px-8 py-3.5"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Logo & System Identity */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/10 border border-cyan-500/30 text-cyan-400 shadow-inner">
            <Shield className="w-5 h-5" />
            <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-zinc-950 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-bold tracking-tight text-white">TrustMesh</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-700/40">
                Actuator Guard v1.0
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Deterministic Safety Verification & Cryptographic Ledger for AI Actuators
            </p>
          </div>
        </div>

        {/* Live Metrics & Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 self-stretch sm:self-auto justify-between sm:justify-end">
          {/* Policy Engine Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-zinc-500">POLICY:</span>
            <span className="text-emerald-400 font-medium">ENFORCING</span>
          </div>

          {/* Ledger Height */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300">
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-zinc-500">BLOCKS:</span>
            <span className="text-white font-semibold">#{blockHeight}</span>
          </div>

          {/* Auto-stream toggle */}
          <button
            id="toggle-telemetry-stream-btn"
            onClick={onToggleStreaming}
            disabled={isEvaluating}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium font-mono border transition-all ${
              isStreaming
                ? 'bg-emerald-950/40 border-emerald-700/50 text-emerald-300 hover:bg-emerald-900/50'
                : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:bg-zinc-800'
            }`}
            title="Toggle autonomous telemetry loop"
          >
            <RefreshCw className={`w-3 h-3 ${isStreaming ? 'animate-spin' : ''}`} />
            <span>{isStreaming ? 'AUTO STREAM: ON' : 'AUTO STREAM: PAUSED'}</span>
          </button>

          {/* Help / Architecture modal toggle */}
          <button
            id="open-how-it-works-btn"
            onClick={onOpenHelp}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden md:inline">Architecture</span>
          </button>
        </div>
      </div>
    </header>
  );
}
