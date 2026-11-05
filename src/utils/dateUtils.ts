/**
 * Date formatting utilities for Grupo Data
 * Enforces strictly Día/Mes/Año (DD/MM/AAAA) format across the entire application.
 */

export const MONTH_NAMES_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const WEEKDAYS_SHORT_ES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export const WEEKDAYS_FULL_ES = [
  'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
];

/**
 * Formats any standard date string (YYYY-MM-DD or ISO timestamp) into strictly DD/MM/AAAA
 * Example: '2026-11-04' -> '04/11/2026'
 */
export function formatDateDisplay(isoDate?: string | null): string {
  if (!isoDate || typeof isoDate !== 'string') return '--/--/----';
  
  // If already in DD/MM/AAAA format, return as is
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(isoDate)) {
    return isoDate;
  }

  // Handle ISO string or simple YYYY-MM-DD
  const cleanStr = isoDate.includes('T') ? isoDate.split('T')[0] : isoDate.trim();
  const parts = cleanStr.split('-');

  if (parts.length === 3) {
    const [year, month, day] = parts;
    const cleanDay = day.padStart(2, '0');
    const cleanMonth = month.padStart(2, '0');
    return `${cleanDay}/${cleanMonth}/${year}`;
  }

  // Handle Month only YYYY-MM
  if (parts.length === 2) {
    const [year, month] = parts;
    return `${month.padStart(2, '0')}/${year}`;
  }

  return isoDate;
}

/**
 * Returns the capitalized Spanish day name for a given YYYY-MM-DD string
 */
export function getDayName(dateStr?: string | null): string {
  if (!dateStr || typeof dateStr !== 'string') return '';
  const cleanStr = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr.trim();
  const [y, m, d] = cleanStr.split('-').map(Number);
  if (!y || !m || !d) return '';
  const date = new Date(y, m - 1, d);
  return WEEKDAYS_FULL_ES[date.getDay()] || '';
}

/**
 * Formats a date range into 'DD/MM/AAAA al DD/MM/AAAA'
 */
export function formatDateRange(startIso?: string | null, endIso?: string | null): string {
  const start = formatDateDisplay(startIso);
  const end = formatDateDisplay(endIso);
  if (start === '--/--/----' && end === '--/--/----') return '----';
  if (start === '--/--/----') return `Hasta ${end}`;
  if (end === '--/--/----') return `Desde ${start}`;
  return `${start} al ${end}`;
}

/**
 * Formats YYYY-MM into 'Mes Año', e.g. 'Noviembre 2026'
 */
export function formatMonthName(yearMonthStr?: string | null): string {
  if (!yearMonthStr) return '';
  const [y, m] = yearMonthStr.split('-').map(Number);
  if (!y || !m || m < 1 || m > 12) return yearMonthStr;
  return `${MONTH_NAMES_ES[m - 1]} ${y}`;
}

/**
 * Returns today in YYYY-MM-DD format for HTML date inputs
 */
export function getTodayIso(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
