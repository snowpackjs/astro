import { AstroCookies } from './cookies.js';

const astroCookiesSymbol = Symbol.for('astro.cookies');

export function attachCookiesToResponse(response: Response, cookies: AstroCookies) {
	Reflect.set(response, astroCookiesSymbol, cookies);
}

export function responseHasCookies(response: Response): boolean {
	return Reflect.has(response, astroCookiesSymbol);
}

export function getCookiesFromResponse(response: Response): AstroCookies | undefined {
	let cookies = Reflect.get(response, astroCookiesSymbol);
	if (cookies != null) {
		return cookies as AstroCookies;
	} else {
		return undefined;
	}
}

export function* getSetCookiesFromResponse(response: Response): Generator<string, string[]> {
	const cookies = getCookiesFromResponse(response);
	if (!cookies) {
		return [];
	}
	for (const headerValue of AstroCookies.consume(cookies)) {
		yield headerValue;
	}

	return [];
}
