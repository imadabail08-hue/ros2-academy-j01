import { useState, useEffect } from "react";
import { Play, Pause, StepForward, RotateCw, ShieldCheck, Clock, Terminal, CheckCircle2 } from "lucide-react";
import { cn } from "../../lib/utils";

type Step = {
  num: number;
  title: string;
  short: string;
  icon: typeof Clock;
  color: string;
  bgBadge: string;
  desc: string;
  analogy: string;
};

const STEPS: Step[] = [
  {
    num: 1,
    title: "Attente passive (Wait-Set DDS)",
    short: "1. Veille passive",
    icon: Clock,
    color: "text-cyan-400 border-cyan-400",
    bgBadge: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
    desc: "L'executor rclpy endort le thread Python via l'appel système Linux epoll(). La consommation CPU tombe à 0.0% : le node ne tourne pas en boucle active inutile.",
    analogy: "Comme attendre que le téléphone sonne au lieu de décrocher toutes les 2 secondes pour vérifier.",
  },
  {
    num: 2,
    title: "Réception d'un signal d'interruption",
    short: "2. Signal réseau",
    icon: RotateCw,
    color: "text-amber-400 border-amber-400",
    bgBadge: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    desc: "Un nouveau message UDP DDS arrive sur l'interface réseau, ou le minuteur du Timer déclenche une interruption d'horloge. Le kernel Linux réveille le thread rclpy.",
    analogy: "La sonnerie du téléphone retentit dans la pièce.",
  },
  {
    num: 3,
    title: "Dépilement de la file d'attente QoS",
    short: "3. Dépilement QoS",
    icon: ShieldCheck,
    color: "text-purple-400 border-purple-400",
    bgBadge: "bg-purple-500/10 text-purple-300 border-purple-500/30",
    desc: "L'executor inspecte la mémoire tampon (History Depth 10) et extrait le message disponible le plus ancien selon la politique QoS (Reliable vs Best Effort).",
    analogy: "Vous prenez la lettre en haut de la pile de votre boîte aux lettres.",
  },
  {
    num: 4,
    title: "Exécution de la fonction Callback",
    short: "4. Exécution Callback",
    icon: Terminal,
    color: "text-emerald-400 border-emerald-400",
    bgBadge: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    desc: "L'executor appelle votre code Python : self.timer_callback() ou self.listener_callback(msg). Ce callback s'exécute de façon bloquante dans le thread.",
    analogy: "Vous lisez la lettre et prenez une décision immédiate.",
  },
  {
    num: 5,
    title: "Bouclage & Retour en attente",
    short: "5. Bouclage",
    icon: CheckCircle2,
    color: "text-blue-400 border-blue-400",
    bgBadge: "bg-blue-500/10 text-blue-300 border-blue-500/30",
    desc: "Dès que le callback retourne (return), l'executor vérifie s'il reste d'autres événements en attente. Si la file est vide, il se rendort en Étape 1.",
    analogy: "Vous reposez le combiné et attendez le prochain appel.",
  },
];

export function EventLoopVisualizer() {
  const [activeStepIdx, setActiveStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setActiveStepIdx((prev) => (prev + 1) % STEPS.length);
    }, 2200);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleNextStep = () => {
    setIsPlaying(false);
    setActiveStepIdx((prev) => (prev + 1) % STEPS.length);
  };

  const activeStep = STEPS[activeStepIdx];

  // Circle positioning coordinates (5 points around a circle of radius 110)
  const centerX = 160;
  const centerY = 150;
  const radius = 105;

  return (
    <div className="rounded-xl border border-slate-800 bg-[#060a14] p-5 shadow-2xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <RotateCw className="h-4 w-4 text-cyan-400 animate-spin" />
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-300">
            Schéma B · Anatomie interne de rclpy.spin(node)
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs font-medium text-slate-300 hover:border-cyan-400 hover:text-cyan-200 transition"
          >
            {isPlaying ? <Pause className="h-3.5 w-3.5 text-amber-400" /> : <Play className="h-3.5 w-3.5 text-emerald-400" />}
            <span>{isPlaying ? "Pause" : "Lecture auto"}</span>
          </button>
          <button
            onClick={handleNextStep}
            className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/40 px-2.5 py-1 text-xs font-medium text-cyan-300 hover:bg-cyan-900/50 transition active:scale-95"
          >
            <StepForward className="h-3.5 w-3.5" />
            <span>Avancer pas-à-pas</span>
          </button>
        </div>
      </div>

      <div className="my-5 grid grid-cols-1 md:grid-cols-[330px_minmax(0,1fr)] items-center gap-6">
        {/* Orbital SVG Wheel */}
        <div className="relative mx-auto w-[320px] h-[300px]">
          <svg viewBox="0 0 320 300" className="w-full h-full">
            {/* Background Circle */}
            <circle
              cx={centerX}
              cy={centerY}
              r={radius}
              fill="none"
              stroke="#1e293b"
              strokeWidth="3"
              strokeDasharray="6 6"
            />

            {/* Glowing Active Track */}
            <circle
              cx={centerX}
              cy={centerY}
              r={radius}
              fill="none"
              stroke="#22d3ee"
              strokeWidth="2"
              className="opacity-40 animate-pulse"
            />

            {/* Center Node Hub */}
            <g transform={`translate(${centerX - 48}, ${centerY - 48})`}>
              <rect
                width="96"
                height="96"
                rx="48"
                fill="#0b1120"
                stroke="#334155"
                strokeWidth="2"
              />
              <text
                x="48"
                y="43"
                textAnchor="middle"
                className="fill-cyan-400 font-mono text-[11px] font-bold"
              >
                rclpy.spin()
              </text>
              <text
                x="48"
                y="59"
                textAnchor="middle"
                className="fill-slate-400 font-mono text-[9px]"
              >
                SingleThreaded
              </text>
              <text
                x="48"
                y="71"
                textAnchor="middle"
                className="fill-slate-500 font-mono text-[8px]"
              >
                Executor
              </text>
            </g>

            {/* 5 Step Nodes on the Circle */}
            {STEPS.map((step, idx) => {
              // 5 evenly spaced angles, starting at top (-PI/2)
              const angle = -Math.PI / 2 + (idx * 2 * Math.PI) / STEPS.length;
              const x = centerX + radius * Math.cos(angle);
              const y = centerY + radius * Math.sin(angle);
              const isActive = activeStepIdx === idx;

              return (
                <g
                  key={step.num}
                  onClick={() => {
                    setIsPlaying(false);
                    setActiveStepIdx(idx);
                  }}
                  className="cursor-pointer transition-transform duration-200"
                >
                  {/* Outer pulse when active */}
                  {isActive && (
                    <circle
                      cx={x}
                      cy={y}
                      r="26"
                      fill="none"
                      stroke="#22d3ee"
                      strokeWidth="2"
                      className="animate-ping opacity-75"
                    />
                  )}

                  {/* Node Circle */}
                  <circle
                    cx={x}
                    cy={y}
                    r="20"
                    fill={isActive ? "#0e1c36" : "#0f172a"}
                    stroke={isActive ? "#22d3ee" : "#334155"}
                    strokeWidth={isActive ? 2.5 : 1.5}
                    className="transition-all"
                  />

                  {/* Step Number */}
                  <text
                    x={x}
                    y={y + 4.5}
                    textAnchor="middle"
                    className={cn(
                      "font-mono text-xs font-bold pointer-events-none select-none",
                      isActive ? "fill-cyan-300" : "fill-slate-400"
                    )}
                  >
                    0{step.num}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Detailed Explanation of Current Step */}
        <div className="flex flex-col justify-center rounded-xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2.5">
            <span
              className={cn(
                "rounded-md border px-2.5 py-0.5 font-mono text-xs font-bold",
                activeStep.bgBadge
              )}
            >
              PHASE 0{activeStep.num} SUR 05
            </span>
            <span className="font-mono text-[11px] text-slate-500">
              Cliquez sur les cercles pour inspecter
            </span>
          </div>

          <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <span>{activeStep.title}</span>
          </h4>

          <p className="text-sm text-slate-300 leading-relaxed mb-4">
            {activeStep.desc}
          </p>

          <div className="rounded-lg border border-purple-500/30 bg-purple-950/20 p-3 text-xs text-purple-200">
            <strong className="text-purple-300 font-semibold">💡 Analogie concrète : </strong>
            {activeStep.analogy}
          </div>

          {/* Quick jump step buttons */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap gap-1.5">
            {STEPS.map((s, idx) => (
              <button
                key={s.num}
                onClick={() => {
                  setIsPlaying(false);
                  setActiveStepIdx(idx);
                }}
                className={cn(
                  "rounded-md px-2 py-1 font-mono text-[10px] transition",
                  activeStepIdx === idx
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold"
                    : "bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800"
                )}
              >
                {s.short}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
