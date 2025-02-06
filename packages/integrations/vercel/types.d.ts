export interface EdgeLocals {
	vercel: {
		edge: import('@vercel/edge').RequestContext;
	};
}
