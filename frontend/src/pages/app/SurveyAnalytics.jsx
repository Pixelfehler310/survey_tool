/**
 * Dashboard - Main admin dashboard with charts and stats
 */

import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import useAdminStore from "../../store/adminStore";
import ThemeToggle from "../../components/ThemeToggle";
import ShareButton from "../../components/ShareButton";

const DATE_RANGE_OPTIONS = [
  { value: "all", label: "Alle Zeiträume" },
  { value: "today", label: "Heute" },
  { value: "7d", label: "Letzte 7 Tage" },
  { value: "30d", label: "Letzte 30 Tage" },
  { value: "custom", label: "Benutzerdefiniert..." },
];

const COLORS = ["#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899", "#f43f5e", "#10b981", "#f59e0b"];

export default function SurveyAnalytics() {
  const navigate = useNavigate();
  const { surveyId } = useParams();
  const {
    isAuthenticated,
    responses,
    stats,
    surveys,
    questionAnalysis,
    dropoffAnalysis,
    isLoading,
    error,
    totalCount,
    fetchResponses,
    fetchStats,
    fetchSurveys,
    fetchQuestionAnalysis,
    fetchDropoffAnalysis,
    exportData,
    logout,
    setFilters,
  } = useAdminStore();

  const [selectedSurvey, setSelectedSurvey] = useState(surveyId);
  const [dateRange, setDateRange] = useState("all");
  const [customDateStart, setCustomDateStart] = useState("");
  const [customDateEnd, setCustomDateEnd] = useState("");
  const [expandedResponseId, setExpandedResponseId] = useState(null);
  const [isAnalysisExpanded, setIsAnalysisExpanded] = useState(true);
  const [surveyDef, setSurveyDef] = useState(null);

  // Load surveys on mount
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    fetchSurveys();
    fetchResponses();
  }, [isAuthenticated]);

  // Load full survey definition when selected
  useEffect(() => {
    if (selectedSurvey) {
      fetch(`/api/v1/surveys/${selectedSurvey}`)
        .then((res) => res.json())
        .then((data) => setSurveyDef(data))
        .catch((err) => console.error("Failed to load survey def", err));
    } else {
      setSurveyDef(null);
    }
  }, [selectedSurvey]);

  // Helper to get question text
  const getQuestionText = (questionId) => {
    if (!surveyDef) return questionId;
    const q = surveyDef.questions.find((q) => q.id === questionId);
    return q && q.text ? q.text : questionId;
  };

  // Helper to get answer label
  const getAnswerLabel = (questionId, value) => {
    if (!surveyDef) return String(value);

    // Handle null/undefined
    if (value === null || value === undefined) return "-";

    const q = surveyDef.questions.find((q) => q.id === questionId);
    if (!q || !q.options) return String(value);

    // Helper for single value lookup
    const lookup = (val) => {
      const opt = q.options.find((o) => o.value === String(val));
      return opt ? opt.label : val;
    };

    // Handle arrays (checkboxes)
    if (Array.isArray(value)) {
      return value.map(lookup).join(", ");
    }

    return lookup(value);
  };

  // Sync selectedSurvey with URL param
  useEffect(() => {
    if (surveyId) {
      setSelectedSurvey(surveyId);
    }
  }, [surveyId]);

  // Fetch data when survey changes
  useEffect(() => {
    if (selectedSurvey) {
      fetchStats(selectedSurvey);
      fetchQuestionAnalysis(selectedSurvey);
      fetchDropoffAnalysis(selectedSurvey);
      setFilters({ survey_id: selectedSurvey, source: "", date_from: "", date_to: "" });
      fetchResponses();
    }
  }, [selectedSurvey]);

  // Filter responses by selected survey and date range
  const filteredResponses = useMemo(() => {
    let filtered = selectedSurvey ? responses.filter((r) => r.survey_id === selectedSurvey) : responses;

    if (dateRange !== "all") {
      const now = new Date();
      let startDate;
      let endDate = new Date();

      switch (dateRange) {
        case "today":
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case "7d":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "30d":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "custom":
          startDate = customDateStart ? new Date(customDateStart) : null;
          endDate = customDateEnd ? new Date(customDateEnd + "T23:59:59") : new Date();
          break;
        default:
          startDate = null;
      }

      if (startDate) {
        filtered = filtered.filter((r) => {
          const responseDate = new Date(r.created_at);
          return responseDate >= startDate && responseDate <= endDate;
        });
      }
    }

    return filtered;
  }, [responses, selectedSurvey, dateRange, customDateStart, customDateEnd]);

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

  // Compute question analysis from filtered responses (respects date filter)
  const computedQuestionAnalysis = useMemo(() => {
    if (!questionAnalysis?.questions) {
      return null;
    }

    if (filteredResponses.length === 0) {
      // No responses in filter - show all questions with 0 counts
      return {
        ...questionAnalysis,
        total_responses: 0,
        questions: questionAnalysis.questions.map((q) => ({
          ...q,
          total_answers: 0,
          distribution: q.distribution.map((d) => ({ ...d, count: 0, percentage: 0 })),
          stats: null,
        })),
      };
    }

    // Build analysis from filtered responses
    const questionData = {};

    filteredResponses.forEach((response) => {
      if (!response.answers) return;

      Object.entries(response.answers).forEach(([questionId, answer]) => {
        if (!questionData[questionId]) {
          questionData[questionId] = { values: [], distribution: {} };
        }

        questionData[questionId].values.push(answer);

        if (Array.isArray(answer)) {
          answer.forEach((item) => {
            const key = String(item);
            questionData[questionId].distribution[key] = (questionData[questionId].distribution[key] || 0) + 1;
          });
        } else {
          const key = String(answer);
          questionData[questionId].distribution[key] = (questionData[questionId].distribution[key] || 0) + 1;
        }
      });
    });

    // Merge with backend metadata (for labels, options, question text)
    const mergedQuestions = questionAnalysis.questions.map((q) => {
      const data = questionData[q.question_id];

      // Get total answers for THIS question from filtered data
      const totalAnswers = data ? data.values.length : 0;

      // Rebuild distribution with filtered counts, preserving labels from backend
      const updatedDistribution = q.distribution.map((d) => {
        const count = data?.distribution[d.value] || 0;
        return {
          ...d,
          count,
          percentage: totalAnswers > 0 ? Math.round((count / totalAnswers) * 1000) / 10 : 0,
        };
      });

      // Calculate stats for numeric values
      let stats = null;
      if (data) {
        const numericValues = data.values.filter((v) => typeof v === "number");
        if (numericValues.length > 0) {
          const sorted = [...numericValues].sort((a, b) => a - b);
          stats = {
            average: Math.round((numericValues.reduce((a, b) => a + b, 0) / numericValues.length) * 100) / 100,
            min: Math.min(...numericValues),
            max: Math.max(...numericValues),
            median: sorted[Math.floor(sorted.length / 2)],
          };
        }
      }

      return {
        ...q,
        total_answers: totalAnswers,
        distribution: updatedDistribution,
        stats,
      };
    });

    return {
      ...questionAnalysis,
      total_responses: filteredResponses.length,
      questions: mergedQuestions,
    };
  }, [questionAnalysis, filteredResponses]);

  const handleLogout = () => {
    logout();
    navigate("/login");
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
            <Link to="/app/dashboard" className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
              Survey Tool
            </Link>
            <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-medium rounded">App</span>
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
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          {/* Survey Selector */}
          {/* Back Link */}
          <div className="flex items-center">
            <Link to="/app/dashboard" className="text-indigo-600 dark:text-indigo-400 hover:underline">
              ← Zurück zur Übersicht
            </Link>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Zeitraum</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {DATE_RANGE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end gap-2 mb-0.5">
            <ShareButton url={`${window.location.origin}/survey/${selectedSurvey}`} />
            <a
              href={`${window.location.origin}/survey/${selectedSurvey}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium flex items-center gap-2"
            >
              <span>🚀</span>
              <span>Öffnen</span>
            </a>
          </div>

          {/* Custom Date Range */}
          {dateRange === "custom" && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Von</label>
                <input
                  type="date"
                  value={customDateStart}
                  onChange={(e) => setCustomDateStart(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Bis</label>
                <input
                  type="date"
                  value={customDateEnd}
                  onChange={(e) => setCustomDateEnd(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Gestartet</p>
            <p className="text-3xl font-bold">{dropoffAnalysis?.total_started || filteredResponses.length}</p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Abgeschlossen</p>
            <p className="text-3xl font-bold text-green-600">{dropoffAnalysis?.total_completed || filteredResponses.filter((r) => r.completed_at).length}</p>
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
            <p className="text-3xl font-bold">
              {dropoffAnalysis?.completion_rate ?? (filteredResponses.length > 0 ? Math.round((filteredResponses.filter((r) => r.completed_at).length / filteredResponses.length) * 100) : 0)}%
            </p>
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

        {/* Drop-off Funnel Analysis */}
        {dropoffAnalysis && dropoffAnalysis.total_started > 0 && (
          <div className="card mb-8">
            <h3 className="text-lg font-semibold mb-4">📉 Drop-off Analyse</h3>

            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <div className="text-2xl font-bold text-slate-900 dark:text-white">{dropoffAnalysis.total_started}</div>
                <div className="text-sm text-slate-500">Gestartet</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{dropoffAnalysis.total_completed}</div>
                <div className="text-sm text-slate-500">Abgeschlossen</div>
              </div>
              <div className="text-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                <div className="text-2xl font-bold text-indigo-600">{dropoffAnalysis.completion_rate}%</div>
                <div className="text-sm text-slate-500">Completion Rate</div>
              </div>
            </div>

            {/* Drop-off Points */}
            {dropoffAnalysis.dropoff_by_question && dropoffAnalysis.dropoff_by_question.length > 0 ? (
              <div>
                <h4 className="text-sm font-medium text-slate-500 mb-3">Abbrüche pro Frage:</h4>
                <div className="space-y-2">
                  {dropoffAnalysis.dropoff_by_question.map((item, i) => (
                    <div key={item.question_index} className="flex items-center gap-3">
                      <div className="w-20 text-sm text-slate-600 dark:text-slate-400">Frage {item.question_index + 1}</div>
                      <div className="flex-1 h-6 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-red-500 transition-all duration-500"
                          style={{
                            width: `${Math.max(item.percentage, 3)}%`,
                            minWidth: item.count > 0 ? "12px" : "0",
                          }}
                        />
                      </div>
                      <div className="w-24 text-sm text-right">
                        <span className="font-medium text-red-600">{item.count}</span>
                        <span className="text-slate-400 ml-1">({item.percentage}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-400 mt-3 italic">Zeigt an, bei welcher Frage wie viele Nutzer die Umfrage abgebrochen haben.</p>
              </div>
            ) : (
              <p className="text-sm text-green-600 italic">🎉 Keine Abbrüche erfasst - alle Teilnehmer haben abgeschlossen!</p>
            )}
          </div>
        )}

        {/* Question Analysis - Scroll Feed */}
        {computedQuestionAnalysis && computedQuestionAnalysis.questions && computedQuestionAnalysis.questions.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setIsAnalysisExpanded(!isAnalysisExpanded)}>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <span className={`transition-transform duration-200 inline-block ${isAnalysisExpanded ? "rotate-90" : ""}`}>▶</span>
                📊 Fragen-Analyse ({filteredResponses.length} Responses)
              </h3>
              <span className="text-sm text-slate-500">{isAnalysisExpanded ? "Einklappen" : "Ausklappen"}</span>
            </div>

            {isAnalysisExpanded && (
              <div className="space-y-4">
                {computedQuestionAnalysis.questions.map((question, index) => (
                  <div key={question.question_id} className="card">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className="text-xs text-slate-500 dark:text-slate-400">Frage {index + 1}</span>
                        <h4 className="font-medium">{getQuestionText(question.question_id)}</h4>
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
                      {question.distribution.slice(0, 10).map((item, i) => (
                        <div key={item.value} className="flex items-center gap-3">
                          <div className="w-32 text-sm text-slate-600 dark:text-slate-400 truncate" title={getAnswerLabel(question.question_id, item.value)}>
                            {getAnswerLabel(question.question_id, item.value)}
                          </div>
                          <div className="flex-1 h-6 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${Math.max(item.percentage, 2)}%`,
                                backgroundColor: COLORS[i % COLORS.length],
                                minWidth: item.count > 0 ? "8px" : "0",
                              }}
                            />
                          </div>
                          <div className="w-16 text-sm text-right">
                            <span className="font-medium">{item.percentage}%</span>
                            <span className="text-slate-400 ml-1">({item.count})</span>
                          </div>
                        </div>
                      ))}

                      {question.distribution.length > 10 && <p className="text-sm text-slate-400 italic">+{question.distribution.length - 10} weitere Optionen</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
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
            <Link to="/app/responses" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
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
                    <th className="text-left py-3 px-2 font-medium text-slate-500 w-8"></th>
                    <th className="text-left py-3 px-2 font-medium text-slate-500">ID</th>
                    <th className="text-left py-3 px-2 font-medium text-slate-500">Survey</th>
                    <th className="text-left py-3 px-2 font-medium text-slate-500">Source</th>
                    <th className="text-left py-3 px-2 font-medium text-slate-500">Status</th>
                    <th className="text-left py-3 px-2 font-medium text-slate-500">Datum</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResponses.length > 0 ? (
                    filteredResponses.slice(0, 15).map((response) => (
                      <React.Fragment key={response.id}>
                        <tr
                          className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
                          onClick={() => setExpandedResponseId(expandedResponseId === response.id ? null : response.id)}
                        >
                          <td className="py-3 px-2">
                            <span className={`transition-transform inline-block ${expandedResponseId === response.id ? "rotate-90" : ""}`}>▶</span>
                          </td>
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
                        {/* Expanded Answer Details */}
                        {expandedResponseId === response.id && (
                          <tr key={`${response.id}-details`}>
                            <td colSpan="6" className="py-4 px-4 bg-slate-50 dark:bg-slate-800/30">
                              <div className="text-xs font-medium text-slate-500 mb-3">Antworten:</div>
                              {response.answers && Object.keys(response.answers).length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {Object.entries(response.answers).map(([questionId, answer]) => (
                                    <div key={questionId} className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                      <div className="text-xs text-slate-500 font-medium mb-1">{getQuestionText(questionId)}</div>
                                      <div className="text-sm text-slate-900 dark:text-slate-100">{getAnswerLabel(questionId, answer)}</div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-slate-400 italic">Keine Antworten vorhanden</div>
                              )}
                              {/* Metadata */}
                              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500">
                                <span className="mr-4">Erstellt: {new Date(response.created_at).toLocaleString("de-DE")}</span>
                                {response.completed_at && <span className="mr-4">Abgeschlossen: {new Date(response.completed_at).toLocaleString("de-DE")}</span>}
                                {response.meta?.user_agent && <span className="mr-4">Browser: {response.meta.user_agent.slice(0, 50)}...</span>}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-slate-400 italic">
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
