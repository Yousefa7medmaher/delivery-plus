import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { generateCorrelationId, generateId } from '../../utils/id';

export interface RequestWithContext extends Request {
  correlationId: string;
  requestId: string;
}

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: RequestWithContext, res: Response, next: NextFunction): void {
    const incoming = req.headers['x-correlation-id'];
    req.correlationId =
      (Array.isArray(incoming) ? incoming[0] : incoming) || generateCorrelationId();
    req.requestId = generateId();
    res.setHeader('x-correlation-id', req.correlationId);
    next();
  }
}
