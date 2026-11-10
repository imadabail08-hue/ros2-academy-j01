import { useState, useEffect, useRef } from "react";
import { Radio, Cpu, ArrowRight, Play, Pause, Zap, Send, Activity } from "lucide-react";
import { cn } from "../../lib/utils";

type Packet = {
  id: number;
  value: number;
  progress: number; // 0 to 100%
};

export function DdsPubSubVisualizer() {
  const [hz, setHz] = useState(3);
  const [paused, setPaused] = useState(false);
  const [packets, setPackets] = useState<Packet[]>([]);
  const [receivedCount, setReceivedCount] = useState(0);
  const [lastReceivedValue, setLastReceivedValue] = useState<number | null>(null);
  const [callbackTriggered, setCallbackTriggered] = useState(false);
  const packetIdRef = useRef(1);

  // Period in milliseconds
  const periodMs = Math.round(1000 / hz);

  // Spawn packets based on frequency
  useEffect(() => {
    if (paused) return;

    const interval = setInterval(() => {
      const simulatedDistance = parseFloat((1.20 + (Math.random() * 2.80)).toFixed(2));
      setPackets((prev) => [
        ...prev,
        {
          id: packetIdRef.current++,
          value: simulatedDistance,
          progress: 0,
        },
      ]);
    }, periodMs);

    return () => clearInterval(interval);
  }, [hz, paused, periodMs]);

  // Animate packets movement (60fps tick)
  useEffect(() => {
    if (paused) return;

    const animInterval = setInterval(() => {
      setPackets((prev) => {
        const next: Packet[] = [];
        let triggered = false;
        let lastVal = lastReceivedValue;

        for (const p of prev) {
          // Speed depends on hz
          const step = 1.2 * (hz / 3 + 0.6);
          const newProgress = p.progress + step;

          if (newProgress >= 100) {
            // Arrived at subscriber!
            triggered = true;
            lastVal = p.value;
            setReceivedCount((c) => c + 1);
          } else {
            next.push({ ...p, progress: newProgress });
          }
        }

        if (triggered) {
          setLastReceivedValue(lastVal);
          setCallbackTriggered(true);
          setTimeout(() => setCallbackTriggered(false), 240);
        }

        return next;
      });
    }, 25);

    return () => clearInterval(animInterval);
  }, [paused, hz, lastReceivedValue]);

  const handleManualEmit = () => {
    const val = parseFloat((0.85 + Math.random() * 2).toFixed(2));
    setPackets((prev) => [
      ...prev,
      {
        id: packetIdRef.current++,
        value: val,
        progress: 0,
      },
    ]);
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-[#060a14] p-5 shadow-2xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-cyan-400" />
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-300">
            Schéma A · Bus DDS & Modèle Publish / Subscribe en temps réel
          </h3>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className={cn("h-2 w-2 rounded-full", paused ? "bg-amber-400" : "bg-emerald-400 animate-pulse")} />
            {paused ? "PAUSE" : "BUS CONNECTÉ"}
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-emerald-400 font-semibold">{receivedCount} callbacks reçus</span>
        </div>
      </div>

      {/* Main Flow Canvas */}
      <div className="my-6 grid grid-cols-1 md:grid-cols-[190px_minmax(0,1fr)_190px] items-center gap-4">
        {/* Left: Publisher Node */}
        <div className="rounded-xl border border-cyan-500/40 bg-slate-900/90 p-4 text-center shadow-lg relative group">
          <div className="absolute -top-2.5 left-4 rounded bg-cyan-500/20 px-2 py-0.5 font-mono text-[9.5px] font-bold text-cyan-300 border border-cyan-500/30">
            PUBLISHER NODE
          </div>
          <div className="mx-auto my-2 grid h-12 w-12 place-items-center rounded-xl bg-cyan-950/60 border border-cyan-400/40 shadow-inner">
            <Radio className="h-6 w-6 text-cyan-400 animate-pulse" />
          </div>
          <p className="font-mono text-xs font-bold text-slate-100 truncate">
            /raw_telemetry_node
          </p>
          <p className="text-[10px] font-mono text-cyan-400/80 mt-0.5">
            create_publisher()
          </p>
          <div className="mt-3 rounded-lg border border-slate-800 bg-[#030610] px-2 py-1 text-[10.5px] font-mono text-slate-400">
            Télémétrie brute @ {hz} Hz
          </div>
        </div>

        {/* Center: DDS Topic Pipe */}
        <div className="flex flex-col gap-2">
          {/* Topic metadata label */}
          <div className="flex items-center justify-between px-2 font-mono text-[10.5px]">
            <span className="text-amber-300 font-semibold flex items-center gap-1">
              <span>Topic:</span>
              <code className="text-slate-100 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700">
                /telemetry/raw_distance
              </code>
            </span>
            <span className="text-purple-300 font-medium">
              [std_msgs/msg/Float32]
            </span>
          </div>

          {/* Network Pipe Visualization */}
          <div className="relative h-14 w-full overflow-hidden rounded-xl border border-slate-800 bg-[#030611] shadow-inner">
            {/* Background Pipe Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:16px_16px] opacity-20" />
            <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500/30 via-cyan-400 to-emerald-500/30" />

            {/* Traveling Packets */}
            {packets.map((pkt) => (
              <div
                key={pkt.id}
                style={{ left: `${pkt.progress}%` }}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex items-center gap-1 rounded-md border border-cyan-400 bg-cyan-950/90 px-2 py-1 shadow-lg shadow-cyan-500/20 font-mono text-[10px] text-cyan-200 transition-all duration-75 select-none"
              >
                <Zap className="h-3 w-3 text-amber-300 fill-amber-300 animate-spin" />
                <span className="font-bold">{pkt.value.toFixed(2)}m</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 px-1">
            <span>DDS Multicast UDP</span>
            <span className="flex items-center gap-1">
              Flux asynchrone non-bloquant <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </div>

        {/* Right: Subscriber Node */}
        <div
          className={cn(
            "rounded-xl border p-4 text-center shadow-lg relative transition-all duration-200",
            callbackTriggered
              ? "border-emerald-400 bg-emerald-950/40 ring-2 ring-emerald-400/50 shadow-emerald-500/30 scale-[1.02]"
              : "border-slate-800 bg-slate-900/90"
          )}
        >
          <div className="absolute -top-2.5 left-4 rounded bg-emerald-500/20 px-2 py-0.5 font-mono text-[9.5px] font-bold text-emerald-300 border border-emerald-500/30">
            SUBSCRIBER NODE
          </div>
          <div className="mx-auto my-2 grid h-12 w-12 place-items-center rounded-xl bg-emerald-950/60 border border-emerald-400/40 shadow-inner">
            <Cpu className={cn("h-6 w-6 text-emerald-400", callbackTriggered && "text-white animate-bounce")} />
          </div>
          <p className="font-mono text-xs font-bold text-slate-100 truncate">
            /distance_filter_node
          </p>
          <p className="text-[10px] font-mono text-emerald-400/80 mt-0.5">
            create_subscription()
          </p>
          <div
            className={cn(
              "mt-3 rounded-lg border px-2 py-1 text-[10.5px] font-mono transition-colors",
              callbackTriggered
                ? "border-emerald-500 bg-emerald-900/50 text-emerald-200 font-bold"
                : "border-slate-800 bg-[#030610] text-slate-400"
            )}
          >
            {callbackTriggered ? "⚡ callback(msg) !" : lastReceivedValue !== null ? `Lu: ${lastReceivedValue.toFixed(2)} m` : "En écoute..."}
          </div>
        </div>
      </div>

      {/* Interactive Controls Bar */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-3">
        {/* Frequency Slider */}
        <div className="flex-1 min-w-[220px]">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-slate-400 font-mono">Fréquence d'émission (Publisher)</span>
            <span className="font-mono font-bold text-cyan-300">
              {hz} Hz <span className="text-slate-500 font-normal">({periodMs} ms)</span>
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={hz}
            onChange={(e) => setHz(parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPaused(!paused)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-cyan-400 hover:text-cyan-300 transition"
          >
            {paused ? <Play className="h-3.5 w-3.5 text-emerald-400" /> : <Pause className="h-3.5 w-3.5 text-amber-400" />}
            <span>{paused ? "Reprendre" : "Pause"}</span>
          </button>

          <button
            onClick={handleManualEmit}
            className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/40 px-3 py-1.5 text-xs font-medium text-cyan-300 hover:bg-cyan-900/50 transition active:scale-95"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Injecter 1 paquet manuel</span>
          </button>
        </div>
      </div>
    </div>
  );
}
