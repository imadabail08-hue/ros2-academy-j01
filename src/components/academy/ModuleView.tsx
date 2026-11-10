import { useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  Bug,
  CheckCircle2,
  Code2,
  Lightbulb,
  Radio,
  Sparkles,
  Terminal,
} from "lucide-react";
import type { Block, Module } from "../../lib/course";
import { CodeBlock, CopyButton } from "./CodeBlock";
import { DdsPubSubVisualizer } from "./DdsPubSubVisualizer";
import { EventLoopVisualizer } from "./EventLoopVisualizer";
import { ColconTreeVisualizer } from "./ColconTreeVisualizer";
import { Project01InteractiveSandbox } from "./Project01InteractiveSandbox";
import { cn } from "../../lib/utils";

const TABS = [
  { id: "theory", label: "Théorie & Concepts", icon: BookOpen },
  { id: "code", label: "Code Python", icon: Code2 },
  { id: "shell", label: "Commandes Shell", icon: Terminal },
  { id: "tips", label: "Astuces & Pièges", icon: Bug },
] as const;

const CALLOUT_STYLES = {
  tip: { icon: Lightbulb, cls: "border-cyan-500/40 bg-cyan-950/20 text-cyan-300" },
  warn: { icon: AlertTriangle, cls: "border-amber-500/40 bg-amber-950/20 text-amber-300" },
  best: { icon: Sparkles, cls: "border-emerald-500/40 bg-emerald-950/20 text-emerald-300" },
  analogy: { icon: Radio, cls: "border-purple-500/40 bg-purple-950/20 text-purple-300" },
};

function RenderBlock({ block }: { block: Block }) {
  switch (block.t) {
    case "h":
      return <h3 className="mt-3 text-lg font-semibold text-slate-100">{block.text}</h3>;
    case "p":
      return <p className="leading-7 text-slate-300 text-sm md:text-base">{block.text}</p>;
    case "list":
      return (
        <ul className="space-y-2 my-2">
          {block.items.map((item, idx) => {
            const [boldPrefix, ...rest] = item.split(" : ");
            return (
              <li key={idx} className="flex items-start gap-2.5 text-sm md:text-base text-slate-300">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
                <span>
                  {rest.length > 0 ? (
                    <>
                      <strong className="font-mono text-cyan-300 font-semibold">{boldPrefix}</strong> : {rest.join(" : ")}
                    </>
                  ) : (
                    item
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      );
    case "diagram":
      return (
        <pre className="my-2 overflow-x-auto rounded-xl border border-slate-800 bg-[#040813] p-4 font-mono text-xs leading-5 text-emerald-300 shadow-inner">
          {block.lines}
        </pre>
      );
    case "callout": {
      const style = CALLOUT_STYLES[block.kind];
      const Icon = style.icon;
      return (
        <div className={cn("rounded-xl border p-4 my-2", style.cls)}>
          <div className="mb-1 flex items-center gap-2 font-semibold text-sm">
            <Icon className="h-4 w-4 shrink-0" />
            <span>{block.title}</span>
          </div>
          <p className="text-xs md:text-sm leading-6 text-slate-200/90">{block.text}</p>
        </div>
      );
    }
  }
}

export function ModuleView({
  mod,
  done,
  onDone,
}: {
  mod: Module;
  done: boolean;
  onDone: () => void;
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("theory");
  const [activeFileIdx, setActiveFileIdx] = useState(0);
  const currentFile = mod.code[Math.min(activeFileIdx, mod.code.length - 1)] || mod.code[0];

  return (
    <div className="flex flex-col gap-6">
      {/* Module Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <span className="inline-block rounded-md bg-cyan-500/10 px-2.5 py-1 font-mono text-xs font-bold text-cyan-400 border border-cyan-500/20">
            {mod.tag}
          </span>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-white md:text-3xl">
            {mod.title}
          </h2>
          <p className="text-sm text-slate-400 mt-1">{mod.subtitle}</p>
        </div>

        <button
          onClick={onDone}
          className={cn(
            "inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition active:scale-95 shadow-md",
            done
              ? "border-emerald-500/60 bg-emerald-950/40 text-emerald-300"
              : "border-slate-700 bg-slate-800/80 text-slate-300 hover:border-cyan-400 hover:text-cyan-300"
          )}
        >
          <CheckCircle2 className={cn("h-4 w-4", done ? "text-emerald-400" : "text-slate-400")} />
          <span>{done ? "Atelier validé ✓" : "Marquer comme validé"}</span>
        </button>
      </header>

      {/* PROJET 01 Spotlight Sandbox: positioned right at the top as requested */}
      {mod.id === "projet01" && (
        <div className="mb-2">
          <Project01InteractiveSandbox />
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex gap-1.5 overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/80 p-1.5">
        {TABS.map((t) => {
          const Icon = t.icon;
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-xs md:text-sm font-medium transition",
                isActive
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div key={tab + mod.id} className="transition-opacity duration-200">
        {/* Tab 1: Theory */}
        {tab === "theory" && (
          <div className="space-y-5">
            {/* Interactive Visualizers integrated into specific LAB theory tabs */}
            {mod.id === "lab01" && (
              <div className="mb-4">
                <ColconTreeVisualizer />
              </div>
            )}

            {mod.id === "lab02" && (
              <div className="mb-4">
                <EventLoopVisualizer />
              </div>
            )}

            {(mod.id === "lab03" || mod.id === "lab04") && (
              <div className="mb-4">
                <DdsPubSubVisualizer />
              </div>
            )}

            {/* Theory Blocks */}
            <div className="space-y-4">
              {mod.theory.map((block, idx) => (
                <RenderBlock key={idx} block={block} />
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Python Code */}
        {tab === "code" && (
          <div className="space-y-4">
            {mod.code.length > 1 && (
              <div className="flex flex-wrap gap-2">
                {mod.code.map((c, idx) => (
                  <button
                    key={c.name}
                    onClick={() => setActiveFileIdx(idx)}
                    className={cn(
                      "rounded-lg border px-3 py-1.5 font-mono text-xs transition",
                      idx === activeFileIdx
                        ? "border-cyan-400 bg-cyan-950/40 text-cyan-300 font-semibold"
                        : "border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700"
                    )}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}
            <CodeBlock
              code={currentFile.code}
              lang={currentFile.lang}
              name={currentFile.name}
              notes={currentFile.notes}
            />
          </div>
        )}

        {/* Tab 3: Shell Commands */}
        {tab === "shell" && (
          <div className="space-y-4">
            {mod.commands.map((c, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-md"
              >
                <div className="mb-2 flex items-center gap-2.5 text-sm text-slate-200">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-cyan-500/15 font-mono text-xs font-bold text-cyan-400">
                    {idx + 1}
                  </span>
                  <span className="font-medium">{c.desc}</span>
                </div>

                <div className="flex items-center gap-2 rounded-lg bg-[#040813] px-3.5 py-2.5 font-mono text-[13px] border border-slate-800">
                  <span className="text-emerald-400 select-none">$</span>
                  <code className="flex-1 overflow-x-auto whitespace-nowrap text-slate-100">
                    {c.cmd}
                  </code>
                  <CopyButton text={c.cmd} />
                </div>

                {c.flags && c.flags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {c.flags.map((fl) => (
                      <span
                        key={fl.f}
                        className="inline-flex items-center gap-1.5 rounded-md border border-slate-800 bg-slate-950/80 px-2.5 py-1 text-xs"
                      >
                        <code className="text-amber-400 font-mono font-semibold">{fl.f}</code>
                        <span className="text-slate-400">— {fl.d}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Tab 4: Pitfalls & Tips */}
        {tab === "tips" && (
          <div className="grid gap-4">
            {mod.pitfalls.map((p, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 shadow-md"
              >
                <h4 className="mb-2 flex items-center gap-2 font-semibold text-slate-100">
                  <Bug className="h-4 w-4 text-red-400" />
                  <span>{p.title}</span>
                </h4>
                <div className="mb-2.5 rounded-lg border border-red-500/30 bg-red-950/20 px-3.5 py-2 font-mono text-xs text-red-300">
                  <span className="font-bold">Symptôme : </span>
                  {p.symptom}
                </div>
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/20 px-3.5 py-2 text-xs md:text-sm text-slate-200">
                  <strong className="text-emerald-400">Solution recommandée : </strong>
                  {p.fix}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
