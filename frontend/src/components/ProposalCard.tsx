"use client";

import Link from "next/link";
import type { ProposalStatus } from "../types";
import CountdownTimer from "./CountdownTimer";

interface ProposalCardProps {
  id?: number;
  title: string;
  description: string;
  status: ProposalStatus;
  yesPercent: number;
  totalVotes?: number;
  deadline?: number;
  onVote?: (id: number, voteYes: boolean) => Promise<void>;
  isVoting?: boolean;
}

const statusConfig: Record<
  ProposalStatus,
  { label: string; dotClass: string; textStyle: React.CSSProperties; borderStyle: React.CSSProperties; ping?: boolean }
> = {
  Active: {
    label: "ACTIVE",
    dotClass: "bg-emerald-400 shadow-[0_0_7px_rgba(34,197,94,0.85)]",
    textStyle: { color: "rgb(52 211 153)" },
    borderStyle: { borderColor: "rgba(16,185,129,0.18)" },
    ping: true,
  },
  Closed: {
    label: "CLOSED",
    dotClass: "",
    textStyle: { color: "color-mix(in srgb, var(--text-secondary) 48%, transparent)" },
    borderStyle: { borderColor: "color-mix(in srgb, var(--accent-secondary) 7%, transparent)" },
  },
  Pending: {
    label: "PENDING",
    dotClass: "",
    textStyle: { color: "color-mix(in srgb, var(--accent-secondary) 65%, transparent)" },
    borderStyle: { borderColor: "color-mix(in srgb, var(--accent-secondary) 10%, transparent)" },
  },
};

export default function ProposalCard({
  id,
  title,
  description,
  status,
  yesPercent,
  totalVotes,
  deadline,
  onVote,
  isVoting = false,
}: ProposalCardProps) {
  const noPercent = 100 - yesPercent;
  const canVote = status === "Active" && id !== undefined && onVote;
  const cfg = statusConfig[status];

  return (
    <article
      className="group relative overflow-hidden"
      style={{
        background: "linear-gradient(160deg, color-mix(in srgb, var(--bg-secondary) 88%, transparent) 0%, color-mix(in srgb, var(--bg-dark) 92%, transparent) 100%)",
        border: "1px solid color-mix(in srgb, var(--accent-secondary) 7%, transparent)",
        transition: "border-color 0.5s ease, box-shadow 0.5s ease, transform 0.4s ease",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.borderColor = "color-mix(in srgb, var(--accent) 18%, transparent)";
        el.style.boxShadow = "0 0 60px color-mix(in srgb, var(--accent) 5%, transparent) inset, 0 0 1px color-mix(in srgb, var(--accent) 10%, transparent), 0 24px 80px rgba(0,0,0,0.65)";
        el.style.transform = "translateY(-3px)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.borderColor = "color-mix(in srgb, var(--accent-secondary) 7%, transparent)";
        el.style.boxShadow = "";
        el.style.transform = "";
      }}
    >
      {/* Blue top-edge highlight */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px transition-all duration-500 group-hover:via-[#4A9EFF]/68"
        style={{ background: "linear-gradient(90deg, transparent, color-mix(in srgb, var(--accent) 40%, transparent), transparent)" }}
      />

      {/* Inner darkness vignette */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent via-transparent transition-opacity duration-500 group-hover:opacity-35"
        style={{ "--tw-gradient-to": "color-mix(in srgb, var(--bg-dark) 55%, transparent)" } as React.CSSProperties}
      />

      {/* Corner bracket framing */}
      <span
        className="pointer-events-none absolute top-0 left-0 h-5 w-5 border-t border-l transition-all duration-500 group-hover:h-7 group-hover:w-7"
        style={{ borderColor: "color-mix(in srgb, var(--accent-secondary) 7%, transparent)" }}
      />
      <span
        className="pointer-events-none absolute bottom-0 right-0 h-5 w-5 border-b border-r transition-all duration-500 group-hover:h-7 group-hover:w-7"
        style={{ borderColor: "color-mix(in srgb, var(--accent-secondary) 7%, transparent)" }}
      />
      <span
        className="pointer-events-none absolute top-0 right-0 h-3 w-3 border-t border-r transition-all duration-500"
        style={{ borderColor: "color-mix(in srgb, var(--accent-secondary) 4%, transparent)" }}
      />
      <span
        className="pointer-events-none absolute bottom-0 left-0 h-3 w-3 border-b border-l transition-all duration-500"
        style={{ borderColor: "color-mix(in srgb, var(--accent-secondary) 4%, transparent)" }}
      />

      {/* Hover glow fill */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, color-mix(in srgb, var(--accent) 3%, transparent), transparent)" }}
      />

      <div className="relative p-7">
        {/* Header */}
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-2">
            {/* OP identifier + separator */}
            <div className="flex items-center gap-2.5">
              <span
                className="mono text-[9px] tracking-[0.38em] uppercase"
                style={{ color: "color-mix(in srgb, var(--accent) 42%, transparent)" }}
              >
                {id !== undefined ? `OP-${String(id).padStart(3, "0")}` : "PREVIEW"}
              </span>
              <span
                className="h-px w-8"
                style={{ background: "color-mix(in srgb, var(--accent-secondary) 7%, transparent)" }}
              />
            </div>

            {/* Title */}
            {id !== undefined ? (
              <Link
                href={`/proposals/${id}`}
                className="text-[16px] font-semibold leading-snug transition-colors duration-200"
                style={{
                  fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)",
                  color: "color-mix(in srgb, var(--text-primary) 82%, transparent)",
                }}
              >
                {title}
              </Link>
            ) : (
              <h3
                className="text-[16px] font-semibold leading-snug"
                style={{
                  fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)",
                  color: "color-mix(in srgb, var(--text-primary) 82%, transparent)",
                }}
              >
                {title}
              </h3>
            )}
          </div>

          {/* Status badge */}
          <span
            className="mono inline-flex shrink-0 items-center gap-2 border px-2.5 py-1.5 text-[9px] font-medium tracking-[0.22em] uppercase bg-transparent"
            style={{ ...cfg.borderStyle, ...cfg.textStyle }}
          >
            <span className="relative flex h-1.5 w-1.5">
              {cfg.ping && (
                <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-55 ${cfg.dotClass}`} />
              )}
              <span
                className={`relative inline-flex h-1.5 w-1.5 rounded-full ${cfg.ping ? cfg.dotClass : ""}`}
                style={!cfg.ping && status === "Closed"
                  ? { background: "color-mix(in srgb, var(--text-secondary) 38%, transparent)" }
                  : !cfg.ping && status === "Pending"
                  ? { background: "color-mix(in srgb, var(--accent-secondary) 55%, transparent)" }
                  : {}
                }
              />
            </span>
            {cfg.label}
          </span>
        </div>

        {/* Description */}
        <p
          className="mb-6 text-[13px] leading-relaxed line-clamp-2"
          style={{ color: "color-mix(in srgb, var(--text-secondary) 65%, transparent)" }}
        >
          {description}
        </p>

        {/* Vote distribution labels */}
        <div className="mb-2 flex items-center justify-between">
          <span
            className="mono text-[10px] font-medium tracking-[0.15em] uppercase"
            style={{ color: "color-mix(in srgb, var(--accent) 78%, transparent)" }}
          >
            {yesPercent}% For
          </span>
          <span
            className="mono text-[10px] font-medium tracking-[0.15em] uppercase"
            style={{ color: "color-mix(in srgb, var(--text-secondary) 52%, transparent)" }}
          >
            {noPercent}% Against
          </span>
        </div>

        {/* Vote bar */}
        <div
          className="mb-5 h-1 w-full overflow-hidden"
          style={{ background: "color-mix(in srgb, var(--accent-secondary) 4.5%, transparent)" }}
        >
          <div className="flex h-full w-full">
            {yesPercent > 0 && (
              <div
                className="h-full transition-all duration-700 ease-out"
                style={{
                  width: `${yesPercent}%`,
                  background: "linear-gradient(90deg, color-mix(in srgb, var(--accent) 28%, transparent) 0%, color-mix(in srgb, var(--accent) 88%, transparent) 100%)",
                  boxShadow: "0 0 8px color-mix(in srgb, var(--accent) 30%, transparent)",
                }}
              />
            )}
            {noPercent > 0 && (
              <div
                className="h-full"
                style={{
                  width: `${noPercent}%`,
                  background: "linear-gradient(90deg, color-mix(in srgb, var(--text-secondary) 12%, transparent) 0%, color-mix(in srgb, var(--text-secondary) 38%, transparent) 100%)",
                }}
              />
            )}
          </div>
        </div>

        {/* Vote count + Countdown */}
        <div className="mb-5 flex items-center justify-between">
          {totalVotes !== undefined ? (
            <p
              className="mono text-[9px] tracking-[0.2em] uppercase"
              style={{ color: "color-mix(in srgb, var(--text-secondary) 28%, transparent)" }}
            >
              {totalVotes.toLocaleString()} votes recorded
            </p>
          ) : (
            <span />
          )}
          {deadline !== undefined && (
            <CountdownTimer deadline={deadline} isClosed={status === "Closed"} />
          )}
        </div>

        {/* Vote buttons */}
        {canVote && (
          <div className="flex gap-2">
            <button
              onClick={() => onVote(id!, true)}
              disabled={isVoting}
              className="mono group/btn relative flex-1 border py-3 text-[10px] font-medium tracking-[0.18em] uppercase transition-all duration-300 hover:bg-[#4A9EFF]/[0.11] hover:text-[#4A9EFF] hover:shadow-[0_0_24px_rgba(74,158,255,0.09)] disabled:cursor-not-allowed disabled:opacity-[0.28] active:scale-[0.98]"
              style={{
                borderColor: "color-mix(in srgb, var(--accent) 18%, transparent)",
                background: "color-mix(in srgb, var(--accent) 5.5%, transparent)",
                color: "color-mix(in srgb, var(--accent) 72%, transparent)",
              }}
            >
              <span
                className="pointer-events-none absolute top-0 left-0 h-1.5 w-1.5 border-t border-l transition-all duration-300 group-hover/btn:h-2.5 group-hover/btn:w-2.5"
                style={{ borderColor: "color-mix(in srgb, var(--accent) 22%, transparent)" }}
              />
              {isVoting ? "Confirming…" : "✓ For"}
            </button>
            <button
              onClick={() => onVote(id!, false)}
              disabled={isVoting}
              className="mono flex-1 border py-3 text-[10px] font-medium tracking-[0.18em] uppercase transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-[0.28] active:scale-[0.98]"
              style={{
                borderColor: "color-mix(in srgb, var(--accent-secondary) 7%, transparent)",
                background: "color-mix(in srgb, var(--bg-secondary) 38%, transparent)",
                color: "color-mix(in srgb, var(--text-secondary) 52%, transparent)",
              }}
            >
              {isVoting ? "Confirming…" : "✗ Against"}
            </button>
          </div>
        )}

        {/* Closed state */}
        {status === "Closed" && (
          <div
            className="border-t pt-4"
            style={{ borderColor: "color-mix(in srgb, var(--accent-secondary) 4.5%, transparent)" }}
          >
            <p
              className="mono text-center text-[9px] tracking-[0.42em] uppercase"
              style={{ color: "color-mix(in srgb, var(--text-secondary) 22%, transparent)" }}
            >
              Voting Concluded
            </p>
          </div>
        )}
      </div>
    </article>
  );
}