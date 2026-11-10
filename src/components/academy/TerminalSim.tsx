import { useEffect, useRef, useState, type ReactNode } from "react";
import { Terminal, Trash2 } from "lucide-react";
import type { SimState } from "../../lib/sim";

type Line = { id: number; node: ReactNode };
let lineCounter = 0;

const PROMPT = (
  <>
    <span className="text-emerald-400 font-semibold">student@ros2-humble</span>
    <span className="text-slate-500">:</span>
    <span className="text-cyan-400 font-semibold">~/ros2_ws</span>
    <span className="text-slate-400">$ </span>
  </>
);

const SHORTCUTS = [
  "ros2 node list",
  "ros2 topic list -t",
  "ros2 topic echo /safety/obstacle_distance",
  "ros2 topic hz /telemetry/lidar_raw",
  "rqt_graph",
  "ros2 run pipeline_pkg safety_filter",
  "clear",
];

const TOPICS_CATALOG: Record<string, string> = {
  "/telemetry/lidar_raw": "std_msgs/msg/Float32",
  "/safety/obstacle_distance": "std_msgs/msg/Float32",
  "/vehicle/brake_cmd": "std_msgs/msg/Bool",
  "/parameter_events": "rcl_interfaces/msg/ParameterEvent",
  "/rosout": "rcl_interfaces/msg/Log",
};

const getTimestamp = () => (Date.now() / 1000).toFixed(6);

export function TerminalSim({ sim }: { sim: SimState }) {
  const [lines, setLines] = useState<Line[]>([
    {
      id: lineCounter++,
      node: (
        <span className="text-slate-400">
          ROS 2 Humble Hawksbill [Ubuntu 22.04 LTS] — Terminal interactif actif.
          <br />
          <span className="text-slate-500">Astuce : Utilisez les raccourcis cliquables ou tapez « help ».</span>
        </span>
      ),
    },
  ]);
  const [input, setInput] = useState("");
  const [stream, setStream] = useState<null | { kind: "echo" | "hz" | "run"; topic: string }>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const terminalBox = useRef<HTMLDivElement>(null);
  const simRef = useRef(sim);
  simRef.current = sim;

  const pushLines = (...nodes: ReactNode[]) => {
    setLines((prev) => [
      ...prev,
      ...nodes.map((node) => ({ id: lineCounter++, node })),
    ].slice(-300));
  };

  useEffect(() => {
    terminalBox.current?.scrollTo({ top: terminalBox.current.scrollHeight });
  }, [lines]);

  // Synchronized simulation stream
  useEffect(() => {
    if (!stream || sim.paused) return;
    const currentSim = simRef.current;

    if (stream.kind === "echo") {
      if (stream.topic === "/vehicle/brake_cmd") {
        pushLines(
          <div className="font-mono text-xs">
            <span>data: </span>
            <span className={currentSim.brake ? "text-red-400 font-bold" : "text-emerald-400 font-bold"}>
              {currentSim.brake ? "true" : "false"}
            </span>
            <div className="text-slate-600">---</div>
          </div>
        );
      } else {
        const val = stream.topic === "/telemetry/lidar_raw" ? currentSim.raw : currentSim.filtered;
        pushLines(
          <div className="font-mono text-xs">
            <span>data: </span>
            <span className={val < 0.50 ? "text-red-400 font-bold" : "text-amber-300 font-mono"}>
              {val.toFixed(5)}
            </span>
            <div className="text-slate-600">---</div>
          </div>
        );
      }
    } else if (stream.kind === "hz") {
      if (sim.tick % Math.max(1, currentSim.hz) === 0) {
        pushLines(
          <div className="font-mono text-xs">
            <span>average rate: </span>
            <span className="text-cyan-400 font-bold">
              {(currentSim.hz + (Math.random() - 0.5) * 0.06).toFixed(3)}
            </span>
            <span className="text-slate-500 ml-2">
              min: {(1 / currentSim.hz - 0.002).toFixed(3)}s max: {(1 / currentSim.hz + 0.003).toFixed(3)}s window: {currentSim.hz * 2}
            </span>
          </div>
        );
      }
    } else if (stream.kind === "run") {
      if (sim.tick % Math.max(1, Math.round(currentSim.hz / 2)) === 0) {
        if (currentSim.brake) {
          pushLines(
            <div className="font-mono text-xs text-amber-400">
              [WARN] [{getTimestamp()}] [emergency_brake_node]: ALERTE : obstacle critique à {currentSim.filtered.toFixed(2)} m - FREIN ACTIF !
            </div>
          );
        } else {
          pushLines(
            <div className="font-mono text-xs text-slate-300">
              [INFO] [{getTimestamp()}] [distance_filter_node]: Mesure filtrée = {currentSim.filtered.toFixed(2)} m (brut {currentSim.raw.toFixed(2)} m)
            </div>
          );
        }
      }
    }
  }, [sim.tick]);

  const executeCommand = (cmdRaw: string) => {
    const cmd = cmdRaw.trim().replace(/\s+/g, " ");
    if (stream) {
      pushLines(<span className="text-slate-500 font-mono">^C</span>);
      setStream(null);
    }

    pushLines(
      <div>
        {PROMPT}
        <span className="text-slate-100 font-semibold">{cmd}</span>
      </div>
    );

    if (!cmd) return;
    setHistory((prev) => [cmd, ...prev]);
    setHistoryIdx(-1);

    const parts = cmd.split(" ");
    const [c0, c1, c2, c3] = parts;

    if (cmd === "clear") {
      setLines([]);
      return;
    }

    if (cmd === "help") {
      pushLines(
        <div className="text-slate-300 space-y-1 font-mono text-xs">
          <p className="text-cyan-400 font-bold">Commandes ROS 2 disponibles dans la simulation :</p>
          <p>• <span className="text-amber-300">ros2 node list</span> : Liste des nodes actifs</p>
          <p>• <span className="text-amber-300">ros2 node info &lt;node&gt;</span> : Carte d'identité d'un node</p>
          <p>• <span className="text-amber-300">ros2 topic list [-t]</span> : Liste des topics (+ types)</p>
          <p>• <span className="text-amber-300">ros2 topic echo &lt;topic&gt;</span> : Écoute en streaming synchrone</p>
          <p>• <span className="text-amber-300">ros2 topic hz &lt;topic&gt;</span> : Fréquence d'émission réelle</p>
          <p>• <span className="text-amber-300">rqt_graph</span> : Ouvre le simulateur SVG au-dessus</p>
          <p>• <span className="text-amber-300">ros2 run pipeline_pkg safety_filter</span> : Démarre le node filtre</p>
          <p>• <span className="text-amber-300">colcon build --symlink-install</span> : Compilation du workspace</p>
          <p>• <span className="text-amber-300">clear</span> : Nettoie l'écran</p>
        </div>
      );
      return;
    }

    if (cmd === "ros2 node list") {
      pushLines(
        <div className="font-mono text-xs space-y-0.5 text-cyan-300">
          <div>/raw_telemetry_node</div>
          <div>/distance_filter_node</div>
          <div>/emergency_brake_node</div>
        </div>
      );
      return;
    }

    if (cmd.startsWith("ros2 topic list")) {
      const showTypes = cmd.includes("-t");
      pushLines(
        <div className="font-mono text-xs space-y-0.5">
          {Object.entries(TOPICS_CATALOG).map(([tName, tType]) => (
            <div key={tName}>
              <span className="text-slate-200">{tName}</span>
              {showTypes && <span className="text-amber-400 ml-2 font-medium">[{tType}]</span>}
            </div>
          ))}
        </div>
      );
      return;
    }

    if (c0 === "ros2" && c1 === "topic" && (c2 === "echo" || c2 === "hz")) {
      if (!c3 || !TOPICS_CATALOG[c3]) {
        pushLines(
          <div className="text-red-400 font-mono text-xs">
            WARNING: topic [{c3 || ""}] does not appear to be published yet
          </div>
        );
        return;
      }
      setStream({ kind: c2, topic: c3 });
      if (c2 === "hz") {
        pushLines(
          <div className="text-slate-400 font-mono text-xs">
            Subscribed to [{c3}] — calcul de fréquence en cours (Ctrl+C pour stopper)...
          </div>
        );
      }
      return;
    }

    if (c0 === "ros2" && c1 === "topic" && c2 === "info" && c3) {
      if (!TOPICS_CATALOG[c3]) {
        pushLines(<div className="text-red-400 font-mono text-xs">Unknown topic '{c3}'</div>);
        return;
      }
      pushLines(
        <div className="font-mono text-xs space-y-0.5 text-slate-300">
          <div>Type: <span className="text-amber-300">{TOPICS_CATALOG[c3]}</span></div>
          <div>Publisher count: <span className="text-emerald-400">1</span></div>
          <div>Subscription count: <span className="text-cyan-400">{c3.includes("brake") ? "0" : "1"}</span></div>
        </div>
      );
      return;
    }

    if (c0 === "ros2" && c1 === "node" && c2 === "info") {
      const nodeDetails: Record<string, { subs: string[]; pubs: string[] }> = {
        "/raw_telemetry_node": {
          subs: [],
          pubs: ["/telemetry/lidar_raw: std_msgs/msg/Float32"],
        },
        "/distance_filter_node": {
          subs: ["/telemetry/lidar_raw: std_msgs/msg/Float32"],
          pubs: ["/safety/obstacle_distance: std_msgs/msg/Float32"],
        },
        "/emergency_brake_node": {
          subs: ["/safety/obstacle_distance: std_msgs/msg/Float32"],
          pubs: ["/vehicle/brake_cmd: std_msgs/msg/Bool"],
        },
      };

      const info = c3 && nodeDetails[c3];
      if (!info) {
        pushLines(<div className="text-red-400 font-mono text-xs">Unable to find node '{c3 || ""}'</div>);
        return;
      }

      pushLines(
        <div className="font-mono text-xs space-y-0.5 text-slate-300">
          <div className="text-cyan-400 font-bold">{c3}</div>
          <div className="text-slate-500 font-semibold">Subscribers:</div>
          {info.subs.length > 0 ? (
            info.subs.map((s) => <div key={s} className="pl-4 text-emerald-400">{s}</div>)
          ) : (
            <div className="pl-4 text-slate-600">None</div>
          )}
          <div className="text-slate-500 font-semibold">Publishers:</div>
          {info.pubs.map((p) => <div key={p} className="pl-4 text-amber-300">{p}</div>)}
          <div className="pl-4 text-slate-500">/parameter_events: rcl_interfaces/msg/ParameterEvent</div>
          <div className="pl-4 text-slate-500">/rosout: rcl_interfaces/msg/Log</div>
          <div className="text-slate-500 font-semibold">Service Servers:</div>
          <div className="pl-4 text-slate-400">{c3}/get_parameters: rcl_interfaces/srv/GetParameters</div>
        </div>
      );
      return;
    }

    if (cmd.startsWith("ros2 interface show")) {
      if (c3 === "std_msgs/msg/Float32") {
        pushLines(
          <div className="font-mono text-xs text-slate-300 bg-slate-950 p-2 rounded border border-slate-800">
            <span className="text-cyan-400">float32</span> data
          </div>
        );
        return;
      }
      if (c3 === "std_msgs/msg/Bool") {
        pushLines(
          <div className="font-mono text-xs text-slate-300 bg-slate-950 p-2 rounded border border-slate-800">
            <span className="text-cyan-400">bool</span> data
          </div>
        );
        return;
      }
      pushLines(<div className="text-red-400 font-mono text-xs">Unknown interface '{c3 || ""}'</div>);
      return;
    }

    if (cmd === "rqt_graph") {
      pushLines(
        <div className="font-mono text-xs text-emerald-400">
          [rqt_graph] Visualiseur de graphe actif. Observez le panneau SVG interactif juste au-dessus !
        </div>
      );
      return;
    }

    if (cmd.startsWith("ros2 run pipeline_pkg")) {
      pushLines(
        <div className="font-mono text-xs space-y-1">
          <div className="text-cyan-400">[INFO] [{getTimestamp()}] [distance_filter_node]: Node démarré.</div>
          <div className="text-slate-400">Exécution en streaming simulée... (Ctrl+C pour arrêter)</div>
        </div>
      );
      setStream({ kind: "run", topic: "" });
      return;
    }

    if (cmd.startsWith("colcon build")) {
      pushLines(
        <div className="font-mono text-xs space-y-0.5">
          <div className="text-slate-400">Starting &gt;&gt;&gt; pipeline_pkg</div>
          <div className="text-emerald-400 font-semibold">Finished &lt;&lt;&lt; pipeline_pkg [1.32s]</div>
          <div className="text-slate-500">Summary: 1 package finished [1.45s]</div>
        </div>
      );
      return;
    }

    if (cmd.startsWith("source")) {
      pushLines(
        <div className="font-mono text-xs text-emerald-400">
          ✓ Environnement chargé avec succès.
        </div>
      );
      return;
    }

    if (c0 === "ros2") {
      pushLines(
        <div className="text-red-400 font-mono text-xs">
          ros2: error: commande non reconnue ou argument manquant. Tapez « help ».
        </div>
      );
      return;
    }

    pushLines(
      <div className="text-red-400 font-mono text-xs">
        bash: {c0}: commande introuvable
      </div>
    );
  };

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-slate-800 bg-[#040813] shadow-xl">
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-3.5 py-2">
        <div className="flex items-center gap-2">
          <Terminal className="h-3.5 w-3.5 text-cyan-400" />
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-400">
            Terminal Shell ROS 2 Humble
          </h3>
        </div>
        {stream ? (
          <button
            onClick={() => {
              setStream(null);
              pushLines(<span className="text-slate-500 font-mono">^C</span>);
            }}
            className="flex items-center gap-1 rounded border border-red-500/50 bg-red-950/40 px-2 py-0.5 font-mono text-[10px] text-red-400 hover:bg-red-900/60"
          >
            Interrompre (Ctrl+C)
          </button>
        ) : (
          <button
            onClick={() => setLines([])}
            title="Effacer le terminal"
            className="text-slate-500 hover:text-slate-300"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Clickable Quick Command Shortcuts */}
      <div className="flex flex-wrap gap-1.5 border-b border-slate-800/80 bg-slate-950/70 p-2">
        {SHORTCUTS.map((sc) => (
          <button
            key={sc}
            onClick={() => executeCommand(sc)}
            className="rounded border border-slate-800 bg-slate-900/90 px-2 py-1 font-mono text-[10px] text-slate-400 transition hover:border-cyan-400 hover:bg-cyan-950/20 hover:text-cyan-300 active:scale-95"
          >
            {sc}
          </button>
        ))}
      </div>

      {/* Terminal Output & Input Area */}
      <div
        ref={terminalBox}
        onClick={() => document.getElementById("ros-terminal-input")?.focus()}
        className="h-72 overflow-y-auto p-3.5 font-mono text-[12px] leading-5 text-slate-200 cursor-text"
      >
        {lines.map((l) => (
          <div key={l.id} className="whitespace-pre-wrap break-all mb-1">
            {l.node}
          </div>
        ))}

        {/* Input prompt */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            executeCommand(input);
            setInput("");
          }}
          className="flex items-center mt-1"
        >
          <span className="shrink-0 select-none">{PROMPT}</span>
          <input
            id="ros-terminal-input"
            type="text"
            value={input}
            autoComplete="off"
            spellCheck={false}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "c" && e.ctrlKey && stream) {
                e.preventDefault();
                setStream(null);
                pushLines(<span className="text-slate-500 font-mono">^C</span>);
              }
              if (e.key === "ArrowUp" && history.length > 0) {
                e.preventDefault();
                const nextIdx = Math.min(historyIdx + 1, history.length - 1);
                setHistoryIdx(nextIdx);
                setInput(history[nextIdx] || "");
              }
              if (e.key === "ArrowDown") {
                e.preventDefault();
                const nextIdx = historyIdx - 1;
                setHistoryIdx(nextIdx);
                setInput(nextIdx >= 0 ? history[nextIdx] || "" : "");
              }
            }}
            className="min-w-0 flex-1 bg-transparent font-mono text-xs text-slate-100 outline-none caret-cyan-400"
          />
        </form>
      </div>
    </div>
  );
}
