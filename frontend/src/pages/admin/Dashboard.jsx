/**
 * Dashboard - Main admin dashboard with charts and stats
 */

import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import useAdminStore from "../../store/adminStore";
import ThemeToggle from "../../components/ThemeToggle";

const COLORS = ["#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899", "#f43f5e", "#10b981", "#f59e0b"];

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    isAuthenticated,
    responses,
    stats,
    surveys,
    questionAnalysis,
    isLoading,
    error,
    totalCount,
    fetchResponses,
    fetchStats,
    fetchSurveys,
    fetchQuestionAnalysis,
    exportData,
    logout,
    setFilters,
  } = useAdminStore();

  const [selectedSurvey, setSelectedSurvey] = useState("");

  // Load surveys on mount
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/admin");
      return;
    }
    fetchSurveys();
    fetchResponses();
  }, [isAuthenticated]);

  // When surveys load, select first one
  useEffect(() => {
    if (surveys.length > 0 && !selectedSurvey) {
      setSelectedSurvey(surveys[0].id);
    }
  }, [surveys]);

  // Fetch data when survey changes
  useEffect(() => {
    if (selectedSurvey) {
      fetchStats(selectedSurvey);
      fetchQuestionAnalysis(selectedSurvey);
      setFilters({ survey_id: selectedSurvey, source: "", date_from: "", date_to: "" });
      fetchResponses();
    }
  }, [selectedSurvey]);

  // Filter responses by selected survey
  const filteredResponses = selectedSurvey ? responses.filter((r) => r.survey_id === selectedSurvey) : responses;

  // Process data for charts
  const responsesPerDay = filteredResponses.reduce((acc, r) => {
    const date = new Date(r.created_at).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
    });
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const lineChartData = Object.entries(responsesPerDay)
    .slice(-14)
    .map(([date, count]) => ({ date, count }));

  const sourceData = filteredResponses.reduce((acc, r) => {
    const source = r.meta?.source || "Direkt";
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {});

  const pieChartData = Object.entries(sourceData).map(([name, value]) => ({
    name,
    value,
  }));

  const handleLogout = () => {
    logout();
    navigate("/admin");
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
              Survey Engine
            </Link>
            <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-medium rounded">Admin</span>
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
        {/* Survey Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Umfrage auswählen</label>
          <select
            value={selectedSurvey}
            onChange={(e) => setSelectedSurvey(e.target.value)}
            className="w-full md:w-auto px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            {surveys.map((survey) => (
              <option key={survey.id} value={survey.id}>
                {survey.title} ({survey.response_count} Responses)
              </option>
            ))}
          </select>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Gesamt Responses</p>
            <p className="text-3xl font-bold">{filteredResponses.length}</p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Abgeschlossen</p>
            <p className="text-3xl font-bold text-green-600">{filteredResponses.filter((r) => r.completed_at).length}</p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Heute</p>
            <p className="text-3xl font-bold text-indigo-600">
              {
                filteredResponses.filter((r) => {
                  const today = new Date().toDateString();
                  return new Date(r.created_at).toDateString() === today;
                }).length
              }
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Completion Rate</p>
            <p className="text-3xl font-bold">{filteredResponses.length > 0 ? Math.round((filteredResponses.filter((r) => r.completed_at).length / filteredResponses.length) * 100) : 0}%</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Line Chart */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Responses pro Tag</h3>
            <div className="h-64 w-full">
              {lineChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <LineChart data={lineChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--color-surface)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "8px",
                      }}
                    />
                    <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={{ fill: "#6366f1" }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">Noch keine Daten vorhanden</div>
              )}
            </div>
          </div>

          {/* Pie Chart */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Traffic Sources</h3>
            <div className="h-64 w-full">
              {pieChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">Noch keine Daten vorhanden</div>
              )}
            </div>
          </div>
        </div>

        {/* Question Analysis - Scroll Feed */}
        {questionAnalysis && questionAnalysis.questions && questionAnalysis.questions.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">📊 Fragen-Analyse</h3>
            <div className="space-y-4">
              {questionAnalysis.questions.map((question, index) => (
                <div key={question.question_id} className="card">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-xs text-slate-500 dark:text-slate-400">Frage {index + 1}</span>
                      <h4 className="font-medium">{question.text || question.question_id}</h4>
                    </div>
                    <span className="text-sm text-slate-500">{question.total_answers} Antworten</span>
                  </div>

                  {/* Stats for numeric questions */}
                  {question.stats && (
                    <div className="flex gap-4 mb-3 text-sm">
                      <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded">Ø {question.stats.average}</span>
                      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded">Min: {question.stats.min}</span>
                      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded">Max: {question.stats.max}</span>
                      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded">Median: {question.stats.median}</span>
                    </div>
                  )}

                  {/* Distribution bars */}
                  <div className="space-y-2">
                    {question.distribution.slice(0, 8).map((item, i) => (
                      <div key={item.value} className="flex items-center gap-3">
                        <div className="w-24 text-sm text-slate-600 dark:text-slate-400 truncate" title={item.value}>
                          {item.value}
                        </div>
                        <div className="flex-1 h-6 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${item.percentage}%`,
                              backgroundColor: COLORS[i % COLORS.length],
                            }}
                          />
                        </div>
                        <div className="w-16 text-sm text-right">
                          <span className="font-medium">{item.percentage}%</span>
                          <span className="text-slate-400 ml-1">({item.count})</span>
                        </div>
                      </div>
                    ))}
                    {question.distribution.length > 8 && <p className="text-sm text-slate-400 italic">+{question.distribution.length - 8} weitere Optionen</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="card mb-8">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <h3 className="text-lg font-semibold">Daten Export</h3>
            <div className="flex gap-3">
              <button onClick={() => exportData("json")} className="btn-secondary">
                📦 JSON Export
              </button>
              <button onClick={() => exportData("csv")} className="btn-primary">
                📊 CSV Export
              </button>
            </div>
          </div>
        </div>

        {/* Recent Responses Table */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Letzte Responses</h3>
            <Link to="/admin/responses" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
              Alle anzeigen →
            </Link>
          </div>

          {isLoading ? (
            <div className="py-8 text-center">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-2 font-medium text-slate-500">ID</th>
                    <th className="text-left py-3 px-2 font-medium text-slate-500">Survey</th>
                    <th className="text-left py-3 px-2 font-medium text-slate-500">Source</th>
                    <th className="text-left py-3 px-2 font-medium text-slate-500">Status</th>
                    <th className="text-left py-3 px-2 font-medium text-slate-500">Datum</th>
                  </tr>
                </thead>
                <tbody>
                  {responses.length > 0 ? (
                    responses.slice(0, 10).map((response) => (
                      <tr key={response.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-3 px-2 font-mono text-xs">{response.id.slice(0, 8)}...</td>
                        <td className="py-3 px-2">{response.survey_id}</td>
                        <td className="py-3 px-2">{response.meta?.source || "-"}</td>
                        <td className="py-3 px-2">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              response.completed_at ? "bg-green-100 dark:bg-green-900/30 text-green-600" : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600"
                            }`}
                          >
                            {response.completed_at ? "Abgeschlossen" : "Offen"}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-slate-500">{new Date(response.created_at).toLocaleDateString("de-DE")}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-slate-400 italic">
                        Keine Responses vorhanden
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {error && <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">{error}</div>}
      </main>
    </div>
  );
}
