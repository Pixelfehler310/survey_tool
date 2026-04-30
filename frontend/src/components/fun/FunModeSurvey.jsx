import { useEffect, useMemo, useRef, useState } from "react";
import { EyeOff, Gamepad2, SkipForward, Sparkles } from "lucide-react";
import Question from "../Question";
import ProgressBar from "../ProgressBar";
import ThemeToggle from "../ThemeToggle";
import Turnstile from "../Turnstile";

const TYPEWRITER_PRESETS = {
  slow: 22,
  normal: 35,
  fast: 55,
};

function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReducedMotion(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return prefersReducedMotion;
}

function getTypewriterSpeed(config) {
  const typewriter = config?.typewriter || {};
  const configuredSpeed = Number(typewriter.characters_per_second);

  if (Number.isFinite(configuredSpeed) && configuredSpeed > 0) {
    return Math.min(Math.max(configuredSpeed, 5), 120);
  }

  return TYPEWRITER_PRESETS[typewriter.preset] || TYPEWRITER_PRESETS.normal;
}

function DefaultHostCharacter({ expression, isTalking, isReacting, reducedMotion }) {
  const expressionClass = expression ? `fun-character--${expression}` : "fun-character--friendly";

  return (
    <div className={`fun-character ${expressionClass} ${isTalking ? "fun-character--talking" : ""} ${isReacting ? "fun-character--reacting" : ""} ${reducedMotion ? "fun-character--reduced" : ""}`}>
      <svg viewBox="0 0 320 360" role="img" aria-label="Friendly survey host" className="w-full h-full">
        <defs>
          <linearGradient id="funHostBody" x1="96" x2="230" y1="110" y2="315" gradientUnits="userSpaceOnUse">
            <stop stopColor="var(--fun-character-main)" />
            <stop offset="1" stopColor="var(--fun-character-deep)" />
          </linearGradient>
        </defs>

        <ellipse cx="164" cy="326" rx="92" ry="18" fill="var(--fun-shadow)" opacity="0.24" />

        <path d="M88 216c-22 10-43 3-54-17" fill="none" stroke="var(--fun-ink)" strokeWidth="14" strokeLinecap="round" />
        <path d="M234 216c23 9 42 1 52-19" fill="none" stroke="var(--fun-ink)" strokeWidth="14" strokeLinecap="round" />
        <circle cx="31" cy="194" r="15" fill="var(--fun-accent)" stroke="var(--fun-ink)" strokeWidth="8" />
        <circle cx="289" cy="192" r="15" fill="var(--fun-accent)" stroke="var(--fun-ink)" strokeWidth="8" />

        <path d="M102 161c-17 28-27 62-27 96 0 47 37 70 89 70s89-23 89-70c0-34-10-68-27-96H102Z" fill="url(#funHostBody)" stroke="var(--fun-ink)" strokeWidth="8" strokeLinejoin="round" />
        <path d="M118 296c8 20 27 31 46 31s38-11 46-31" fill="none" stroke="var(--fun-highlight)" strokeWidth="8" strokeLinecap="round" opacity="0.55" />

        <path d="M92 126c0-50 33-88 73-88 39 0 72 38 72 88 0 45-24 75-72 75s-73-30-73-75Z" fill="var(--fun-face)" stroke="var(--fun-ink)" strokeWidth="8" />
        <path d="M111 62c14-21 35-34 58-34 34 0 60 25 69 62-22-18-47-25-74-20-21 4-38 1-53-8Z" fill="var(--fun-hair)" stroke="var(--fun-ink)" strokeWidth="8" strokeLinejoin="round" />
        <circle cx="93" cy="134" r="18" fill="var(--fun-face)" stroke="var(--fun-ink)" strokeWidth="8" />
        <circle cx="237" cy="134" r="18" fill="var(--fun-face)" stroke="var(--fun-ink)" strokeWidth="8" />

        <g className="fun-character-eyes">
          <ellipse className="fun-character-eye" cx="137" cy="128" rx="10" ry="15" fill="var(--fun-ink)" />
          <ellipse className="fun-character-eye" cx="191" cy="128" rx="10" ry="15" fill="var(--fun-ink)" />
          <circle cx="141" cy="122" r="3" fill="white" />
          <circle cx="195" cy="122" r="3" fill="white" />
        </g>

        <path d="M156 145c5 4 11 4 16 0" fill="none" stroke="var(--fun-ink)" strokeWidth="5" strokeLinecap="round" />
        <path className="fun-character-mouth fun-character-mouth--idle" d="M145 164c10 13 28 13 38 0" fill="none" stroke="var(--fun-ink)" strokeWidth="7" strokeLinecap="round" />
        <ellipse className="fun-character-mouth fun-character-mouth--talk" cx="164" cy="169" rx="17" ry="12" fill="var(--fun-mouth)" stroke="var(--fun-ink)" strokeWidth="6" />

        <path d="M113 104c12-8 28-8 39-1" fill="none" stroke="var(--fun-ink)" strokeWidth="6" strokeLinecap="round" />
        <path d="M177 103c12-7 28-7 39 1" fill="none" stroke="var(--fun-ink)" strokeWidth="6" strokeLinecap="round" />

        <path d="M117 327l-12 22" stroke="var(--fun-ink)" strokeWidth="10" strokeLinecap="round" />
        <path d="M210 327l13 22" stroke="var(--fun-ink)" strokeWidth="10" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export default function FunModeSurvey({
  survey,
  currentQuestion,
  currentAnswer,
  progress,
  showProgress,
  validationError,
  error,
  isSubmitting,
  isLastQuestion,
  canGoBack,
  goToPrevious,
  onAnswerChange,
  onNext,
  onDisableFunMode,
  turnstileToken,
  setTurnstileToken,
  isPreview,
}) {
  const funMode = useMemo(() => survey.settings?.fun_mode || {}, [survey.settings?.fun_mode]);
  const typewriter = funMode.typewriter || {};
  const character = funMode.character || {};
  const reducedMotion = useReducedMotion();
  const fullText = currentQuestion?.text || "Keine Frage verfügbar.";
  const [displayedText, setDisplayedText] = useState(fullText);
  const [isRevealed, setIsRevealed] = useState(true);
  const [isReacting, setIsReacting] = useState(false);
  const typewriterIntervalRef = useRef(null);
  const reactionTimeoutRef = useRef(null);
  const speed = useMemo(() => getTypewriterSpeed(funMode), [funMode]);
  const primaryColor = survey.branding?.primary_color || "#6366f1";
  const showAnswersAfterReveal = typewriter.answers_after_reveal !== false;
  const canAnswer = isRevealed || !showAnswersAfterReveal;
  const isTalking = !isRevealed && !reducedMotion;

  useEffect(() => {
    if (typewriterIntervalRef.current) {
      window.clearInterval(typewriterIntervalRef.current);
    }

    const startTimer = window.setTimeout(() => {
      if (reducedMotion || !fullText) {
        setDisplayedText(fullText);
        setIsRevealed(true);
        return;
      }

      setDisplayedText("");
      setIsRevealed(false);

      let index = 0;
      typewriterIntervalRef.current = window.setInterval(() => {
        index += 1;
        setDisplayedText(fullText.slice(0, index));

        if (index >= fullText.length) {
          window.clearInterval(typewriterIntervalRef.current);
          typewriterIntervalRef.current = null;
          setIsRevealed(true);
        }
      }, Math.max(1000 / speed, 12));
    }, 0);

    return () => {
      window.clearTimeout(startTimer);
      if (typewriterIntervalRef.current) {
        window.clearInterval(typewriterIntervalRef.current);
        typewriterIntervalRef.current = null;
      }
    };
  }, [currentQuestion?.id, fullText, reducedMotion, speed]);

  useEffect(() => {
    return () => {
      if (reactionTimeoutRef.current) {
        window.clearTimeout(reactionTimeoutRef.current);
      }
      if (typewriterIntervalRef.current) {
        window.clearInterval(typewriterIntervalRef.current);
        typewriterIntervalRef.current = null;
      }
    };
  }, []);

  const revealText = () => {
    if (isRevealed || typewriter.skip_on_click === false) return;
    if (typewriterIntervalRef.current) {
      window.clearInterval(typewriterIntervalRef.current);
      typewriterIntervalRef.current = null;
    }
    setDisplayedText(fullText);
    setIsRevealed(true);
  };

  const triggerReaction = () => {
    if (reducedMotion || !canAnswer || character.answer_reaction === "none") return;

    setIsReacting(true);
    if (reactionTimeoutRef.current) {
      window.clearTimeout(reactionTimeoutRef.current);
    }
    reactionTimeoutRef.current = window.setTimeout(() => setIsReacting(false), 640);
  };

  const handleAnswerChange = (value) => {
    onAnswerChange(value);
    triggerReaction();
  };

  const handleNext = () => {
    if (!isRevealed && typewriter.skip_on_click !== false) {
      revealText();
      return;
    }
    onNext();
  };

  return (
    <div className="fun-mode-shell" style={{ "--fun-primary": primaryColor }}>
      <div className="fun-mode-stage">
        <header className="fun-mode-toolbar">
          <div className="fun-mode-title-group">
            <div className="fun-mode-badge">
              <Gamepad2 size={16} aria-hidden="true" />
              <span>Fun Mode</span>
            </div>
            <h1>{survey.title}</h1>
          </div>

          <div className="fun-mode-toolbar-actions">
            {funMode.participant_toggle !== false && (
              <button type="button" className="fun-mode-icon-button" onClick={onDisableFunMode} title="Fun Mode ausschalten" aria-label="Fun Mode ausschalten">
                <EyeOff size={18} aria-hidden="true" />
              </button>
            )}
            <ThemeToggle />
          </div>
        </header>

        {showProgress && (
          <div className="fun-mode-progress" aria-label="Fortschritt">
            <ProgressBar progress={progress} />
          </div>
        )}

        {isPreview && (
          <div className="fun-mode-preview-note">
            <Sparkles size={16} aria-hidden="true" />
            <span>Vorschau-Modus - Antworten werden nicht gespeichert</span>
          </div>
        )}

        <main className="fun-mode-scene">
          <section className="fun-mode-dialogue-zone" aria-live="polite">
            <button type="button" className="fun-mode-dialogue" onClick={revealText} disabled={isRevealed || typewriter.skip_on_click === false} aria-label={isRevealed ? undefined : "Text vollständig anzeigen"}>
              <span className="fun-mode-speaker">Interview Host</span>
              <span className="fun-mode-text">
                {displayedText}
                {currentQuestion?.required && isRevealed && <span className="fun-mode-required"> *</span>}
                {!isRevealed && <span className="fun-mode-cursor" aria-hidden="true" />}
              </span>
              {currentQuestion?.description && isRevealed && <span className="fun-mode-description">{currentQuestion.description}</span>}
              {!isRevealed && typewriter.skip_on_click !== false && (
                <span className="fun-mode-skip-hint">
                  <SkipForward size={15} aria-hidden="true" />
                  Weiterblenden
                </span>
              )}
            </button>

            <div className={`fun-mode-answer-panel ${canAnswer ? "fun-mode-answer-panel--ready" : ""}`}>
              {canAnswer ? (
                currentQuestion ? (
                  <Question question={currentQuestion} value={currentAnswer} onChange={handleAnswerChange} error={validationError} showPrompt={false} showDescription={false} />
                ) : (
                  <p className="text-slate-500 dark:text-slate-400">Keine Fragen verfügbar.</p>
                )
              ) : (
                <div className="fun-mode-answer-wait">Antworten erscheinen gleich.</div>
              )}
            </div>

            {isLastQuestion && survey.settings?.captcha && !isPreview && (
              <div className="fun-mode-captcha">
                <p>Bitte verifiziere, dass du ein Mensch bist:</p>
                <Turnstile onVerify={setTurnstileToken} />
              </div>
            )}

            {error && (
              <div className="fun-mode-error" role="alert">
                {error}
              </div>
            )}

            <div className="fun-mode-navigation">
              <button type="button" onClick={goToPrevious} disabled={!canGoBack || isSubmitting} className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed">
                Zurück
              </button>

              <button type="button" onClick={handleNext} disabled={isSubmitting || !canAnswer || (isLastQuestion && isPreview) || (isLastQuestion && survey.settings?.captcha && !turnstileToken)} className="btn-primary flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Wird gesendet...
                  </>
                ) : isLastQuestion ? (
                  isPreview ? (
                    "Absenden (Vorschau)"
                  ) : (
                    "Absenden"
                  )
                ) : (
                  "Weiter"
                )}
              </button>
            </div>
          </section>

          <aside className="fun-mode-character-zone" aria-hidden="true">
            <DefaultHostCharacter expression={character.default_expression || "friendly"} isTalking={isTalking} isReacting={isReacting} reducedMotion={reducedMotion} />
          </aside>
        </main>
      </div>
    </div>
  );
}
