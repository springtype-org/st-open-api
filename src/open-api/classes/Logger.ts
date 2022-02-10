/* eslint-disable no-console,max-classes-per-file */
export type LogLevel = 'WARN' | 'INFO' | 'DEBUG';

export abstract class Logger {
  public static wrapper(message: any, optionalParams: Array<any>, logFn: (message?: any, ...params: any[]) => void) {
    if (optionalParams.length === 0) {
      logFn(message);
      return;
    }
    logFn(message, optionalParams);
  }

  public debug: (message?: any, ...optionalParams: Array<any>) => void;

  public info: (message?: any, ...optionalParams: Array<any>) => void;

  public warn: (message?: any, ...optionalParams: Array<any>) => void;
}

export class ConsoleLogger extends Logger {
  constructor(private level: LogLevel = 'INFO') {
    super();
  }

  debug = (message?: any, ...optionalParams: Array<any>): void => {
    if (this.level === 'DEBUG') {
      ConsoleLogger.wrapper(message, optionalParams, console.debug);
    }
  };

  info = (message?: any, ...optionalParams: Array<any>): void => {
    if (this.level === 'DEBUG' || this.level === 'INFO') {
      ConsoleLogger.wrapper(message, optionalParams, console.info);
    }
  };

  warn = (message?: any, ...optionalParams: Array<any>): void => {
    ConsoleLogger.wrapper(message, optionalParams, console.warn);
  };
}
