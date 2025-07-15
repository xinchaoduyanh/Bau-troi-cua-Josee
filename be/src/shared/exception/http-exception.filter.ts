import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Request, Response } from 'express';
import { ZodSerializationException } from 'nestjs-zod';
import { ZodError } from 'zod';

@Catch()
export class HttpExceptionFilter
  extends BaseExceptionFilter
  implements ExceptionFilter
{
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Lỗi Zod khi serialize response
    if (exception instanceof ZodSerializationException) {
      const zodErrorRaw = (
        exception as { getZodError: () => unknown }
      ).getZodError();
      if (zodErrorRaw instanceof ZodError) {
        this.logger.error(
          `[ZodSerializationException] ${zodErrorRaw.message} | Path: ${request.method} ${request.url}`,
        );
        response.status(500).json({
          statusCode: 500,
          error: 'Internal Server Error',
          message: 'Zod serialization error',
          details: (zodErrorRaw as unknown as { errors: unknown }).errors,
        });
      } else {
        this.logger.error(
          `[ZodSerializationException] Unknown Zod error | Path: ${request.method} ${request.url}`,
        );
        response.status(500).json({
          statusCode: 500,
          error: 'Internal Server Error',
          message: 'Zod serialization error',
          details: undefined,
        });
      }
      return;
    }

    // Lỗi Zod khi validate input (UnprocessableEntityException)
    if (
      typeof exception === 'object' &&
      exception !== null &&
      'getStatus' in exception &&
      typeof (exception as { getStatus?: unknown }).getStatus === 'function' &&
      (exception as { getStatus: () => number }).getStatus() === 422 &&
      'getResponse' in exception &&
      typeof (exception as { getResponse?: unknown }).getResponse === 'function'
    ) {
      const errorResponse = (
        exception as { getResponse: () => unknown }
      ).getResponse();
      this.logger.error(
        `[ZodValidationError] ${JSON.stringify(errorResponse)} | Path: ${request.method} ${request.url}`,
      );
      response.status(422).json({
        statusCode: 422,
        error: 'Unprocessable Entity',
        message:
          typeof errorResponse === 'object' &&
          errorResponse !== null &&
          'message' in errorResponse
            ? (errorResponse as { message?: unknown }).message
            : errorResponse,
        details:
          typeof errorResponse === 'object' &&
          errorResponse !== null &&
          'message' in errorResponse
            ? (errorResponse as { message?: unknown }).message
            : errorResponse,
      });
      return;
    }

    // Lỗi HTTP thông thường
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const errorResponse = exception.getResponse();

      // Nếu là lỗi 401, log chi tiết hơn
      if (status === 401) {
        this.logger.warn(
          `[AuthError] 401 Unauthorized | Path: ${request.method} ${request.url} | Headers: ${JSON.stringify(request.headers)} | Body: ${JSON.stringify(request.body)}`,
        );
      } else {
        this.logger.error(
          `[HttpException] ${JSON.stringify(errorResponse)} | Path: ${request.method} ${request.url}`,
        );
      }

      response.status(status).json({
        statusCode: status,
        error: exception.name,
        message:
          typeof errorResponse === 'object' &&
          errorResponse !== null &&
          'message' in errorResponse
            ? (errorResponse as { message?: unknown }).message
            : errorResponse,
      });
      return;
    }

    // Lỗi không xác định (500)
    let unknownMessage: string = 'Unknown error';
    if (
      typeof exception === 'object' &&
      exception !== null &&
      'message' in exception &&
      typeof (exception as { message?: unknown }).message === 'string'
    ) {
      unknownMessage = (exception as { message: string }).message;
    } else if (typeof exception === 'string') {
      unknownMessage = exception;
    }
    this.logger.error(
      `[UnknownError] ${unknownMessage} | Path: ${request.method} ${request.url}`,
    );
    response.status(500).json({
      statusCode: 500,
      error: 'Internal Server Error',
      message: unknownMessage,
    });
  }
}
