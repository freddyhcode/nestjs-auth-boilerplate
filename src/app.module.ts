import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ServicesModule } from './services/services.module';
import { CoreModule } from './core/core.module';
import { MailModule } from './services/mail/mail.module';
import { ConfigService } from './core/config/config.service';

@Module({
  imports: [
    CoreModule,
    MailModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          host: config.mail.host,
          port: config.mail.port,
          secure: config.mail.secure,
          ignoreTls: config.mail.ignoreTls,
          user: config.mail.user,
          pass: config.mail.pass,
          from: config.mail.from,
          frontendUrl: config.frontend.url,
        };
      },
    }),
    AuthModule,
    UserModule,
    ServicesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
