import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col" style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}>
      <Navbar />
      <main className="relative flex flex-1 flex-col items-center justify-center px-6 text-center">
        {/* Atmospheric blue glow */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]"
            style={{ background: "color-mix(in srgb, var(--accent) 5%, transparent)" }}
          />
        </div>

        <p
          className="relative mb-3 font-bold leading-none"
          style={{
            fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)",
            fontSize: "clamp(6rem, 20vw, 14rem)",
            color: "color-mix(in srgb, var(--accent) 8%, transparent)",
          }}
        >
          404
        </p>
        <h1
          className="mb-3 text-2xl font-bold"
          style={{
            fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)",
            color: "color-mix(in srgb, var(--text-primary) 80%, transparent)",
          }}
        >
          Page not found
        </h1>
        <p className="mb-10 text-sm" style={{ color: "color-mix(in srgb, var(--text-secondary) 55%, transparent)" }}>
          This page doesn&apos;t exist on-chain or off.
        </p>
        <Link
          href="/"
          className="blue-glow-btn mono border px-6 py-3 text-sm font-medium tracking-[0.14em] uppercase transition-all duration-200 hover:bg-[#4A9EFF]/20 hover:border-[#4A9EFF]/60 active:scale-[0.97]"
          style={{
            borderColor: "color-mix(in srgb, var(--accent) 40%, transparent)",
            background: "color-mix(in srgb, var(--accent) 10%, transparent)",
            color: "var(--accent)",
          }}
        >
          Go home
        </Link>
      </main>
      <Footer />
    </div>
  );
}
