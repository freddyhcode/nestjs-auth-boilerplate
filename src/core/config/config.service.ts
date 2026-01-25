import { Injectable } from '@nestjs/common';
import { z } from 'zod';

@Injectable()
export class ConfigService {
  private readonly config: any;

  readonly project: {
    prefix: string;
    port: number;
    typeormSync: boolean;
  };

  readonly database: {
    host: string;
    port: number;
    name: string;
    username: string;
    password: string;
  };

  readonly jwt: {
    secret: string;
    passwordResetSecret: string;
    refreshSecret: string;
    expiresIn: string;
    refreshExpiresIn: string;
    refreshThresholdDays: number;
  };

  readonly cookie: {
    secure: boolean;
    sameSite: 'lax' | 'strict' | 'none';
    accessMaxAge: number;
    refreshMaxAge: number;
    credentials: boolean;
  };

  readonly security: {
    dummyHashPassword: string;
  };

  readonly mail: {
    host: string;
    port: number;
    secure: boolean;
    ignoreTls: boolean;
    user?: string;
    pass?: string;
    from: string;
  };

  readonly frontend: {
    url: string;
    cors: string[];
  };

  readonly throttler: {
    ttl: number;
    limit: number;
  };

  readonly logger: {
    console: boolean;
    local: boolean;
  };

  readonly infrastructure: {
    trustProxy: number;
  };

  constructor() {
    this.config = this.validateEnv();

    this.project = {
      prefix: this.config.PROJECT_PREFIX,
      port: this.config.PROJECT_PORT,
      typeormSync: this.config.TYPEORM_SYNC,
    };

    this.database = {
      host: this.config.DB_HOST,
      port: this.config.DB_PORT,
      name: this.config.DB_NAME,
      username: this.config.DB_USERNAME,
      password: this.config.DB_PASSWORD,
    };

    this.jwt = {
      secret: this.config.JWT_SECRET,
      passwordResetSecret: this.config.JWT_PASSWORD_RESET_SECRET,
      refreshSecret: this.config.REFRESH_TOKEN_SECRET,
      expiresIn: this.config.JWT_EXPIRES_IN,
      refreshExpiresIn: this.config.REFRESH_TOKEN_EXPIRES_IN,
      refreshThresholdDays: this.config.REFRESH_TOKEN_THRESHOLD_DAYS,
    };

    this.cookie = {
      secure: this.isProduction(),
      sameSite: this.config.COOKIE_SAMESITE || 'lax',
      accessMaxAge: this.config.COOKIE_ACCESS_MAX_AGE,
      refreshMaxAge: this.config.COOKIE_REFRESH_MAX_AGE,
      credentials: this.config.COOKIE_CREDENTIALS,
    };

    this.security = {
      dummyHashPassword: this.config.DUMMY_HASH_PASSWORD,
    };

    this.mail = {
      host: this.config.MAIL_HOST,
      port: this.config.MAIL_PORT,
      secure: this.config.MAIL_SECURE,
      ignoreTls: this.config.MAIL_IGNORE_TLS,
      user: this.config.MAIL_USER,
      pass: this.config.MAIL_PASS,
      from: this.config.MAIL_FROM,
    };

    this.frontend = {
      url: this.config.FRONTEND_URL,
      cors: this.config.FRONTEND_CORS.split(',').map((origin: any) =>
        origin.trim(),
      ),
    };

    this.throttler = {
      ttl: this.config.THROTTLE_TTL,
      limit: this.config.THROTTLE_LIMIT,
    };

    this.logger = {
      console: this.config.LOG_CONSOLE,
      local: this.config.LOG_LOCAL,
    };

    this.infrastructure = {
      trustProxy: this.config.TRUST_PROXY,
    };
  }

  private validateEnv() {
    const schema = z
      .object({
        NODE_ENV: z.enum(['development', 'production']).default('development'),
        PROJECT_PREFIX: z.string().default('api/v1'),
        PROJECT_PORT: z.coerce.number().default(3000),
        // Database
        DB_HOST: z.string(),
        DB_PORT: z.coerce.number().default(5432),
        DB_NAME: z.string(),
        DB_USERNAME: z.string(),
        DB_PASSWORD: z.string(),
        TYPEORM_SYNC: z
          .string()
          .default('false')
          .transform((val) => val === 'true'),
        // JWT
        JWT_SECRET: z.string(),
        JWT_PASSWORD_RESET_SECRET: z.string(),
        REFRESH_TOKEN_SECRET: z.string(),
        JWT_EXPIRES_IN: z.string().default('1h'),
        REFRESH_TOKEN_EXPIRES_IN: z.string().default('7d'),
        REFRESH_TOKEN_THRESHOLD_DAYS: z.coerce.number().default(2),
        // Cookies
        COOKIE_SAMESITE: z.enum(['lax', 'strict', 'none']).default('lax'),
        COOKIE_ACCESS_MAX_AGE: z.coerce.number().default(3600000),
        COOKIE_REFRESH_MAX_AGE: z.coerce.number().default(604800000),
        COOKIE_CREDENTIALS: z
          .string()
          .default('false')
          .transform((val) => val === 'true'),
        // Security
        DUMMY_HASH_PASSWORD: z.string(),
        // Mail
        MAIL_HOST: z.string(),
        MAIL_PORT: z.coerce.number().default(2525),
        MAIL_SECURE: z
          .string()
          .default('false')
          .transform((val) => val === 'true'),
        MAIL_IGNORE_TLS: z
          .string()
          .default('true')
          .transform((val) => val === 'true'),
        MAIL_USER: z.string().optional(),
        MAIL_PASS: z.string().optional(),
        MAIL_FROM: z.string(),
        // Frontend
        FRONTEND_URL: z.string().default('http://localhost:5173'),
        FRONTEND_CORS: z.string().default('http://localhost:5173'),
        // Throttler
        THROTTLE_TTL: z.coerce.number().default(60000),
        THROTTLE_LIMIT: z.coerce.number().default(10),
        // Logger
        LOG_CONSOLE: z
          .string()
          .default('true')
          .transform((val) => val === 'true'),
        LOG_LOCAL: z
          .string()
          .default('true')
          .transform((val) => val === 'true'),
        TRUST_PROXY: z.coerce.number().int().min(0).default(0),
      })
      .superRefine((env, ctx) => {
        if (env.NODE_ENV === 'production' && env.TYPEORM_SYNC) {
          ctx.addIssue({
            path: ['TYPEORM_SYNC'],
            message: 'TYPEORM_SYNC cannot be active in production',
            code: 'custom',
          });
        }

        if (env.COOKIE_SAMESITE === 'none' && env.NODE_ENV === 'development') {
          ctx.addIssue({
            path: ['COOKIE_SAMESITE'],
            message:
              'SameSite=none requires HTTPS. Use "lax" for local development.',
            code: 'custom',
          });
        }

        if (env.COOKIE_CREDENTIALS && env.FRONTEND_CORS === '*') {
          ctx.addIssue({
            path: ['FRONTEND_CORS'],
            message:
              'CORS: Security risk. Replace "*" with a specific domain to use credentials.',
            code: 'custom',
          });
        }

        if (!env.DUMMY_HASH_PASSWORD) {
          ctx.addIssue({
            path: ['DUMMY_HASH_PASSWORD'],
            message:
              'DUMMY_HASH_PASSWORD is required to prevent timing attacks during authentication',
            code: 'custom',
          });
        }

        if (env.MAIL_IGNORE_TLS && (env.MAIL_USER || env.MAIL_PASS)) {
          ctx.addIssue({
            path: ['MAIL_IGNORE_TLS'],
            message:
              'MAIL_IGNORE_TLS=true cannot be used along with MAIL_USER/PASS',
            code: 'custom',
          });
        }

        if (
          !env.MAIL_IGNORE_TLS &&
          env.MAIL_SECURE === false &&
          env.NODE_ENV === 'production'
        ) {
          ctx.addIssue({
            path: ['MAIL_SECURE'],
            message: 'In production you must use TLS or SSL for mail',
            code: 'custom',
          });
        }
      });

    return schema.parse(process.env);
  }

  public isDevelopment(): boolean {
    return this.config.NODE_ENV === 'development';
  }

  public isProduction(): boolean {
    return this.config.NODE_ENV === 'production';
  }
}
