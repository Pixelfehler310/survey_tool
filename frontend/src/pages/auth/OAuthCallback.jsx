/**
 * OAuthCallback - Handle OAuth redirect and store token
 */

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useAdminStore from "../../store/adminStore";

export default function OAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState(null);
  const setToken = useAdminStore((state) => state.setToken);

  useEffect(() => {
    const token = searchParams.get("token");
    const errorParam = searchParams.get("error");

    if (errorParam) {
      setError(errorParam);
      return;
    }

    if (token) {
      // Store token and redirect to dashboard
      setToken(token);
      navigate("/app/dashboard", { replace: true });
    } else {
      setError("No token received");
    }
  }, [searchParams, navigate, setToken]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 transition-colors duration-300">
        <div className="card max-w-md w-full text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold mb-2">Login fehlgeschlagen</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-6">{error}</p>
          <a href="/admin" className="btn-primary inline-block px-6 py-2">
            Erneut versuchen
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center transition-colors duration-300">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-500 dark:text-slate-400">Anmeldung läuft...</p>
      </div>
    </div>
  );
}
