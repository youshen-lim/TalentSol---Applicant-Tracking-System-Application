// Simple logger utility for TalentSol ATS Backend
// Provides structured logging with different levels

export interface LogLevel {
  ERROR: 'error';
  WARN: 'warn';
  INFO: 'info';
  DEBUG: 'debug';
}

export const LOG_LEVELS: LogLevel = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
};

class Logger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  private formatMessage(level: string, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}`;
  }

  error(message: string, meta?: any): void {
    console.error(this.formatMessage('error', message, meta));
  }

  warn(message: string, meta?: any): void {
    console.warn(this.formatMessage('warn', message, meta));
  }

  info(message: string, meta?: any): void {
    console.info(this.formatMessage('info', message, meta));
  }

  debug(message: string, meta?: any): void {
    if (this.isDevelopment) {
      console.debug(this.formatMessage('debug', message, meta));
    }
  }

  log(level: keyof LogLevel, message: string, meta?: any): void {
    switch (level) {
      case 'ERROR':
        this.error(message, meta);
        break;
      case 'WARN':
        this.warn(message, meta);
        break;
      case 'INFO':
        this.info(message, meta);
        break;
      case 'DEBUG':
        this.debug(message, meta);
        break;
      default:
        this.info(message, meta);
    }
  }
}

// Export singleton instance
export const logger = new Logger();
export default logger;
