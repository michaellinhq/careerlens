export function MatchBadge({ pct }: { pct: number }) {
  const color = pct >= 70 ? 'bg-green-500/10 text-green-600 border-green-500/30'
    : pct >= 40 ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30'
    : 'bg-red-500/10 text-red-600 border-red-500/30';
  return (
    <span className={`px-2 py-0.5 text-[11px] font-bold rounded-full border ${color}`}>
      {pct}% match
    </span>
  );
}
