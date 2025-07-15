import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  RESPONSE_METADATA_KEY,
  ResponseOptions,
} from '../decorators/response.decorator';

export type ResponseData<T = unknown> = {
  data?: T;
  message?: string;
  statusCode: number;
};

@Injectable()
export class ResponseInterceptor<T = unknown>
  implements NestInterceptor<T, ResponseData<T>>
{
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ResponseData<T>> {
    const responseOptions: ResponseOptions | undefined =
      this.reflector.get<ResponseOptions>(
        RESPONSE_METADATA_KEY,
        context.getHandler(),
      );

    return next.handle().pipe(
      map((data: T): ResponseData<T> => {
        const response: ResponseData<T> = {
          statusCode: responseOptions?.status ?? HttpStatus.OK,
          data,
        };

        if (responseOptions?.message) {
          response.message = responseOptions.message;
        }

        // Set the status code on the response object
        const responseObj: { status: (code: number) => void } = context
          .switchToHttp()
          .getResponse();
        responseObj.status(response.statusCode);

        return response;
      }),
    );
  }
}
