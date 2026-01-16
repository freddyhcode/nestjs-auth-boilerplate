import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { LoggerService } from './logger.service';
import {
  LoggerModuleAsyncOptions,
  LoggerModuleOptions,
} from './interfaces/logger-options.interface';
import { LOGGER_CONFIG_OPTIONS } from './constants/logger.constant';

@Global()
@Module({})
export class LoggerModule {
  public static forRoot(options: LoggerModuleOptions): DynamicModule {
    return {
      module: LoggerModule,
      providers: [
        {
          provide: LOGGER_CONFIG_OPTIONS,
          useValue: options,
        },
        LoggerService,
      ],
      exports: [LoggerService],
    };
  }

  public static forRootAsync(options: LoggerModuleAsyncOptions): DynamicModule {
    return {
      module: LoggerModule,
      imports: options.imports || [],
      providers: [this.createAsyncOptionsProvider(options), LoggerService],
      exports: [LoggerService],
    };
  }

  private static createAsyncOptionsProvider(
    options: LoggerModuleAsyncOptions,
  ): Provider {
    return {
      provide: LOGGER_CONFIG_OPTIONS,
      useFactory: options.useFactory,
      inject: options.inject || [],
    };
  }
}
