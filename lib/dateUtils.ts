import { format as dateFnsFormat, parseISO } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { APP_CONFIG } from './config';

/**
 * Convert date to Chile timezone
 */
const toChileTime = (date: Date | string): Date => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return toZonedTime(dateObj, APP_CONFIG.timezone);
};

/**
 * Formatea una fecha sin necesitar locales
 * Los meses se muestran en inglés por defecto
 */
export const formatDate = (date: Date | string, formatStr: string = 'dd MMM yyyy'): string => {
  const chileDate = toChileTime(date);
  return dateFnsFormat(chileDate, formatStr);
};

/**
 * Formatea una fecha en formato corto (DD/MM/YYYY)
 */
export const formatShortDate = (date: Date | string): string => {
  const chileDate = toChileTime(date);
  return dateFnsFormat(chileDate, 'dd/MM/yyyy');
};

/**
 * Formatea una fecha en formato largo (DD de MMMM de YYYY)
 */
export const formatLongDate = (date: Date | string): string => {
  const chileDate = toChileTime(date);
  return dateFnsFormat(chileDate, 'dd MMMM yyyy');
};

/**
 * Get current date in Chile timezone as ISO string (YYYY-MM-DD)
 */
export const getCurrentDateISO = (): string => {
  const now = new Date();
  const chileDate = toChileTime(now);
  return dateFnsFormat(chileDate, 'yyyy-MM-dd');
};

/**
 * Parse date string to Chile timezone
 */
export const parseDate = (dateString: string): Date => {
  return toChileTime(dateString);
};
