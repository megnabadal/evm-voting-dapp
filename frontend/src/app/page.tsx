"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProposalCard from "../components/ProposalCard";
import ScrollReveal from "../components/ScrollReveal";
import { getAllProposals } from "../services/blockchainService";

const ParticleCanvas = dynamic(() => import("../components/ThreeHero"), {
  ssr: false,
  loading: () => <div className="absolute inset-0" />,
});

interface ChainStats {
  totalProposals: number;
  totalVotes: number;
  activeProposals: number;
}

const PREVIEW_PROPOSALS = [
  {
    title: "Fund community treasury",
    description: "Allocate 10 ETH for ecosystem grants and developer bounties.",
    status: "Active" as const,
    yesPercent: 72,
  },
  {
    title: "Update voting threshold",
    description: "Change the quorum requirement from 10% to 15% of token supply.",
    status: "Active" as const,
    yesPercent: 45,
  },
  {
    title: "Add USDC fee support",
    description: "Allow USDC as an accepted token for protocol fee payments.",
    status: "Closed" as const,
    yesPercent: 88,
  },
  {
    title: "Extend proposal deadline",
    description: "Allow a 7-day voting window instead of the current 3 days.",
    status: "Closed" as const,
    yesPercent: 33,
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Connect Wallet",
    desc: "Connect your MetaMask wallet to the Sepolia testnet. Your address becomes your identity — no signup, no password.",
  },
  {
    step: "02",
    title: "Create Proposal",
    desc: "Submit a governance proposal with a title, description, and voting window. Stored permanently on Sepolia.",
  },
  {
    step: "03",
    title: "Cast Vote",
    desc: "Vote for or against any active proposal. One address, one vote — enforced by the smart contract, not a server.",
  },
];

const PILLARS = [
  {
    num: "01",
    title: "Transparency",
    desc: "Every proposal, every vote — permanently on-chain. Queryable by anyone, at any time, forever.",
  },
  {
    num: "02",
    title: "Immutability",
    desc: "Results cannot be altered. The chain is the record. No intermediary, no revision, no erasure.",
  },
  {
    num: "03",
    title: "Participation",
    desc: "Every connected wallet is a voice. One address, one sovereign decision per proposal. Equal weight.",
  },
];

export default function HomePage() {
  const [stats, setStats] = useState<ChainStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [pillarVisible, setPillarVisible] = useState<boolean[]>([false, false, false]);
  const pillarRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    getAllProposals()
      .then((raw) => {
        const proposals = raw as Array<{
          yesVotes: bigint;
          noVotes: bigint;
          active: boolean;
        }>;
        const totalProposals = proposals.length;
        const activeProposals = proposals.filter((p) => Boolean(p.active)).length;
        const totalVotes = proposals.reduce(
          (sum, p) => sum + Number(p.yesVotes) + Number(p.noVotes),
          0
        );
        setStats({ totalProposals, totalVotes, activeProposals });
      })
      .catch(() => setStats(null))
      .finally(() => setStatsLoading(false));
  }, []);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    pillarRefs.current.forEach((el, i) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              setPillarVisible((prev) =>
                prev.map((v, j) => (j === i ? true : v))
              );
            }, i * 100);
            obs.unobserve(el);
          }
        },
        { threshold: 0.15 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  // Delay 500ms to allow dynamic imports to fully mount before observing
  useEffect(() => {
    const timer = setTimeout(() => {
      const els = document.querySelectorAll<HTMLElement>(".reveal, .reveal-left");
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("visible");
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1 }
      );
      els.forEach((el) => obs.observe(el));
      return () => obs.disconnect();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const statItems = [
    {
      label: "Total Proposals",
      value: statsLoading ? null : (stats?.totalProposals ?? "—"),
      sub: "On-chain records",
    },
    {
      label: "Votes Cast",
      value: statsLoading ? null : (stats?.totalVotes ?? "—"),
      sub: "Immutable decisions",
    },
    {
      label: "Active Now",
      value: statsLoading ? null : (stats?.activeProposals ?? "—"),
      sub: "Open for vote",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-[#0A0F1E] text-[#F5F0E8]">
      <Navbar />

      {/* HERO */}
      <section className="relative flex min-h-[100svh] overflow-hidden">
        <div className="three-canvas-wrap">
          <ParticleCanvas />
        </div>

        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(200,216,240,0.03) 1px, transparent 1px)," +
              "linear-gradient(90deg, rgba(200,216,240,0.03) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />

        <div
          className="animate-scan-line pointer-events-none absolute inset-x-0 top-0 h-[2px]"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(200,216,240,0.28), transparent)",
          }}
        />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#0A0F1E] to-transparent" />

        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-8 text-center">
          <div
            className="mb-14"
            style={{ animation: "fade-up 0.7s ease-out 0.1s both" }}
          >
            <div className="inline-flex items-center gap-3 border border-[rgba(200,216,240,0.07)] bg-[rgba(6,13,26,0.80)] px-5 py-2.5 backdrop-blur-xl">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              <span className="mono text-[9px] tracking-[0.32em] text-[#A8A090]/50 uppercase">
                Live · Sepolia Testnet · Network Operational
              </span>
            </div>
          </div>

          <div className="overflow-hidden">
            <h1
              className="block leading-[0.82] tracking-[-0.02em] text-[#F5F0E8]"
              style={{
                fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)",
                fontWeight: 900,
                fontSize: "clamp(5.5rem, 18vw, 15rem)",
                animation: "fade-up 0.9s ease-out 0s both",
              }}
            >
              GOVERN
            </h1>
          </div>

          <div className="mb-2 overflow-hidden">
            <h1
              className="block leading-[0.88]"
              style={{
                fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)",
                fontWeight: 400,
                fontStyle: "italic",
                fontSize: "clamp(5.5rem, 18vw, 15rem)",
                background: "linear-gradient(135deg, #4A9EFF 0%, #C8D8F0 55%, #4A9EFF 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                animation: "fade-up 0.9s ease-out 0.3s both",
              }}
            >
              ON-CHAIN.
            </h1>
          </div>

          <div
            className="mb-10 flex items-center gap-4"
            style={{ animation: "fade-up 0.9s ease-out 0.5s both" }}
          >
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#4A9EFF]/30" />
            <span className="mono text-[8px] tracking-[0.5em] text-[#4A9EFF]/35 uppercase">
              Decentralized Democracy
            </span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#4A9EFF]/30" />
          </div>

          <p
            className="mx-auto mb-14 max-w-[440px] text-[15px] leading-relaxed text-[#A8A090]/75"
            style={{ animation: "fade-up 0.9s ease-out 0.8s both" }}
          >
            Create proposals. Cast votes. View results — permanently on-chain.
            Where every decision becomes history.
          </p>

          <div
            className="flex flex-wrap justify-center gap-4"
            style={{ animation: "fade-up 0.9s ease-out 1.1s both" }}
          >
            <Link
              href="/proposals/create"
              className="blue-glow-btn group relative border border-[#4A9EFF]/40 bg-[#4A9EFF]/10 px-10 py-4 text-[11px] font-medium tracking-[0.18em] text-[#4A9EFF] uppercase backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-[#4A9EFF]/65 hover:bg-[#4A9EFF]/18 active:scale-[0.97]"
            >
              <span className="pointer-events-none absolute left-0 top-0 h-2.5 w-2.5 border-l-2 border-t-2 border-[#4A9EFF]/45 transition-all duration-300 group-hover:h-4 group-hover:w-4" />
              <span className="pointer-events-none absolute bottom-0 right-0 h-2.5 w-2.5 border-b-2 border-r-2 border-[#4A9EFF]/45 transition-all duration-300 group-hover:h-4 group-hover:w-4" />
              Create Proposal
            </Link>
            <Link
              href="/proposals"
              className="group relative border border-[rgba(200,216,240,0.09)] bg-[rgba(15,22,40,0.65)] px-10 py-4 text-[11px] font-medium tracking-[0.18em] text-[#A8A090]/70 uppercase backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-[rgba(200,216,240,0.2)] hover:text-[#C8D8F0] active:scale-[0.97]"
            >
              <span className="pointer-events-none absolute left-0 top-0 h-2.5 w-2.5 border-l border-t border-[rgba(200,216,240,0.12)] transition-colors duration-300 group-hover:border-[#4A9EFF]/30" />
              <span className="pointer-events-none absolute bottom-0 right-0 h-2.5 w-2.5 border-b border-r border-[rgba(200,216,240,0.12)] transition-colors duration-300 group-hover:border-[#4A9EFF]/30" />
              Explore Proposals →
            </Link>
          </div>

          <div className="animate-fade-in-slow absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
            <span className="mono text-[8px] tracking-[0.5em] text-[#A8A090]/22 uppercase">
              Scroll
            </span>
            <div className="animate-scroll-hint h-12 w-px bg-gradient-to-b from-transparent via-[#4A9EFF]/28 to-transparent" />
          </div>
        </div>
      </section>

      {/* LIVE STATS */}
      <section className="relative border-y border-[rgba(200,216,240,0.04)] bg-[#060D1A] py-20">
        <div className="mx-auto max-w-6xl px-8">
          <ScrollReveal>
            <div className="mb-12">
              <p className="mono text-[9px] tracking-[0.35em] text-[#4A9EFF]/32 uppercase">
                // Live Metrics
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 divide-y divide-[rgba(200,216,240,0.04)] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {statItems.map((stat, i) => (
              <ScrollReveal key={stat.label} delay={i * 150}>
                <div className="reveal group px-8 py-10 text-center transition-colors duration-500 hover:bg-[rgba(74,158,255,0.015)]">
                  <p className="mono mb-4 text-[9px] tracking-[0.3em] text-[#A8A090]/30 uppercase">
                    {stat.label}
                  </p>
                  <div className="relative mb-4 flex min-h-[3.5rem] items-center justify-center">
                    {stat.value === null ? (
                      <div className="h-14 w-24 animate-pulse rounded-sm bg-[rgba(200,216,240,0.05)]" />
                    ) : (
                      <p
                        className="relative inline-block text-[3.5rem] font-bold leading-none text-[#F5F0E8]/60"
                        style={{ fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)" }}
                      >
                        {stat.value}
                        <span className="absolute -bottom-2 left-1/2 h-px w-4 -translate-x-1/2 bg-[#4A9EFF]/45 transition-all duration-500 group-hover:w-10" />
                      </p>
                    )}
                  </div>
                  <p className="mono text-[9px] tracking-[0.22em] text-[#A8A090]/22 uppercase">
                    {stat.sub}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative border-b border-[rgba(200,216,240,0.04)] py-28">
        <div className="mx-auto max-w-6xl px-8">
          <ScrollReveal>
            <div className="mb-16">
              <p className="mono mb-3 text-[9px] tracking-[0.35em] text-[#4A9EFF]/32 uppercase">
                // Protocol
              </p>
              <h2
                className="reveal text-3xl font-bold text-[#F5F0E8]/72"
                style={{ fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)" }}
              >
                How It Works
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 gap-0 sm:grid-cols-3 sm:divide-x sm:divide-[rgba(200,216,240,0.04)]">
            {HOW_IT_WORKS.map((item, i) => (
              <ScrollReveal key={item.step} delay={i * 200} direction="left">
                <div className={`reveal reveal-delay-${i + 1} group relative px-8 py-10 transition-colors duration-500 hover:bg-[rgba(74,158,255,0.015)]`}>
                  <span
                    className="absolute -right-2 -top-4 select-none text-[7rem] font-bold leading-none text-[#4A9EFF]/[0.02]"
                    style={{ fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)" }}
                    aria-hidden="true"
                  >
                    {item.step}
                  </span>
                  <p className="mono mb-5 text-[10px] tracking-[0.4em] text-[#4A9EFF]/42 uppercase">
                    {item.step}
                  </p>
                  <h3
                    className="mb-4 text-xl font-semibold text-[#F5F0E8]/78"
                    style={{ fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)" }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-[13px] leading-relaxed text-[#A8A090]/60">
                    {item.desc}
                  </p>
                  {i < HOW_IT_WORKS.length - 1 && (
                    <span className="pointer-events-none absolute right-0 top-1/2 hidden -translate-y-1/2 translate-x-1/2 text-[#4A9EFF]/20 sm:block">
                      →
                    </span>
                  )}
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* PROTOCOL PILLARS */}
      <section className="relative border-b border-[rgba(200,216,240,0.04)] bg-[#060D1A] py-28">
        <div className="mx-auto max-w-6xl px-8">
          <ScrollReveal>
            <div className="mb-16 border-b border-[rgba(200,216,240,0.04)] pb-6">
              <p className="mono mb-3 text-[9px] tracking-[0.35em] text-[#4A9EFF]/32 uppercase">
                // Protocol Foundation
              </p>
              <h2
                className="reveal text-3xl font-bold text-[#F5F0E8]/72"
                style={{ fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)" }}
              >
                Built on Principle
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 gap-0 sm:grid-cols-3 sm:divide-x sm:divide-[rgba(200,216,240,0.04)]">
            {PILLARS.map((pillar, i) => (
              <div
                key={pillar.num}
                ref={(el) => { pillarRefs.current[i] = el; }}
                className="group relative px-10 py-14"
                style={{
                  opacity: pillarVisible[i] ? 1 : 0,
                  transform: pillarVisible[i] ? "translateY(0)" : "translateY(32px)",
                  transition: "opacity 0.7s ease-out, transform 0.7s ease-out, background-color 0.5s ease",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(74,158,255,0.018)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ""; }}
              >
                <span
                  className="absolute -right-2 -top-4 select-none text-[8rem] font-bold leading-none text-[#4A9EFF]/[0.022] transition-all duration-700 group-hover:text-[#4A9EFF]/[0.055]"
                  style={{ fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)" }}
                  aria-hidden="true"
                >
                  {pillar.num}
                </span>
                <div className="relative">
                  <p className="mono mb-4 text-[10px] tracking-[0.4em] text-[#4A9EFF]/42 uppercase">
                    {pillar.num}
                  </p>
                  <h3
                    className="mb-4 text-xl font-semibold text-[#F5F0E8]/78"
                    style={{ fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)" }}
                  >
                    {pillar.title}
                  </h3>
                  <p className="mb-6 text-[13px] leading-relaxed text-[#A8A090]/60">
                    {pillar.desc}
                  </p>
                  <div
                    style={{
                      height: "1px",
                      background: "rgba(74,158,255,0.35)",
                      width: pillarVisible[i] ? "100%" : "0%",
                      transition: "width 0.8s cubic-bezier(0.16,1,0.3,1) 0.35s",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EXAMPLE PROPOSALS */}
      <section className="relative py-28">
        <div className="mx-auto max-w-6xl px-8">
          <ScrollReveal>
            <div className="mb-14 flex items-end justify-between border-b border-[rgba(200,216,240,0.05)] pb-6">
              <div>
                <p className="mono mb-3 text-[9px] tracking-[0.35em] text-[#4A9EFF]/32 uppercase">
                  // Example Proposals
                </p>
                <h2
                  className="reveal text-3xl font-bold text-[#F5F0E8]/72"
                  style={{ fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)" }}
                >
                  Governance in Motion
                </h2>
              </div>
              <Link
                href="/proposals"
                className="mono text-[10px] tracking-[0.22em] text-[#A8A090]/30 uppercase transition-colors duration-300 hover:text-[#4A9EFF]/60"
              >
                All Proposals →
              </Link>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {PREVIEW_PROPOSALS.map((p, i) => (
              <ScrollReveal key={p.title} delay={i * 120}>
                <div className={`reveal reveal-delay-${i + 1}`}>
                  <ProposalCard
                    title={p.title}
                    description={p.description}
                    status={p.status}
                    yesPercent={p.yesPercent}
                  />
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="relative overflow-hidden border-t border-[rgba(200,216,240,0.04)] bg-[#060D1A] py-36">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#4A9EFF]/10 to-transparent" />
          <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-[#4A9EFF]/[0.06] to-transparent" />
          <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-[#4A9EFF]/[0.06] to-transparent" />
        </div>

        <div className="relative mx-auto max-w-6xl px-8 text-center">
          <ScrollReveal>
            <p className="mono mb-6 text-[9px] tracking-[0.45em] text-[#4A9EFF]/32 uppercase">
              // Begin
            </p>
            <h2
              className="reveal mx-auto mb-8 max-w-2xl text-4xl font-bold leading-tight text-[#F5F0E8]/72 sm:text-5xl"
              style={{ fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)" }}
            >
              Not a voting form.
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg, #4A9EFF 0%, #C8D8F0 55%, #4A9EFF 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                A living democracy.
              </span>
            </h2>
            <p className="mx-auto mb-14 max-w-md text-[14px] leading-relaxed text-[#A8A090]/60">
              Connect your wallet and step into decentralized governance.
              Every vote is permanent. Every decision is history.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/proposals/create"
                className="blue-glow-btn group relative inline-flex items-center border border-[#4A9EFF]/40 bg-[#4A9EFF]/10 px-10 py-4 text-[11px] font-medium tracking-[0.18em] text-[#4A9EFF] uppercase transition-all duration-300 hover:scale-[1.02] hover:border-[#4A9EFF]/60 hover:bg-[#4A9EFF]/18 active:scale-[0.97]"
              >
                <span className="pointer-events-none absolute left-0 top-0 h-2.5 w-2.5 border-l-2 border-t-2 border-[#4A9EFF]/40 transition-all duration-300 group-hover:h-4 group-hover:w-4" />
                <span className="pointer-events-none absolute bottom-0 right-0 h-2.5 w-2.5 border-b-2 border-r-2 border-[#4A9EFF]/40 transition-all duration-300 group-hover:h-4 group-hover:w-4" />
                Create First Proposal
              </Link>
              <Link
                href="/proposals"
                className="group relative inline-flex items-center border border-[rgba(200,216,240,0.09)] bg-transparent px-10 py-4 text-[11px] font-medium tracking-[0.18em] text-[#A8A090]/55 uppercase transition-all duration-300 hover:scale-[1.02] hover:border-[rgba(200,216,240,0.18)] hover:text-[#C8D8F0]/80 active:scale-[0.97]"
              >
                <span className="pointer-events-none absolute left-0 top-0 h-2 w-2 border-l border-t border-[rgba(200,216,240,0.10)]" />
                <span className="pointer-events-none absolute bottom-0 right-0 h-2 w-2 border-b border-r border-[rgba(200,216,240,0.10)]" />
                Explore the Network →
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}