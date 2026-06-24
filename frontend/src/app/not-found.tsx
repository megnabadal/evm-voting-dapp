import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-[#0A0F1E] text-[#F5F0E8]">
      <Navbar />
      <main className="relative flex flex-1 flex-col items-center justify-center px-6 text-center">
        {/* Atmospheric blue glow */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#4A9EFF]/[0.05] blur-[120px]" />
        </div>

        <p
          className="relative mb-3 font-bold leading-none text-[#4A9EFF]/[0.08]"
          style={{
            fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)",
            fontSize: "clamp(6rem, 20vw, 14rem)",
          }}
        >
          404
        </p>
        <h1
          className="mb-3 text-2xl font-bold text-[#F5F0E8]/80"
          style={{ fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)" }}
        >
          Page not found
        </h1>
        <p className="mb-10 text-sm text-[#A8A090]/55">
          This page doesn&apos;t exist on-chain or off.
        </p>
        <Link
          href="/"
          className="blue-glow-btn mono border border-[#4A9EFF]/40 bg-[#4A9EFF]/10 px-6 py-3 text-sm font-medium tracking-[0.14em] text-[#4A9EFF] uppercase transition-all duration-200 hover:bg-[#4A9EFF]/20 hover:border-[#4A9EFF]/60 active:scale-[0.97]"
        >
          Go home
        </Link>
      </main>
      <Footer />
    </div>
  );
}
