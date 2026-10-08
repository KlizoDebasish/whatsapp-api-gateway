/**
 * Deterministic number and currency formatting utilities to ensure
 * server-side rendering (SSR) and client-side rendering (CSR) outputs match exactly,
 * preventing React hydration mismatch errors.
 */

export function formatInteger(val: number): string {
  // Use standard regex-based comma separation for deterministic integer formatting
  return Math.round(val)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function formatDecimal(val: number, decimals: number = 2): string {
  const parts = val.toFixed(decimals).split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}

export function formatINR(val: number): string {
  // Deterministic Indian numbering system formatting: 1,78,500
  const rounded = Math.round(val);
  const str = rounded.toString();
  if (str.length <= 3) return str;
  const lastThree = str.substring(str.length - 3);
  const otherNumbers = str.substring(0, str.length - 3);
  const formattedOther = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return `${formattedOther},${lastThree}`;
}

export function formatTime(): string {
  return "11:15 AM";
}
