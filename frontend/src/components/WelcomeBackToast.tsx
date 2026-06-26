"use client";

import { useUser } from "../context/UserContext";

export default function WelcomeBackToast() {
  const { user, showWelcomeBack } = useUser();

  if (!showWelcomeBack || !user) return null;

  return (
    <div
      className="fixed bottom-8 right-8 z-[9999] px-6 py-4 transition-all duration-300"
      style={{
        background: "color-mix(in srgb, var(--bg-secondary) 95%, transparent)",
        border: "1px solid color-mix(in srgb, var(--accent) 30%, transparent)",
        backdropFilter: "blur(12px)",
        boxShadow: "0 0 30px color-mix(in srgb, var(--accent) 10%, transparent)",
        animation: "slide-up 0.3s ease-out",
      }}
    >
      <p
        className="mono text-[9px] tracking-[0.3em] uppercase"
        style={{ color: "color-mix(in srgb, var(--accent) 50%, transparent)" }}
      >
        // Returning User
      </p>
      <p
        className="mt-1 text-sm font-medium"
        style={{ color: "var(--text-primary)" }}
      >
        Hi, welcome back {user.username}!
      </p>
    </div>
  );
}