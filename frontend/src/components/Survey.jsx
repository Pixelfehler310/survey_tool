import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import useSurveyStore from "../store/surveyStore";
import { loadSurvey, submitResponse, generateFingerprint } from "../lib/surveyEngine";
import Question from "./Question";
import ProgressBar from "./ProgressBar";
import ThemeToggle from "./ThemeToggle";
import Turnstile from "./Turnstile";
import useBranding from "../hooks/useBranding";

export default function Survey() {
  const { surveyId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState(null);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  const [submittedSurvey, setSubmittedSurvey] = useState(null); // Store survey for thank-you page
  const [countdown, setCountdown] = useState(0);

  const {
    survey,
    answers,
    currentIndex,
    isLoading,
    isSubmitting,
    error,
    validationError,
    setSurvey,
    setAnswer,
    goToNext,
    goToPrevious,
    canGoBack,
    isLastQuestion,
    getProgress,
    getCurrentQuestion,
    getCurrentAnswer,
    getSubmissionData,
    setLoading,
    setSubmitting,
    setError,
    reset,
  } = useSurveyStore();

  // Apply branding from survey configuration
  useBranding(survey);

  // Check for client-side duplicate prevention
  const getStorageKey = () => `survey_${surveyId}_completed`;

  const checkClientDuplicate = (surveySettings) => {
    const dupMode = surveySettings?.duplicate_prevention;
    // Default to client mode if not specified and allow_multiple_responses is false
    const effectiveMode = dupMode || (surveySettings?.allow_multiple_responses ? "none" : "client");

    if (effectiveMode === "client") {
      const completed = localStorage.getItem(getStorageKey());
      if (completed) {
        setAlreadyCompleted(true);
        return true;
      }
    }
    return false;
  };

  const markAsCompleted = (surveySettings) => {
    const dupMode = surveySettings?.duplicate_prevention;
    const effectiveMode = dupMode || (surveySettings?.allow_multiple_responses ? "none" : "client");

    if (effectiveMode === "client") {
      localStorage.setItem(getStorageKey(), Date.now().toString());
    }
  };

  // Load survey on mount
  useEffect(() => {
    async function fetchSurvey() {
      setLoading(true);
      setError(null);

      try {
        const data = await loadSurvey(surveyId);

        // Check for client-side duplicate before showing survey
        if (!checkClientDuplicate(data.settings)) {
          setSurvey(data);
        }
      } catch (err) {
        setError(err.message || "Umfrage konnte nicht geladen werden.");
      } finally {
        setLoading(false);
      }
    }

    fetchSurvey();

    return () => {
      // Don't reset on unmount to preserve progress
    };
  }, [surveyId]);

  // Auto-fill hidden fields from URL parameters
  useEffect(() => {
    if (!survey?.questions) return;

    const hiddenQuestions = survey.questions.filter((q) => q.type === "hidden");

    hiddenQuestions.forEach((q) => {
      // Try multiple parameter names for each hidden field
      const paramNames = [q.id, `utm_${q.id}`, q.id.replace("_", "-")];

      for (const paramName of paramNames) {
        const value = searchParams.get(paramName);
        if (value) {
          setAnswer(q.id, value);
          break;
        }
      }
    });
  }, [survey, searchParams, setAnswer]);

  // Handle form submission
  const handleSubmit = async () => {
    // Validate last question
    if (!goToNext() && !isLastQuestion()) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const data = getSubmissionData();

      // Add source from URL params
      const source = searchParams.get("source");
      if (source) {
        data.meta.source = source;
      }

      // Add fingerprint for duplicate prevention
      data.fingerprint = generateFingerprint();

      // Add Turnstile token if available
      if (turnstileToken) {
        data.turnstile_token = turnstileToken;
      }

      await submitResponse(data);

      // Mark as completed for client-side duplicate prevention
      markAsCompleted(survey?.settings);

      // Store survey config for thank-you page BEFORE reset
      setSubmittedSurvey(survey);
      setIsSubmitted(true);

      // Reset store after successful submission
      reset();

      // Redirect to thank you page if configured
      if (survey?.settings?.submit_redirect) {
        navigate(survey.settings.submit_redirect);
      }
    } catch (err) {
      setError(err.message || "Fehler beim Absenden der Umfrage.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle next button click
  const handleNext = () => {
    if (isLastQuestion()) {
      handleSubmit();
    } else {
      goToNext();
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex]);

  // Handle auto-redirect after submission if configured
  useEffect(() => {
    if (isSubmitted && submittedSurvey?.settings?.thank_you) {
      const { cta_url, redirect_delay } = submittedSurvey.settings.thank_you;
      if (redirect_delay && cta_url) {
        setCountdown(redirect_delay);
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              window.location.href = cta_url;
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        return () => clearInterval(timer);
      }
    }
  }, [isSubmitted, submittedSurvey]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-slate-500 dark:text-slate-400">Umfrage wird geladen...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !survey) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 transition-colors duration-300">
        <div className="card max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Fehler</h2>
          <p className="text-slate-600 dark:text-slate-400">{error}</p>
          <Link to="/" className="mt-6 inline-block text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
            Zurück zur Übersicht
          </Link>
        </div>
      </div>
    );
  }

  // Already completed state (client-side duplicate prevention)
  if (alreadyCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 transition-colors duration-300">
        <div className="card max-w-md w-full text-center">
          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Bereits teilgenommen</h2>
          <p className="text-slate-600 dark:text-slate-400">Du hast diese Umfrage bereits ausgefüllt. Vielen Dank für deine Teilnahme!</p>
          <Link to="/" className="mt-6 inline-block text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
            Zurück zur Übersicht
          </Link>
        </div>
      </div>
    );
  }

  // Submitted state with custom thank-you page
  if (isSubmitted) {
    // Use submittedSurvey since survey is reset to null after submission
    const thankYouConfig = submittedSurvey?.settings?.thank_you || {};
    const { title = "Vielen Dank!", message = "Deine Antworten wurden erfolgreich übermittelt.", cta_text, cta_url, redirect_delay } = thankYouConfig;

    return (
      <div className="min-h-screen flex items-center justify-center px-4 transition-colors duration-300">
        <div className="card max-w-md w-full text-center py-10">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">{title}</h2>
          <p className="text-slate-600 dark:text-slate-400 whitespace-pre-line">{message}</p>

          {cta_text && cta_url && (
            <a href={cta_url} className="mt-6 inline-block btn-primary" target="_blank" rel="noopener noreferrer">
              {cta_text}
            </a>
          )}

          {!cta_url && (
            <Link to="/" className="mt-6 inline-block text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
              Neue Umfrage starten
            </Link>
          )}

          {countdown > 0 && cta_url && <p className="text-sm text-slate-400 mt-4">Weiterleitung in {countdown} Sekunden...</p>}
        </div>
      </div>
    );
  }

  // No survey loaded
  if (!survey) {
    return null;
  }

  const currentQuestion = getCurrentQuestion();
  const currentAnswer = getCurrentAnswer();
  const progress = getProgress();
  const showProgress = survey.settings?.show_progress !== false;

  return (
    <div className="min-h-screen py-8 px-4 transition-colors duration-300">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex-1 mr-4">
            {survey.branding?.logo_url && <img src={survey.branding.logo_url} alt="Logo" className="h-12 w-auto mb-6 object-contain" onError={(e) => (e.target.style.display = "none")} />}
            <h1 className="text-2xl md:text-3xl font-bold mb-4">{survey.title}</h1>
            {showProgress && <ProgressBar progress={progress} />}
          </div>
          <ThemeToggle />
        </div>

        {/* Question card */}
        <div className="card mb-6 md:p-8">
          {currentQuestion ? (
            <>
              <Question question={currentQuestion} value={currentAnswer} onChange={(value) => setAnswer(currentQuestion.id, value)} error={validationError} />

              {isLastQuestion() && survey.settings?.captcha && (
                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-sm text-center text-slate-500 mb-4 font-medium">Bitte verifiziere, dass du ein Mensch bist:</p>
                  <Turnstile onVerify={setTurnstileToken} />
                </div>
              )}
            </>
          ) : (
            <p className="text-slate-500 dark:text-slate-400">Keine Fragen verfügbar.</p>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 flex items-center gap-3">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between gap-4">
          <button type="button" onClick={goToPrevious} disabled={!canGoBack() || isSubmitting} className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed">
            ← Zurück
          </button>

          <button type="button" onClick={handleNext} disabled={isSubmitting || (isLastQuestion() && survey.settings?.captcha && !turnstileToken)} className="btn-primary flex items-center gap-2">
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Wird gesendet...
              </>
            ) : isLastQuestion() ? (
              "Absenden ✓"
            ) : (
              "Weiter →"
            )}
          </button>
        </div>

        {/* Keyboard hint */}
        <p className="text-center text-sm text-slate-400 mt-8">
          Drücke <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs shadow-sm">Enter</kbd> um fortzufahren
        </p>
      </div>
    </div>
  );
}
