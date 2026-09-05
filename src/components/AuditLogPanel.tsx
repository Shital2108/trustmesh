import { useState } from 'react';
import { ShieldCheck, ShieldAlert, CheckCircle2, AlertTriangle, Copy, Check, FileText, Lock, RefreshCw, Terminal, Eye } from 'lucide-react';
import { AuditLogEntry, ChainVerificationResult } from '../types';

interface AuditLogPanelProps {
  entries: AuditLogEntry[];
  verificationResult: ChainVerificationResult | null;
  isVerifying: boolean;
  onVerifyChain: () => void;
  onSimulateTamper: (entryId: string) => void;
  onRestoreChain: () => void;
  isTampered: boolean;
}

export function AuditLogPanel({
  entries,
  verificationResult,
  isVerifying,
  onVerifyChain,
  onSimulateTamper,
  onRestoreChain,
  isTampered,
}: AuditLogPanelProps) {
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(id);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <section
      id="audit-log-panel"
      className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-zinc-100 shadow-xl flex flex-col"
    >
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800/80 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-semibold tracking-tight text-white uppercase font-mono">
              4. Append-Only Cryptographic Audit Log (SHA-256 Chained)
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Every decision is immutably hashed. Each block hash includes the previous block's hash.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Tamper simulation for demo */}
          {entries.length > 0 && (
            <>
              {isTampered ? (
                <button
                  id="restore-chain-btn"
                  onClick={onRestoreChain}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-amber-600/50 transition-colors"
                  title="Reset modified entry back to valid cryptographic state"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Restore Clean Chain
                </button>
              ) : (
                <button
                  id="simulate-tamper-btn"
                  onClick={() => {
                    if (entries.length > 0) {
                      onSimulateTamper(entries[0].id);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-zinc-950 hover:bg-zinc-800 text-rose-300 border border-rose-800/50 transition-colors"
                  title="Deliberately alter a historical audit log entry to test cryptographic chain break detection"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  Simulate Database Tamper
                </button>
              )}
            </>
          )}

          {/* Primary Verification Button */}
          <button
            id="verify-chain-integrity-btn"
            onClick={onVerifyChain}
            disabled={isVerifying || entries.length === 0}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-50 transition-colors shadow-md shadow-cyan-950"
          >
            <ShieldCheck className={`w-4 h-4 ${isVerifying ? 'animate-spin' : ''}`} />
            <span>{isVerifying ? 'Verifying Hashes...' : 'Verify Chain Integrity'}</span>
          </button>
        </div>
      </div>

      {/* Verification Status Banner */}
      {verificationResult && (
        <div
          id="chain-verification-banner"
          className={`p-3 rounded-xl border mb-4 flex items-center justify-between text-xs font-mono ${
            verificationResult.isValid
              ? 'bg-emerald-950/60 border-emerald-600/80 text-emerald-200'
              : 'bg-rose-950/80 border-rose-500 text-rose-100 animate-pulse'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {verificationResult.isValid ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <div>
              <span className="font-bold">
                {verificationResult.isValid ? 'CHAIN INTEGRITY INTACT' : 'CHAIN TAMPER DETECTED!'}
              </span>
              <span className="opacity-90 ml-2">({verificationResult.message})</span>
            </div>
          </div>

          <span className="text-[11px] px-2 py-0.5 rounded bg-zinc-950/70 border border-zinc-800">
            {verificationResult.verifiedEntries} / {verificationResult.totalEntries} Blocks Verified
          </span>
        </div>
      )}

      {/* Audit Log Table */}
      <div className="overflow-x-auto rounded-xl border border-zinc-800/80 bg-zinc-950/90 max-h-80 overflow-y-auto">
        <table className="w-full text-left text-xs font-mono whitespace-nowrap">
          <thead className="bg-zinc-900/90 text-zinc-400 sticky top-0 border-b border-zinc-800 z-10">
            <tr>
              <th className="py-2.5 px-3"># Block</th>
              <th className="py-2.5 px-3">Timestamp</th>
              <th className="py-2.5 px-3">Telemetry (P/F/T)</th>
              <th className="py-2.5 px-3">Proposed Command</th>
              <th className="py-2.5 px-3">Policy Verdict</th>
              <th className="py-2.5 px-3">Enforced Pos</th>
              <th className="py-2.5 px-3">Previous Hash</th>
              <th className="py-2.5 px-3">Block Hash (SHA-256)</th>
              <th className="py-2.5 px-3 text-center">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {entries.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-zinc-500 font-sans text-xs">
                  Audit log empty. Awaiting first actuator evaluation tick.
                </td>
              </tr>
            ) : (
              entries.map((entry) => {
                const isBlocked = entry.verdict === 'BLOCKED';
                const isCorrupted = entry.isCorruptedForDemo;

                return (
                  <tr
                    key={entry.id}
                    id={`audit-row-${entry.sequence}`}
                    className={`transition-colors ${
                      isCorrupted
                        ? 'bg-rose-950/70 text-rose-100 hover:bg-rose-900/60'
                        : isBlocked
                        ? 'bg-rose-950/20 text-rose-200/90 hover:bg-rose-950/40'
                        : 'hover:bg-zinc-900/50 text-zinc-300'
                    }`}
                  >
                    {/* Sequence */}
                    <td className="py-2.5 px-3 font-semibold text-white">
                      #{entry.sequence}
                      {isCorrupted && (
                        <span className="ml-1.5 text-[9px] bg-rose-900 text-rose-100 px-1 rounded uppercase">
                          Tampered
                        </span>
                      )}
                    </td>

                    {/* Timestamp */}
                    <td className="py-2.5 px-3 text-zinc-400 text-[11px]">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </td>

                    {/* Telemetry */}
                    <td className="py-2.5 px-3">
                      <span className={entry.sensors.isSpoofed ? 'text-rose-400 font-bold' : 'text-cyan-300'}>
                        {entry.sensors.pressure.toFixed(1)} PSI
                      </span>
                      <span className="text-zinc-600 mx-1">|</span>
                      <span className="text-zinc-400">{entry.sensors.flowRate.toFixed(0)} L/m</span>
                      <span className="text-zinc-600 mx-1">|</span>
                      <span className="text-zinc-400">{entry.sensors.temperature.toFixed(0)} °C</span>
                    </td>

                    {/* Command */}
                    <td className="py-2.5 px-3">
                      <span className="text-white font-medium">
                        set_valve({entry.command.target_percent.toFixed(1)}%)
                      </span>
                    </td>

                    {/* Verdict */}
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                          isBlocked
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}
                      >
                        {isBlocked ? 'BLOCKED' : 'ALLOWED'}
                      </span>
                    </td>

                    {/* Enforced Position */}
                    <td className="py-2.5 px-3 text-zinc-200 font-mono">
                      {entry.actuatorPositionAfter.toFixed(1)}%
                    </td>

                    {/* Previous Hash */}
                    <td className="py-2.5 px-3 text-zinc-500 text-[11px]" title={entry.previousHash}>
                      {entry.previousHash.slice(0, 8)}...{entry.previousHash.slice(-4)}
                    </td>

                    {/* Current Block Hash */}
                    <td className="py-2.5 px-3 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`font-mono ${
                            isCorrupted ? 'text-rose-300 line-through' : 'text-indigo-300'
                          }`}
                          title={entry.hash}
                        >
                          {entry.hash.slice(0, 10)}...{entry.hash.slice(-6)}
                        </span>
                        <button
                          onClick={() => handleCopy(entry.hash, entry.id)}
                          className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white"
                          title="Copy full SHA-256 hash"
                        >
                          {copiedHash === entry.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Inspect details button */}
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => setSelectedEntry(entry)}
                        className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-cyan-300"
                        title="View raw cryptographic payload"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for Raw Block Inspection */}
      {selectedEntry && (
        <div
          id="block-inspect-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs"
        >
          <div className="w-full max-w-xl rounded-2xl bg-zinc-950 border border-zinc-800 p-6 text-zinc-100 font-mono shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-sm">
                  CRYPTOGRAPHIC BLOCK #{selectedEntry.sequence} INSPECTION
                </span>
              </div>
              <button
                onClick={() => setSelectedEntry(null)}
                className="text-zinc-500 hover:text-white text-xs px-2 py-1 rounded bg-zinc-900 border border-zinc-800"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-zinc-500 block text-[10px] uppercase">SHA-256 Block Hash</span>
                <span className="text-indigo-300 break-all select-all font-bold">
                  {selectedEntry.hash}
                </span>
              </div>

              <div>
                <span className="text-zinc-500 block text-[10px] uppercase">Previous Parent Hash</span>
                <span className="text-zinc-400 break-all select-all">
                  {selectedEntry.previousHash}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800">
                  <span className="text-zinc-500 text-[10px] block">Verdict</span>
                  <span
                    className={
                      selectedEntry.verdict === 'BLOCKED' ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'
                    }
                  >
                    {selectedEntry.verdict}
                  </span>
                </div>
                <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800">
                  <span className="text-zinc-500 text-[10px] block">Actuator Before / After</span>
                  <span className="text-white">
                    {selectedEntry.actuatorPositionBefore.toFixed(1)}% → {selectedEntry.actuatorPositionAfter.toFixed(1)}%
                  </span>
                </div>
              </div>

              <div>
                <span className="text-zinc-500 block text-[10px] uppercase">Verdict Reason</span>
                <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 text-[11px] leading-relaxed">
                  {selectedEntry.reason}
                </div>
              </div>

              <div>
                <span className="text-zinc-500 block text-[10px] uppercase">Agent Reasoning Log</span>
                <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 text-[11px] leading-relaxed max-h-24 overflow-y-auto">
                  {selectedEntry.command.reasoning}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
