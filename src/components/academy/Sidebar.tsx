import { CheckCircle2, Circle, CircleDot, RotateCcw, Volume2, VolumeX, GraduationCap, Cpu } from "lucide-react";
import { MODULES, QUIZ_ID } from "../../lib/course";
import { cn } from "../../lib/utils";

export type Progress = {
  done: string[];
  visited: string[];
  quizScore: number | null;
};

type SidebarProps = {
  active: string;
  onSelect: (id: string) => void;
  progress: Progress;
  toggleDone: (id: string) => void;
  onReset: () => void;
  sound: boolean;
  setSound: (b: boolean) => void;
};

export function Sidebar({
  active,
  onSelect,
  progress,
  toggleDone,
  onReset,
  sound,
  setSound,
}: SidebarProps) {
  const allItems = [
    ...MODULES.map((m) => ({
      id: m.id,
      tag: m.tag,
      title: m.title,
      sub: m.subtitle,
    })),
    {
      id: QUIZ_ID,
      tag: "QUIZ",
      title: "Évaluation Jour 01",
      sub: "10 questions avec score immédiat",
    },
  ];

  const totalCount = allItems.length;
  const completedCount = progress.done.length;
  const percent = Math.round((completedCount / totalCount) * 100);

  return (
    <aside className="flex h-full flex-col gap-4 overflow-y-auto border-slate-800 bg-[#060a15] p-4 lg:border-r">
      {/* Brand Header */}
      <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3.5">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-cyan-500/10 font-mono text-sm font-extrabold text-cyan-400 border border-cyan-500/30 terminal-glow">
            <Cpu className="h-6 w-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
              <span>ROS 2 Academy</span>
              <span className="rounded bg-cyan-400/20 px-1.5 py-0.2 font-mono text-[10px] text-cyan-300">
                Humble
              </span>
            </h1>
            <p className="text-xs text-slate-400">Jour 01 : Communications & Nodes</p>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-1">
          <button
            title={sound ? "Désactiver les effets sonores" : "Activer les effets sonores"}
            onClick={() => setSound(!sound)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition"
          >
            {sound ? <Volume2 className="h-4 w-4 text-cyan-400" /> : <VolumeX className="h-4 w-4" />}
          </button>
          <button
            title="Réinitialiser la progression"
            onClick={onReset}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-red-400 transition"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Progress Card */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 shadow-sm">
        <div className="mb-2 flex items-center justify-between font-mono text-xs">
          <span className="text-slate-400 font-medium">Progression globale</span>
          <span className="text-cyan-400 font-bold">{percent}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 transition-all duration-700 shadow-sm"
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
          <span>{completedCount}/{totalCount} ateliers validés</span>
          <span className="font-mono text-slate-500">LTS 2027</span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex flex-col gap-1.5 flex-1">
        {allItems.map((item) => {
          const isDone = progress.done.includes(item.id);
          const isVisited = progress.visited.includes(item.id);
          const isCurrent = active === item.id;
          const isQuiz = item.id === QUIZ_ID;
          const isProject = item.tag.startsWith("PROJET");

          const StatusIcon = isDone ? CheckCircle2 : isVisited ? CircleDot : Circle;

          return (
            <div
              key={item.id}
              className={cn(
                "group flex items-center gap-2.5 rounded-xl border p-2.5 transition active:scale-[0.99]",
                isCurrent
                  ? "border-cyan-500/40 bg-cyan-950/20 shadow-md ring-1 ring-cyan-500/20"
                  : "border-transparent bg-slate-900/20 hover:border-slate-800 hover:bg-slate-900/60"
              )}
            >
              {/* Checkbox trigger */}
              <button
                onClick={() => toggleDone(item.id)}
                title={isDone ? "Marquer non validé" : "Marquer comme validé"}
                className="shrink-0 p-0.5"
              >
                <StatusIcon
                  className={cn(
                    "h-4 w-4 transition-colors",
                    isDone
                      ? "text-emerald-400"
                      : isVisited
                      ? "text-amber-400"
                      : "text-slate-600 group-hover:text-slate-400"
                  )}
                />
              </button>

              {/* Navigation button */}
              <button
                onClick={() => onSelect(item.id)}
                className="min-w-0 flex-1 text-left"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "font-mono text-[10px] font-bold",
                      isQuiz
                        ? "text-amber-400"
                        : isProject
                        ? "text-emerald-400"
                        : "text-cyan-400"
                    )}
                  >
                    {item.tag}
                  </span>
                  {isQuiz && <GraduationCap className="h-3.5 w-3.5 text-amber-400" />}
                </div>
                <div className={cn("truncate text-xs font-semibold mt-0.5", isCurrent ? "text-cyan-200" : "text-slate-200")}>
                  {item.title}
                </div>
                <div className="truncate text-[10.5px] text-slate-400">
                  {item.sub}
                </div>
              </button>
            </div>
          );
        })}
      </nav>

      {/* Quiz Best Score Pill */}
      {progress.quizScore !== null && (
        <div className="mt-auto rounded-lg border border-amber-500/30 bg-amber-950/20 p-2.5 text-center font-mono text-xs text-amber-300">
          Meilleur score évaluation : <strong>{progress.quizScore}/10</strong>
        </div>
      )}
    </aside>
  );
}
