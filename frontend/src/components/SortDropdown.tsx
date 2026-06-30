"use client";

import { useState, useRef, useEffect } from "react";

export type SortOption = "newest" | "oldest" | "most-votes" | "least-votes";

interface SortDropdownProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

const options: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "most-votes", label: "Most votes" },
  { value: "least-votes", label: "Least votes" },
];

export default function SortDropdown({ value, onChange }: SortDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const currentLabel = options.find((o) => o.value === value)?.label ?? "Sort";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="mono flex items-center gap-2 border px-3 py-2 text-[10px] tracking-[0.18em] uppercase transition-all duration-300"
        style={{
          borderColor: "color-mix(in srgb, var(--accent-secondary) 10%, transparent)",
          background: "color-mix(in srgb, var(--bg-secondary) 50%, transparent)",
          color: "color-mix(in srgb, var(--text-secondary) 70%, transparent)",
        }}
      >
        <span style={{ color: "color-mix(in srgb, var(--accent) 60%, transparent)" }}>
          Sort:
        </span>
        <span>{currentLabel}</span>
        <span className="text-[8px]">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div
          className="absolute right-0 z-50 mt-1 w-44 border shadow-xl"
          style={{
            borderColor: "color-mix(in srgb, var(--accent-secondary) 12%, transparent)",
            background: "color-mix(in srgb, var(--bg-dark) 96%, transparent)",
            backdropFilter: "blur(8px)",
          }}
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className="mono block w-full px-3 py-2 text-left text-[10px] tracking-[0.15em] uppercase transition-colors duration-200"
              style={{
                color:
                  opt.value === value
                    ? "color-mix(in srgb, var(--accent) 85%, transparent)"
                    : "color-mix(in srgb, var(--text-secondary) 65%, transparent)",
                background:
                  opt.value === value
                    ? "color-mix(in srgb, var(--accent) 8%, transparent)"
                    : "transparent",
              }}
              onMouseEnter={(e) => {
                if (opt.value !== value) {
                  e.currentTarget.style.background =
                    "color-mix(in srgb, var(--accent) 4%, transparent)";
                }
              }}
              onMouseLeave={(e) => {
                if (opt.value !== value) {
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}