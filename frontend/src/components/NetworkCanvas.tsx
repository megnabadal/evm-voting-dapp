"use client";

interface Node {
  x: number;
  y: number;
  r: number;
  hub?: boolean;
  main?: boolean;
}
interface Edge {
  from: number;
  to: number;
  accent?: boolean;
}

const NODES: Node[] = [
  { x: 90,   y: 200, r: 1.5 },
  { x: 280,  y: 140, r: 2.5, hub: true },
  { x: 150,  y: 360, r: 1.2 },
  { x: 430,  y: 240, r: 3.5, hub: true },
  { x: 390,  y: 430, r: 1.5 },
  { x: 630,  y: 80,  r: 1.8 },
  { x: 720,  y: 290, r: 5,   hub: true, main: true },
  { x: 740,  y: 490, r: 1.8 },
  { x: 520,  y: 620, r: 1.2 },
  { x: 900,  y: 170, r: 1.8 },
  { x: 1020, y: 350, r: 3.2, hub: true },
  { x: 950,  y: 540, r: 1.8 },
  { x: 1150, y: 160, r: 1.2 },
  { x: 1260, y: 410, r: 2.8, hub: true },
  { x: 1360, y: 280, r: 1.5 },
  { x: 200,  y: 680, r: 1.2 },
  { x: 840,  y: 760, r: 1.5 },
  { x: 1100, y: 680, r: 1.5 },
];

const EDGES: Edge[] = [
  { from: 0,  to: 1 },
  { from: 0,  to: 2 },
  { from: 1,  to: 3,  accent: true },
  { from: 2,  to: 4 },
  { from: 3,  to: 4 },
  { from: 3,  to: 5,  accent: true },
  { from: 3,  to: 6,  accent: true },
  { from: 5,  to: 6 },
  { from: 5,  to: 9 },
  { from: 6,  to: 7,  accent: true },
  { from: 6,  to: 9,  accent: true },
  { from: 6,  to: 10, accent: true },
  { from: 7,  to: 8 },
  { from: 7,  to: 11 },
  { from: 8,  to: 4 },
  { from: 8,  to: 15 },
  { from: 9,  to: 10 },
  { from: 9,  to: 12 },
  { from: 10, to: 11 },
  { from: 10, to: 13, accent: true },
  { from: 11, to: 17 },
  { from: 12, to: 14 },
  { from: 13, to: 14 },
  { from: 13, to: 11 },
  { from: 15, to: 16 },
  { from: 16, to: 17 },
  { from: 16, to: 11 },
];

export default function NetworkCanvas() {
  return (
    <svg
      viewBox="0 0 1440 900"
      className="absolute inset-0 h-full w-full"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="main-hub-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="hub-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.10" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </radialGradient>
      </defs>

      {EDGES.map(({ from, to, accent }, i) => {
        const n1 = NODES[from];
        const n2 = NODES[to];
        return (
          <line
            key={`e-${i}`}
            x1={n1.x}
            y1={n1.y}
            x2={n2.x}
            y2={n2.y}
            stroke={accent ? "color-mix(in srgb, var(--accent) 16%, transparent)" : "color-mix(in srgb, var(--accent-secondary) 4.5%, transparent)"}
            strokeWidth={accent ? "0.8" : "0.5"}
            style={{
              animationName: "edge-pulse",
              animationDuration: `${9 + (i % 7) * 1.8}s`,
              animationDelay: `${i * 0.35}s`,
              animationTimingFunction: "ease-in-out",
              animationIterationCount: "infinite",
            }}
          />
        );
      })}

      {NODES.map((node, i) => (
        <g key={`n-${i}`}>
          {node.main && (
            <>
              <circle
                cx={node.x} cy={node.y} r={node.r * 14}
                fill="url(#main-hub-glow)"
                style={{
                  animationName: "node-breathe",
                  animationDuration: "7s",
                  animationTimingFunction: "ease-in-out",
                  animationIterationCount: "infinite",
                }}
              />
              <circle
                cx={node.x} cy={node.y} r={node.r * 7}
                fill="none"
                stroke="color-mix(in srgb, var(--accent) 20%, transparent)"
                strokeWidth="0.6"
                style={{
                  animationName: "node-ring",
                  animationDuration: "4s",
                  animationTimingFunction: "ease-out",
                  animationIterationCount: "infinite",
                }}
              />
              <circle
                cx={node.x} cy={node.y} r={node.r * 7}
                fill="none"
                stroke="color-mix(in srgb, var(--accent) 10%, transparent)"
                strokeWidth="0.5"
                style={{
                  animationName: "node-ring",
                  animationDuration: "4s",
                  animationDelay: "2s",
                  animationTimingFunction: "ease-out",
                  animationIterationCount: "infinite",
                }}
              />
            </>
          )}
          {node.hub && !node.main && (
            <circle
              cx={node.x} cy={node.y} r={node.r * 8}
              fill="url(#hub-glow)"
              style={{
                animationName: "node-breathe",
                animationDuration: `${6 + i * 0.4}s`,
                animationDelay: `${i * 0.6}s`,
                animationTimingFunction: "ease-in-out",
                animationIterationCount: "infinite",
              }}
            />
          )}
          <circle
            cx={node.x} cy={node.y}
            r={node.r}
            fill={
              node.main
                ? "color-mix(in srgb, var(--accent) 75%, transparent)"
                : node.hub
                ? "color-mix(in srgb, var(--accent) 38%, transparent)"
                : "color-mix(in srgb, var(--accent-secondary) 20%, transparent)"
            }
            style={{
              animationName: "node-breathe",
              animationDuration: `${4 + (i % 4) * 1.2}s`,
              animationDelay: `${i * 0.28}s`,
              animationTimingFunction: "ease-in-out",
              animationIterationCount: "infinite",
            }}
          />
        </g>
      ))}
    </svg>
  );
}
