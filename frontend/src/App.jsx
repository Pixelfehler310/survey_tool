/**
 * App - Main application with routing
 */

import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Survey from "./components/Survey";
import ThankYou from "./pages/ThankYou";
import { Dashboard, ResponseList, SurveyAnalytics, SurveyBuilder } from "./pages/app";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Setup from "./pages/auth/Setup";
import OAuthCallback from "./pages/auth/OAuthCallback";
import useThemeStore from "./store/themeStore";

function App() {
  const initTheme = useThemeStore((state) => state.initTheme);

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Survey Route */}
        <Route path="/survey/:surveyId" element={<Survey />} />
        <Route path="/thank-you" element={<ThankYou />} />

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/setup" element={<Setup />} />
        <Route path="/auth/callback" element={<OAuthCallback />} />

        {/* App Routes (Protected) */}
        <Route path="/app/dashboard" element={<Dashboard />} />
        <Route path="/app/analytics/:surveyId" element={<SurveyAnalytics />} />
        <Route path="/app/builder/:surveyId" element={<SurveyBuilder />} />
        <Route path="/app/responses" element={<ResponseList />} />

        {/* Root Redirect */}
        <Route path="/" element={<Navigate to="/app/dashboard" replace />} />

        {/* Fallback Redirect */}
        <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
