"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useWallet } from "../hooks/useWallet";
import { useTheme } from "../context/ThemeContext";

export default function Navbar() {
  const { isConnected, shortAddress, network, connect, disconnect } = useWallet();
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-700 ${
        scrolled ? "border-b backdrop-blur-2xl" : "border-b border-transparent bg-transparent"
      }`}
      style={scrolled ? {
        borderColor: "color-mix(in srgb, var(--accent-secondary) 5.5%, transparent)",
        background: "color-mix(in srgb, var(--bg-dark) 97%, transparent)",
      } : {}}
    >
      {/* Blue accent thread — only visible when scrolled */}
      <div
        className={`absolute inset-x-0 top-0 h-px transition-opacity duration-700 ${
          scrolled ? "opacity-100" : "opacity-0"
        }`}
        style={{
          background: "linear-gradient(90deg, transparent, color-mix(in srgb, var(--accent) 40%, transparent), transparent)",
        }}
      />

      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-8">
        {/* VOTECHAIN wordmark */}
        <Link
          href="/"
          className="group flex items-center gap-2.5 transition-opacity duration-300 hover:opacity-65"
        >
          <span
            className="mono text-[13px] font-medium tracking-[0.30em] uppercase"
            style={{ color: "color-mix(in srgb, var(--accent-secondary) 88%, transparent)" }}
          >
            VoteChain
          </span>
          <span
            className="h-1.5 w-1.5 rounded-full transition-all duration-300 group-hover:shadow-[0_0_10px_rgba(74,158,255,0.9)]"
            style={{
              background: "var(--accent)",
              boxShadow: "0 0 6px color-mix(in srgb, var(--accent) 80%, transparent)",
            }}
          />
        </Link>

        {/* Center nav */}
        <div className="hidden items-center gap-8 sm:flex">
          {[
            { href: "/proposals", label: "Proposals" },
            { href: "/proposals/create", label: "Create" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="group relative mono text-[10px] tracking-[0.28em] uppercase transition-colors duration-300"
              style={{ color: "color-mix(in srgb, var(--text-secondary) 48%, transparent)" }}
            >
              {label}
              <span
                className="absolute -bottom-1 left-0 h-px w-0 transition-all duration-300 group-hover:w-full"
                style={{ background: "var(--accent)" }}
              />
            </Link>
          ))}
        </div>

        {/* Wallet area */}
        <div className="flex items-center gap-3">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="mono flex h-8 w-8 items-center justify-center border border-[var(--border-subtle)] text-[var(--text-secondary)] transition-all duration-300 hover:border-[#4A9EFF]/30 hover:text-[var(--accent)]"
          >
            {theme === "dark" ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>

          {!mounted ? (
            <div
              className="h-7 w-28 animate-pulse rounded-sm"
              style={{ background: "color-mix(in srgb, var(--accent-secondary) 4%, transparent)" }}
            />
          ) : isConnected ? (
            <div className="flex items-center gap-2.5">
              {/* Network indicator */}
              {network && (
                <div
                  className={`hidden items-center gap-2 sm:inline-flex ${
                    network.isSupported ? "text-emerald-400/65" : ""
                  }`}
                  style={!network.isSupported ? { color: "color-mix(in srgb, var(--accent) 65%, transparent)" } : {}}
                >
                  <span className="relative flex h-1 w-1 rounded-full">
                    <span
                      className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-55 ${
                        network.isSupported ? "bg-emerald-400" : ""
                      }`}
                      style={!network.isSupported ? { background: "var(--accent)" } : {}}
                    />
                    <span
                      className={`relative inline-flex h-1 w-1 rounded-full ${
                        network.isSupported ? "bg-emerald-400" : ""
                      }`}
                      style={!network.isSupported ? { background: "var(--accent)" } : {}}
                    />
                  </span>
                  <span className="mono text-[9px] tracking-[0.22em] uppercase">
                    {network.name}
                  </span>
                </div>
              )}

              {/* Address pill */}
              <div
                className="hidden items-center gap-2 border px-3 py-1.5 sm:inline-flex"
                style={{
                  borderColor: "color-mix(in srgb, var(--accent-secondary) 7%, transparent)",
                  background: "color-mix(in srgb, var(--bg-secondary) 55%, transparent)",
                }}
              >
                <span
                  className="mono text-[10px]"
                  style={{ color: "color-mix(in srgb, var(--text-secondary) 78%, transparent)" }}
                >
                  {shortAddress}
                </span>
              </div>

              {/* Disconnect */}
              <button
                onClick={disconnect}
                className="mono border bg-transparent px-3 py-1.5 text-[9px] tracking-[0.18em] uppercase transition-all duration-300 hover:border-[#4A9EFF]/18 hover:text-[#4A9EFF]/55"
                style={{
                  borderColor: "color-mix(in srgb, var(--accent-secondary) 5.5%, transparent)",
                  color: "color-mix(in srgb, var(--text-secondary) 35%, transparent)",
                }}
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={connect}
              className="animate-glow-pulse mono border px-5 py-2 text-[10px] font-medium tracking-[0.20em] uppercase transition-all duration-300 hover:bg-[#4A9EFF]/16 hover:border-[#4A9EFF]/52 active:scale-[0.97]"
              style={{
                borderColor: "color-mix(in srgb, var(--accent) 32%, transparent)",
                background: "color-mix(in srgb, var(--accent) 9%, transparent)",
                color: "var(--accent)",
              }}
            >
              Connect Wallet
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}
