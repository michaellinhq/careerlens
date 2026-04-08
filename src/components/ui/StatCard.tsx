export function StatCard({ label, value, unit, accent }: { label: string; value: string | number; unit?: string; accent?: string }) {
  return (
    <div className="bg-surface rounded-xl p-3 text-center">
      <div className={`text-xl font-bold font-mono ${accent || 'text-foreground'}`}>{value}<span className="text-sm text-muted ml-0.5">{unit}</span></div>
      <div className="text-[10px] text-muted mt-1">{label}</div>
    </div>
  );
}
