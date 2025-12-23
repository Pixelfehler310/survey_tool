/**
 * ResponseList - Paginated list of all responses with filters
 */

import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAdminStore from "../../store/adminStore";
import ThemeToggle from "../../components/ThemeToggle";

export default function ResponseList() {
  const navigate = useNavigate();
  const { isAuthenticated, responses, isLoading, error, page, pageSize, totalCount, filters, fetchResponses, deleteResponse, setPage, setFilters, clearFilters, logout } = useAdminStore();

  const [showFilters, setShowFilters] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/admin");
      return;
    }
    fetchResponses();
  }, [isAuthenticated, page, filters]);

  const totalPages = Math.ceil(totalCount / pageSize);

  const handleDelete = async (id) => {
    if (deleteConfirm === id) {
      await deleteResponse(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
    }
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
            <Link to="/admin/dashboard" className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
              ← Dashboard
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button
              onClick={() => {
                logout();
                navigate("/admin");
              }}
              className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              Abmelden
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Alle Responses</h1>
          <button onClick={() => setShowFilters(!showFilters)} className="btn-secondary text-sm">
            🔍 Filter {showFilters ? "ausblenden" : "anzeigen"}
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="card mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Survey ID</label>
                <input
                  type="text"
                  value={filters.survey_id}
                  onChange={(e) => setFilters({ ...filters, survey_id: e.target.value })}
                  className="input-field text-sm"
                  placeholder="z.B. civic_validation_2024"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Source</label>
                <input type="text" value={filters.source} onChange={(e) => setFilters({ ...filters, source: e.target.value })} className="input-field text-sm" placeholder="z.B. instagram" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Von</label>
                <input type="date" value={filters.date_from} onChange={(e) => setFilters({ ...filters, date_from: e.target.value })} className="input-field text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Bis</label>
                <input type="date" value={filters.date_to} onChange={(e) => setFilters({ ...filters, date_to: e.target.value })} className="input-field text-sm" />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={() => fetchResponses()} className="btn-primary text-sm">
                Filter anwenden
              </button>
              <button onClick={clearFilters} className="btn-secondary text-sm">
                Zurücksetzen
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="card">
          {isLoading ? (
            <div className="py-12 text-center">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left py-3 px-2 font-medium text-slate-500">ID</th>
                      <th className="text-left py-3 px-2 font-medium text-slate-500">Survey</th>
                      <th className="text-left py-3 px-2 font-medium text-slate-500">Source</th>
                      <th className="text-left py-3 px-2 font-medium text-slate-500">Antworten</th>
                      <th className="text-left py-3 px-2 font-medium text-slate-500">Status</th>
                      <th className="text-left py-3 px-2 font-medium text-slate-500">Erstellt</th>
                      <th className="text-right py-3 px-2 font-medium text-slate-500">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {responses.map((response) => (
                      <tr key={response.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-3 px-2">
                          <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{response.id.slice(0, 8)}</span>
                        </td>
                        <td className="py-3 px-2">{response.survey_id}</td>
                        <td className="py-3 px-2">{response.meta?.source || "-"}</td>
                        <td className="py-3 px-2">{Object.keys(response.answers || {}).length}</td>
                        <td className="py-3 px-2">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              response.completed_at ? "bg-green-100 dark:bg-green-900/30 text-green-600" : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600"
                            }`}
                          >
                            {response.completed_at ? "Fertig" : "Offen"}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-slate-500">
                          {new Date(response.created_at).toLocaleString("de-DE", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="py-3 px-2 text-right">
                          <button
                            onClick={() => handleDelete(response.id)}
                            className={`text-xs px-2 py-1 rounded transition-colors ${
                              deleteConfirm === response.id ? "bg-red-500 text-white" : "text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                            }`}
                          >
                            {deleteConfirm === response.id ? "Bestätigen?" : "Löschen"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-500">
                  Zeige {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, totalCount)} von {totalCount}
                </p>
                <div className="flex gap-2">
                  <button onClick={() => setPage(page - 1)} disabled={page <= 1} className="btn-secondary text-sm disabled:opacity-50">
                    ← Zurück
                  </button>
                  <span className="px-3 py-2 text-sm">
                    Seite {page} von {totalPages || 1}
                  </span>
                  <button onClick={() => setPage(page + 1)} disabled={page >= totalPages} className="btn-secondary text-sm disabled:opacity-50">
                    Weiter →
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {error && <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">{error}</div>}
      </main>
    </div>
  );
}
