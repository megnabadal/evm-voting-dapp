"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import WalletGuard from "../../components/WalletGuard";
import Pagination from "../../components/Pagination";
import { useProposalStore } from "../../store/useProposalStore";
import { getProposalVotes, type VoteTransaction } from "../../lib/api";

interface ActivityItem extends VoteTransaction {
  proposalTitle: string;
}

const ITEMS_PER_PAGE = 10;

function ActivityList() {
  const { proposals, fetchProposals } = useProposalStore();
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (proposals.length === 0) fetchProposals();
  }, [proposals.length, fetchProposals]);

  useEffect(() => {
    if (proposals.length === 0) return;

    let cancelled = false;
    setLoading(true);

    Promise.all(
      proposals.map(async (p) => {
        const votes = await getProposalVotes(p.id);
        return votes.map((v) => ({ ...v, proposalTitle: p.title }));
      })
    )
      .then((results) => {
        if (cancelled) return;
        const all = results.flat();
        all.sort((a, b) => new Date(b.voted_at).getTime() - new Date(a.voted_at).getTime());
        setActivity(all);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load activity:", err);
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [proposals]);

  const totalPages = Math.ceil(activity.length / ITEMS_PER_PAGE);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return activity.slice(start, start + ITEMS_PER_PAGE);
  }, [activity, currentPage]);

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-16 animate-pulse border border-[rgba(200,216,240,0.05)] bg-[rgba(15,22,40,0.4)]"
            style={{ animationDelay: `${i * 80}ms` }}
          />
        ))}
      </div>
    );
  }

  if (activity.length === 0) {
    return (
      <div className="py-32 text-center">
        <div className="relative mx-auto mb-8 flex h-16 w-16 items-center justify-center border border-[rgba(200,216,240,0.08)] bg-[rgba(15,22,40,0.6)]">
          <span className="mono text-2xl text-[#A8A090]/35">∅</span>
        </div>
        <p
          className="mb-3 text-xl font-bold text-[#F5F0E8]/60"
          style={{ fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)" }}
        >
          No activity yet
        </p>
        <p className="mono mb-12 text-[10px] tracking-[0.25em] text-[#A8A090]/35 uppercase">
          Cast a vote to populate the feed
        </p>
        <Link
          href="/proposals"
          className="mono inline-flex items-center border border-[#4A9EFF]/40 bg-[#4A9EFF]/10 px-7 py-3.5 text-[11px] font-medium tracking-[0.15em] text-[#4A9EFF] uppercase transition-all duration-300 hover:bg-[#4A9EFF]/20"
        >
          View Proposals
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {paginated.map((item, i) => {
          const isYes = item.vote_yes ?? item.support ?? false;
          const shortVoter = `${item.voter_address.slice(0, 6)}...${item.voter_address.slice(-4)}`;
          const time = new Date(item.voted_at).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div
              key={`${item.tx_hash}-${i}`}
              className="relative flex items-center justify-between gap-4 border p-4 transition-all duration-300 hover:border-[#4A9EFF]/20"
              style={{
                borderColor: "color-mix(in srgb, var(--accent-secondary) 7%, transparent)",
                background: "color-mix(in srgb, var(--bg-secondary) 50%, transparent)",
              }}
            >
              {/* Vote indicator */}
              <div className="flex items-center gap-3">
                <div
                  className="mono flex h-9 w-9 items-center justify-center border text-[10px] font-bold"
                  style={{
                    borderColor: isYes
                      ? "rgba(16,185,129,0.3)"
                      : "color-mix(in srgb, var(--text-secondary) 18%, transparent)",
                    background: isYes
                      ? "rgba(16,185,129,0.08)"
                      : "color-mix(in srgb, var(--text-secondary) 4%, transparent)",
                    color: isYes
                      ? "rgb(52 211 153)"
                      : "color-mix(in srgb, var(--text-secondary) 70%, transparent)",
                  }}
                >
                  {isYes ? "✓" : "✗"}
                </div>

                <div className="flex flex-col gap-0.5">
                  <Link
                    href={`/proposals/${item.proposal_id}`}
                    className="text-[14px] font-semibold transition-colors hover:text-[#4A9EFF]"
                    style={{
                      fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)",
                      color: "color-mix(in srgb, var(--text-primary) 85%, transparent)",
                    }}
                  >
                    {item.proposalTitle}
                  </Link>
                  <div className="mono flex items-center gap-2 text-[9px] tracking-[0.15em] uppercase">
                    <span style={{ color: "color-mix(in srgb, var(--accent) 60%, transparent)" }}>
                      OP-{String(item.proposal_id).padStart(3, "0")}
                    </span>
                    <span style={{ color: "color-mix(in srgb, var(--text-secondary) 30%, transparent)" }}>
                      ·
                    </span>
                    <span style={{ color: "color-mix(in srgb, var(--text-secondary) 50%, transparent)" }}>
                      by {shortVoter}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <a
                  href={`https://sepolia.etherscan.io/tx/${item.tx_hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mono text-[9px] tracking-[0.18em] uppercase transition-colors hover:text-[#4A9EFF]"
                  style={{ color: "color-mix(in srgb, var(--text-secondary) 45%, transparent)" }}
                  title="View on Etherscan"
                >
                  TX ↗
                </a>
                <span
                  className="mono text-[9px] tracking-[0.15em] uppercase whitespace-nowrap"
                  style={{ color: "color-mix(in srgb, var(--text-secondary) 35%, transparent)" }}
                >
                  {time}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </>
  );
}

export default function ActivityPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#0A0F1E] text-[#F5F0E8]">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="animate-atmospheric absolute -top-60 left-1/2 h-[700px] w-[800px] -translate-x-1/2 rounded-full bg-[#4A9EFF]/[0.05] blur-[180px]" />
      </div>

      <Navbar />

      <div className="relative overflow-hidden border-b border-[rgba(200,216,240,0.06)]">
        <div className="fine-grid pointer-events-none absolute inset-0 opacity-50" />
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-25" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0A0F1E]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#4A9EFF]/22 to-transparent" />

        <div className="relative mx-auto max-w-6xl px-8 pb-14 pt-16">
          <div className="animate-fade-up mb-8 flex items-center gap-4">
            <span className="mono text-[9px] tracking-[0.4em] text-[#4A9EFF]/40 uppercase">
              // Network Activity
            </span>
            <span className="animate-line-extend h-px flex-1 bg-[rgba(200,216,240,0.05)]" />
            <span className="mono text-[9px] tracking-[0.2em] text-[#A8A090]/20 uppercase">
              Live Feed
            </span>
          </div>

          <h1
            className="animate-cinema-1 font-extrabold leading-[0.85] tracking-[-0.025em] text-[#F5F0E8]/85"
            style={{
              fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)",
              fontSize: "clamp(3rem, 8vw, 6rem)",
            }}
          >
            ACTIVITY
          </h1>
          <p className="animate-cinema-2 mono mt-4 text-[11px] tracking-[0.22em] text-[#A8A090]/40 uppercase">
            All on-chain votes — most recent first
          </p>
        </div>
      </div>

      <main className="relative mx-auto w-full max-w-6xl flex-1 px-8 py-12">
        <WalletGuard message="Connect your wallet to view activity.">
          <ActivityList />
        </WalletGuard>
      </main>

      <Footer />
    </div>
  );
}