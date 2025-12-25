/**
 * ScrollSurvey - Scroll-based survey layout
 * Supports two modes:
 * - scroll-reveal: Questions reveal progressively after being answered
 * - scroll-all: All questions visible from the start
 */

import { useEffect, useRef } from "react";
import Question from "./Question";
import ProgressBar from "./ProgressBar";
import ThemeToggle from "./ThemeToggle";
import Turnstile from "./Turnstile";
import { evaluateExpression } from "../lib/expressionParser";

export default function ScrollSurvey({ survey, answers, setAnswer, revealedCount, setRevealedCount, isSubmitting, error, turnstileToken, setTurnstileToken, onSubmit, isPreview }) {
  const layout = survey.settings?.layout || "paged";
  const isScrollAll = layout === "scroll-all";
  const isScrollReveal = layout === "scroll-reveal";
  const questionRefs = useRef({});

  // Get visible questions (respecting show_if logic)
  const visibleQuestions = survey.questions.filter((q) => {
    if (q.type === "hidden") return false;
    if (!q.show_if) return true;

    // Use the proper expression parser (supports 'and', 'or', 'in' syntax)
    return evaluateExpression(q.show_if, { answers });
  });

  // Determine how many questions to show
  const questionsToShow = isScrollAll ? visibleQuestions : visibleQuestions.slice(0, revealedCount);

  // Check if a question has been answered
  const isAnswered = (questionId) => {
    const answer = answers[questionId];
    if (answer === undefined || answer === null) return false;
    if (Array.isArray(answer)) return answer.length > 0;
    if (typeof answer === "string") return answer.trim() !== "";
    return true;
  };

  // Calculate progress
  const answeredCount = visibleQuestions.filter((q) => isAnswered(q.id)).length;
  const progress = (answeredCount / visibleQuestions.length) * 100;

  // Auto-reveal next question when current is answered (for scroll-reveal mode)
  useEffect(() => {
    if (!isScrollReveal) return;

    // Find the highest answered question index
    let highestAnswered = -1;
    for (let i = 0; i < visibleQuestions.length; i++) {
      if (isAnswered(visibleQuestions[i].id)) {
        highestAnswered = i;
      } else {
        break; // Stop at first unanswered
      }
    }

    // Reveal up to the next unanswered question
    const newRevealCount = Math.min(highestAnswered + 2, visibleQuestions.length);
    if (newRevealCount > revealedCount) {
      setRevealedCount(newRevealCount);

      // Scroll to newly revealed question
      setTimeout(() => {
        const nextQ = visibleQuestions[newRevealCount - 1];
        if (nextQ && questionRefs.current[nextQ.id]) {
          questionRefs.current[nextQ.id].scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 100);
    }
  }, [answers, isScrollReveal, visibleQuestions, revealedCount, setRevealedCount]);

  // Handle submit
  const handleSubmit = () => {
    if (isPreview) return;
    onSubmit();
  };

  // Check if all questions are answered
  const allAnswered = visibleQuestions.every((q) => isAnswered(q.id));
  const showSubmit = isScrollAll || (isScrollReveal && revealedCount >= visibleQuestions.length);

  return (
    <div className="min-h-screen py-8 px-4 transition-colors duration-300">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8 sticky top-4 z-10">
          <div className="flex-1 mr-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
            {survey.branding?.logo_url && <img src={survey.branding.logo_url} alt="Logo" className="h-10 w-auto mb-4 object-contain" onError={(e) => (e.target.style.display = "none")} />}
            <h1 className="text-xl md:text-2xl font-bold mb-3">{survey.title}</h1>
            {survey.settings?.show_progress !== false && <ProgressBar progress={progress} />}
            <div className="text-xs text-slate-500 mt-2">
              {answeredCount} von {visibleQuestions.length} beantwortet
            </div>
          </div>
          <ThemeToggle />
        </div>

        {/* Preview badge */}
        {isPreview && (
          <div className="mb-4 p-3 bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded-lg text-center">
            <span className="text-amber-700 dark:text-amber-400 font-medium">📝 Vorschau-Modus - Antworten werden nicht gespeichert</span>
          </div>
        )}

        {/* Questions */}
        <div className="space-y-6">
          {questionsToShow.map((question, index) => {
            const questionAnswered = isAnswered(question.id);
            const isLast = index === questionsToShow.length - 1;

            return (
              <div
                key={question.id}
                ref={(el) => (questionRefs.current[question.id] = el)}
                className={`
                  card p-6 transition-all duration-500
                  ${questionAnswered ? "ring-2 ring-green-500/30" : ""}
                  ${isScrollReveal && isLast && !questionAnswered ? "animate-pulse" : ""}
                `}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`
                    w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-medium text-sm
                    ${questionAnswered ? "bg-green-100 dark:bg-green-900/30 text-green-600" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}
                  `}
                  >
                    {questionAnswered ? "✓" : index + 1}
                  </div>
                  <div className="flex-1">
                    <Question question={question} value={answers[question.id]} onChange={(value) => setAnswer(question.id, value)} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Loading indicator for scroll-reveal */}
        {isScrollReveal && revealedCount < visibleQuestions.length && (
          <div className="mt-8 text-center text-slate-400">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full">
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
              Beantworte die Frage um fortzufahren
            </div>
          </div>
        )}

        {/* CAPTCHA & Submit */}
        {showSubmit && !isPreview && (
          <div className="mt-8 space-y-6">
            {survey.settings?.captcha && (
              <div className="card p-6 text-center">
                <p className="text-sm text-slate-500 mb-4 font-medium">Bitte verifiziere, dass du ein Mensch bist:</p>
                <Turnstile onVerify={setTurnstileToken} />
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 flex items-center gap-3">
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !allAnswered || (survey.settings?.captcha && !turnstileToken)}
              className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Wird gesendet...
                </>
              ) : (
                <>Absenden ✓</>
              )}
            </button>

            {!allAnswered && <p className="text-center text-sm text-slate-500">Bitte beantworten Sie alle Fragen, um fortzufahren.</p>}
          </div>
        )}

        {/* Preview submit */}
        {showSubmit && isPreview && (
          <div className="mt-8">
            <button type="button" disabled className="w-full btn-primary py-4 text-lg opacity-50 cursor-not-allowed">
              Absenden (Vorschau)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
