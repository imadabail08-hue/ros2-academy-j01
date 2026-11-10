import { useState } from "react";
import { ShieldAlert, ShieldCheck, Cpu, Radio, Activity } from "lucide-react";
import { cn } from "../../lib/utils";

export function Project01InteractiveSandbox() {
  const [distance, setDistance] = useState(1.40); // 0.10m to 2.50m
  const isEmergency = distance < 0.50;

  // Normalized visual position for SVG:
  // When distance = 2.50m -> robotX = 80
  // When distance = 0.10m -> robotX = 330 (wall at 380)
  const robotX = 80 + ((2.50 - distance) / 2.40) * 230;
  const wallX = 370;

  return (
    <div
      className={cn(
        "rounded-2xl border p-5 shadow-2xl transition-all duration-300",
        isEmergency
          ? "border-red-500/80 bg-gradient-to-b from-red-950/40 via-slate-950 to-slate-950 ring-2 ring-red-500/40 alarm-glow"
          : "border-slate-800 bg-[#060a14]"
      )}
    >
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          {isEmergency ? (
            <ShieldAlert className="h-5 w-5 text-red-400 animate-bounce" />
          ) : (
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
          )}
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-300">
            Schéma D · Bac à sable Projet 01 : Télémétrie LiDAR & Arrêt d'Urgence AGV
          </h3>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-400">Seuil de sécurité :</span>
          <span className="rounded bg-amber-500/10 px-2 py-0.5 font-bold text-amber-400 border border-amber-500/30">
            0.50 m
          </span>
        </div>
      </div>

      {/* Critical Alert Warning */}
      {isEmergency && (
        <div className="my-3 flex items-center justify-between gap-3 rounded-xl border border-red-500 bg-red-950/70 p-3 text-red-200 animate-pulse shadow-lg">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-red-500/30 text-red-300 text-lg">
              🚨
            </span>
            <div>
              <p className="font-mono text-xs font-extrabold text-red-400 uppercase tracking-wider">
                ARRÊT D'URGENCE ACTIF (Distance &lt; 0.50 m)
              </p>
              <p className="text-xs text-red-200/90">
                L'obstacle est à <strong>{distance.toFixed(2)} m</strong>. Le node `/emergency_brake_node` coupe les moteurs !
              </p>
            </div>
          </div>
          <span className="rounded-lg bg-red-500 px-3 py-1 font-mono text-xs font-black text-slate-950 uppercase tracking-widest shadow">
            FREIN 100%
          </span>
        </div>
      )}

      {/* 2D AGV Simulation Scene (SVG) */}
      <div className="my-4 overflow-hidden rounded-xl border border-slate-800 bg-[#030712] p-2 relative shadow-inner">
        <svg viewBox="0 0 450 180" className="w-full h-auto">
          <defs>
            {/* Laser beam gradient */}
            <linearGradient id="laserGradCyan" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="laserGradRed" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.2" />
            </linearGradient>

            {/* Pattern grid floor */}
            <pattern id="floorGrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" strokeOpacity="0.4" />
            </pattern>
          </defs>

          {/* Floor grid */}
          <rect y="120" width="450" height="60" fill="url(#floorGrid)" />
          <line x1="0" y1="120" x2="450" y2="120" stroke="#334155" strokeWidth="1.5" />

          {/* Obstacle Wall on the right */}
          <g transform={`translate(${wallX}, 35)`}>
            <rect
              width="35"
              height="95"
              rx="4"
              fill={isEmergency ? "#7f1d1d" : "#1e293b"}
              stroke={isEmergency ? "#ef4444" : "#475569"}
              strokeWidth="2"
              className="transition-colors duration-300"
            />
            {/* Warning stripes on the wall */}
            {[0, 16, 32, 48, 64, 80].map((yOff) => (
              <line
                key={yOff}
                x1="0"
                y1={yOff}
                x2="35"
                y2={yOff + 14}
                stroke={isEmergency ? "#f87171" : "#334155"}
                strokeWidth="2"
              />
            ))}
            <text x="17.5" y="110" textAnchor="middle" className="fill-slate-500 font-mono text-[9px]">
              OBSTACLE
            </text>
          </g>

          {/* Distance Indicator Arrow between Robot and Wall */}
          <g>
            <line
              x1={robotX + 55}
              y1="45"
              x2={wallX}
              y2="45"
              stroke={isEmergency ? "#ef4444" : "#22d3ee"}
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            <rect
              x={(robotX + 55 + wallX) / 2 - 35}
              y="33"
              width="70"
              height="22"
              rx="5"
              fill="#090e1a"
              stroke={isEmergency ? "#ef4444" : "#22d3ee"}
              strokeWidth="1.5"
            />
            <text
              x={(robotX + 55 + wallX) / 2}
              y="48"
              textAnchor="middle"
              className={cn(
                "font-mono text-[11px] font-bold",
                isEmergency ? "fill-red-400" : "fill-cyan-300"
              )}
            >
              {distance.toFixed(2)} m
            </text>
          </g>

          {/* LiDAR Laser Cone */}
          <polygon
            points={`${robotX + 52},85 ${wallX},70 ${wallX},100`}
            fill={isEmergency ? "url(#laserGradRed)" : "url(#laserGradCyan)"}
            className="transition-all duration-150"
          />
          <line
            x1={robotX + 52}
            y1="85"
            x2={wallX}
            y2="85"
            stroke={isEmergency ? "#ef4444" : "#22d3ee"}
            strokeWidth={isEmergency ? 2.5 : 1.5}
            className="animate-pulse"
          />

          {/* Robot AGV body */}
          <g transform={`translate(${robotX}, 65)`} className="transition-transform duration-100">
            {/* Gyrophare / Rotating beacon */}
            {isEmergency ? (
              <g transform="translate(25, -12)">
                <circle cx="0" cy="0" r="10" fill="#ef4444" className="animate-ping opacity-75" />
                <rect x="-6" y="-7" width="12" height="12" rx="3" fill="#ef4444" stroke="#fca5a5" strokeWidth="1.5" />
                <path d="M -6 -1 L 6 -1" stroke="#ffffff" strokeWidth="2" />
              </g>
            ) : (
              <circle cx="25" cy="-8" r="4" fill="#10b981" />
            )}

            {/* Chassis */}
            <rect
              x="0"
              y="0"
              width="50"
              height="40"
              rx="8"
              fill={isEmergency ? "#450a0a" : "#0f172a"}
              stroke={isEmergency ? "#ef4444" : "#06b6d4"}
              strokeWidth="2"
              className="transition-colors duration-300"
            />

            {/* LiDAR sensor turret on top */}
            <rect x="42" y="14" width="10" height="12" rx="3" fill="#38bdf8" />
            <circle cx="47" cy="20" r="2.5" fill="#0284c7" />

            {/* Wheels */}
            <rect x="6" y="38" width="14" height="12" rx="3" fill="#334155" />
            <rect x="30" y="38" width="14" height="12" rx="3" fill="#334155" />

            {/* AGV Label */}
            <text x="25" y="24" textAnchor="middle" className="fill-slate-100 font-mono text-[9px] font-bold">
              AGV-01
            </text>
          </g>
        </svg>
      </div>

      {/* Real-time Distance Slider Control */}
      <div className="my-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-mono text-slate-300 font-semibold">
            Réglez la position de l'obstacle :
          </label>
          <span
            className={cn(
              "font-mono text-sm font-bold px-2 py-0.5 rounded border",
              isEmergency
                ? "bg-red-950/60 text-red-300 border-red-500/50"
                : "bg-cyan-950/60 text-cyan-300 border-cyan-500/40"
            )}
          >
            Distance = {distance.toFixed(2)} m
          </span>
        </div>
        <input
          type="range"
          min={0.10}
          max={2.50}
          step={0.02}
          value={distance}
          onChange={(e) => setDistance(parseFloat(e.target.value))}
          className={cn(
            "w-full h-2 rounded-lg appearance-none cursor-pointer",
            isEmergency ? "accent-red-500 bg-red-950" : "accent-cyan-400 bg-slate-800"
          )}
        />
        <div className="flex justify-between font-mono text-[10px] text-slate-500 mt-1">
          <span className="text-red-400 font-bold">0.10 m (Collision imminente)</span>
          <span className="text-amber-400 font-bold">0.50 m (Seuil d'alerte)</span>
          <span>2.50 m (Sécurité totale)</span>
        </div>
      </div>

      {/* 3 Connected Nodes State Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Node 1 */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 font-mono text-xs">
          <div className="flex items-center gap-2 text-cyan-300 font-bold mb-1.5">
            <Radio className="h-4 w-4 text-cyan-400" />
            <span className="truncate">/raw_telemetry_node</span>
          </div>
          <div className="text-[11px] text-slate-400 mb-1">
            Publie sur : <span className="text-amber-300">/telemetry/raw_distance</span>
          </div>
          <div className="flex items-center justify-between rounded bg-slate-950 px-2 py-1 text-[11px]">
            <span className="text-slate-500">[Float32]</span>
            <span className="text-cyan-400 font-bold">{distance.toFixed(2)} m</span>
          </div>
        </div>

        {/* Node 2 */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 font-mono text-xs">
          <div className="flex items-center gap-2 text-emerald-300 font-bold mb-1.5">
            <Activity className="h-4 w-4 text-emerald-400" />
            <span className="truncate">/distance_filter_node</span>
          </div>
          <div className="text-[11px] text-slate-400 mb-1">
            Publie sur : <span className="text-amber-300">/safety/filtered_distance</span>
          </div>
          <div className="flex items-center justify-between rounded bg-slate-950 px-2 py-1 text-[11px]">
            <span className="text-slate-500">[Float32]</span>
            <span className="text-emerald-400 font-bold">{distance.toFixed(2)} m (lissé)</span>
          </div>
        </div>

        {/* Node 3 */}
        <div
          className={cn(
            "rounded-xl border p-3 font-mono text-xs transition-colors",
            isEmergency
              ? "border-red-500/70 bg-red-950/30 text-red-200"
              : "border-slate-800 bg-slate-900/70"
          )}
        >
          <div className="flex items-center gap-2 font-bold mb-1.5">
            <Cpu className={cn("h-4 w-4", isEmergency ? "text-red-400 animate-spin" : "text-purple-400")} />
            <span className="truncate">/emergency_brake_node</span>
          </div>
          <div className="text-[11px] text-slate-400 mb-1">
            Publie sur : <span className="text-amber-300">/safety/emergency_flag</span>
          </div>
          <div
            className={cn(
              "flex items-center justify-between rounded px-2 py-1 text-[11px] font-bold",
              isEmergency
                ? "bg-red-500 text-slate-950 shadow"
                : "bg-slate-950 text-emerald-400"
            )}
          >
            <span className={isEmergency ? "text-slate-950" : "text-slate-500"}>[Bool]</span>
            <span>{isEmergency ? "TRUE (FREIN 100%)" : "FALSE (ROUTE LIBRE)"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
