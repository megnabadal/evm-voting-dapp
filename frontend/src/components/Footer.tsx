import Link from "next/link";

export default function Footer() {
  return (
    <footer
      className="relative overflow-hidden border-t"
      style={{
        borderColor: "color-mix(in srgb, var(--accent-secondary) 5.5%, transparent)",
        background: "var(--bg-dark)",
      }}
    >
      {/* Blue accent thread */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, color-mix(in srgb, var(--accent) 22%, transparent), transparent)" }}
      />

      {/* Atmospheric glows */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="animate-float-slower absolute -bottom-10 -left-10 h-[300px] w-[420px] rounded-full blur-[130px]"
          style={{ background: "color-mix(in srgb, var(--accent) 3.5%, transparent)" }}
        />
        <div
          className="animate-float-slow absolute -top-10 right-0 h-[220px] w-[320px] rounded-full blur-[110px]"
          style={{ background: "color-mix(in srgb, var(--accent) 2.5%, transparent)" }}
        />
      </div>

      {/* Chain motif particle field SVG */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-40">
        <svg
          viewBox="0 0 1440 240"
          className="absolute bottom-0 h-full w-full"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          {/* Nodes */}
          {[
            { x: 72,   y: 55,  r: 2.5, hub: false },
            { x: 195,  y: 145, r: 3.5, hub: true  },
            { x: 335,  y: 72,  r: 2,   hub: false },
            { x: 510,  y: 165, r: 3,   hub: true  },
            { x: 665,  y: 55,  r: 2,   hub: false },
            { x: 820,  y: 135, r: 3.5, hub: true  },
            { x: 970,  y: 48,  r: 2,   hub: false },
            { x: 1110, y: 158, r: 3,   hub: true  },
            { x: 1255, y: 75,  r: 2.5, hub: false },
            { x: 1385, y: 132, r: 2,   hub: false },
          ].map((n, i) => (
            <g key={i}>
              {n.hub && (
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={n.r * 3.5}
                  fill="color-mix(in srgb, var(--accent) 5.5%, transparent)"
                />
              )}
              <circle
                cx={n.x}
                cy={n.y}
                r={n.r}
                fill={n.hub ? "color-mix(in srgb, var(--accent) 55%, transparent)" : "color-mix(in srgb, var(--accent-secondary) 25%, transparent)"}
              />
            </g>
          ))}

          {/* Edges */}
          {[
            [72, 55, 195, 145],
            [195, 145, 335, 72],
            [335, 72, 510, 165],
            [510, 165, 665, 55],
            [665, 55, 820, 135],
            [820, 135, 970, 48],
            [970, 48, 1110, 158],
            [1110, 158, 1255, 75],
            [1255, 75, 1385, 132],
            [195, 145, 510, 165],
            [665, 55, 970, 48],
            [820, 135, 1110, 158],
          ].map((e, i) => (
            <line
              key={i}
              x1={e[0]} y1={e[1]} x2={e[2]} y2={e[3]}
              stroke={i % 3 === 0 ? "color-mix(in srgb, var(--accent) 12%, transparent)" : "color-mix(in srgb, var(--accent-secondary) 6%, transparent)"}
              strokeWidth={i % 3 === 0 ? "0.8" : "0.5"}
            />
          ))}

          {/* Horizontal chain floor lines */}
          <line x1="0" y1="230" x2="420" y2="230" stroke="color-mix(in srgb, var(--accent) 12%, transparent)" strokeWidth="0.5" />
          <line x1="1020" y1="230" x2="1440" y2="230" stroke="color-mix(in srgb, var(--accent) 12%, transparent)" strokeWidth="0.5" />
          <line x1="480" y1="230" x2="960" y2="230" stroke="color-mix(in srgb, var(--accent) 6.5%, transparent)" strokeWidth="0.5" />

          {/* Vertical tick marks */}
          {[120, 360, 600, 840, 1080, 1320].map((x, i) => (
            <line
              key={i}
              x1={x} y1="220" x2={x} y2="235"
              stroke="color-mix(in srgb, var(--accent-secondary) 10%, transparent)"
              strokeWidth="0.5"
            />
          ))}
        </svg>
      </div>

      {/* Fine grid overlay */}
      <div className="fine-grid pointer-events-none absolute inset-0 opacity-20" />

      <div className="relative mx-auto max-w-6xl px-8 py-14">
        <div className="mb-12 grid grid-cols-1 gap-10 sm:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="mb-4 flex items-center gap-2.5">
              <p
                className="mono text-[13px] font-medium tracking-[0.30em] uppercase"
                style={{ color: "color-mix(in srgb, var(--accent-secondary) 72%, transparent)" }}
              >
                VoteChain
              </p>
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{
                  background: "var(--accent)",
                  boxShadow: "0 0 7px color-mix(in srgb, var(--accent) 72%, transparent)",
                }}
              />
            </div>
            <p
              className="mono text-[10px] leading-relaxed tracking-[0.12em] uppercase"
              style={{ color: "color-mix(in srgb, var(--text-secondary) 45%, transparent)" }}
            >
              Transparent governance,<br />
              suspended in darkness,<br />
              waiting to move.
            </p>

            {/* Mini chain decoration */}
            <div className="mt-6 flex items-center gap-1.5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div
                    className="h-1.5 w-1.5 rounded-full"
                    style={{
                      background: i === 2 ? "var(--accent)" : "color-mix(in srgb, var(--accent-secondary) 18%, transparent)",
                      boxShadow: i === 2 ? "0 0 5px color-mix(in srgb, var(--accent) 60%, transparent)" : "none",
                    }}
                  />
                  {i < 4 && (
                    <div
                      className="h-px w-3"
                      style={{ background: "color-mix(in srgb, var(--accent-secondary) 8%, transparent)" }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Protocol links */}
          <div>
            <p
              className="mono mb-5 text-[9px] tracking-[0.32em] uppercase"
              style={{ color: "color-mix(in srgb, var(--accent) 38%, transparent)" }}
            >
              Protocol
            </p>
            <div className="flex flex-col gap-3">
              {[
                { href: "/proposals", label: "Proposals" },
                { href: "/proposals/create", label: "Create" },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="group mono flex items-center gap-2 text-[10px] tracking-[0.22em] uppercase transition-colors duration-300"
                  style={{ color: "color-mix(in srgb, var(--text-secondary) 38%, transparent)" }}
                >
                  <span
                    className="h-px w-3 transition-all duration-300 group-hover:w-5"
                    style={{ background: "color-mix(in srgb, var(--accent-secondary) 10%, transparent)" }}
                  />
                  {label}
                </Link>
              ))}
              <a
                href="https://sepolia.etherscan.io"
                target="_blank"
                rel="noopener noreferrer"
                className="group mono flex items-center gap-2 text-[10px] tracking-[0.22em] uppercase transition-colors duration-300"
                style={{ color: "color-mix(in srgb, var(--text-secondary) 38%, transparent)" }}
              >
                <span
                  className="h-px w-3 transition-all duration-300 group-hover:w-5"
                  style={{ background: "color-mix(in srgb, var(--accent-secondary) 10%, transparent)" }}
                />
                Etherscan ↗
              </a>
            </div>
          </div>

          {/* Network info */}
          <div>
            <p
              className="mono mb-5 text-[9px] tracking-[0.32em] uppercase"
              style={{ color: "color-mix(in srgb, var(--accent) 38%, transparent)" }}
            >
              Network
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-40" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500/65" />
                </span>
                <span className="mono text-[9px] tracking-[0.20em] text-emerald-600/55 uppercase">
                  Sepolia Testnet
                </span>
              </div>
              <p
                className="mono break-all text-[9px] tracking-wide leading-relaxed"
                style={{ color: "color-mix(in srgb, var(--text-secondary) 22%, transparent)" }}
              >
                0x0eE97B60A88421E106e4999EBCF3D0144b479A94
              </p>
              <div className="flex items-center gap-1.5">
                <span
                  className="mono text-[8px] tracking-[0.18em] uppercase"
                  style={{ color: "color-mix(in srgb, var(--text-secondary) 18%, transparent)" }}
                >
                  Block
                </span>
                <span
                  className="mono text-[8px]"
                  style={{ color: "color-mix(in srgb, var(--accent) 28%, transparent)" }}
                >
                  11113560
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom rule */}
        <div
          className="border-t pt-7"
          style={{ borderColor: "color-mix(in srgb, var(--accent-secondary) 4.5%, transparent)" }}
        >
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <p
              className="mono text-[9px] tracking-[0.30em] uppercase"
              style={{ color: "color-mix(in srgb, var(--text-secondary) 22%, transparent)" }}
            >
              Decentralized · Transparent · Permanent
            </p>
            <p
              className="mono text-[9px]"
              style={{ color: "color-mix(in srgb, var(--text-secondary) 15%, transparent)" }}
            >
              VoteChain v1.0 // All rights reserved
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
