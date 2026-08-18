import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { CurrencyCode } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a numeric price into localized currency format using standard Intl.NumberFormat
 * Supports INR (₹), USD ($), GBP (£), EUR (€)
 */
export function formatCurrency(amount?: number | null, currency: CurrencyCode = "INR"): string {
  if (amount === null || amount === undefined || isNaN(amount) || amount <= 0) {
    return "Price unavailable";
  }

  let locale = "en-IN";
  let cur = currency;

  if (currency === "USD") {
    locale = "en-US";
  } else if (currency === "GBP") {
    locale = "en-GB";
  } else if (currency === "EUR") {
    locale = "en-IE"; // standard English format with € symbol (e.g. €749)
  } else if (currency === "OTHER") {
    locale = "en-US";
    cur = "USD";
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: cur,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

/**
 * Formats a numeric price into Indian Rupee format (e.g., ₹49,999 or ₹1,04,999)
 * Safely handles null/undefined amounts by returning "Price unavailable"
 */
export function formatINR(amount?: number | null): string {
  return formatCurrency(amount, "INR");
}

/**
 * Formats a price in the specified currency.
 * Reusable utility adhering to project requirements.
 */
export function formatPrice(amount?: number | null, currency: CurrencyCode = "INR"): string {
  return formatCurrency(amount, currency);
}
