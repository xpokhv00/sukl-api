// Cron expressions: https://crontab.guru/
export const dataLoaderConfig = {
  // Daily at 2 AM
  daily: process.env.DATA_LOADER_DAILY_CRON || '0 2 * * *',
  
  // Weekly on Sunday at 3 AM
  weekly: process.env.DATA_LOADER_WEEKLY_CRON || '0 3 * * 0',
  
  // Monthly on the 1st at 4 AM
  monthly: process.env.DATA_LOADER_MONTHLY_CRON || '0 4 1 * *',
  
  // Enable/disable scheduling
  enabled: process.env.DATA_LOADER_ENABLED !== 'false',
  
  // Enable verbose logging
  verbose: process.env.DATA_LOADER_VERBOSE === 'true',
};
