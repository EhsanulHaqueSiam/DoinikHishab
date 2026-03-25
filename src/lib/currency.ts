/**
 * Currency utilities for BDT (Bangladeshi Taka)
 * All amounts stored as paisa (integer) — 1 taka = 100 paisa
 */

const TAKA_SYMBOL = "৳";

export function paisaToTaka(paisa: number): number {
  return paisa / 100;
}

export function takaToPaisa(taka: number): number {
  return Math.round(taka * 100);
}

export function formatCurrency(paisa: number, useBengali = false): string {
  const taka = paisaToTaka(Math.abs(paisa));
  const sign = paisa < 0 ? "-" : "";

  const formatted = taka.toLocaleString("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const display = useBengali ? toBengaliNumerals(formatted) : formatted;
  return `${sign}${TAKA_SYMBOL}${display}`;
}

export function formatCurrencyShort(paisa: number): string {
  const taka = paisaToTaka(Math.abs(paisa));
  const sign = paisa < 0 ? "-" : "";

  if (taka >= 10000000) {
    return `${sign}${TAKA_SYMBOL}${(taka / 10000000).toFixed(1)}কো`;
  }
  if (taka >= 100000) {
    return `${sign}${TAKA_SYMBOL}${(taka / 100000).toFixed(1)}লা`;
  }
  if (taka >= 1000) {
    return `${sign}${TAKA_SYMBOL}${(taka / 1000).toFixed(1)}হা`;
  }
  return formatCurrency(paisa);
}

const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

export function toBengaliNumerals(str: string): string {
  return str.replace(/[0-9]/g, (d) => bengaliDigits[parseInt(d, 10)]);
}

export function parseCurrencyInput(input: string): number {
  // Remove taka symbol, commas, spaces
  const cleaned = input.replace(/[৳,\s]/g, "");
  const num = parseFloat(cleaned);
  if (Number.isNaN(num)) return 0;
  return takaToPaisa(num);
}
