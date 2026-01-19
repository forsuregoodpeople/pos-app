import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generatePurchaseInvoiceNumber(): string {
  const date = new Date();
  const timestamp = Date.now() % 1000;
  return `PUR-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${String(timestamp).padStart(3, '0')}`;
}
