/**
 * Register - New user registration
 */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAdminStore from "../../store/adminStore";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAdminStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Registrierung fehlgeschlagen");
      }

      // Automatically login (store token)
      // We already have the token from register response
      useAdminStore.getState().setToken(data.access_token);

      navigate("/app/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 transition-colors duration-300">
      <div className="card max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Account erstellen</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Starten Sie mit Survey Engine</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Name (Optional)</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field" placeholder="Max Mustermann" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">E-Mail-Adresse</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="name@example.com" required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Passwort</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" placeholder="Mindestens 8 Zeichen" minLength={8} required />
          </div>

          {error && <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">{error}</div>}

          <button type="submit" disabled={isLoading} className="btn-primary w-full flex items-center justify-center gap-2">
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Registrieren...
              </>
            ) : (
              "Account erstellen"
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-sm text-slate-500">
            Bereits registriert?{" "}
            <Link to="/login" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
              Anmelden
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
