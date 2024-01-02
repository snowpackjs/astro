import createAppListener from './serve-app.js';
import type { RequestHandler } from "./types.js";
import type { NodeApp } from "astro/app/node";

/**
 * Creates a middleware that can be used with Express, Connect, etc.
 * 
 * Similar to `createListener` but can additionally be placed in the express
 * chain as an error middleware.
 * 
 * https://expressjs.com/en/guide/using-middleware.html#middleware.error-handling
 */
export default function createMiddleware(
    app: NodeApp,
): RequestHandler {
    const listener = createAppListener(app)
    const logger = app.getAdapterLogger()
    // using spread args because express trips up if the function's
    // stringified body includes req, res, next, locals directly
    return async function (...args) {
        // assume normal invocation at first
        const [req, res, next, locals] = args;
        // short circuit if it is an error invocation
        if (req instanceof Error) {
            const error = req;
            if (next) {
                return next(error);
            } else {
                throw error;
            }
        }
		try {
			await listener(req, res, next, locals);
		} catch (err) {
			logger.error(`Could not render ${req.url}`);
			console.error(err);
			if (!res.headersSent) {
				res.writeHead(500, `Server error`);
				res.end();
			}
		}
    }
}
