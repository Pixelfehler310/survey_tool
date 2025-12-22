/**
 * ThankYou - Thank you page after survey submission
 */

import { Link, useSearchParams } from "react-router-dom";

export default function ThankYou() {
  const [searchParams] = useSearchParams();
  const surveyId = searchParams.get("survey");

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="card max-w-md w-full text-center">
        {/* Success icon */}
        <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-slate-800 mb-3">Vielen Dank! 🎉</h1>

        <p className="text-slate-600 mb-6">Deine Antworten wurden erfolgreich übermittelt. Wir schätzen deine Teilnahme sehr!</p>

        <div className="border-t border-slate-100 pt-6">
          <p className="text-sm text-slate-500">Du kannst dieses Fenster jetzt schließen.</p>
        </div>
      </div>
    </div>
  );
}
