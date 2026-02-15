import type { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { logger, redactSensitive } from '../logger/logger.js';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const requestId = randomUUID();
  req.requestId = requestId;

  const ip = req.ip ?? req.socket?.remoteAddress ?? 'unknown';
  const userAgent = req.get('user-agent') ?? undefined;

  const query = req.query as Record<string, unknown>;
  const params = req.params as Record<string, unknown>;
  const meta: Record<string, unknown> = {
    requestId,
    method: req.method,
    path: req.path,
    query: Object.keys(query).length ? redactSensitive(query) : undefined,
    params: Object.keys(params).length ? redactSensitive(params) : undefined,
    ip,
    userAgent,
  };
  if (req.body && typeof req.body === 'object' && Object.keys(req.body as object).length) {
    const body = req.body as Record<string, unknown>;
    meta.body = redactSensitive(body);
  }
  const headers = req.headers as Record<string, unknown>;
  if (Object.keys(headers).length) {
    meta.headers = redactSensitive(headers);
  }
  logger.debug('request_start', meta);

  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const contentLength = res.get('content-length');
    const meta: Record<string, unknown> = {
      requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      durationMs: duration,
      ip,
      userAgent,
    };
    if (req.authUserId) meta.authUserId = req.authUserId;
    if (req.guestId) meta.guestId = req.guestId;
    if (contentLength) meta.contentLength = contentLength;

    if (res.statusCode >= 500) {
      logger.error('request_complete', meta);
    } else if (res.statusCode >= 400) {
      logger.warn('request_complete', meta);
    } else {
      logger.debug('request_complete', meta);
    }
  });

  next();
}
