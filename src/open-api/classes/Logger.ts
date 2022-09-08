export type LogLevel = 'WARN' | 'INFO' | 'DEBUG' | 'ERROR';

export const LOG_LEVEL_ORDER: Array<LogLevel> = ['DEBUG', 'INFO', 'WARN', 'ERROR'];

export interface Logger {
  getLevel: () => LogLevel;
  debug: (...optionalParams: Array<any>) => void;
  info: (...optionalParams: Array<any>) => void;
  warn: (...optionalParams: Array<any>) => void;
  error: (...optionalParams: Array<any>) => void;
}
export class ConsoleLogger implements Logger {
  constructor(private level: LogLevel) {}

  static isLogging(currentLevel: LogLevel, level: LogLevel) {
    const levelIndex = LOG_LEVEL_ORDER.indexOf(currentLevel);
    const foundIndex = LOG_LEVEL_ORDER.indexOf(level);
    return levelIndex <= foundIndex;
  }

  debug = (...messages: Array<any>): void => {
    if (ConsoleLogger.isLogging(this.level, 'DEBUG')) {
      console.debug(...messages);
    }
  };

  info = (...messages: Array<any>): void => {
    if (ConsoleLogger.isLogging(this.level, 'INFO')) {
      console.info(...messages);
    }
  };

  warn = (...messages: Array<any>): void => {
    if (ConsoleLogger.isLogging(this.level, 'WARN')) {
      console.warn(...messages);
    }
  };

  error = (...messages: Array<any>): void => {
    if (ConsoleLogger.isLogging(this.level, 'ERROR')) {
      console.error(...messages);
    }
  };

  getLevel(): LogLevel {
    return this.level;
  }
}
