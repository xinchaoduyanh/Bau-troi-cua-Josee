import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class GlobalGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // Thêm logic guard chung ở đây
    return true;
  }
}
