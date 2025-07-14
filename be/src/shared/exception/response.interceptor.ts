import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Response } from 'express'; // Import Response từ express để có kiểu rõ ràng
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((data: unknown) => {
        // Lấy đối tượng phản hồi (response) từ context
        // Sử dụng kiểu Response từ 'express' để có kiểu rõ ràng hơn
        const res = context.switchToHttp().getResponse<Response>();

        // Đảm bảo statusCode là một số.
        // Mặc dù res.statusCode thường là number, nhưng kiểm tra cẩn thận vẫn tốt.
        const statusCode: number =
          typeof res.statusCode === 'number' ? res.statusCode : 200;

        // Trả về đối tượng phản hồi đã được định dạng
        return {
          statusCode: statusCode, // Gán giá trị statusCode đã được kiểm tra kiểu
          data: data, // data đã được khai báo là unknown, nên việc gán nó là an toàn
          message: 'Success',
        };
      }),
    );
  }
}
