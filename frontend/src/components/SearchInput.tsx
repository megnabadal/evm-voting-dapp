"use client";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchInput({ value, onChange }: SearchInputProps) {
  return (
    <div className="relative w-full sm:w-64">
      <span
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[12px]"
        style={{ color: "color-mix(in srgb, var(--accent) 50%, transparent)" }}
      >
        ⌕
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search proposals..."
        className="mono w-full border py-2 pl-8 pr-8 text-[11px] tracking-[0.1em] uppercase outline-none transition-all duration-300 focus:border-[#4A9EFF]/40"
        style={{
          borderColor: "color-mix(in srgb, var(--accent-secondary) 10%, transparent)",
          background: "color-mix(in srgb, var(--bg-secondary) 50%, transparent)",
          color: "color-mix(in srgb, var(--text-primary) 80%, transparent)",
        }}
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-[14px] leading-none transition-colors duration-200"
          style={{ color: "color-mix(in srgb, var(--text-secondary) 50%, transparent)" }}
          aria-label="Clear search"
        >
          ×
        </button>
      )}
    </div>
  );
}