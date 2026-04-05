import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    // Handle Prisma known errors
    if (exception && typeof exception === 'object' && 'code' in exception) {
      const prismaError = exception as { code: string; meta?: any };
      if (prismaError.code === 'P2002') {
        res.status(409).json({ success: false, code: 409, message: '資料已存在，請勿重複建立', data: null });
        return;
      }
      if (prismaError.code === 'P2025') {
        res.status(404).json({ success: false, code: 404, message: '找不到資料', data: null });
        return;
      }
    }

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const message = exception instanceof HttpException ? exception.message : 'Internal server error';
    res.status(status).json({ success: false, code: status, message, data: null });
  }
}
