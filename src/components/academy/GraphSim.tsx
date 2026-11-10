import { useState } from "react";
import { Info, Pause, Play, ShieldAlert, Waves, X } from "lucide-react";
import type { SimState } from "../../lib/sim";
import { cn } from "../../lib/utils";

type NodeInfo = {
  id: string;
  x: number;
  y: number;
  subs: string[];
  pubs: string[];
  rate: string;
  qos: string;
};

export function GraphSim({ sim }: { sim: SimState }) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const nodes: NodeInfo[] = [
    {
      id: "/raw_telemetry_node",
      x: 105,
      y: 45,
      subs: [],
      pubs: ["/telemetry/lidar_raw [std_msgs/msg/Float32]"],
      rate: `${sim.hz} Hz (Timer rclpy)`,
      qos: "RELIABLE · VOLATILE · KEEP_LAST(10)",
    },
    {
      id: "/distance_filter_node",
      x: 105,
      y: 155,
      subs: ["/telemetry/lidar_raw [std_msgs/msg/Float32]"],
      pubs: ["/safety/obstacle_distance [std_msgs/msg/Float32]"],
      rate: `${sim.hz} Hz (Event-Driven)`,
      qos: "RELIABLE · VOLATILE · KEEP_LAST(10)",
    },
    {
      id: "/emergency_brake_node",
      x: 105,
      y: 265,
      subs: ["/safety/obstacle_distance [std_msgs/msg/Float32]"],
      pubs: ["/vehicle/brake_cmd [std_msgs/msg/Bool]"],
      rate: `${sim.hz} Hz (Event-Driven)`,
      qos: "RELIABLE · VOLATILE · KEEP_LAST(10)",
    },
  ];

  const topics = [
    { id: "/telemetry/lidar_raw", x: 295, y: 100, val: `${sim.raw.toFixed(2)} m` },
    { id: "/safety/obstacle_distance", x: 295, y: 210, val: `${sim.filtered.toFixed(2)} m` },
    { id: "/vehicle/brake_cmd", x: 295, y: 312, val: sim.brake ? "True" : "False" },
  ];

  // SVG curved paths connecting nodes and topics
  const edges = [
    "M 175 45 C 240 45, 295 65, 295 86",
    "M 295 114 C 295 145, 250 155, 178 155",
    "M 178 155 C 245 155, 295 175, 295 196",
    "M 295 224 C 295 255, 250 265, 178 265",
    "M 178 265 C 245 265, 295 285, 295 298",
  ];

  const dur = `${Math.max(0.4, 2.5 / Math.sqrt(sim.hz))}s`;
  const activeInfo = nodes.find((n) => n.id === selectedNode);

  return (
    <div
      className={cn(
        "relative rounded-xl border bg-slate-900/90 p-4 transition-all duration-300 shadow-xl",
        sim.brake
          ? "border-red-500/80 ring-2 ring-red-500/30 alarm-glow"
          : "border-slate-800"
      )}
    >
      {/* Top Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-400">
            rqt_graph · Simulateur SVG
          </h3>
        </div>
        <span
          className={cn(
            "flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[11px] font-semibold",
            sim.paused
              ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
              : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", sim.paused ? "bg-amber-400" : "bg-emerald-400 animate-pulse")} />
          {sim.paused ? "EN PAUSE" : "FLUX ACTIF"}
        </span>
      </div>

      {/* Emergency Warning Banner when distance < 0.50m */}
      {sim.brake && (
        <div className="mb-3 flex items-center gap-2.5 rounded-lg border border-red-500/80 bg-red-950/60 px-3 py-2 text-red-200 animate-pulse shadow-lg">
          <ShieldAlert className="h-5 w-5 shrink-0 text-red-400" />
          <div className="font-mono text-[11px] font-bold leading-tight">
            <span className="text-red-400">URGENCE :</span> OBSTACLE DÉTECTÉ (&lt; 0.50m) — FREIN ACTIF !
          </div>
        </div>
      )}

      {/* SVG Canvas */}
      <div className="relative overflow-hidden rounded-lg border border-slate-800 bg-[#040813]">
        <svg viewBox="0 0 410 335" className="w-full">
          <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto"
            >
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#64748b" />
            </marker>
          </defs>

          {/* Background grid */}
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" strokeOpacity="0.4" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Connection Edges & Message Pulses */}
          {edges.map((pathD, idx) => {
            const isBrakeEdge = idx === 4 && sim.brake;
            return (
              <g key={idx}>
                <path
                  id={`edge-${idx}`}
                  d={pathD}
                  fill="none"
                  strokeWidth="1.6"
                  markerEnd="url(#arrow)"
                  className={cn(
                    "transition-colors",
                    isBrakeEdge ? "stroke-red-500 stroke-[2.2]" : "stroke-slate-600/80"
                  )}
                />
                {!sim.paused && (
                  <circle
                    r="4.5"
                    filter="url(#glow)"
                    className={cn(
                      idx >= 3 && sim.brake
                        ? "fill-red-400"
                        : idx < 2
                        ? "fill-cyan-400"
                        : "fill-emerald-400"
                    )}
                  >
                    <animateMotion
                      dur={dur}
                      repeatCount="indefinite"
                      begin={`${idx * 0.15}s`}
                    >
                      <mpath href={`#edge-${idx}`} />
                    </animateMotion>
                  </circle>
                )}
              </g>
            );
          })}

          {/* Topics (Rectangles ROS 2 Style) */}
          {topics.map((t, idx) => {
            const isBrake = idx === 2 && sim.brake;
            return (
              <g key={t.id}>
                <rect
                  x={t.x - 95}
                  y={t.y - 14}
                  width="190"
                  height="28"
                  rx="5"
                  className={cn(
                    "fill-slate-900 transition-colors",
                    isBrake
                      ? "stroke-red-500 stroke-[1.8]"
                      : "stroke-amber-400/80 stroke-[1.2]"
                  )}
                />
                <text
                  x={t.x}
                  y={t.y - 1}
                  textAnchor="middle"
                  className="fill-amber-300 font-mono text-[9.5px] font-medium"
                >
                  {t.id}
                </text>
                <text
                  x={t.x}
                  y={t.y + 10}
                  textAnchor="middle"
                  className={cn(
                    "font-mono text-[8.5px] font-bold",
                    isBrake ? "fill-red-400" : "fill-slate-400"
                  )}
                >
                  {t.val}
                </text>
              </g>
            );
          })}

          {/* Nodes (Ellipses ROS 2 Style) */}
          {nodes.map((node, idx) => {
            const isSelected = selectedNode === node.id;
            const isBrakeNode = idx === 2 && sim.brake;
            return (
              <g
                key={node.id}
                onClick={() => setSelectedNode(isSelected ? null : node.id)}
                className="cursor-pointer transition-transform hover:scale-[1.02]"
              >
                <ellipse
                  cx={node.x}
                  cy={node.y}
                  rx="75"
                  ry="21"
                  className={cn(
                    "transition-all",
                    isSelected
                      ? "fill-cyan-950/80 stroke-cyan-300 stroke-[2.5]"
                      : isBrakeNode
                      ? "fill-red-950/40 stroke-red-500 stroke-[2]"
                      : "fill-slate-900 stroke-cyan-500/80 stroke-[1.4] hover:stroke-cyan-400"
                  )}
                />
                <text
                  x={node.x}
                  y={node.y + 3.5}
                  textAnchor="middle"
                  className="pointer-events-none fill-slate-100 font-mono text-[9.5px] font-medium"
                >
                  {node.id}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="absolute bottom-2 left-2 flex items-center gap-1 text-[10px] text-slate-500">
          <Info className="h-3 w-3" />
          <span>Cliquez sur un node pour l'inspecter</span>
        </div>
      </div>

      {/* Node Inspector Box */}
      {activeInfo && (
        <div className="mt-3 rounded-lg border border-cyan-500/40 bg-slate-950/90 p-3 font-mono text-[11px] text-slate-300 shadow-md">
          <div className="mb-2 flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="font-bold text-cyan-300">{activeInfo.id}</span>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-slate-500 hover:text-slate-300"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="space-y-1">
            <p className="text-slate-500">Subscribers :</p>
            {activeInfo.subs.length > 0 ? (
              activeInfo.subs.map((s) => (
                <p key={s} className="pl-2 text-emerald-400">└─ {s}</p>
              ))
            ) : (
              <p className="pl-2 text-slate-600 italic">aucun</p>
            )}

            <p className="pt-1 text-slate-500">Publishers :</p>
            {activeInfo.pubs.map((p) => (
              <p key={p} className="pl-2 text-amber-300">└─ {p}</p>
            ))}

            <div className="mt-2 flex justify-between pt-1 border-t border-slate-800 text-[10px]">
              <span><span className="text-slate-500">Rate:</span> {activeInfo.rate}</span>
              <span><span className="text-slate-500">QoS:</span> {activeInfo.qos}</span>
            </div>
          </div>
        </div>
      )}

      {/* Simulator Interactive Controls */}
      <div className="mt-4 space-y-3">
        {/* Distance Slider */}
        <div>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-slate-400">Distance obstacle (LiDAR)</span>
            <span
              className={cn(
                "font-mono font-bold",
                sim.distance < 0.50 ? "text-red-400" : "text-cyan-400"
              )}
            >
              {sim.distance.toFixed(2)} m
            </span>
          </div>
          <input
            type="range"
            min={0.10}
            max={5.00}
            step={0.02}
            value={sim.distance}
            onChange={(e) => sim.setDistance(parseFloat(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
          />
          <div className="flex justify-between font-mono text-[9px] text-slate-600 mt-0.5">
            <span className="text-red-400 font-semibold">0.10m (Crash)</span>
            <span className="text-amber-400 font-semibold">0.50m (Seuil Frein)</span>
            <span>5.00m (Sécurisé)</span>
          </div>
        </div>

        {/* Frequency Slider */}
        <div>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-slate-400">Fréquence de boucle ROS 2</span>
            <span className="font-mono text-emerald-400">{sim.hz} Hz</span>
          </div>
          <input
            type="range"
            min={1}
            max={20}
            step={1}
            value={sim.hz}
            onChange={(e) => sim.setHz(parseInt(e.target.value))}
            className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => sim.setPaused(!sim.paused)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 py-2 text-xs font-medium text-slate-200 transition hover:border-cyan-400 hover:text-cyan-300"
          >
            {sim.paused ? <Play className="h-3.5 w-3.5 text-emerald-400" /> : <Pause className="h-3.5 w-3.5 text-amber-400" />}
            {sim.paused ? "Reprendre flux" : "Pause simulation"}
          </button>

          <button
            onClick={() => sim.setNoise(!sim.noise)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-medium transition",
              sim.noise
                ? "border-amber-500/50 bg-amber-950/30 text-amber-300"
                : "border-slate-700 bg-slate-800/80 text-slate-400"
            )}
          >
            <Waves className="h-3.5 w-3.5" />
            Bruit capteur : {sim.noise ? "ACTIF" : "OFF"}
          </button>
        </div>
      </div>
    </div>
  );
}
