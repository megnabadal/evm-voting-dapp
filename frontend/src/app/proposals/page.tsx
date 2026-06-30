"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Loading from "../../components/Loading";
import Toast from "../../components/Toast";
import WalletGuard from "../../components/WalletGuard";
import SortDropdown, { type SortOption } from "../../components/SortDropdown";
import { castVote } from "../../services/blockchainService";
import { formatVoteError } from "../../utils/proposal";
import { useProposalStore } from "../../store/useProposalStore";
import { useUIStore } from "../../store/useUIStore";

// Lazy load heavy components
const ProposalCard = dynamic(() => import("../../components/ProposalCard"), {
  loading: () => (
    <div className="h-40 animate-pulse border border-[rgba(200,216,240,0.05)] bg-[rgba(15,22,40,0.4)]" />
  ),
  ssr: false,
});

const ScrollReveal = dynamic(() => import("../../components/ScrollReveal"), {
  ssr: false,
});

// Cache duration — 30 seconds
const CACHE_TTL = 30_000;
let lastFetchTime = 0;

function ProposalsList() {
  const { proposals, loading, error, votingId, fetchProposals, setVotingId } =
    useProposalStore();
  const { toast, showToast, clearToast } = useUIStore();
  const hasFetched = useRef(false);

  const [sortBy, setSortBy] = useState<SortOption>("newest");

  const sortedProposals = useMemo(() => {
    const arr = [...proposals];
    switch (sortBy) {
      case "newest":
        return arr.sort((a, b) => b.deadline - a.deadline);
      case "oldest":
        return arr.sort((a, b) => a.deadline - b.deadline);
      case "most-votes":
        return arr.sort((a, b) => b.totalVotes - a.totalVotes);
      case "least-votes":
        return arr.sort((a, b) => a.totalVotes - b.totalVotes);
    }
  }, [proposals, sortBy]);

  useEffect(() => {
    const now = Date.now();
    // Only fetch if no cache or cache expired
    if (!hasFetched.current || now - lastFetchTime > CACHE_TTL) {
      hasFetched.current = true;
      lastFetchTime = now;
      fetchProposals();
    }
  }, [fetchProposals]);

  const handleVote = async (proposalId: number, voteYes: boolean) => {
    setVotingId(proposalId);
    try {
      const receipt = await castVote(proposalId, voteYes);

      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/proposals/${proposalId}/votes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            txHash: receipt.hash,
            voterAddress: receipt.from,
            support: voteYes,
            blockNumber: receipt.blockNumber,
          }),
        }
      );

      showToast("Vote submitted successfully!", "success");
      // Invalidate cache and refetch
      lastFetchTime = 0;
      await fetchProposals();
    } catch (err) {
      showToast(formatVoteError(err), "error");
    } finally {
      setVotingId(null);
    }
  };

  const activeCount = proposals.filter((p) => p.status === "Active").length;
  const closedCount = proposals.length - activeCount;

  return (
    <>
      {toast && (
        <div className="mb-6 animate-slide-up">
          <Toast message={toast.message} type={toast.type} onClose={clearToast} />
        </div>
      )}

      {/* Sort dropdown */}
      {!loading && proposals.length > 0 && (
        <div className="mb-4 flex items-center justify-end">
          <SortDropdown value={sortBy} onChange={setSortBy} />
        </div>
      )}

      {/* Stats row */}
      {!loading && proposals.length > 0 && (
        <div className="mb-10 grid grid-cols-3 divide-x divide-[rgba(200,216,240,0.05)] border border-[rgba(200,216,240,0.07)]">
          {[
            { label: "Total", value: proposals.length, color: "text-[#F5F0E8]/70" },
            { label: "Active", value: activeCount, color: "text-emerald-400/80" },
            { label: "Closed", value: closedCount, color: "text-[#A8A090]/50" },
          ].map(({ label, value, color }) => (
            <div key={label} className="px-6 py-5 text-center">
              <p
                className={`text-3xl font-bold tabular-nums ${color}`}
                style={{ fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)" }}
              >
                {value}
              </p>
              <p className="mono mt-1 text-[9px] tracking-[0.28em] text-[#A8A090]/30 uppercase">
                {label}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Show skeleton while loading */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-40 animate-pulse border border-[rgba(200,216,240,0.05)] bg-[rgba(15,22,40,0.4)]"
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>
      )}

      {error && (
        <div className="relative border border-[rgba(200,216,240,0.1)] bg-[rgba(74,158,255,0.04)] px-5 py-4">
          <span className="pointer-events-none absolute top-0 left-0 h-2 w-2 border-t border-l border-[#4A9EFF]/30" />
          <span className="pointer-events-none absolute bottom-0 right-0 h-2 w-2 border-b border-r border-[#4A9EFF]/30" />
          <p className="mono text-sm text-[#C8D8F0]/70">{error}</p>
        </div>
      )}

      {!loading && !error && proposals.length === 0 && (
        <div className="py-32 text-center animate-fade-up">
          <div className="relative mx-auto mb-8 flex h-16 w-16 items-center justify-center border border-[rgba(200,216,240,0.08)] bg-[rgba(15,22,40,0.6)]">
            <span className="pointer-events-none absolute top-0 left-0 h-3 w-3 border-t border-l border-[#4A9EFF]/25" />
            <span className="pointer-events-none absolute bottom-0 right-0 h-3 w-3 border-b border-r border-[#4A9EFF]/25" />
            <span className="mono text-2xl text-[#A8A090]/35">∅</span>
          </div>
          <p
            className="mb-3 text-xl font-bold text-[#F5F0E8]/60"
            style={{ fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)" }}
          >
            No proposals yet
          </p>
          <p className="mono mb-12 text-[10px] tracking-[0.25em] text-[#A8A090]/35 uppercase">
            Initiate the first directive
          </p>
          <Link
            href="/proposals/create"
            className="blue-glow-btn inline-flex items-center border border-[#4A9EFF]/40 bg-[#4A9EFF]/10 px-7 py-3.5 text-[11px] font-medium tracking-[0.15em] text-[#4A9EFF] uppercase transition-all duration-300 hover:bg-[#4A9EFF]/20 hover:border-[#4A9EFF]/60 hover:scale-[1.02] active:scale-[0.97]"
          >
            Create Proposal
          </Link>
        </div>
      )}

      {/* Proposals with lazy loaded cards */}
      {!loading && proposals.length > 0 && (
        <div className="space-y-3">
          {sortedProposals.map((proposal, i) => (
            <ScrollReveal key={proposal.id} delay={i * 60}>
              <ProposalCard
                id={proposal.id}
                title={proposal.title}
                description={proposal.description}
                status={proposal.status}
                yesPercent={proposal.yesPercent}
                totalVotes={proposal.totalVotes}
                deadline={proposal.deadline}
                onVote={handleVote}
                isVoting={votingId === proposal.id}
              />

              
            </ScrollReveal>
          ))}
        </div>
      )}
    </>
  );
}

export default function ProposalsPage() {
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
              // On-Chain Proposals
            </span>
            <span className="animate-line-extend h-px flex-1 bg-[rgba(200,216,240,0.05)]" />
            <span className="mono text-[9px] tracking-[0.2em] text-[#A8A090]/20 uppercase">
              Sepolia
            </span>
          </div>

          <div className="flex items-end justify-between gap-6">
            <div>
              <h1
                className="animate-cinema-1 font-extrabold leading-[0.85] tracking-[-0.025em] text-[#F5F0E8]/85"
                style={{
                  fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)",
                  fontSize: "clamp(3rem, 8vw, 6rem)",
                }}
              >
                PROPOSALS
              </h1>
              <p className="animate-cinema-2 mono mt-4 text-[11px] tracking-[0.22em] text-[#A8A090]/40 uppercase">
                All on-chain governance — vote or create a new directive
              </p>
            </div>

            <div className="animate-cinema-3 shrink-0">
              <Link
                href="/proposals/create"
                className="blue-glow-btn relative inline-flex items-center border border-[#4A9EFF]/40 bg-[#4A9EFF]/10 px-6 py-3 text-[11px] font-medium tracking-[0.15em] text-[#4A9EFF] uppercase transition-all duration-300 hover:bg-[#4A9EFF]/20 hover:border-[#4A9EFF]/60 hover:scale-[1.02] active:scale-[0.97]"
              >
                <span className="pointer-events-none absolute top-0 left-0 h-1.5 w-1.5 border-t border-l border-[#4A9EFF]/35" />
                <span className="pointer-events-none absolute bottom-0 right-0 h-1.5 w-1.5 border-b border-r border-[#4A9EFF]/35" />
                + Create
              </Link>
            </div>
          </div>
        </div>
      </div>

      <main className="relative mx-auto w-full max-w-6xl flex-1 px-8 py-12">
        <WalletGuard message="Connect your wallet to access the proposals.">
          <ProposalsList />
        </WalletGuard>
      </main>

      <Footer />
    </div>
  );
}