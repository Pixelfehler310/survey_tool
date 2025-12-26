/**
 * Setup - Initial admin account creation page
 * Only shown when no users exist in the database (first run)
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Setup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Check if setup is needed
  useEffect(() => {
    const checkSetupStatus = async () => {
      try {
        const res = await fetch("/api/v1/setup/status");
        const data = await res.json();

        if (!data.needs_setup) {
          // Setup already done, redirect to login
          navigate("/login");
        } else {
          setIsLoading(false);
        }
      } catch (err) {
        setError("Verbindungsfehler zum Server");
        setIsLoading(false);
      }
    };

    checkSetupStatus();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwörter stimmen nicht überein");
      return;
    }

    if (password.length < 8) {
      setError("Passwort muss mindestens 8 Zeichen lang sein");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/v1/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Setup fehlgeschlagen");
      }

      // Success - redirect to login
      navigate("/login", {
        state: { message: "Admin-Konto erstellt. Bitte melde dich an." },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-linear-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Ersteinrichtung</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Erstelle dein Administrator-Konto</p>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field" placeholder="Dein Name" required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">E-Mail-Adresse</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="admin@example.com" required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Passwort</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" placeholder="Mindestens 8 Zeichen" required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Passwort bestätigen</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input-field" placeholder="Passwort wiederholen" required />
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full flex items-center justify-center gap-2">
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Wird erstellt...
              </>
            ) : (
              "Admin-Konto erstellen"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">Dieses Konto hat vollen Zugriff auf alle Umfragen und Einstellungen.</p>
      </div>
    </div>
  );
}
