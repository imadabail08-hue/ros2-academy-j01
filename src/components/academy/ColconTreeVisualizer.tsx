import { useState } from "react";
import { Folder, FolderOpen, FileCode, Link2, Copy, AlertCircle, CheckCircle, Terminal } from "lucide-react";
import { cn } from "../../lib/utils";

export function ColconTreeVisualizer() {
  const [useSymlink, setUseSymlink] = useState(true);

  return (
    <div className="rounded-xl border border-slate-800 bg-[#060a14] p-5 shadow-2xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-cyan-400" />
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-300">
            Schéma C · Anatomie colcon build : Rôle vital de --symlink-install
          </h3>
        </div>

        {/* Toggle Mode */}
        <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setUseSymlink(false)}
            className={cn(
              "px-3 py-1 rounded-lg text-xs font-mono font-medium transition",
              !useSymlink
                ? "bg-slate-800 text-amber-300 border border-amber-500/30 shadow"
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            Sans symlink (Défaut)
          </button>
          <button
            onClick={() => setUseSymlink(true)}
            className={cn(
              "px-3 py-1 rounded-lg text-xs font-mono font-medium transition flex items-center gap-1.5",
              useSymlink
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow"
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            <Link2 className="h-3.5 w-3.5 text-cyan-400" />
            <span>Avec --symlink-install</span>
          </button>
        </div>
      </div>

      {/* Explanatory Banner based on mode */}
      <div
        className={cn(
          "my-4 rounded-xl border p-4 text-xs md:text-sm transition-all duration-300",
          useSymlink
            ? "border-emerald-500/50 bg-emerald-950/20 text-emerald-200"
            : "border-amber-500/50 bg-amber-950/20 text-amber-200"
        )}
      >
        <div className="flex items-center gap-2 font-bold mb-1">
          {useSymlink ? (
            <>
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span>Mode Développeur Actif (--symlink-install)</span>
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4 text-amber-400" />
              <span>Mode Statique Standard (sans options)</span>
            </>
          )}
        </div>
        <p className="text-slate-300 text-xs leading-relaxed">
          {useSymlink
            ? "Un lien symbolique (symlink) pointe depuis install/ vers votre fichier source réel dans src/. Vous éditez votre code Python, sauvegardez, et relancez immédiatement votre node : vos modifications sont actives sans recompiler !"
            : "colcon a dupliqué votre code par copie physique dans install/. Toute modification ultérieure dans src/ sera TOTALEMENT IGNORÉE par 'ros2 run' tant que vous ne relancez pas 'colcon build' !"}
        </p>
      </div>

      {/* Interactive Tree View */}
      <div className="my-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Tree: src/ */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 font-mono text-xs">
          <div className="flex items-center gap-2 text-cyan-300 font-bold border-b border-slate-800 pb-2 mb-3">
            <FolderOpen className="h-4 w-4 text-cyan-400" />
            <span>~/ros2_ws/src/ (Sources de développement)</span>
          </div>

          <div className="space-y-1.5 pl-2 text-slate-300">
            <div className="flex items-center gap-2 text-slate-400">
              <span>└──</span>
              <Folder className="h-3.5 w-3.5 text-amber-400" />
              <span className="font-semibold text-slate-200">pipeline_pkg/</span>
            </div>
            <div className="flex items-center gap-2 pl-6 text-slate-400">
              <span>├──</span>
              <FileCode className="h-3.5 w-3.5 text-blue-400" />
              <span>package.xml</span>
            </div>
            <div className="flex items-center gap-2 pl-6 text-slate-400">
              <span>├──</span>
              <FileCode className="h-3.5 w-3.5 text-blue-400" />
              <span>setup.py</span>
            </div>
            <div className="flex items-center gap-2 pl-6 text-slate-400">
              <span>└──</span>
              <Folder className="h-3.5 w-3.5 text-amber-400" />
              <span className="font-semibold text-slate-200">pipeline_pkg/</span>
            </div>
            <div className="flex items-center gap-2 pl-12 text-slate-400">
              <span>├──</span>
              <FileCode className="h-3.5 w-3.5 text-slate-500" />
              <span>__init__.py</span>
            </div>
            {/* The TARGET Source File */}
            <div
              className={cn(
                "flex items-center gap-2 pl-12 p-1.5 rounded-lg border transition-all duration-300",
                useSymlink
                  ? "border-cyan-400/80 bg-cyan-950/40 text-cyan-300 font-bold shadow-md"
                  : "border-slate-800 bg-slate-950 text-slate-300"
              )}
            >
              <span>└──</span>
              <FileCode className={cn("h-4 w-4", useSymlink ? "text-cyan-400 animate-pulse" : "text-slate-400")} />
              <span>raw_telemetry_node.py</span>
              <span className="ml-auto text-[9.5px] rounded bg-cyan-500/20 px-1.5 py-0.2 text-cyan-300">
                [SOURCE RÉELLE]
              </span>
            </div>
          </div>
        </div>

        {/* Right Tree: install/ */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 font-mono text-xs">
          <div className="flex items-center gap-2 text-emerald-300 font-bold border-b border-slate-800 pb-2 mb-3">
            <FolderOpen className="h-4 w-4 text-emerald-400" />
            <span>~/ros2_ws/install/ (Exécutables finaux)</span>
          </div>

          <div className="space-y-1.5 pl-2 text-slate-300">
            <div className="flex items-center gap-2 text-slate-400">
              <span>├──</span>
              <FileCode className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">setup.bash</span>
              <span className="text-[10px] text-slate-500">(à sourcer !)</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <span>└──</span>
              <Folder className="h-3.5 w-3.5 text-amber-400" />
              <span className="font-semibold text-slate-200">pipeline_pkg/</span>
            </div>
            <div className="flex items-center gap-2 pl-6 text-slate-400">
              <span>├──</span>
              <Folder className="h-3.5 w-3.5 text-slate-500" />
              <span>share/</span>
            </div>
            <div className="flex items-center gap-2 pl-6 text-slate-400">
              <span>└──</span>
              <Folder className="h-3.5 w-3.5 text-amber-400" />
              <span>lib/pipeline_pkg/</span>
            </div>

            {/* The Executable Link or Copy */}
            <div
              className={cn(
                "flex items-center gap-2 pl-12 p-2 rounded-lg border transition-all duration-300",
                useSymlink
                  ? "border-emerald-400 bg-emerald-950/40 text-emerald-300 shadow-md"
                  : "border-amber-500/40 bg-amber-950/30 text-amber-300"
              )}
            >
              <span>└──</span>
              {useSymlink ? (
                <Link2 className="h-4 w-4 text-emerald-400 animate-spin" />
              ) : (
                <Copy className="h-4 w-4 text-amber-400" />
              )}
              <div className="min-w-0 flex-1">
                <div className="font-bold flex items-center gap-1.5">
                  <span>raw_telemetry</span>
                  <span className="text-[9px] rounded px-1.5 py-0.2 bg-slate-900 border border-slate-700">
                    {useSymlink ? "LIEN SYMBOLIQUE" : "COPIE STATIQUE"}
                  </span>
                </div>
                <div className="text-[9.5px] text-slate-400 truncate mt-0.5">
                  {useSymlink
                    ? "→ ~/ros2_ws/src/pipeline_pkg/.../raw_telemetry_node.py"
                    : "Copie figée au moment du dernier build"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Terminal Command comparison footer */}
      <div className="rounded-xl border border-slate-800 bg-[#040813] p-3 font-mono text-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-slate-400">
          <Terminal className="h-4 w-4 text-cyan-400" />
          <span>Commande recommandée en dev Python :</span>
        </div>
        <code className="text-cyan-300 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800 font-bold">
          colcon build --symlink-install
        </code>
      </div>
    </div>
  );
}
