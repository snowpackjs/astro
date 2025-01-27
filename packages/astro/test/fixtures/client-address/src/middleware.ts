import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (ctx, next) => {
  // Clone a request, losing all symbols
  const clonedRequest = ctx.request.clone();
  const safeInternalRequest = new Request(clonedRequest, {
    method: clonedRequest.method,
    headers: clonedRequest.headers,
  });

  return next(safeInternalRequest);
});
