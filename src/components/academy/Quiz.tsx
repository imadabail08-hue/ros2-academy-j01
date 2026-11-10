import { useState, useEffect } from "react";
import { Award, CheckCircle2, RotateCcw, XCircle, ArrowRight, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";
import { QUESTIONS } from "../../lib/quiz";
import { cn } from "../../lib/utils";

export function Quiz({
  onFinish,
  feedback,
}: {
  onFinish: (score: number) => void;
  feedback: (ok: boolean) => void;
}) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const question = QUESTIONS[currentIdx];

  const handleReset = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setScore(0);
    setIsFinished(false);
  };

  useEffect(() => {
    if (isFinished && score >= 8) {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#22d3ee", "#34d399", "#fbbf24", "#a855f7"],
      });
    }
  }, [isFinished, score]);

  if (isFinished) {
    const isPerfect = score === QUESTIONS.length;
    const title =
      isPerfect
        ? "Pilote ROS 2 Certifié (10/10)"
        : score >= 8
        ? "Ingénieur ROS 2 Confirmé"
        : score >= 5
        ? "Apprenti Roboticien en Progression"
        : "Cadet ROS 2 (Révisions recommandées)";

    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-amber-500/40 bg-slate-900/90 p-8 text-center shadow-2xl animate-in zoom-in-95 duration-500">
        <div
          className={cn(
            "mx-auto mb-5 grid h-24 w-24 place-items-center rounded-full border-4 shadow-xl",
            isPerfect
              ? "border-amber-400 bg-amber-500/20 text-amber-400"
              : "border-cyan-400 bg-cyan-500/20 text-cyan-300"
          )}
        >
          <Award className="h-12 w-12" />
        </div>

        <p className="font-mono text-5xl font-extrabold text-white">
          {score}
          <span className="text-2xl text-slate-500 font-normal"> / {QUESTIONS.length}</span>
        </p>

        <h3 className="mt-3 text-xl font-bold text-amber-300">{title}</h3>

        <p className="mt-2 text-sm text-slate-300 leading-relaxed">
          {isPerfect
            ? "Félicitations ! Vous maîtrisez parfaitement l'architecture rclpy, les topics, les filtres et les launch files ROS 2."
            : score >= 7
            ? "Très bon résultat ! Vous êtes prêt pour aborder le Jour 02 (Services, Actions & Paramètres)."
            : "Prenez le temps de revoir les LABs 02, 03 et 04, puis retentez l'évaluation pour valider vos acquis."}
        </p>

        <button
          onClick={handleReset}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-400 active:scale-95 shadow-lg"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Recommencer l'évaluation</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quiz Header */}
      <header className="border-b border-slate-800 pb-5">
        <div className="flex items-center justify-between">
          <span className="rounded-md bg-amber-500/10 px-2.5 py-1 font-mono text-xs font-bold text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            ÉVALUATION OFFICIELLE DU JOUR 01
          </span>
          <span className="font-mono text-xs text-slate-400">
            Score actuel : <strong className="text-cyan-400 font-bold">{score}</strong> / {QUESTIONS.length}
          </span>
        </div>

        <h2 className="mt-3 text-2xl font-bold text-white md:text-3xl">
          Validation des Acquis ROS 2 Humble
        </h2>

        {/* Progress Bar */}
        <div className="mt-4 flex gap-1.5">
          {QUESTIONS.map((_, idx) => (
            <div
              key={idx}
              className={cn(
                "h-2 flex-1 rounded-full transition-all duration-300",
                idx < currentIdx
                  ? "bg-emerald-500"
                  : idx === currentIdx
                  ? "bg-cyan-400"
                  : "bg-slate-800"
              )}
            />
          ))}
        </div>
        <p className="mt-2 font-mono text-xs text-slate-400">
          Question {currentIdx + 1} sur {QUESTIONS.length}
        </p>
      </header>

      {/* Question Body */}
      <div className="space-y-4">
        <h3 className="text-lg md:text-xl font-semibold leading-snug text-slate-100">
          {question.q}
        </h3>

        {/* Options */}
        <div className="space-y-2.5">
          {question.options.map((opt, optIdx) => {
            const isCorrect = isSubmitted && optIdx === question.answer;
            const isWrong = isSubmitted && optIdx === selectedOption && optIdx !== question.answer;
            const isSelected = selectedOption === optIdx;

            return (
              <button
                key={optIdx}
                disabled={isSubmitted}
                onClick={() => setSelectedOption(optIdx)}
                className={cn(
                  "flex w-full items-center gap-3.5 rounded-xl border p-4 text-left transition active:scale-[0.99]",
                  isCorrect
                    ? "border-emerald-500 bg-emerald-950/30 text-emerald-200"
                    : isWrong
                    ? "border-red-500 bg-red-950/30 text-red-200"
                    : isSelected
                    ? "border-cyan-400 bg-cyan-950/30 text-slate-100 ring-1 ring-cyan-400/50"
                    : "border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:bg-slate-900"
                )}
              >
                <span
                  className={cn(
                    "grid h-7 w-7 shrink-0 place-items-center rounded-lg font-mono text-xs font-bold",
                    isCorrect
                      ? "bg-emerald-500 text-slate-950"
                      : isWrong
                      ? "bg-red-500 text-white"
                      : isSelected
                      ? "bg-cyan-400 text-slate-950"
                      : "bg-slate-800 text-slate-400"
                  )}
                >
                  {String.fromCharCode(65 + optIdx)}
                </span>
                <span className="flex-1 font-mono text-xs md:text-sm leading-relaxed">
                  {opt}
                </span>
                {isCorrect && <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />}
                {isWrong && <XCircle className="h-5 w-5 text-red-400 shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Correction Explanation Alert */}
        {isSubmitted && (
          <div
            className={cn(
              "rounded-xl border p-4 text-sm leading-relaxed animate-in fade-in duration-300",
              selectedOption === question.answer
                ? "border-emerald-500/50 bg-emerald-950/30 text-emerald-200"
                : "border-red-500/50 bg-red-950/30 text-red-200"
            )}
          >
            <div className="font-bold mb-1 flex items-center gap-2">
              {selectedOption === question.answer ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Exactement !</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-red-400" />
                  <span>Mauvaise réponse.</span>
                </>
              )}
            </div>
            <p className="text-slate-300 text-xs md:text-sm">{question.explain}</p>
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          {!isSubmitted ? (
            <button
              disabled={selectedOption === null}
              onClick={() => {
                setIsSubmitted(true);
                const isRight = selectedOption === question.answer;
                if (isRight) setScore((prev) => prev + 1);
                feedback(isRight);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-40 disabled:pointer-events-none shadow-md"
            >
              <span>Valider la réponse</span>
            </button>
          ) : (
            <button
              onClick={() => {
                if (currentIdx + 1 >= QUESTIONS.length) {
                  setIsFinished(true);
                  onFinish(score);
                } else {
                  setCurrentIdx((prev) => prev + 1);
                  setSelectedOption(null);
                  setIsSubmitted(false);
                }
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-400 shadow-md"
            >
              <span>{currentIdx + 1 >= QUESTIONS.length ? "Voir le score final" : "Question suivante"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
