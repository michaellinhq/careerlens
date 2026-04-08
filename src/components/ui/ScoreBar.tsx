export function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-20 text-muted shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-surface rounded-full overflow-hidden">
        <div className="score-bar h-full rounded-full" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
      <span className="w-8 text-right text-foreground">{value}</span>
    </div>
  );
}
