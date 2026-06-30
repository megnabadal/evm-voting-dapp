"use client";

export type FilterOption = "all" | "active" | "closed";

interface FilterTabsProps {
  value: FilterOption;
  onChange: (value: FilterOption) => void;
  counts: { all: number; active: number; closed: number };
}

const tabs: { value: FilterOption; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "closed", label: "Closed" },
];

export default function FilterTabs({ value, onChange, counts }: FilterTabsProps) {
  return (
    <div
      className="flex border"
      style={{
        borderColor: "color-mix(in srgb, var(--accent-secondary) 10%, transparent)",
        background: "color-mix(in srgb, var(--bg-secondary) 50%, transparent)",
      }}
    >
      {tabs.map((tab) => {
        const isActive = value === tab.value;
        const count = counts[tab.value];
        return (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            className="mono flex items-center gap-2 px-4 py-2 text-[10px] tracking-[0.18em] uppercase transition-all duration-300"
            style={{
              background: isActive
                ? "color-mix(in srgb, var(--accent) 10%, transparent)"
                : "transparent",
              color: isActive
                ? "color-mix(in srgb, var(--accent) 85%, transparent)"
                : "color-mix(in srgb, var(--text-secondary) 60%, transparent)",
              borderRight: "1px solid color-mix(in srgb, var(--accent-secondary) 8%, transparent)",
            }}
          >
            <span>{tab.label}</span>
            <span
              className="text-[9px] tabular-nums"
              style={{
                color: isActive
                  ? "color-mix(in srgb, var(--accent) 60%, transparent)"
                  : "color-mix(in srgb, var(--text-secondary) 35%, transparent)",
              }}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}