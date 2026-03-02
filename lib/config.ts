// Global configuration for the application

export const APP_CONFIG = {
  // Timezone configuration for Chile
  timezone: 'America/Santiago',
  
  // Locale for date/number formatting
  locale: 'es-CL',
  
  // Date format preferences
  dateFormat: {
    short: 'dd/MM/yyyy',
    long: 'dd \'de\' MMMM \'de\' yyyy',
    iso: 'yyyy-MM-dd',
  },
  
  // Currency configuration
  currency: {
    code: 'CLP',
    symbol: '$',
    locale: 'es-CL',
  },
} as const;

export type AppConfig = typeof APP_CONFIG;
