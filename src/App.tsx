import { useEffect, useRef, useState } from "react";
import { Sidebar, type Progress } from "./components/academy/Sidebar";
import { ModuleView } from "./components/academy/ModuleView";
import { GraphSim } from "./components/academy/GraphSim";
import { TerminalSim } from "./components/academy/TerminalSim";
import { Quiz } from "./components/academy/Quiz";
import { MODULES, QUIZ_ID } from "./lib/course";
import { beep, useSim } from "./lib/sim";
import { BookOpen, Network, Terminal as TerminalIcon } from "lucide-react";

const STORAGE_KEY = "ros2_academy_progress_j01";

const INITIAL_PROGRESS: Progress = {
  done: [],
  visited: ["intro"],
  quizScore: null,
};

export default function App() {
  const [activeModuleId, setActiveModuleId] = useState("intro");
  const [progress, setProgress] = useState<Progress>(INITIAL_PROGRESS);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [mobileTab, setMobileTab] = useState<"content" | "graph" | "terminal">("content");
  const isLoaded = useRef(false);

  const sim = useSim();

  // Load progress from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setProgress({ ...INITIAL_PROGRESS, ...JSON.parse(saved) });
      }
    } catch {
      // Ignore localStorage errors
    }
    isLoaded.current = true;
  }, []);

  // Save progress to localStorage
  useEffect(() => {
    if (isLoaded.current) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    }
  }, [progress]);

  // Audio alert on brake activation
  const previousBrakeState = useRef(false);
  useEffect(() => {
    if (soundEnabled && sim.brake && !previousBrakeState.current) {
      beep(320, 0.3, 0.08);
    }
    previousBrakeState.current = sim.brake;
  }, [sim.brake, soundEnabled]);

  const handleSelectModule = (id: string) => {
    setActiveModuleId(id);
    setProgress((prev) => ({
      ...prev,
      visited: prev.visited.includes(id) ? prev.visited : [...prev.visited, id],
    }));
    if (soundEnabled) beep(650, 0.05, 0.03);
    setMobileTab("content");
  };

  const handleToggleDone = (id: string) => {
    setProgress((prev) => {
      const isAlreadyDone = prev.done.includes(id);
      if (!isAlreadyDone && soundEnabled) {
        beep(980, 0.1, 0.04);
      }
      return {
        ...prev,
        done: isAlreadyDone ? prev.done.filter((x) => x !== id) : [...prev.done, id],
        visited: prev.visited.includes(id) ? prev.visited : [...prev.visited, id],
      };
    });
  };

  const handleResetProgress = () => {
    if (window.confirm("Êtes-vous sûr de vouloir réinitialiser toute votre progression ?")) {
      setProgress(INITIAL_PROGRESS);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const currentModule = MODULES.find((m) => m.id === activeModuleId);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col lg:grid lg:h-screen lg:grid-cols-[280px_minmax(0,1fr)_410px] overflow-hidden">
      {/* 1. Left Sidebar (Navigation & Dynamic Progress) */}
      <div className="lg:h-screen shrink-0">
        <Sidebar
          active={activeModuleId}
          onSelect={handleSelectModule}
          progress={progress}
          toggleDone={handleToggleDone}
          onReset={handleResetProgress}
          sound={soundEnabled}
          setSound={setSoundEnabled}
        />
      </div>

      {/* Mobile Tab Switcher */}
      <div className="lg:hidden flex border-b border-slate-800 bg-slate-900/90 p-2 gap-1 sticky top-0 z-30">
        <button
          onClick={() => setMobileTab("content")}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 ${
            mobileTab === "content" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40" : "text-slate-400"
          }`}
        >
          <BookOpen className="h-3.5 w-3.5" />
          <span>Atelier</span>
        </button>
        <button
          onClick={() => setMobileTab("graph")}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 ${
            mobileTab === "graph" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40" : "text-slate-400"
          }`}
        >
          <Network className="h-3.5 w-3.5" />
          <span>rqt_graph</span>
        </button>
        <button
          onClick={() => setMobileTab("terminal")}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 ${
            mobileTab === "terminal" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40" : "text-slate-400"
          }`}
        >
          <TerminalIcon className="h-3.5 w-3.5" />
          <span>Terminal</span>
        </button>
      </div>

      {/* 2. Central Workspace (Detailed Module View with 4 tabs or Quiz) */}
      <main
        className={`overflow-y-auto p-4 md:p-6 lg:p-8 lg:h-screen ${
          mobileTab !== "content" ? "hidden lg:block" : "block"
        }`}
      >
        <div className="mx-auto max-w-3xl">
          {currentModule ? (
            <ModuleView
              key={currentModule.id}
              mod={currentModule}
              done={progress.done.includes(currentModule.id)}
              onDone={() => handleToggleDone(currentModule.id)}
            />
          ) : (
            <Quiz
              feedback={(isOk) => {
                if (soundEnabled) {
                  beep(isOk ? 1046 : 220, 0.15, 0.05);
                }
              }}
              onFinish={(finalScore) => {
                setProgress((prev) => ({
                  ...prev,
                  quizScore: Math.max(finalScore, prev.quizScore ?? 0),
                  done:
                    finalScore >= 7 && !prev.done.includes(QUIZ_ID)
                      ? [...prev.done, QUIZ_ID]
                      : prev.done,
                }));
              }}
            />
          )}
        </div>
      </main>

      {/* 3. Right Column (Dual Interactive Simulation Suite) */}
      <aside
        className={`space-y-4 overflow-y-auto border-slate-800 bg-[#030712] p-4 lg:h-screen lg:border-l ${
          mobileTab === "content" ? "hidden lg:block" : "block"
        }`}
      >
        <div className={mobileTab === "terminal" ? "hidden lg:block" : "block"}>
          <GraphSim sim={sim} />
        </div>
        <div className={mobileTab === "graph" ? "hidden lg:block" : "block"}>
          <TerminalSim sim={sim} />
        </div>
      </aside>
    </div>
  );
}
