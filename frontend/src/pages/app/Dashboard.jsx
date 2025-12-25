/**
 * Dashboard - User's Survey List
 */
import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAdminStore from "../../store/adminStore";
import ThemeToggle from "../../components/ThemeToggle";

export default function Dashboard() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { isAuthenticated, surveys, isLoading, error, fetchSurveys, createSurvey, importSurvey, fetchTemplates, useTemplate, logout } = useAdminStore();

  const [showTemplates, setShowTemplates] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    fetchSurveys();
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleCreateEmpty = async () => {
    const title = prompt("Titel der Umfrage:");
    if (!title) return;

    setIsCreating(true);
    try {
      // Generate a random UUID-style ID (independent of title)
      const randomId = crypto.randomUUID
        ? crypto.randomUUID()
        : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
          });

      const newSurvey = {
        id: randomId,
        title: title,
        questions: [],
        settings: { allow_back: true },
      };
      await createSurvey(newSurvey);
    } catch (err) {
      alert("Fehler: " + err.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCreating(true);
    try {
      await importSurvey(file);
    } catch (err) {
      alert("Import Fehler: " + err.message);
    } finally {
      setIsCreating(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleShowTemplates = async () => {
    setIsCreating(true);
    const tpls = await fetchTemplates();
    setTemplates(tpls);
    setShowTemplates(true);
    setIsCreating(false);
  };

  const handleUseTemplate = async (templateId) => {
    setIsCreating(true);
    try {
      await useTemplate(templateId);
      setShowTemplates(false);
    } catch (err) {
      alert("Template Fehler: " + err.message);
    } finally {
      setIsCreating(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen transition-colors duration-300">
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">Survey Engine</span>
            <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-medium rounded">Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button onClick={handleLogout} className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
              Abmelden
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">Meine Umfragen</h1>
            <p className="text-slate-500">Verwalten Sie Ihre Umfragen und analysieren Sie die Ergebnisse.</p>
          </div>

          <div className="flex gap-3">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />

            <button
              onClick={handleImportClick}
              disabled={isCreating}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              📤 Import JSON
            </button>

            <button
              onClick={handleShowTemplates}
              disabled={isCreating}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              📑 Templates
            </button>

            <button onClick={handleCreateEmpty} disabled={isCreating} className="btn-primary flex items-center gap-2">
              <span>+</span> Neue Umfrage
            </button>
          </div>
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">{error}</div>}

        {/* Template Modal */}
        {showTemplates && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <h3 className="font-bold text-lg">Vorlage auswählen</h3>
                <button onClick={() => setShowTemplates(false)} className="text-slate-400 hover:text-slate-600">
                  ✕
                </button>
              </div>
              <div className="p-4 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((tpl) => (
                  <div key={tpl.id} className="card hover:border-indigo-500 cursor-pointer transition-colors" onClick={() => handleUseTemplate(tpl.id)}>
                    <h4 className="font-bold mb-1">{tpl.title}</h4>
                    <p className="text-sm text-slate-500">{tpl.description}</p>
                  </div>
                ))}
                {templates.length === 0 && <p className="text-slate-500 col-span-2 text-center py-8">Keine Templates gefunden.</p>}
              </div>
            </div>
          </div>
        )}

        {isLoading && surveys.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-slate-500">Lade Umfragen...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {surveys.map((survey) => (
              <Link key={survey.id} to={`/app/analytics/${survey.id}`} className="card hover:shadow-lg transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                    📊
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${survey.is_active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>
                    {survey.is_active ? "Aktiv" : "Inaktiv"}
                  </span>
                </div>

                <h3 className="font-bold text-lg mb-2 truncate" title={survey.title}>
                  {survey.title}
                </h3>
                <p className="text-xs text-slate-500 mb-4 font-mono">{survey.id}</p>

                <div className="flex items-center justify-between text-sm text-slate-500 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <span>{new Date(survey.created_at || Date.now()).toLocaleDateString()}</span>
                  <span>{survey.response_count || 0} Responses</span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Link
                    to={`/app/builder/${survey.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 px-3 py-2 text-center text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    ✏️ Bearbeiten
                  </Link>
                  <Link
                    to={`/app/analytics/${survey.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 px-3 py-2 text-center text-sm border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    📊 Statistik
                  </Link>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!isLoading && surveys.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            <p className="text-lg font-medium text-slate-900 dark:text-white mb-2">Noch keine Umfragen</p>
            <p className="text-slate-500 mb-6">Erstellen Sie Ihre erste Umfrage, um loszulegen.</p>
            <button onClick={handleCreateEmpty} className="btn-primary">
              Jetzt erstellen
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
