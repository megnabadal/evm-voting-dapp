interface LoadingProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

export default function Loading({
  message = "Loading…",
  size = "md",
}: LoadingProps) {
  const sizes = {
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-2",
    lg: "h-10 w-10 border-[3px]",
  };

  return (
    <div className="flex items-center gap-3" style={{ color: "color-mix(in srgb, var(--text-secondary) 60%, transparent)" }}>
      <span
        className={`${sizes[size]} animate-spin rounded-full`}
        style={{ borderColor: "var(--border-subtle)", borderTopColor: "var(--accent)" }}
      />
      {message && <span className="mono text-sm tracking-[0.12em]">{message}</span>}
    </div>
  );
}
