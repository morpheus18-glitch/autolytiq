import type { RequestHandler } from 'express';
import type { RequestContext } from '../types/context.js';

export const initializeContext: RequestHandler = (req, _res, next) => {
  const current = req.context ?? ({} as RequestContext);
  req.context = {
    ...current,
    roles: current.roles ?? [],
  };

  next();
};
