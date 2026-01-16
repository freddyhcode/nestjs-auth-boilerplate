import {
  Inject,
  Injectable,
  LoggerService as NestLoggerService,
} from '@nestjs/common';
import {
  createLogger,
  format,
  transports,
  Logger,
  LoggerOptions,
} from 'winston';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { LOGGER_CONFIG_OPTIONS } from './constants/logger.constant';
import type { LoggerModuleOptions } from './interfaces/logger-options.interface';

@Injectable()
export class LoggerService implements NestLoggerService {
  private logger: Logger;

  constructor(
    @Inject(LOGGER_CONFIG_OPTIONS)
    private readonly options: LoggerModuleOptions,
  ) {
    const winstonTransports: any[] = [];

    if (this.options.console) {
      winstonTransports.push(
        new transports.Console({
          format: format.combine(
            format.timestamp({ format: 'HH:mm:ss' }),
            nestWinstonModuleUtilities.format.nestLike('SERVER', {
              colors: true,
              prettyPrint: false,
            }),
          ),
        }),
      );
    }

    if (this.options.local) {
      winstonTransports.push(
        new DailyRotateFile({
          dirname: 'logs',
          filename: 'api-error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '50m',
          maxFiles: '10',
          level: 'error',
          format: format.combine(format.timestamp(), format.json()),
        }),
      );
    }

    const loggerOptions: LoggerOptions = {
      transports: winstonTransports,
    };

    this.logger = createLogger(loggerOptions);
  }

  public log(message: string, context?: any) {
    if (typeof context === 'object') {
      this.logger.info(message, context);
    } else {
      this.logger.info(message, { context });
    }
  }

  public error(message: string, trace?: string, context?: any) {
    if (typeof context === 'object') {
      this.logger.error(message, { trace, ...context });
    } else {
      this.logger.error(message, { trace, context });
    }
  }

  public warn(message: string, context?: any) {
    if (typeof context === 'object') {
      this.logger.warn(message, context);
    } else {
      this.logger.warn(message, { context });
    }
  }

  public debug(message: string, context?: any) {
    if (typeof context === 'object') {
      this.logger.debug(message, context);
    } else {
      this.logger.debug(message, { context });
    }
  }

  public verbose(message: string, context?: any) {
    if (typeof context === 'object') {
      this.logger.verbose(message, context);
    } else {
      this.logger.verbose(message, { context });
    }
  }
}
