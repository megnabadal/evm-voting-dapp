"use client";

import { useEffect, useState } from "react";

type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  type?: ToastType;
  onClose?: () => void;
  duration?: number;
}

const icons: Record<ToastType, string> = {
  success: "✓",
  error: "✕",
  info: "i",
};

const styles: Record<ToastType, React.CSSProperties> = {
  success: {
    borderColor: "rgba(6,78,59,0.4)",
    background: "color-mix(in srgb, var(--bg-dark) 90%, transparent)",
    color: "rgb(110 231 183)",
  },
  error: {
    borderColor: "color-mix(in srgb, var(--accent-secondary) 14%, transparent)",
    background: "color-mix(in srgb, var(--bg-dark) 90%, transparent)",
    color: "color-mix(in srgb, var(--accent-secondary) 80%, transparent)",
  },
  info: {
    borderColor: "color-mix(in srgb, var(--accent-secondary) 10%, transparent)",
    background: "color-mix(in srgb, var(--bg-dark) 88%, transparent)",
    color: "var(--text-secondary)",
  },
};

export default function Toast({
  message,
  type = "info",
  onClose,
  duration = 4000,
}: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (duration === 0) return;
    const timer = setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible) return null;

  return (
    <div
      className="flex items-center gap-3 border px-4 py-3 text-sm backdrop-blur-sm"
      style={styles[type]}
    >
      <span className="flex h-5 w-5 shrink-0 items-center justify-center border border-current text-xs font-bold">
        {icons[type]}
      </span>
      <p className="leading-snug">{message}</p>
      {onClose && (
        <button
          onClick={() => {
            setVisible(false);
            onClose();
          }}
          className="ml-auto opacity-50 transition hover:opacity-100"
        >
          ✕
        </button>
      )}
    </div>
  );
}
