"use client";

import { useEffect, useState } from "react";

interface CountdownTimerProps {
  deadline: number; // Unix timestamp in seconds
  isClosed?: boolean;
}

function formatRemaining(seconds: number): string {
  if (seconds <= 0) return "EXPIRED";

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
}

export default function CountdownTimer({ deadline, isClosed = false }: CountdownTimerProps) {
  const [remaining, setRemaining] = useState<number>(() =>
    Math.max(0, deadline - Math.floor(Date.now() / 1000))
  );

  useEffect(() => {
    if (isClosed) return;

    const initial = Math.max(0, deadline - Math.floor(Date.now() / 1000));
    if (initial <= 0) return;

    const interval = setInterval(() => {
      const secs = Math.max(0, deadline - Math.floor(Date.now() / 1000));
      setRemaining(secs);
      if (secs <= 0) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [deadline, isClosed]);

  const expired = remaining <= 0 || isClosed;
  const urgent = !expired && remaining < 3600; // < 1 hour

  return (
    <span
      className="mono text-[10px] font-medium tracking-[0.18em] uppercase"
      style={{
        color: expired
          ? "color-mix(in srgb, var(--text-secondary) 35%, transparent)"
          : urgent
          ? "rgb(248 113 113)"
          : "color-mix(in srgb, var(--accent) 75%, transparent)",
      }}
    >
      {expired ? "EXPIRED" : `⏱ ${formatRemaining(remaining)}`}
    </span>
  );
}