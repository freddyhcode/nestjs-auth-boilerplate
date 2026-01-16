import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggerService } from '../logger/logger.service';

@Catch()
export class AllExceptionsLoggerFilter implements ExceptionFilter {
  // private readonly logger = new Logger('AllExceptions');
  constructor(private readonly logger: LoggerService) {}

  public catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionMessage =
      exception instanceof Error ? exception.message : 'Unknown error';
    const exceptionStack =
      exception instanceof Error ? exception.stack : undefined;

    const clientIp = request.ip || request.headers['x-forwarded-for'];

    const logMessage = `[${request.method}] ${request.url} - ${status}`;

    this.logger.error(logMessage, exceptionStack, {
      ip: clientIp,
      method: request.method,
      url: request.url,
      status,
      error: exceptionMessage,
    });

    if (exception instanceof HttpException) {
      return response.status(status).json(exception.getResponse());
    }

    return response.status(status).json({
      message: 'Internal server error',
      statusCode: status,
    });
  }
}
