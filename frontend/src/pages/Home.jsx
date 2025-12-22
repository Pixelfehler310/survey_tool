/**
 * Home - Landing page with survey list
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Home() {
  const [surveys, setSurveys] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSurveys() {
      try {
        const response = await fetch("/api/v1/surveys");
        const data = await response.json();
        setSurveys(data.surveys || []);
      } catch (error) {
        console.error("Failed to load surveys:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSurveys();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">Survey Engine</h1>
          <p className="text-lg text-slate-600">Ein schlankes, JSON-gesteuertes Open-Source Umfrage-Tool</p>
        </div>

        {/* Survey list */}
        <div className="grid gap-4">
          {isLoading ? (
            <div className="card text-center py-12">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-slate-600">Umfragen werden geladen...</p>
            </div>
          ) : surveys.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-slate-600">Keine Umfragen verfügbar.</p>
            </div>
          ) : (
            surveys.map((survey) => (
              <Link key={survey.id} to={`/survey/${survey.id}`} className="card hover:shadow-xl transition-shadow duration-200 group">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">{survey.title}</h2>
                    <p className="text-sm text-slate-500 mt-1">Version {survey.version}</p>
                  </div>
                  <svg className="w-6 h-6 text-slate-400 group-hover:text-indigo-600 transform group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
