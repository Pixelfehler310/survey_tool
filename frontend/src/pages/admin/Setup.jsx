/**
 * Setup - Initial admin account creation page
 * Only accessible when no users exist in the database
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Setup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState(null);

  // Check if setup is needed
  useEffect(() => {
    async function checkSetupStatus() {
      try {
        const response = await fetch("/api/v1/setup/status");
        const data = await response.json();

        if (!data.needs_setup) {
          // Setup already done, redirect to login
          navigate("/admin");
        }
      } catch (err) {
        setError("Verbindung zum Server fehlgeschlagen");
      } finally {
        setIsChecking(false);
      }
    }
    checkSetupStatus();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwörter stimmen nicht überein");
      return;
    }

    if (password.length < 8) {
      setError("Passwort muss mindestens 8 Zeichen lang sein");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/v1/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name: name || null }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Setup fehlgeschlagen");
      }

      // Success - redirect to login
      navigate("/admin", { state: { message: "Admin-Konto erstellt! Bitte melde dich an." } });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
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
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Willkommen!</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Erstelle dein Administrator-Konto, um loszulegen.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Name (optional)</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field" placeholder="Max Mustermann" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">E-Mail-Adresse</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="admin@example.com" required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Passwort</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" placeholder="Mindestens 8 Zeichen" required minLength={8} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Passwort bestätigen</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input-field" placeholder="Passwort wiederholen" required />
          </div>

          {error && <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">{error}</div>}

          <button type="submit" disabled={isLoading} className="btn-primary w-full flex items-center justify-center gap-2">
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Wird erstellt...
              </>
            ) : (
              "Admin-Konto erstellen"
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center">Dies ist eine einmalige Einrichtung. Weitere Benutzer können später im Dashboard hinzugefügt werden.</p>
        </div>
      </div>
    </div>
  );
}
