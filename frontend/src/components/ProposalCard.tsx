"use client";

import Link from "next/link";
import type { ProposalStatus } from "../types";

interface ProposalCardProps {
  id?: number;
  title: string;
  description: string;
  status: ProposalStatus;
  yesPercent: number;
  totalVotes?: number;
  onVote?: (id: number, voteYes: boolean) => Promise<void>;
  isVoting?: boolean;
}

const statusConfig: Record<
  ProposalStatus,
  { label: string; dot: string; text: string; border: string; ping?: boolean }
> = {
  Active: {
    label: "ACTIVE",
    dot: "bg-emerald-400 shadow-[0_0_7px_rgba(34,197,94,0.85)]",
    text: "text-emerald-400",
    border: "border-emerald-500/18",
    ping: true,
  },
  Closed: {
    label: "CLOSED",
    dot: "bg-[#A8A090]/38",
    text: "text-[#A8A090]/48",
    border: "border-[rgba(200,216,240,0.07)]",
  },
  Pending: {
    label: "PENDING",
    dot: "bg-[#C8D8F0]/55 shadow-[0_0_5px_rgba(200,216,240,0.45)]",
    text: "text-[#C8D8F0]/65",
    border: "border-[rgba(200,216,240,0.10)]",
  },
};

export default function ProposalCard({
  id,
  title,
  description,
  status,
  yesPercent,
  totalVotes,
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
        background: "linear-gradient(160deg, rgba(15, 22, 40, 0.88) 0%, rgba(6, 13, 26, 0.92) 100%)",
        border: "1px solid rgba(200, 216, 240, 0.07)",
        transition: "border-color 0.5s ease, box-shadow 0.5s ease, transform 0.4s ease",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.borderColor = "rgba(74, 158, 255, 0.18)";
        el.style.boxShadow = "0 0 60px rgba(74,158,255,0.05) inset, 0 0 1px rgba(74,158,255,0.10), 0 24px 80px rgba(0,0,0,0.65)";
        el.style.transform = "translateY(-3px)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.borderColor = "rgba(200, 216, 240, 0.07)";
        el.style.boxShadow = "";
        el.style.transform = "";
      }}
    >
      {/* Blue top-edge highlight — always present, intensifies on hover */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#4A9EFF]/40 to-transparent transition-all duration-500 group-hover:via-[#4A9EFF]/68" />

      {/* Inner darkness vignette */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-[#060D1A]/55 transition-opacity duration-500 group-hover:opacity-35" />

      {/* Corner bracket framing — expand on hover */}
      <span className="pointer-events-none absolute top-0 left-0 h-5 w-5 border-t border-l border-[rgba(200,216,240,0.07)] transition-all duration-500 group-hover:h-7 group-hover:w-7 group-hover:border-[#4A9EFF]/30" />
      <span className="pointer-events-none absolute bottom-0 right-0 h-5 w-5 border-b border-r border-[rgba(200,216,240,0.07)] transition-all duration-500 group-hover:h-7 group-hover:w-7 group-hover:border-[#4A9EFF]/30" />
      <span className="pointer-events-none absolute top-0 right-0 h-3 w-3 border-t border-r border-[rgba(200,216,240,0.04)] transition-all duration-500 group-hover:border-[#4A9EFF]/18" />
      <span className="pointer-events-none absolute bottom-0 left-0 h-3 w-3 border-b border-l border-[rgba(200,216,240,0.04)] transition-all duration-500 group-hover:border-[#4A9EFF]/18" />

      {/* Hover glow fill */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(74,158,255,0.03), transparent)" }}
      />

      <div className="relative p-7">
        {/* Header */}
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-2">
            {/* OP identifier + separator */}
            <div className="flex items-center gap-2.5">
              <span className="mono text-[9px] tracking-[0.38em] text-[#4A9EFF]/42 uppercase">
                {id !== undefined ? `OP-${String(id).padStart(3, "0")}` : "PREVIEW"}
              </span>
              <span className="h-px w-8 bg-[rgba(200,216,240,0.07)]" />
            </div>

            {/* Title — Playfair Display */}
            {id !== undefined ? (
              <Link
                href={`/proposals/${id}`}
                className="text-[16px] font-semibold leading-snug text-[#F5F0E8]/82 transition-colors duration-200 hover:text-[#F5F0E8]"
                style={{ fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)" }}
              >
                {title}
              </Link>
            ) : (
              <h3
                className="text-[16px] font-semibold leading-snug text-[#F5F0E8]/82"
                style={{ fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)" }}
              >
                {title}
              </h3>
            )}
          </div>

          {/* Status badge */}
          <span
            className={`mono inline-flex shrink-0 items-center gap-2 border px-2.5 py-1.5 text-[9px] font-medium tracking-[0.22em] uppercase ${cfg.border} bg-transparent ${cfg.text}`}
          >
            <span className="relative flex h-1.5 w-1.5">
              {cfg.ping && (
                <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-55 ${cfg.dot}`} />
              )}
              <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
            </span>
            {cfg.label}
          </span>
        </div>

        {/* Description */}
        <p className="mb-6 text-[13px] leading-relaxed text-[#A8A090]/65 line-clamp-2">
          {description}
        </p>

        {/* Vote distribution labels */}
        <div className="mb-2 flex items-center justify-between">
          <span className="mono text-[10px] font-medium tracking-[0.15em] text-[#4A9EFF]/78 uppercase">
            {yesPercent}% For
          </span>
          <span className="mono text-[10px] font-medium tracking-[0.15em] text-[#A8A090]/52 uppercase">
            {noPercent}% Against
          </span>
        </div>

        {/* Vote bar */}
        <div className="mb-5 h-1 w-full overflow-hidden bg-[rgba(200,216,240,0.045)]">
          <div className="flex h-full w-full">
            {yesPercent > 0 && (
              <div
                className="h-full transition-all duration-700 ease-out"
                style={{
                  width: `${yesPercent}%`,
                  background: "linear-gradient(90deg, rgba(74,158,255,0.28) 0%, rgba(74,158,255,0.88) 100%)",
                  boxShadow: "0 0 8px rgba(74,158,255,0.3)",
                }}
              />
            )}
            {noPercent > 0 && (
              <div
                className="h-full"
                style={{
                  width: `${noPercent}%`,
                  background: "linear-gradient(90deg, rgba(168,160,144,0.12) 0%, rgba(168,160,144,0.38) 100%)",
                }}
              />
            )}
          </div>
        </div>

        {/* Vote count */}
        {totalVotes !== undefined && (
          <p className="mono mb-5 text-[9px] tracking-[0.2em] text-[#A8A090]/28 uppercase">
            {totalVotes.toLocaleString()} votes recorded
          </p>
        )}

        {/* Vote buttons */}
        {canVote && (
          <div className="flex gap-2">
            <button
              onClick={() => onVote(id!, true)}
              disabled={isVoting}
              className="mono group/btn relative flex-1 border border-[#4A9EFF]/18 bg-[#4A9EFF]/[0.055] py-3 text-[10px] font-medium tracking-[0.18em] text-[#4A9EFF]/72 uppercase transition-all duration-300 hover:border-[#4A9EFF]/38 hover:bg-[#4A9EFF]/[0.11] hover:text-[#4A9EFF] hover:shadow-[0_0_24px_rgba(74,158,255,0.09)] disabled:cursor-not-allowed disabled:opacity-28 active:scale-[0.98]"
            >
              <span className="pointer-events-none absolute top-0 left-0 h-1.5 w-1.5 border-t border-l border-[#4A9EFF]/22 transition-all duration-300 group-hover/btn:h-2.5 group-hover/btn:w-2.5" />
              {isVoting ? "Confirming…" : "✓ For"}
            </button>
            <button
              onClick={() => onVote(id!, false)}
              disabled={isVoting}
              className="mono flex-1 border border-[rgba(200,216,240,0.07)] bg-[rgba(15,22,40,0.38)] py-3 text-[10px] font-medium tracking-[0.18em] text-[#A8A090]/52 uppercase transition-all duration-300 hover:border-[rgba(200,216,240,0.14)] hover:text-[#A8A090]/78 disabled:cursor-not-allowed disabled:opacity-28 active:scale-[0.98]"
            >
              {isVoting ? "Confirming…" : "✗ Against"}
            </button>
          </div>
        )}

        {/* Closed state */}
        {status === "Closed" && (
          <div className="border-t border-[rgba(200,216,240,0.045)] pt-4">
            <p className="mono text-center text-[9px] tracking-[0.42em] text-[#A8A090]/22 uppercase">
              Voting Concluded
            </p>
          </div>
        )}
      </div>
    </article>
  );
}
