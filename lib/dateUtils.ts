import { format as dateFnsFormat } from 'date-fns';

/**
 * Formatea una fecha sin necesitar locales
 * Los meses se muestran en inglés por defecto
 */
export const formatDate = (date: Date | string, formatStr: string = 'dd MMM yyyy'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateFnsFormat(dateObj, formatStr);
};

/**
 * Formatea una fecha en formato corto (DD/MM/YYYY)
 */
export const formatShortDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateFnsFormat(dateObj, 'dd/MM/yyyy');
};

/**
 * Formatea una fecha en formato largo (DD de MMMM de YYYY)
 */
export const formatLongDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateFnsFormat(dateObj, 'dd MMMM yyyy');
};
