// server/utils/logger.js

/**
 * Logging utility that respects NODE_ENV
 * In production, only warnings and errors are logged
 * In development, all logs are shown
 */

const isDevelopment = process.env.NODE_ENV !== 'production';

const logger = {
  /**
   * Info level logs - only shown in development
   */
  info: (...args) => {
    if (isDevelopment) {
      console.log('[INFO]', ...args);
    }
  },

  /**
   * Debug level logs - only shown in development
   */
  debug: (...args) => {
    if (isDevelopment) {
      console.log('[DEBUG]', ...args);
    }
  },

  /**
   * Warning logs - always shown
   */
  warn: (...args) => {
    console.warn('[WARN]', ...args);
  },

  /**
   * Error logs - always shown
   */
  error: (...args) => {
    console.error('[ERROR]', ...args);
  }
};

module.exports = logger;





