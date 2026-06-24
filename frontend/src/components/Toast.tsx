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

const styles: Record<ToastType, string> = {
  success:
    "border-emerald-700/40 bg-[rgba(6,13,26,0.90)] text-emerald-300",
  error:
    "border-[rgba(200,216,240,0.14)] bg-[rgba(6,13,26,0.90)] text-[#C8D8F0]/80",
  info:
    "border-[rgba(200,216,240,0.10)] bg-[rgba(6,13,26,0.88)] text-[#A8A090]",
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
      className={`flex items-center gap-3 border px-4 py-3 text-sm backdrop-blur-sm ${styles[type]}`}
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
