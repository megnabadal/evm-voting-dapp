"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import WalletGuard from "../../../components/WalletGuard";
import SortDropdown, { type SortOption } from "../../../components/SortDropdown";
import SearchInput from "../../../components/SearchInput";
import Pagination from "../../../components/Pagination";
import { useProposalStore } from "../../../store/useProposalStore";

const ProposalCard = dynamic(() => import("../../../components/ProposalCard"), {
  loading: () => (
    <div className="h-40 animate-pulse border border-[rgba(200,216,240,0.05)] bg-[rgba(15,22,40,0.4)]" />
  ),
  ssr: false,
});

const ScrollReveal = dynamic(() => import("../../../components/ScrollReveal"), {
  ssr: false,
});

const CACHE_TTL = 30_000;
const PROPOSALS_PER_PAGE = 5;
let lastFetchTime = 0;

function ArchiveList() {
  const { proposals, loading, error, fetchProposals } = useProposalStore();
  const hasFetched = useRef(false);

  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const now = Date.now();
    if (!hasFetched.current || now - lastFetchTime > CACHE_TTL) {
      hasFetched.current = true;
      lastFetchTime = now;
      fetchProposals();
    }
  }, [fetchProposals]);

  const archived = useMemo(() => {
    let arr = proposals.filter((p) => p.status !== "Active");

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      arr = arr.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

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
  }, [proposals, sortBy, search]);

  const totalPages = Math.ceil(archived.length / PROPOSALS_PER_PAGE);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PROPOSALS_PER_PAGE;
    return archived.slice(start, start + PROPOSALS_PER_PAGE);
  }, [archived, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, sortBy]);

  return (
    <>
      {!loading && archived.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <SearchInput value={search} onChange={setSearch} />
          <SortDropdown value={sortBy} onChange={setSortBy} />
        </div>
      )}

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
          <p className="mono text-sm text-[#C8D8F0]/70">{error}</p>
        </div>
      )}

      {!loading && !error && archived.length === 0 && (
        <div className="py-32 text-center">
          <div className="relative mx-auto mb-8 flex h-16 w-16 items-center justify-center border border-[rgba(200,216,240,0.08)] bg-[rgba(15,22,40,0.6)]">
            <span className="mono text-2xl text-[#A8A090]/35">∅</span>
          </div>
          <p
            className="mb-3 text-xl font-bold text-[#F5F0E8]/60"
            style={{ fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)" }}
          >
            Archive is empty
          </p>
          <p className="mono mb-12 text-[10px] tracking-[0.25em] text-[#A8A090]/35 uppercase">
            No concluded proposals yet
          </p>
          <Link
            href="/proposals"
            className="mono inline-flex items-center border border-[#4A9EFF]/40 bg-[#4A9EFF]/10 px-7 py-3.5 text-[11px] font-medium tracking-[0.15em] text-[#4A9EFF] uppercase transition-all duration-300 hover:bg-[#4A9EFF]/20"
          >
            View Active Proposals
          </Link>
        </div>
      )}

      {!loading && archived.length > 0 && (
        <div className="space-y-3">
          {paginated.map((proposal, i) => (
            <ScrollReveal key={proposal.id} delay={i * 60}>
              <ProposalCard
                id={proposal.id}
                title={proposal.title}
                description={proposal.description}
                status={proposal.status}
                yesPercent={proposal.yesPercent}
                totalVotes={proposal.totalVotes}
                deadline={proposal.deadline}
              />
            </ScrollReveal>
          ))}
        </div>
      )}

      {!loading && archived.length > 0 && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </>
  );
}

export default function ArchivePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#0A0F1E] text-[#F5F0E8]">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="animate-atmospheric absolute -top-60 left-1/2 h-[700px] w-[800px] -translate-x-1/2 rounded-full bg-[#4A9EFF]/[0.04] blur-[180px]" />
      </div>

      <Navbar />

      <div className="relative overflow-hidden border-b border-[rgba(200,216,240,0.06)]">
        <div className="fine-grid pointer-events-none absolute inset-0 opacity-40" />
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-20" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0A0F1E]" />

        <div className="relative mx-auto max-w-6xl px-8 pb-14 pt-16">
          <div className="animate-fade-up mb-8 flex items-center gap-4">
            <span className="mono text-[9px] tracking-[0.4em] text-[#4A9EFF]/40 uppercase">
              // Concluded Directives
            </span>
            <span className="animate-line-extend h-px flex-1 bg-[rgba(200,216,240,0.05)]" />
            <span className="mono text-[9px] tracking-[0.2em] text-[#A8A090]/20 uppercase">
              Permanent Record
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
                ARCHIVE
              </h1>
              <p className="animate-cinema-2 mono mt-4 text-[11px] tracking-[0.22em] text-[#A8A090]/40 uppercase">
                Closed proposals — historical governance record
              </p>
            </div>

            <div className="animate-cinema-3 shrink-0">
              <Link
                href="/proposals"
                className="mono relative inline-flex items-center border border-[#4A9EFF]/30 bg-[#4A9EFF]/5 px-6 py-3 text-[11px] font-medium tracking-[0.15em] text-[#4A9EFF]/80 uppercase transition-all duration-300 hover:bg-[#4A9EFF]/15 hover:border-[#4A9EFF]/50"
              >
                ← Active Proposals
              </Link>
            </div>
          </div>
        </div>
      </div>

      <main className="relative mx-auto w-full max-w-6xl flex-1 px-8 py-12">
        <WalletGuard message="Connect your wallet to view the archive.">
          <ArchiveList />
        </WalletGuard>
      </main>

      <Footer />
    </div>
  );
}