import { defineMiddleware, sequence } from 'astro:middleware';

const first = defineMiddleware(async (context, next) => {
	if (context.request.url.includes('/lorem')) {
		context.locals.name = 'ipsum';
	} else if (context.request.url.includes('/rewrite')) {
		return new Response('<span>New content!!</span>', {
			status: 200,
		});
	} else if (context.request.url.includes('/content-policy')) {
		const response = await next();
		response.headers.append('X-Content-Type-Options', 'nosniff');
		response.headers.append('Content-Type', 'application/json');

		return next();
	} else if (context.request.url.includes('/broken-500')) {
		return new Response(null, {
			status: 500,
		});
	} else if (context.request.url.includes('/api/endpoint')) {
		const response = await next();
		const object = await response.json();
		object.name = 'REDACTED';
		return new Response(JSON.stringify(object), {
			headers: response.headers,
		});
	} else if (context.url.pathname === '/throw') {
		throw new Error();
	} else if (context.url.pathname === '/clone') {
		const response = await next();
		const newResponse = response.clone();
		const /** @type {string} */ html = await newResponse.text();
		const newhtml = html.replace('testing', 'it works');
		return new Response(newhtml, { status: 200, headers: response.headers });
	} else if (context.url.pathname === '/return-response-cookies') {
		const response = await next();
		const html = await response.text();

		return new Response(html, {
			status: 200,
			headers: response.headers,
		});
	} else if (context.url.pathname === '/prerendered/') {
		context.locals.canBeReadDuringPrerendering = "yes they can!";
	} else {
		if (context.url.pathname === '/') {
			context.cookies.set('foo', 'bar');
		}

		Object.assign(context.locals, {
			name: 'bar',
		});
	}
	return await next();
});

const second = defineMiddleware(async (context, next) => {
	if (context.request.url.includes('/second')) {
		context.locals.name = 'second';
	} else if (context.request.url.includes('/redirect')) {
		return context.redirect('/', 302);
	}
	return await next();
});

const third = defineMiddleware(async (context, next) => {
	if (context.request.url.includes('/broken-locals')) {
		Object.assign(context.locals, {
			fn() {},
		});
	} else if (context.request.url.includes('/does-nothing')) {
		return undefined;
	}
	return next();
});

const fourth = defineMiddleware((context, next) => {
	if (context.request.url.includes('/no-route-but-200')) {
		return new Response("It's OK!", {
			status: 200
		});
	}
	return next()
})

export const onRequest = sequence(first, second, third, fourth);
