"use client";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  // Generate page numbers to show (max 5 visible)
  const getPages = (): (number | "...")[] => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);

    const pages: (number | "...")[] = [1];
    if (currentPage > 3) pages.push("...");

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);

    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="mt-8 flex items-center justify-center gap-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!canPrev}
        className="mono border px-3 py-2 text-[10px] tracking-[0.18em] uppercase transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-30"
        style={{
          borderColor: "color-mix(in srgb, var(--accent-secondary) 10%, transparent)",
          background: "color-mix(in srgb, var(--bg-secondary) 50%, transparent)",
          color: "color-mix(in srgb, var(--text-secondary) 70%, transparent)",
        }}
      >
        ← Prev
      </button>

      {getPages().map((page, i) =>
        page === "..." ? (
          <span
            key={`ellipsis-${i}`}
            className="mono px-2 text-[10px]"
            style={{ color: "color-mix(in srgb, var(--text-secondary) 40%, transparent)" }}
          >
            …
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className="mono border px-3 py-2 text-[10px] tracking-[0.18em] tabular-nums uppercase transition-all duration-300"
            style={{
              borderColor:
                page === currentPage
                  ? "color-mix(in srgb, var(--accent) 40%, transparent)"
                  : "color-mix(in srgb, var(--accent-secondary) 10%, transparent)",
              background:
                page === currentPage
                  ? "color-mix(in srgb, var(--accent) 12%, transparent)"
                  : "color-mix(in srgb, var(--bg-secondary) 50%, transparent)",
              color:
                page === currentPage
                  ? "color-mix(in srgb, var(--accent) 90%, transparent)"
                  : "color-mix(in srgb, var(--text-secondary) 70%, transparent)",
              minWidth: "2.5rem",
            }}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!canNext}
        className="mono border px-3 py-2 text-[10px] tracking-[0.18em] uppercase transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-30"
        style={{
          borderColor: "color-mix(in srgb, var(--accent-secondary) 10%, transparent)",
          background: "color-mix(in srgb, var(--bg-secondary) 50%, transparent)",
          color: "color-mix(in srgb, var(--text-secondary) 70%, transparent)",
        }}
      >
        Next →
      </button>
    </div>
  );
}