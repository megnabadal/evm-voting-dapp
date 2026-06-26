"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Loading from "../../components/Loading";
import Toast from "../../components/Toast";
import WalletGuard from "../../components/WalletGuard";
import { castVote } from "../../services/blockchainService";
import { formatVoteError } from "../../utils/proposal";
import { useProposalStore } from "../../store/useProposalStore";
import { useUIStore } from "../../store/useUIStore";

// Lazy load heavy components
const ProposalCard = dynamic(() => import("../../components/ProposalCard"), {
  loading: () => (
    <div
      className="relative h-44 overflow-hidden border"
      style={{
        border: "1px solid color-mix(in srgb, var(--accent-secondary) 5%, transparent)",
        background: "color-mix(in srgb, var(--bg-secondary) 40%, transparent)",
      }}
    >
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, color-mix(in srgb, var(--accent) 20%, transparent), transparent)" }}
      />
      <div className="p-7 space-y-3">
        <div
          className="h-2 w-24 animate-pulse rounded-sm"
          style={{ background: "color-mix(in srgb, var(--accent-secondary) 6%, transparent)" }}
        />
        <div
          className="h-4 w-3/4 animate-pulse rounded-sm"
          style={{ background: "color-mix(in srgb, var(--accent-secondary) 8%, transparent)" }}
        />
        <div
          className="h-3 w-1/2 animate-pulse rounded-sm"
          style={{ background: "color-mix(in srgb, var(--accent-secondary) 5%, transparent)" }}
        />
      </div>
    </div>
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

  useEffect(() => {
    const now = Date.now();
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
        `${"https://evm-voting-dapp-production.up.railway.app"}/api/proposals/${proposalId}/votes`,
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

      {/* Stats bar */}
      {!loading && proposals.length > 0 && (
        <div
          className="mb-10 grid grid-cols-3 divide-x border"
          style={{
            borderColor: "color-mix(in srgb, var(--accent-secondary) 7%, transparent)",
            "--tw-divide-color": "color-mix(in srgb, var(--accent-secondary) 5%, transparent)",
          } as React.CSSProperties}
        >
          {[
            { label: "Total", value: proposals.length, colorStyle: { color: "color-mix(in srgb, var(--text-primary) 70%, transparent)" } },
            { label: "Active", value: activeCount, colorStyle: { color: "rgb(52 211 153 / 0.8)" } },
            { label: "Closed", value: closedCount, colorStyle: { color: "color-mix(in srgb, var(--text-secondary) 50%, transparent)" } },
          ].map(({ label, value, colorStyle }) => (
            <div
              key={label}
              className="group relative px-6 py-5 text-center transition-colors hover:bg-[rgba(74,158,255,0.02)]"
            >
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-px scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
                style={{ background: "linear-gradient(90deg, transparent, color-mix(in srgb, var(--accent) 20%, transparent), transparent)" }}
              />
              <p
                className="text-3xl font-bold tabular-nums"
                style={{ fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)", ...colorStyle }}
              >
                {value}
              </p>
              <p
                className="mono mt-1 text-[9px] tracking-[0.28em] uppercase"
                style={{ color: "color-mix(in srgb, var(--text-secondary) 30%, transparent)" }}
              >
                {label}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Skeleton while loading */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="relative h-44 overflow-hidden border"
              style={{
                animationDelay: `${i * 100}ms`,
                border: "1px solid color-mix(in srgb, var(--accent-secondary) 5%, transparent)",
                background: "color-mix(in srgb, var(--bg-secondary) 40%, transparent)",
              }}
            >
              <div
                className="absolute inset-x-0 top-0 h-px animate-pulse"
                style={{ background: "linear-gradient(90deg, transparent, color-mix(in srgb, var(--accent) 15%, transparent), transparent)" }}
              />
              <div className="p-7 space-y-3">
                <div
                  className="h-2 w-20 animate-pulse rounded-sm"
                  style={{ animationDelay: `${i*80}ms`, background: "color-mix(in srgb, var(--accent-secondary) 6%, transparent)" }}
                />
                <div
                  className="h-4 w-3/4 animate-pulse rounded-sm"
                  style={{ animationDelay: `${i*80}ms`, background: "color-mix(in srgb, var(--accent-secondary) 8%, transparent)" }}
                />
                <div
                  className="h-3 w-1/2 animate-pulse rounded-sm"
                  style={{ animationDelay: `${i*80}ms`, background: "color-mix(in srgb, var(--accent-secondary) 5%, transparent)" }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div
          className="relative border px-5 py-4"
          style={{
            border: "1px solid color-mix(in srgb, var(--accent-secondary) 10%, transparent)",
            background: "color-mix(in srgb, var(--accent) 4%, transparent)",
          }}
        >
          <span
            className="pointer-events-none absolute top-0 left-0 h-2 w-2 border-t border-l"
            style={{ borderColor: "color-mix(in srgb, var(--accent) 30%, transparent)" }}
          />
          <span
            className="pointer-events-none absolute bottom-0 right-0 h-2 w-2 border-b border-r"
            style={{ borderColor: "color-mix(in srgb, var(--accent) 30%, transparent)" }}
          />
          <p
            className="mono text-sm"
            style={{ color: "color-mix(in srgb, var(--accent-secondary) 70%, transparent)" }}
          >
            {error}
          </p>
        </div>
      )}

      {!loading && !error && proposals.length === 0 && (
        <div className="py-36 text-center animate-fade-up">
          <div
            className="relative mx-auto mb-10 flex h-20 w-20 items-center justify-center border"
            style={{
              border: "1px solid color-mix(in srgb, var(--accent-secondary) 8%, transparent)",
              background: "color-mix(in srgb, var(--bg-secondary) 60%, transparent)",
            }}
          >
            <span
              className="pointer-events-none absolute top-0 left-0 h-4 w-4 border-t border-l"
              style={{ borderColor: "color-mix(in srgb, var(--accent) 25%, transparent)" }}
            />
            <span
              className="pointer-events-none absolute bottom-0 right-0 h-4 w-4 border-b border-r"
              style={{ borderColor: "color-mix(in srgb, var(--accent) 25%, transparent)" }}
            />
            {/* Pulsing ring */}
            <span
              className="absolute h-full w-full animate-ping-ring rounded-full border"
              style={{ borderColor: "color-mix(in srgb, var(--accent) 10%, transparent)" }}
            />
            <span
              className="mono text-2xl"
              style={{ color: "color-mix(in srgb, var(--text-secondary) 35%, transparent)" }}
            >
              ∅
            </span>
          </div>
          <p
            className="mb-3 text-xl font-bold"
            style={{
              fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)",
              color: "color-mix(in srgb, var(--text-primary) 55%, transparent)",
            }}
          >
            No proposals yet
          </p>
          <p
            className="mono mb-14 text-[10px] tracking-[0.28em] uppercase"
            style={{ color: "color-mix(in srgb, var(--text-secondary) 30%, transparent)" }}
          >
            Initiate the first directive
          </p>
          <Link
            href="/proposals/create"
            className="blue-glow-btn group relative inline-flex items-center border px-8 py-4 text-[11px] font-medium tracking-[0.15em] uppercase transition-all duration-300 hover:bg-[#4A9EFF]/18 hover:border-[#4A9EFF]/60 hover:scale-[1.02] active:scale-[0.97]"
            style={{
              borderColor: "color-mix(in srgb, var(--accent) 40%, transparent)",
              background: "color-mix(in srgb, var(--accent) 10%, transparent)",
              color: "var(--accent)",
            }}
          >
            <span
              className="pointer-events-none absolute top-0 left-0 h-2 w-2 border-t border-l"
              style={{ borderColor: "color-mix(in srgb, var(--accent) 40%, transparent)" }}
            />
            <span
              className="pointer-events-none absolute bottom-0 right-0 h-2 w-2 border-b border-r"
              style={{ borderColor: "color-mix(in srgb, var(--accent) 40%, transparent)" }}
            />
            Create Proposal
          </Link>
        </div>
      )}

      {/* Proposals with staggered reveal */}
      {!loading && proposals.length > 0 && (
        <div className="space-y-3">
          {proposals.map((proposal, i) => (
            <ScrollReveal key={proposal.id} delay={i * 60}>
              <ProposalCard
                id={proposal.id}
                title={proposal.title}
                description={proposal.description}
                status={proposal.status}
                yesPercent={proposal.yesPercent}
                totalVotes={proposal.totalVotes}
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
    <div className="flex min-h-screen flex-col" style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}>
      {/* Fixed atmospheric glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="animate-atmospheric absolute -top-60 left-1/2 h-[700px] w-[800px] -translate-x-1/2 rounded-full blur-[200px]"
          style={{ background: "color-mix(in srgb, var(--accent) 4.5%, transparent)" }}
        />
        <div
          className="animate-atmospheric-slow absolute bottom-0 right-0 h-[400px] w-[500px] rounded-full blur-[150px]"
          style={{ background: "color-mix(in srgb, var(--accent) 2.5%, transparent)" }}
        />
      </div>

      <Navbar />

      {/* Cinematic command-center header */}
      <div
        className="relative overflow-hidden border-b"
        style={{ borderColor: "color-mix(in srgb, var(--accent-secondary) 5%, transparent)" }}
      >
        <div className="fine-grid pointer-events-none absolute inset-0 opacity-45" />
        <div className="hex-grid pointer-events-none absolute inset-0 opacity-30" />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "linear-gradient(to bottom, transparent, transparent, var(--bg-primary))" }}
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, color-mix(in srgb, var(--accent) 20%, transparent), transparent)" }}
        />

        {/* Scan line */}
        <div
          className="animate-scan-line pointer-events-none absolute inset-x-0 top-0 h-px opacity-60"
          style={{ background: "linear-gradient(90deg, transparent, color-mix(in srgb, var(--accent) 15%, transparent), transparent)" }}
        />

        {/* Atmospheric glow in header */}
        <div
          className="pointer-events-none absolute left-1/4 top-0 h-[200px] w-[400px] rounded-full blur-[80px]"
          style={{ background: "color-mix(in srgb, var(--accent) 4%, transparent)" }}
        />

        <div className="relative mx-auto max-w-6xl px-8 pb-16 pt-16">
          <div className="animate-fade-up mb-8 flex items-center gap-4">
            <span
              className="mono text-[9px] tracking-[0.42em] uppercase"
              style={{ color: "color-mix(in srgb, var(--accent) 38%, transparent)" }}
            >
              // On-Chain Proposals
            </span>
            <span
              className="animate-line-extend h-px flex-1"
              style={{ background: "color-mix(in srgb, var(--accent-secondary) 4%, transparent)" }}
            />
            <span
              className="mono text-[9px] tracking-[0.2em] uppercase"
              style={{ color: "color-mix(in srgb, var(--text-secondary) 18%, transparent)" }}
            >
              Sepolia
            </span>
          </div>

          <div className="flex items-end justify-between gap-6">
            <div>
              <h1
                className="animate-cinema-1 font-extrabold leading-[0.85] tracking-[-0.025em]"
                style={{
                  fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)",
                  fontSize: "clamp(3rem, 9vw, 7rem)",
                  color: "color-mix(in srgb, var(--text-primary) 85%, transparent)",
                }}
              >
                PROPOSALS
              </h1>
              <p
                className="animate-cinema-2 mono mt-4 text-[11px] tracking-[0.22em] uppercase"
                style={{ color: "color-mix(in srgb, var(--text-secondary) 38%, transparent)" }}
              >
                All on-chain governance — cast your vote or create a new directive
              </p>
            </div>

            <div className="animate-cinema-3 shrink-0">
              <Link
                href="/proposals/create"
                className="blue-glow-btn group relative inline-flex items-center border px-6 py-3 text-[11px] font-medium tracking-[0.15em] uppercase transition-all duration-300 hover:bg-[#4A9EFF]/18 hover:border-[#4A9EFF]/60 hover:scale-[1.02] active:scale-[0.97]"
                style={{
                  borderColor: "color-mix(in srgb, var(--accent) 40%, transparent)",
                  background: "color-mix(in srgb, var(--accent) 10%, transparent)",
                  color: "var(--accent)",
                }}
              >
                <span
                  className="pointer-events-none absolute top-0 left-0 h-1.5 w-1.5 border-t border-l transition-all duration-300 group-hover:h-2.5 group-hover:w-2.5"
                  style={{ borderColor: "color-mix(in srgb, var(--accent) 35%, transparent)" }}
                />
                <span
                  className="pointer-events-none absolute bottom-0 right-0 h-1.5 w-1.5 border-b border-r transition-all duration-300 group-hover:h-2.5 group-hover:w-2.5"
                  style={{ borderColor: "color-mix(in srgb, var(--accent) 35%, transparent)" }}
                />
                + Create
              </Link>
            </div>
          </div>
        </div>
      </div>

      <main className="relative mx-auto w-full max-w-6xl flex-1 px-8 py-12">
        <WalletGuard message="Connect your wallet to access the governance network.">
          <ProposalsList />
        </WalletGuard>
      </main>

      <Footer />
    </div>
  );
}
