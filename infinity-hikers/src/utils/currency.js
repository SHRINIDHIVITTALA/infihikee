export const CURRENCY_OPTIONS = [
  { code: "INR", symbol: "₹", locale: "en-IN", label: "Indian Rupee (₹)" },
  { code: "USD", symbol: "$", locale: "en-US", label: "US Dollar ($)" },
  { code: "EUR", symbol: "€", locale: "de-DE", label: "Euro (€)" },
  { code: "GBP", symbol: "£", locale: "en-GB", label: "British Pound (£)" },
  { code: "AED", symbol: "AED ", locale: "en-AE", label: "UAE Dirham (AED)" },
];

const DEFAULT_CODE = "INR";

/** Format a numeric amount using the site's configured currency (symbol + locale grouping). */
export function formatMoney(amount, code = DEFAULT_CODE) {
  const currency = CURRENCY_OPTIONS.find((c) => c.code === code) || CURRENCY_OPTIONS[0];
  const value = Number(amount) || 0;
  return `${currency.symbol}${value.toLocaleString(currency.locale)}`;
}
