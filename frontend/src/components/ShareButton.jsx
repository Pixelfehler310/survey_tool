import React, { useState } from "react";

export default function ShareButton({ url, label, className = "", iconOnly = false }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg transition-all ${
        copied
          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 font-medium"
      } ${className}`}
      title={url}
    >
      {copied ? (
        <>
          <span>✅</span>
          {!iconOnly && <span>{label || "Kopiert!"}</span>}
        </>
      ) : (
        <>
          <span>🔗</span>
          {!iconOnly && <span>{label || "Link kopieren"}</span>}
        </>
      )}
    </button>
  );
}
