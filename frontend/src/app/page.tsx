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
    <div className="flex min-h-screen flex-col" style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}>
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
              "linear-gradient(color-mix(in srgb, var(--accent-secondary) 3%, transparent) 1px, transparent 1px)," +
              "linear-gradient(90deg, color-mix(in srgb, var(--accent-secondary) 3%, transparent) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />

        <div
          className="animate-scan-line pointer-events-none absolute inset-x-0 top-0 h-[2px]"
          style={{
            background: "linear-gradient(90deg, transparent, color-mix(in srgb, var(--accent-secondary) 28%, transparent), transparent)",
          }}
        />

        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-48"
          style={{ background: "linear-gradient(to top, var(--bg-primary), transparent)" }}
        />

        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-8 text-center">
          <div
            className="mb-14"
            style={{ animation: "fade-up 0.7s ease-out 0.1s both" }}
          >
            <div
              className="inline-flex items-center gap-3 border px-5 py-2.5 backdrop-blur-xl"
              style={{
                border: "1px solid color-mix(in srgb, var(--accent-secondary) 7%, transparent)",
                background: "color-mix(in srgb, var(--bg-dark) 80%, transparent)",
              }}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              <span
                className="mono text-[9px] tracking-[0.32em] uppercase"
                style={{ color: "color-mix(in srgb, var(--text-secondary) 50%, transparent)" }}
              >
                Live · Sepolia Testnet · Network Operational
              </span>
            </div>
          </div>

          <div className="overflow-hidden">
            <h1
              className="block leading-[0.82] tracking-[-0.02em]"
              style={{
                fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)",
                fontWeight: 900,
                fontSize: "clamp(5.5rem, 18vw, 15rem)",
                animation: "fade-up 0.9s ease-out 0s both",
                color: "var(--text-primary)",
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
                background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-secondary) 55%, var(--accent) 100%)",
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
            <div
              className="h-px w-16"
              style={{ background: "linear-gradient(to right, transparent, color-mix(in srgb, var(--accent) 30%, transparent))" }}
            />
            <span
              className="mono text-[8px] tracking-[0.5em] uppercase"
              style={{ color: "color-mix(in srgb, var(--accent) 35%, transparent)" }}
            >
              Decentralized Democracy
            </span>
            <div
              className="h-px w-16"
              style={{ background: "linear-gradient(to left, transparent, color-mix(in srgb, var(--accent) 30%, transparent))" }}
            />
          </div>

          <p
            className="mx-auto mb-14 max-w-[440px] text-[15px] leading-relaxed"
            style={{
              animation: "fade-up 0.9s ease-out 0.8s both",
              color: "color-mix(in srgb, var(--text-secondary) 75%, transparent)",
            }}
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
              className="blue-glow-btn group relative border px-10 py-4 text-[11px] font-medium tracking-[0.18em] uppercase backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:bg-[#4A9EFF]/18 hover:border-[#4A9EFF]/65 active:scale-[0.97]"
              style={{
                borderColor: "color-mix(in srgb, var(--accent) 40%, transparent)",
                background: "color-mix(in srgb, var(--accent) 10%, transparent)",
                color: "var(--accent)",
              }}
            >
              <span
                className="pointer-events-none absolute left-0 top-0 h-2.5 w-2.5 border-l-2 border-t-2 transition-all duration-300 group-hover:h-4 group-hover:w-4"
                style={{ borderColor: "color-mix(in srgb, var(--accent) 45%, transparent)" }}
              />
              <span
                className="pointer-events-none absolute bottom-0 right-0 h-2.5 w-2.5 border-b-2 border-r-2 transition-all duration-300 group-hover:h-4 group-hover:w-4"
                style={{ borderColor: "color-mix(in srgb, var(--accent) 45%, transparent)" }}
              />
              Create Proposal
            </Link>
            <Link
              href="/proposals"
              className="group relative border px-10 py-4 text-[11px] font-medium tracking-[0.18em] uppercase backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-[rgba(200,216,240,0.2)] active:scale-[0.97]"
              style={{
                border: "1px solid color-mix(in srgb, var(--accent-secondary) 9%, transparent)",
                background: "color-mix(in srgb, var(--bg-secondary) 65%, transparent)",
                color: "color-mix(in srgb, var(--text-secondary) 70%, transparent)",
              }}
            >
              <span
                className="pointer-events-none absolute left-0 top-0 h-2.5 w-2.5 border-l border-t transition-colors duration-300"
                style={{ borderColor: "color-mix(in srgb, var(--accent-secondary) 12%, transparent)" }}
              />
              <span
                className="pointer-events-none absolute bottom-0 right-0 h-2.5 w-2.5 border-b border-r transition-colors duration-300"
                style={{ borderColor: "color-mix(in srgb, var(--accent-secondary) 12%, transparent)" }}
              />
              Explore Proposals →
            </Link>
          </div>

          <div className="animate-fade-in-slow absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
            <span
              className="mono text-[8px] tracking-[0.5em] uppercase"
              style={{ color: "color-mix(in srgb, var(--text-secondary) 22%, transparent)" }}
            >
              Scroll
            </span>
            <div
              className="animate-scroll-hint h-12 w-px"
              style={{ background: "linear-gradient(to bottom, transparent, color-mix(in srgb, var(--accent) 28%, transparent), transparent)" }}
            />
          </div>
        </div>
      </section>

      {/* LIVE STATS */}
      <section
        className="relative border-y py-20"
        style={{
          borderColor: "color-mix(in srgb, var(--accent-secondary) 4%, transparent)",
          background: "var(--bg-dark)",
        }}
      >
        <div className="mx-auto max-w-6xl px-8">
          <ScrollReveal>
            <div className="mb-12">
              <p
                className="mono text-[9px] tracking-[0.35em] uppercase"
                style={{ color: "color-mix(in srgb, var(--accent) 32%, transparent)" }}
              >
                // Live Metrics
              </p>
            </div>
          </ScrollReveal>

          <div
            className="grid grid-cols-1 divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0"
            style={{ "--tw-divide-color": "color-mix(in srgb, var(--accent-secondary) 4%, transparent)" } as React.CSSProperties}
          >
            {statItems.map((stat, i) => (
              <ScrollReveal key={stat.label} delay={i * 150}>
                <div className="reveal group px-8 py-10 text-center transition-colors duration-500 hover:bg-[rgba(74,158,255,0.015)]">
                  <p
                    className="mono mb-4 text-[9px] tracking-[0.3em] uppercase"
                    style={{ color: "color-mix(in srgb, var(--text-secondary) 30%, transparent)" }}
                  >
                    {stat.label}
                  </p>
                  <div className="relative mb-4 flex min-h-[3.5rem] items-center justify-center">
                    {stat.value === null ? (
                      <div
                        className="h-14 w-24 animate-pulse rounded-sm"
                        style={{ background: "color-mix(in srgb, var(--accent-secondary) 5%, transparent)" }}
                      />
                    ) : (
                      <p
                        className="relative inline-block text-[3.5rem] font-bold leading-none"
                        style={{
                          fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)",
                          color: "color-mix(in srgb, var(--text-primary) 60%, transparent)",
                        }}
                      >
                        {stat.value}
                        <span
                          className="absolute -bottom-2 left-1/2 h-px w-4 -translate-x-1/2 transition-all duration-500 group-hover:w-10"
                          style={{ background: "color-mix(in srgb, var(--accent) 45%, transparent)" }}
                        />
                      </p>
                    )}
                  </div>
                  <p
                    className="mono text-[9px] tracking-[0.22em] uppercase"
                    style={{ color: "color-mix(in srgb, var(--text-secondary) 22%, transparent)" }}
                  >
                    {stat.sub}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        className="relative border-b py-28"
        style={{ borderColor: "color-mix(in srgb, var(--accent-secondary) 4%, transparent)" }}
      >
        <div className="mx-auto max-w-6xl px-8">
          <ScrollReveal>
            <div className="mb-16">
              <p
                className="mono mb-3 text-[9px] tracking-[0.35em] uppercase"
                style={{ color: "color-mix(in srgb, var(--accent) 32%, transparent)" }}
              >
                // Protocol
              </p>
              <h2
                className="reveal text-3xl font-bold"
                style={{
                  fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)",
                  color: "color-mix(in srgb, var(--text-primary) 72%, transparent)",
                }}
              >
                How It Works
              </h2>
            </div>
          </ScrollReveal>

          <div
            className="grid grid-cols-1 gap-0 sm:grid-cols-3 sm:divide-x"
            style={{ "--tw-divide-color": "color-mix(in srgb, var(--accent-secondary) 4%, transparent)" } as React.CSSProperties}
          >
            {HOW_IT_WORKS.map((item, i) => (
              <ScrollReveal key={item.step} delay={i * 200} direction="left">
                <div className={`reveal reveal-delay-${i + 1} group relative px-8 py-10 transition-colors duration-500 hover:bg-[rgba(74,158,255,0.015)]`}>
                  <span
                    className="absolute -right-2 -top-4 select-none text-[7rem] font-bold leading-none"
                    style={{
                      fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)",
                      color: "color-mix(in srgb, var(--accent) 2%, transparent)",
                    }}
                    aria-hidden="true"
                  >
                    {item.step}
                  </span>
                  <p
                    className="mono mb-5 text-[10px] tracking-[0.4em] uppercase"
                    style={{ color: "color-mix(in srgb, var(--accent) 42%, transparent)" }}
                  >
                    {item.step}
                  </p>
                  <h3
                    className="mb-4 text-xl font-semibold"
                    style={{
                      fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)",
                      color: "color-mix(in srgb, var(--text-primary) 78%, transparent)",
                    }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="text-[13px] leading-relaxed"
                    style={{ color: "color-mix(in srgb, var(--text-secondary) 60%, transparent)" }}
                  >
                    {item.desc}
                  </p>
                  {i < HOW_IT_WORKS.length - 1 && (
                    <span
                      className="pointer-events-none absolute right-0 top-1/2 hidden -translate-y-1/2 translate-x-1/2 sm:block"
                      style={{ color: "color-mix(in srgb, var(--accent) 20%, transparent)" }}
                    >
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
      <section
        className="relative border-b py-28"
        style={{
          borderColor: "color-mix(in srgb, var(--accent-secondary) 4%, transparent)",
          background: "var(--bg-dark)",
        }}
      >
        <div className="mx-auto max-w-6xl px-8">
          <ScrollReveal>
            <div
              className="mb-16 border-b pb-6"
              style={{ borderColor: "color-mix(in srgb, var(--accent-secondary) 4%, transparent)" }}
            >
              <p
                className="mono mb-3 text-[9px] tracking-[0.35em] uppercase"
                style={{ color: "color-mix(in srgb, var(--accent) 32%, transparent)" }}
              >
                // Protocol Foundation
              </p>
              <h2
                className="reveal text-3xl font-bold"
                style={{
                  fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)",
                  color: "color-mix(in srgb, var(--text-primary) 72%, transparent)",
                }}
              >
                Built on Principle
              </h2>
            </div>
          </ScrollReveal>

          <div
            className="grid grid-cols-1 gap-0 sm:grid-cols-3 sm:divide-x"
            style={{ "--tw-divide-color": "color-mix(in srgb, var(--accent-secondary) 4%, transparent)" } as React.CSSProperties}
          >
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
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "color-mix(in srgb, var(--accent) 1.8%, transparent)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ""; }}
              >
                <span
                  className="absolute -right-2 -top-4 select-none text-[8rem] font-bold leading-none transition-all duration-700"
                  style={{
                    fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)",
                    color: "color-mix(in srgb, var(--accent) 2.2%, transparent)",
                  }}
                  aria-hidden="true"
                >
                  {pillar.num}
                </span>
                <div className="relative">
                  <p
                    className="mono mb-4 text-[10px] tracking-[0.4em] uppercase"
                    style={{ color: "color-mix(in srgb, var(--accent) 42%, transparent)" }}
                  >
                    {pillar.num}
                  </p>
                  <h3
                    className="mb-4 text-xl font-semibold"
                    style={{
                      fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)",
                      color: "color-mix(in srgb, var(--text-primary) 78%, transparent)",
                    }}
                  >
                    {pillar.title}
                  </h3>
                  <p
                    className="mb-6 text-[13px] leading-relaxed"
                    style={{ color: "color-mix(in srgb, var(--text-secondary) 60%, transparent)" }}
                  >
                    {pillar.desc}
                  </p>
                  <div
                    style={{
                      height: "1px",
                      background: "color-mix(in srgb, var(--accent) 35%, transparent)",
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
            <div
              className="mb-14 flex items-end justify-between border-b pb-6"
              style={{ borderColor: "color-mix(in srgb, var(--accent-secondary) 5%, transparent)" }}
            >
              <div>
                <p
                  className="mono mb-3 text-[9px] tracking-[0.35em] uppercase"
                  style={{ color: "color-mix(in srgb, var(--accent) 32%, transparent)" }}
                >
                  // Example Proposals
                </p>
                <h2
                  className="reveal text-3xl font-bold"
                  style={{
                    fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)",
                    color: "color-mix(in srgb, var(--text-primary) 72%, transparent)",
                  }}
                >
                  Governance in Motion
                </h2>
              </div>
              <Link
                href="/proposals"
                className="mono text-[10px] tracking-[0.22em] uppercase transition-colors duration-300 hover:text-[#4A9EFF]/60"
                style={{ color: "color-mix(in srgb, var(--text-secondary) 30%, transparent)" }}
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
      <section
        className="relative overflow-hidden border-t py-36"
        style={{
          borderColor: "color-mix(in srgb, var(--accent-secondary) 4%, transparent)",
          background: "var(--bg-dark)",
        }}
      >
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute inset-x-0 top-0 h-px"
            style={{ background: "linear-gradient(90deg, transparent, color-mix(in srgb, var(--accent) 10%, transparent), transparent)" }}
          />
          <div
            className="absolute inset-y-0 left-0 w-px"
            style={{ background: "linear-gradient(to bottom, transparent, color-mix(in srgb, var(--accent) 6%, transparent), transparent)" }}
          />
          <div
            className="absolute inset-y-0 right-0 w-px"
            style={{ background: "linear-gradient(to bottom, transparent, color-mix(in srgb, var(--accent) 6%, transparent), transparent)" }}
          />
        </div>

        <div className="relative mx-auto max-w-6xl px-8 text-center">
          <ScrollReveal>
            <p
              className="mono mb-6 text-[9px] tracking-[0.45em] uppercase"
              style={{ color: "color-mix(in srgb, var(--accent) 32%, transparent)" }}
            >
              // Begin
            </p>
            <h2
              className="reveal mx-auto mb-8 max-w-2xl text-4xl font-bold leading-tight sm:text-5xl"
              style={{
                fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)",
                color: "color-mix(in srgb, var(--text-primary) 72%, transparent)",
              }}
            >
              Not a voting form.
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-secondary) 55%, var(--accent) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                A living democracy.
              </span>
            </h2>
            <p
              className="mx-auto mb-14 max-w-md text-[14px] leading-relaxed"
              style={{ color: "color-mix(in srgb, var(--text-secondary) 60%, transparent)" }}
            >
              Connect your wallet and step into decentralized governance.
              Every vote is permanent. Every decision is history.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/proposals/create"
                className="blue-glow-btn group relative inline-flex items-center border px-10 py-4 text-[11px] font-medium tracking-[0.18em] uppercase transition-all duration-300 hover:scale-[1.02] hover:bg-[#4A9EFF]/18 hover:border-[#4A9EFF]/60 active:scale-[0.97]"
                style={{
                  borderColor: "color-mix(in srgb, var(--accent) 40%, transparent)",
                  background: "color-mix(in srgb, var(--accent) 10%, transparent)",
                  color: "var(--accent)",
                }}
              >
                <span
                  className="pointer-events-none absolute left-0 top-0 h-2.5 w-2.5 border-l-2 border-t-2 transition-all duration-300 group-hover:h-4 group-hover:w-4"
                  style={{ borderColor: "color-mix(in srgb, var(--accent) 40%, transparent)" }}
                />
                <span
                  className="pointer-events-none absolute bottom-0 right-0 h-2.5 w-2.5 border-b-2 border-r-2 transition-all duration-300 group-hover:h-4 group-hover:w-4"
                  style={{ borderColor: "color-mix(in srgb, var(--accent) 40%, transparent)" }}
                />
                Create First Proposal
              </Link>
              <Link
                href="/proposals"
                className="group relative inline-flex items-center border bg-transparent px-10 py-4 text-[11px] font-medium tracking-[0.18em] uppercase transition-all duration-300 hover:scale-[1.02] hover:border-[rgba(200,216,240,0.18)] active:scale-[0.97]"
                style={{
                  borderColor: "color-mix(in srgb, var(--accent-secondary) 9%, transparent)",
                  color: "color-mix(in srgb, var(--text-secondary) 55%, transparent)",
                }}
              >
                <span
                  className="pointer-events-none absolute left-0 top-0 h-2 w-2 border-l border-t"
                  style={{ borderColor: "color-mix(in srgb, var(--accent-secondary) 10%, transparent)" }}
                />
                <span
                  className="pointer-events-none absolute bottom-0 right-0 h-2 w-2 border-b border-r"
                  style={{ borderColor: "color-mix(in srgb, var(--accent-secondary) 10%, transparent)" }}
                />
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
