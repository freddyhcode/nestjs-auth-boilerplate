import { NestFactory, Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { ConfigService } from './core/config/config.service';
import { LoggerService } from './core/logger/logger.service';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });
  const logger = app.get(LoggerService);
  const config = app.get(ConfigService);
  const trustProxyHops = config.infrastructure.trustProxy;

  app.use(helmet());
  app.use(cookieParser());
  app.useLogger(logger);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.setGlobalPrefix(config.project.prefix);
  app.enableCors({
    origin: config.frontend.cors,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: false,
  });

  if (trustProxyHops && trustProxyHops > 0) {
    app.set('trust proxy', trustProxyHops);
  }

  await app.listen(config.project.port);
}

void bootstrap();
