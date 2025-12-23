/**
 * ThankYou - Thank you page after survey submission
 */

import { Link, useSearchParams } from "react-router-dom";

export default function ThankYou() {
  const [searchParams] = useSearchParams();
  const surveyId = searchParams.get("survey");

  return (
    <div className="min-h-screen flex items-center justify-center px-4 transition-colors duration-300">
      <div className="card max-w-md w-full text-center py-10">
        {/* Success icon */}
        <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl transform hover:scale-110 transition-transform duration-300">
          <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold mb-3">Vielen Dank! 🎉</h1>

        <p className="text-slate-500 dark:text-slate-400 mb-8 text-lg">Deine Antworten wurden erfolgreich übermittelt. Wir schätzen deine Teilnahme sehr!</p>

        <div className="border-t border-slate-100 dark:border-slate-800 pt-8">
          <Link to="/" className="btn-primary inline-block w-full">
            Zurück zur Übersicht
          </Link>
          <p className="text-sm text-slate-400 mt-4">Du kannst dieses Fenster jetzt schließen.</p>
        </div>
      </div>
    </div>
  );
}
