/**
 * App - Main application with routing
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Survey from "./components/Survey";
import Home from "./pages/Home";
import ThankYou from "./pages/ThankYou";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/survey/:surveyId" element={<Survey />} />
        <Route path="/thank-you" element={<ThankYou />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
