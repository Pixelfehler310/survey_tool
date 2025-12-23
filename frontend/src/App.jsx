/**
 * App - Main application with routing
 */

import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Survey from "./components/Survey";
import Home from "./pages/Home";
import ThankYou from "./pages/ThankYou";
import { AdminLogin, AdminSetup, Dashboard, ResponseList } from "./pages/admin";
import useThemeStore from "./store/themeStore";

function App() {
  const initTheme = useThemeStore((state) => state.initTheme);

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/survey/:surveyId" element={<Survey />} />
        <Route path="/thank-you" element={<ThankYou />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/setup" element={<AdminSetup />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/responses" element={<ResponseList />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
