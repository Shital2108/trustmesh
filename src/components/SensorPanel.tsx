import { Gauge, Flame, Droplets, Sliders, AlertOctagon, TrendingUp, Radio } from 'lucide-react';
import { SensorReading } from '../types';

interface SensorPanelProps {
  currentSensor: SensorReading;
  previousSensor?: SensorReading;
  pressureHistory: number[];
}

export function SensorPanel({
  currentSensor,
  previousSensor,
  pressureHistory,
}: SensorPanelProps) {
  const isSpoofed = currentSensor.isSpoofed;

  // Calculate pressure rate of change if previous reading exists
  let pressureDeltaText = '0.0%';
  let isSpike = false;
  if (previousSensor && previousSensor.pressure > 0) {
    const diff = currentSensor.pressure - previousSensor.pressure;
    const pct = (diff / previousSensor.pressure) * 100;
    pressureDeltaText = `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`;
    if (Math.abs(pct) > 35) {
      isSpike = true;
    }
  }

  return (
    <section
      id="sensor-panel"
      className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-zinc-100 flex flex-col h-full shadow-lg"
    >
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-zinc-800/80 mb-4">
        <div className="flex items-center gap-2">
          <Radio className={`w-4 h-4 ${isSpoofed ? 'text-rose-400 animate-ping' : 'text-emerald-400 animate-pulse'}`} />
          <h2 className="text-sm font-semibold tracking-tight text-white uppercase font-mono">
            1. Physical Sensor Telemetry
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {isSpoofed ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-950 text-rose-300 border border-rose-700/80 text-xs font-mono font-bold animate-pulse">
              <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
              SPOOFED TELEMETRY DETECTED
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/50 text-[11px] font-mono">
              STREAM: HEALTHY (1-2s cadence)
            </span>
          )}
        </div>
      </div>

      {/* Grid of Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-4">
        {/* Pressure Gauge */}
        <div
          id="metric-pressure"
          className={`p-3.5 rounded-xl border transition-all ${
            isSpoofed || isSpike
              ? 'bg-rose-950/40 border-rose-500/80 text-rose-100 shadow-md shadow-rose-950/50 ring-1 ring-rose-500/50'
              : 'bg-zinc-950/90 border-zinc-800/90 text-zinc-100'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <Gauge className="w-3.5 h-3.5 text-cyan-400" /> Valve Pressure
            </span>
            <span
              className={`font-mono text-[11px] px-1.5 py-0.5 rounded ${
                isSpike ? 'bg-rose-900 text-rose-200 font-bold' : 'bg-zinc-900 text-zinc-400'
              }`}
            >
              {pressureDeltaText}
            </span>
          </div>

          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl lg:text-3xl font-bold font-mono tracking-tight text-white">
              {currentSensor.pressure.toFixed(1)}
            </span>
            <span className="text-xs text-zinc-400 font-mono">PSI</span>
          </div>

          <div className="mt-2.5 text-[11px] text-zinc-400 flex items-center justify-between font-mono">
            <span>Nominal: 45 - 50 PSI</span>
            <span className={currentSensor.pressure > 65 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
              {currentSensor.pressure > 65 ? 'SURGE' : 'NOMINAL'}
            </span>
          </div>

          {/* Sparkline trend representation */}
          <div className="mt-2 pt-2 border-t border-zinc-800/70 flex items-end gap-1 h-7">
            {pressureHistory.slice(-14).map((p, idx) => {
              const heightPercent = Math.min(100, Math.max(15, ((p - 30) / 110) * 100));
              const isHigh = p > 65;
              return (
                <div
                  key={idx}
                  className="flex-1 bg-zinc-800 rounded-xs overflow-hidden flex flex-col justify-end h-full"
                  title={`${p.toFixed(1)} PSI`}
                >
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full transition-all duration-300 ${
                      isHigh ? 'bg-rose-500' : 'bg-cyan-500/80'
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Flow Rate Gauge */}
        <div
          id="metric-flow-rate"
          className="p-3.5 rounded-xl bg-zinc-950/90 border border-zinc-800/90 text-zinc-100"
        >
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <Droplets className="w-3.5 h-3.5 text-blue-400" /> Fluid Flow Rate
            </span>
            <TrendingUp className="w-3.5 h-3.5 text-zinc-500" />
          </div>

          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl lg:text-3xl font-bold font-mono tracking-tight text-white">
              {currentSensor.flowRate.toFixed(1)}
            </span>
            <span className="text-xs text-zinc-400 font-mono">L/min</span>
          </div>

          <div className="mt-2.5 text-[11px] text-zinc-400 flex items-center justify-between font-mono">
            <span>Nominal: 120 - 130 L/m</span>
            <span className="text-emerald-400">STABLE</span>
          </div>

          {/* Simple progress bar */}
          <div className="mt-3 w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (currentSensor.flowRate / 180) * 100)}%` }}
            />
          </div>
        </div>

        {/* Temperature Gauge */}
        <div
          id="metric-temperature"
          className="p-3.5 rounded-xl bg-zinc-950/90 border border-zinc-800/90 text-zinc-100"
        >
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <Flame className="w-3.5 h-3.5 text-amber-400" /> Fluid Temp
            </span>
            <span className="font-mono text-[10px] text-zinc-500">RTD SENSOR</span>
          </div>

          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl lg:text-3xl font-bold font-mono tracking-tight text-white">
              {currentSensor.temperature.toFixed(1)}
            </span>
            <span className="text-xs text-zinc-400 font-mono">°C</span>
          </div>

          <div className="mt-2.5 text-[11px] text-zinc-400 flex items-center justify-between font-mono">
            <span>Nominal: 65 - 72 °C</span>
            <span className={currentSensor.temperature > 78 ? 'text-amber-400' : 'text-emerald-400'}>
              {currentSensor.temperature > 78 ? 'ELEVATED' : 'OPTIMAL'}
            </span>
          </div>

          {/* Simple progress bar */}
          <div className="mt-3 w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                currentSensor.temperature > 75 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, (currentSensor.temperature / 100) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Actuator Physical Status Bar */}
      <div
        id="actuator-physical-status"
        className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-700/80 text-cyan-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <div className="font-mono font-medium text-white flex items-center gap-2">
              <span>PHYSICAL ACTUATOR POSITION</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-normal">
                Modbus ID #0x2A
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Downstream solenoid servo position currently locked at {currentSensor.valvePosition}%
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex-1 sm:flex-initial text-right">
            <span className="font-mono text-xl font-bold text-cyan-400">
              {currentSensor.valvePosition.toFixed(1)}%
            </span>
            <span className="text-[10px] text-zinc-500 block uppercase font-mono">APERTURE</span>
          </div>
          <div className="w-24 sm:w-32 bg-zinc-800 rounded-full h-2 overflow-hidden shrink-0">
            <div
              className="bg-cyan-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${currentSensor.valvePosition}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
