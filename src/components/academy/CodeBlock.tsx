import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "../../lib/utils";

const PY_KW = /\b(import|from|class|def|return|if|else|elif|for|while|in|not|and|or|try|except|finally|pass|None|True|False|self|super|with|as|lambda)\b/;

function tokenize(line: string, lang: string) {
  const out: { s: string; c: string }[] = [];
  const re =
    lang === "xml"
      ? /(<!--.*?-->)|(<\/?[\w:-]+|\/?>)|("[^"]*")|([\w:-]+=)/g
      : /(#.*$)|('[^']*'|"[^"]*"|f'[^']*')|(\b\d+\.?\d*\b)|(\b\w+\b)|(--?[\w-]+)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line))) {
    if (m.index > last) out.push({ s: line.slice(last, m.index), c: "" });
    const t = m[0];
    let c = "";
    if (lang === "xml") c = m[1] ? "text-slate-500 italic" : m[2] ? "text-cyan-400" : m[3] ? "text-emerald-400" : "text-amber-400";
    else if (m[1]) c = "text-slate-500 italic";
    else if (m[2]) c = "text-emerald-400";
    else if (m[3]) c = "text-amber-400";
    else if (m[4]) {
      if (PY_KW.test(t) && lang === "python") c = "text-purple-400 font-medium";
      else if (lang === "bash" && /^(ros2|colcon|source|cd|mkdir|echo|rqt_graph)$/.test(t)) c = "text-cyan-400 font-semibold";
      else if (/^[A-Z]/.test(t)) c = "text-cyan-300";
      else if (line[m.index + t.length] === "(") c = "text-amber-300";
    } else if (m[5]) c = "text-amber-400";
    out.push({ s: t, c });
    last = m.index + t.length;
  }
  if (last < line.length) out.push({ s: line.slice(last), c: "" });
  return out;
}

export function CopyButton({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <button
      onClick={handleCopy}
      title="Copier dans le presse-papier"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs font-mono text-slate-300 transition hover:border-cyan-400 hover:text-cyan-300 active:scale-95",
        copied && "border-emerald-500 bg-emerald-950/40 text-emerald-400",
        className
      )}
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      <span>{copied ? "Copié !" : "Copier"}</span>
    </button>
  );
}

export function CodeBlock({
  code,
  lang,
  name,
  notes,
}: {
  code: string;
  lang: string;
  name?: string;
  notes?: { line: number; text: string }[];
}) {
  const lines = code.split("\n");
  const noteMap = new Map(notes?.map((n) => [n.line, n.text]));

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#070b14] shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-900/70 px-4 py-2.5">
        <div className="flex items-center gap-3">
          <span className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-red-500/80" />
            <span className="h-3 w-3 rounded-full bg-amber-500/80" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
          </span>
          {name && <span className="font-mono text-xs font-medium text-slate-300">{name}</span>}
          <span className="rounded bg-slate-800 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-cyan-400">
            {lang}
          </span>
        </div>
        <CopyButton text={code} />
      </div>

      <pre className="overflow-x-auto py-3 font-mono text-[12.5px] leading-6">
        {lines.map((l, i) => {
          const note = noteMap.get(i + 1);
          return (
            <div key={i} className={cn("group flex px-4 transition hover:bg-slate-800/30", note && "bg-cyan-950/20")}>
              <span className="mr-4 w-7 shrink-0 select-none text-right font-mono text-xs text-slate-600">
                {i + 1}
              </span>
              <code className="whitespace-pre">
                {tokenize(l, lang).map((t, j) => (
                  <span key={j} className={t.c}>{t.s}</span>
                ))}
                {note && (
                  <span className="ml-4 select-none rounded bg-cyan-500/10 px-2 py-0.5 font-sans text-[11px] font-medium text-cyan-300 border border-cyan-500/20">
                    ◀ {note}
                  </span>
                )}
              </code>
            </div>
          );
        })}
      </pre>
    </div>
  );
}
