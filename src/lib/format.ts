export function stripCurrencySymbol(value: string): string {
  return value.replace(/^[^\d-]+/, '');
}

export function formatStorySalary(value: string, currency: string): string {
  return `${currency}${stripCurrencySymbol(value)}`;
}

export function formatKValue(value: number, currency: string): string {
  const rounded = Math.round(value * 10) / 10;
  return `${currency}${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)}K`;
}

export function formatRangeK(low: number, high: number, currency: string): string {
  return `${formatKValue(low, currency)}-${formatKValue(high, currency).replace(currency, '')}`;
}

export function formatDeltaK(delta: number, currency: string): string {
  const rounded = Math.round(delta * 10) / 10;
  const display = Number.isInteger(rounded) ? `${rounded}` : rounded.toFixed(1);
  return `${delta >= 0 ? '+' : ''}${currency}${display}K`;
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}
