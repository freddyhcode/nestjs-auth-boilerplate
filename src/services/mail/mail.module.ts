import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { MailService } from './mail.service';
import {
  MailModuleAsyncOptions,
  MailModuleOptions,
} from './interfaces/mail-options.interface';
import { MAIL_CONFIG_OPTIONS } from './constants/mail.constant';

@Global()
@Module({})
export class MailModule {
  public static forRoot(options: MailModuleOptions): DynamicModule {
    return {
      module: MailModule,
      providers: [
        {
          provide: MAIL_CONFIG_OPTIONS,
          useValue: options,
        },
        MailService,
      ],
      exports: [MailService],
    };
  }

  public static forRootAsync(options: MailModuleAsyncOptions): DynamicModule {
    return {
      module: MailModule,
      imports: options.imports || [],
      providers: [this.createAsyncOptionsProvider(options), MailService],
      exports: [MailService],
    };
  }

  private static createAsyncOptionsProvider(
    options: MailModuleAsyncOptions,
  ): Provider {
    return {
      provide: MAIL_CONFIG_OPTIONS,
      useFactory: options.useFactory,
      inject: options.inject || [],
    };
  }
}
