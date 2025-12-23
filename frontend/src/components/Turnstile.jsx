/**
 * Turnstile - Cloudflare Turnstile CAPTCHA component
 */

import { useEffect, useRef, useState } from "react";

// Turnstile site key - configure via environment variable
const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || "";

export default function Turnstile({ onVerify, onError, onExpire }) {
  const containerRef = useRef(null);
  const widgetId = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Skip if no site key configured
    if (!TURNSTILE_SITE_KEY) {
      // Pass null token to indicate CAPTCHA is disabled
      onVerify?.(null);
      return;
    }

    // Load Turnstile script if not already loaded
    if (!window.turnstile) {
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      script.async = true;
      script.defer = true;
      script.onload = () => setIsLoaded(true);
      document.head.appendChild(script);
    } else {
      setIsLoaded(true);
    }

    return () => {
      // Cleanup widget on unmount
      if (widgetId.current && window.turnstile) {
        window.turnstile.remove(widgetId.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isLoaded || !window.turnstile || !containerRef.current || !TURNSTILE_SITE_KEY) {
      return;
    }

    // Render widget
    widgetId.current = window.turnstile.render(containerRef.current, {
      sitekey: TURNSTILE_SITE_KEY,
      callback: (token) => {
        onVerify?.(token);
      },
      "error-callback": () => {
        onError?.();
      },
      "expired-callback": () => {
        onExpire?.();
      },
      theme: document.documentElement.classList.contains("dark") ? "dark" : "light",
    });
  }, [isLoaded]);

  // Don't render if no site key
  if (!TURNSTILE_SITE_KEY) {
    return null;
  }

  return (
    <div className="flex justify-center my-4">
      <div ref={containerRef} />
    </div>
  );
}
