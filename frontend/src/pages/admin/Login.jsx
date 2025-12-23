/**
 * AdminLogin - Login page for admin dashboard
 */

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useAdminStore from "../../store/adminStore";

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, isAuthenticated } = useAdminStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isChecking, setIsChecking] = useState(true);
  const [successMessage, setSuccessMessage] = useState(location.state?.message || null);

  // Check if already authenticated or needs setup
  useEffect(() => {
    async function checkStatus() {
      // If already authenticated, go to dashboard
      if (isAuthenticated) {
        navigate("/admin/dashboard");
        return;
      }

      // Check if setup is needed
      try {
        const response = await fetch("/api/v1/setup/status");
        const data = await response.json();

        if (data.needs_setup) {
          navigate("/admin/setup");
          return;
        }
      } catch (err) {
        // Server might be down, show login anyway
      }

      setIsChecking(false);
    }
    checkStatus();
  }, [navigate, isAuthenticated]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage(null);
    const success = await login(email, password);
    if (success) {
      navigate("/admin/dashboard");
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 transition-colors duration-300">
      <div className="card max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Admin Login</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Melde dich an, um das Dashboard zu nutzen</p>
        </div>

        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-600 dark:text-green-400 text-sm">{successMessage}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">E-Mail-Adresse</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="admin@example.com" required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Passwort</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" placeholder="••••••••" required />
          </div>

          {error && <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">{error}</div>}

          <button type="submit" disabled={isLoading} className="btn-primary w-full flex items-center justify-center gap-2">
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Anmelden...
              </>
            ) : (
              "Anmelden"
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
          <a href="/" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
            ← Zurück zur Startseite
          </a>
        </div>
      </div>
    </div>
  );
}
