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
import FilterTabs, { type FilterOption } from "../../components/FilterTabs";
import SearchInput from "../../components/SearchInput";
import Pagination from "../../components/Pagination";
import { castVote } from "../../services/blockchainService";
import { formatVoteError } from "../../utils/proposal";
import { useProposalStore } from "../../store/useProposalStore";
import { useUIStore } from "../../store/useUIStore";

const ProposalCard = dynamic(() => import("../../components/ProposalCard"), {
  loading: () => (
    <div
      className="h-40 animate-pulse"
      style={{
        border: "1px solid color-mix(in srgb, var(--accent-secondary) 5%, transparent)",
        background: "color-mix(in srgb, var(--bg-secondary) 40%, transparent)",
      }}
    />
  ),
  ssr: false,
});

const ScrollReveal = dynamic(() => import("../../components/ScrollReveal"), {
  ssr: false,
});

const CACHE_TTL = 30_000;
const PROPOSALS_PER_PAGE = 5;
let lastFetchTime = 0;

function ProposalsList() {
  const { proposals, loading, error, votingId, fetchProposals, setVotingId } =
    useProposalStore();
  const { toast, showToast, clearToast } = useUIStore();
  const hasFetched = useRef(false);

  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [filter, setFilter] = useState<FilterOption>("all");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredAndSorted = useMemo(() => {
    let arr = [...proposals];
    if (filter === "active") arr = arr.filter((p) => p.status === "Active");
    else if (filter === "closed") arr = arr.filter((p) => p.status !== "Active");
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      arr = arr.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }
    switch (sortBy) {
      case "newest": return arr.sort((a, b) => b.deadline - a.deadline);
      case "oldest": return arr.sort((a, b) => a.deadline - b.deadline);
      case "most-votes": return arr.sort((a, b) => b.totalVotes - a.totalVotes);
      case "least-votes": return arr.sort((a, b) => a.totalVotes - b.totalVotes);
    }
  }, [proposals, sortBy, filter, search]);

  const totalPages = Math.ceil(filteredAndSorted.length / PROPOSALS_PER_PAGE);

  const paginatedProposals = useMemo(() => {
    const start = (currentPage - 1) * PROPOSALS_PER_PAGE;
    return filteredAndSorted.slice(start, start + PROPOSALS_PER_PAGE);
  }, [filteredAndSorted, currentPage]);

  useEffect(() => { setCurrentPage(1); }, [filter, search, sortBy]);

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
      const result = await castVote(proposalId, voteYes);
      try {
        const response = await fetch(
          `https://evm-voting-dapp-production.up.railway.app/api/proposals/${proposalId}/votes`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              txHash: result.txHash,
              voterAddress: result.voterAddress,
              support: voteYes,
              blockNumber: result.receipt.blockNumber,
            }),
          }
        );
        if (!response.ok) {
          const errorBody = await response.text();
          console.error(
            `[VoteChain] Failed to save vote transaction to DB. Status: ${response.status}. Proposal: ${proposalId}. TxHash: ${result.txHash}. Body: ${errorBody}`
          );
        }
      } catch (dbErr: unknown) {
        const e = dbErr as Error;
        console.error(
          `[VoteChain] Network error saving vote transaction to DB. Proposal: ${proposalId}. TxHash: ${result.txHash}. Error: ${e.message}`
        );
      }
      showToast("Vote submitted successfully!", "success");
      lastFetchTime = 0;
      await fetchProposals();
    } catch (err) {
      console.error("Vote error:", err);
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

      {!loading && proposals.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <FilterTabs
              value={filter}
              onChange={setFilter}
              counts={{ all: proposals.length, active: activeCount, closed: closedCount }}
            />
            <SearchInput value={search} onChange={setSearch} />
          </div>
          <SortDropdown value={sortBy} onChange={setSortBy} />
        </div>
      )}

      {!loading && proposals.length > 0 && (
        <div
          className="mb-10 grid grid-cols-3 divide-x"
          style={{
            border: "1px solid color-mix(in srgb, var(--accent-secondary) 7%, transparent)",
          }}
        >
          {[
            { label: "Total", value: proposals.length, isActive: false, isClosed: false },
            { label: "Active", value: activeCount, isActive: true, isClosed: false },
            { label: "Closed", value: closedCount, isActive: false, isClosed: true },
          ].map(({ label, value, isActive, isClosed }) => (
            <div key={label} className="px-6 py-5 text-center">
              <p
                className="text-3xl font-bold tabular-nums"
                style={{
                  fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)",
                  color: isActive
                    ? "rgba(52, 211, 153, 0.8)"
                    : isClosed
                    ? "color-mix(in srgb, var(--text-secondary) 50%, transparent)"
                    : "color-mix(in srgb, var(--text-primary) 70%, transparent)",
                }}
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

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-40 animate-pulse"
              style={{
                animationDelay: `${i * 100}ms`,
                border: "1px solid color-mix(in srgb, var(--accent-secondary) 5%, transparent)",
                background: "color-mix(in srgb, var(--bg-secondary) 40%, transparent)",
              }}
            />
          ))}
        </div>
      )}

      {error && (
        <div
          className="relative px-5 py-4"
          style={{
            border: "1px solid color-mix(in srgb, var(--accent) 14%, transparent)",
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
        <div className="py-32 text-center animate-fade-up">
          <div
            className="relative mx-auto mb-8 flex h-16 w-16 items-center justify-center"
            style={{
              border: "1px solid color-mix(in srgb, var(--accent-secondary) 8%, transparent)",
              background: "color-mix(in srgb, var(--bg-secondary) 60%, transparent)",
            }}
          >
            <span
              className="pointer-events-none absolute top-0 left-0 h-3 w-3 border-t border-l"
              style={{ borderColor: "color-mix(in srgb, var(--accent) 25%, transparent)" }}
            />
            <span
              className="pointer-events-none absolute bottom-0 right-0 h-3 w-3 border-b border-r"
              style={{ borderColor: "color-mix(in srgb, var(--accent) 25%, transparent)" }}
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
              color: "color-mix(in srgb, var(--text-primary) 60%, transparent)",
            }}
          >
            No proposals yet
          </p>
          <p
            className="mono mb-12 text-[10px] tracking-[0.25em] uppercase"
            style={{ color: "color-mix(in srgb, var(--text-secondary) 35%, transparent)" }}
          >
            Initiate the first directive
          </p>
          <Link
            href="/proposals/create"
            className="blue-glow-btn inline-flex items-center border px-7 py-3.5 text-[11px] font-medium tracking-[0.15em] uppercase transition-all duration-300 hover:scale-[1.02] active:scale-[0.97]"
            style={{
              borderColor: "color-mix(in srgb, var(--accent) 40%, transparent)",
              background: "color-mix(in srgb, var(--accent) 10%, transparent)",
              color: "var(--accent)",
            }}
          >
            Create Proposal
          </Link>
        </div>
      )}

      {!loading && proposals.length > 0 && (
        <div className="space-y-3">
          {paginatedProposals.map((proposal, i) => (
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

      {!loading && proposals.length > 0 && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {!loading && proposals.length > 0 && filteredAndSorted.length === 0 && (
        <div className="mt-8 py-16 text-center">
          <p
            className="mono text-[10px] tracking-[0.25em] uppercase"
            style={{ color: "color-mix(in srgb, var(--text-secondary) 40%, transparent)" }}
          >
            {search.trim()
              ? `No proposals match "${search.trim()}"`
              : `No ${filter} proposals`}
          </p>
        </div>
      )}
    </>
  );
}

export default function ProposalsPage() {
  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}
    >
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="animate-atmospheric absolute -top-60 left-1/2 h-[700px] w-[800px] -translate-x-1/2 rounded-full blur-[180px]"
          style={{ background: "color-mix(in srgb, var(--accent) 5%, transparent)" }}
        />
      </div>

      <Navbar />

      <div
        className="relative overflow-hidden border-b"
        style={{ borderColor: "color-mix(in srgb, var(--accent-secondary) 6%, transparent)" }}
      >
        <div className="fine-grid pointer-events-none absolute inset-0 opacity-50" />
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-25" />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "linear-gradient(to bottom, transparent, transparent, var(--bg-primary))" }}
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, color-mix(in srgb, var(--accent) 22%, transparent), transparent)" }}
        />

        <div className="relative mx-auto max-w-6xl px-8 pb-14 pt-16">
          <div className="animate-fade-up mb-8 flex items-center gap-4">
            <span
              className="mono text-[9px] tracking-[0.4em] uppercase"
              style={{ color: "color-mix(in srgb, var(--accent) 40%, transparent)" }}
            >
              // On-Chain Proposals
            </span>
            <span
              className="animate-line-extend h-px flex-1"
              style={{ background: "color-mix(in srgb, var(--accent-secondary) 5%, transparent)" }}
            />
            <span
              className="mono text-[9px] tracking-[0.2em] uppercase"
              style={{ color: "color-mix(in srgb, var(--text-secondary) 20%, transparent)" }}
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
                  fontSize: "clamp(3rem, 8vw, 6rem)",
                  color: "color-mix(in srgb, var(--text-primary) 85%, transparent)",
                }}
              >
                PROPOSALS
              </h1>
              <p
                className="animate-cinema-2 mono mt-4 text-[11px] tracking-[0.22em] uppercase"
                style={{ color: "color-mix(in srgb, var(--text-secondary) 40%, transparent)" }}
              >
                All on-chain governance — vote or create a new directive
              </p>
            </div>

            <div className="animate-cinema-3 flex shrink-0 items-center gap-3">
              <Link
                href="/proposals/archive"
                className="mono relative inline-flex items-center border bg-transparent px-5 py-3 text-[11px] font-medium tracking-[0.15em] uppercase transition-all duration-300"
                style={{
                  borderColor: "color-mix(in srgb, var(--accent) 25%, transparent)",
                  color: "color-mix(in srgb, var(--accent) 70%, transparent)",
                }}
              >
                Archive
              </Link>
              <Link
                href="/proposals/create"
                className="blue-glow-btn relative inline-flex items-center border px-6 py-3 text-[11px] font-medium tracking-[0.15em] uppercase transition-all duration-300 hover:scale-[1.02] active:scale-[0.97]"
                style={{
                  borderColor: "color-mix(in srgb, var(--accent) 40%, transparent)",
                  background: "color-mix(in srgb, var(--accent) 10%, transparent)",
                  color: "var(--accent)",
                }}
              >
                <span
                  className="pointer-events-none absolute top-0 left-0 h-1.5 w-1.5 border-t border-l"
                  style={{ borderColor: "color-mix(in srgb, var(--accent) 35%, transparent)" }}
                />
                <span
                  className="pointer-events-none absolute bottom-0 right-0 h-1.5 w-1.5 border-b border-r"
                  style={{ borderColor: "color-mix(in srgb, var(--accent) 35%, transparent)" }}
                />
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