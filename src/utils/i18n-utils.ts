import i18n from 'i18next';
import { format, parseISO } from 'date-fns';

// Format date based on current locale
export function formatDate(date: Date | string, formatStr = 'PP'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr, { locale: i18n.options?.locale });
}

// Format currency based on current locale
export function formatCurrency(value: number, currency = 'SAR'): string {
  return new Intl.NumberFormat(i18n.language, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

// Format number based on current locale
export function formatNumber(value: number): string {
  return new Intl.NumberFormat(i18n.language).format(value);
}
