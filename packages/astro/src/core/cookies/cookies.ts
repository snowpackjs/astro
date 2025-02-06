import type { CookieSerializeOptions } from 'cookie';
import { parse, serialize } from 'cookie';
import { AstroError, AstroErrorData } from '../errors/index.js';

export type AstroCookieSetOptions = Pick<
	CookieSerializeOptions,
	'domain' | 'path' | 'expires' | 'maxAge' | 'httpOnly' | 'sameSite' | 'secure' | 'encode'
>;

export interface AstroCookieGetOptions {
	decode?: (value: string) => string;
}

type AstroCookieDeleteOptions = Omit<AstroCookieSetOptions, 'expires' | 'maxAge' | 'encode'>;

interface AstroCookieInterface {
	value: string;
	json(): Record<string, any>;
	number(): number;
	boolean(): boolean;
}

interface AstroCookiesInterface {
	get(key: string): AstroCookieInterface | undefined;
	has(key: string): boolean;
	set(
		key: string,
		value: string | number | boolean | Record<string, any>,
		options?: AstroCookieSetOptions,
	): void;
	delete(key: string, options?: AstroCookieDeleteOptions): void;
}

const DELETED_EXPIRATION = new Date(0);
const DELETED_VALUE = 'deleted';
const responseSentSymbol = Symbol.for('astro.responseSent');

class AstroCookie implements AstroCookieInterface {
	constructor(public value: string) {}
	json() {
		if (this.value === undefined) {
			throw new Error(`Cannot convert undefined to an object.`);
		}
		return JSON.parse(this.value);
	}
	number() {
		return Number(this.value);
	}
	boolean() {
		if (this.value === 'false') return false;
		if (this.value === '0') return false;
		return Boolean(this.value);
	}
}

class AstroCookies implements AstroCookiesInterface {
	#request: Request;
	#requestValues: Record<string, string> | null;
	#outgoing: Map<string, [string, string, boolean]> | null;
	#consumed: boolean;
	constructor(request: Request) {
		this.#request = request;
		this.#requestValues = null;
		this.#outgoing = null;
		this.#consumed = false;
	}

	/**
	 * Astro.cookies.delete(key) is used to delete a cookie. Using this method will result
	 * in a Set-Cookie header added to the response.
	 * @param key The cookie to delete
	 * @param options Options related to this deletion, such as the path of the cookie.
	 */
	delete(key: string, options?: AstroCookieDeleteOptions): void {
		/**
		 * The `@ts-expect-error` is necessary because `maxAge` and `expires` properties
		 * must not appear in the AstroCookieDeleteOptions type.
		 */
		const {
			// @ts-expect-error
			maxAge: _ignoredMaxAge,
			// @ts-expect-error
			expires: _ignoredExpires,
			...sanitizedOptions
		} = options || {};
		const serializeOptions: CookieSerializeOptions = {
			expires: DELETED_EXPIRATION,
			...sanitizedOptions,
		};

		// Set-Cookie: token=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT
		this.#ensureOutgoingMap().set(key, [
			DELETED_VALUE,
			serialize(key, DELETED_VALUE, serializeOptions),
			false,
		]);
	}

	/**
	 * Astro.cookies.get(key) is used to get a cookie value. The cookie value is read from the
	 * request. If you have set a cookie via Astro.cookies.set(key, value), the value will be taken
	 * from that set call, overriding any values already part of the request.
	 * @param key The cookie to get.
	 * @returns An object containing the cookie value as well as convenience methods for converting its value.
	 */
	get(
		key: string,
		options: AstroCookieGetOptions | undefined = undefined,
	): AstroCookie | undefined {
		// Check for outgoing Set-Cookie values first
		if (this.#outgoing?.has(key)) {
			let [serializedValue, , isSetValue] = this.#outgoing.get(key)!;
			if (isSetValue) {
				return new AstroCookie(serializedValue);
			} else {
				return undefined;
			}
		}

		const values = this.#ensureParsed(options);
		if (key in values) {
			const value = values[key];
			return new AstroCookie(value);
		}
	}

	/**
	 * Astro.cookies.has(key) returns a boolean indicating whether this cookie is either
	 * part of the initial request or set via Astro.cookies.set(key)
	 * @param key The cookie to check for.
	 * @returns
	 */
	has(key: string, options: AstroCookieGetOptions | undefined = undefined): boolean {
		if (this.#outgoing?.has(key)) {
			let [, , isSetValue] = this.#outgoing.get(key)!;
			return isSetValue;
		}
		const values = this.#ensureParsed(options);
		return !!values[key];
	}

	/**
	 * Astro.cookies.set(key, value) is used to set a cookie's value. If provided
	 * an object it will be stringified via JSON.stringify(value). Additionally you
	 * can provide options customizing how this cookie will be set, such as setting httpOnly
	 * in order to prevent the cookie from being read in client-side JavaScript.
	 * @param key The name of the cookie to set.
	 * @param value A value, either a string or other primitive or an object.
	 * @param options Options for the cookie, such as the path and security settings.
	 */
	set(key: string, value: string | Record<string, any>, options?: AstroCookieSetOptions): void {
		if (this.#consumed) {
			const warning = new Error(
				'Astro.cookies.set() was called after the cookies had already been sent to the browser.\n' +
					'This may have happened if this method was called in an imported component.\n' +
					'Please make sure that Astro.cookies.set() is only called in the frontmatter of the main page.',
			);
			warning.name = 'Warning';
			console.warn(warning);
		}
		let serializedValue: string;
		if (typeof value === 'string') {
			serializedValue = value;
		} else {
			// Support stringifying JSON objects for convenience. First check that this is
			// a plain object and if it is, stringify. If not, allow support for toString() overrides.
			let toStringValue = value.toString();
			if (toStringValue === Object.prototype.toString.call(value)) {
				serializedValue = JSON.stringify(value);
			} else {
				serializedValue = toStringValue;
			}
		}

		const serializeOptions: CookieSerializeOptions = {};
		if (options) {
			Object.assign(serializeOptions, options);
		}

		this.#ensureOutgoingMap().set(key, [
			serializedValue,
			serialize(key, serializedValue, serializeOptions),
			true,
		]);

		if ((this.#request as any)[responseSentSymbol]) {
			throw new AstroError({
				...AstroErrorData.ResponseSentError,
			});
		}
	}

	/**
	 * Merges a new AstroCookies instance into the current instance. Any new cookies
	 * will be added to the current instance, overwriting any existing cookies with the same name.
	 */
	merge(cookies: AstroCookies) {
		const outgoing = cookies.#outgoing;
		if (outgoing) {
			for (const [key, value] of outgoing) {
				this.#ensureOutgoingMap().set(key, value);
			}
		}
	}

	/**
	 * Astro.cookies.header() returns an iterator for the cookies that have previously
	 * been set by either Astro.cookies.set() or Astro.cookies.delete().
	 * This method is primarily used by adapters to set the header on outgoing responses.
	 * @returns
	 */
	*headers(): Generator<string, void, unknown> {
		if (this.#outgoing == null) return;
		for (const [, value] of this.#outgoing) {
			yield value[1];
		}
	}

	/**
	 * Behaves the same as AstroCookies.prototype.headers(),
	 * but allows a warning when cookies are set after the instance is consumed.
	 */
	static consume(cookies: AstroCookies): Generator<string, void, unknown> {
		cookies.#consumed = true;
		return cookies.headers();
	}

	#ensureParsed(options: AstroCookieGetOptions | undefined = undefined): Record<string, string> {
		if (!this.#requestValues) {
			this.#parse(options);
		}
		if (!this.#requestValues) {
			this.#requestValues = {};
		}
		return this.#requestValues;
	}

	#ensureOutgoingMap(): Map<string, [string, string, boolean]> {
		if (!this.#outgoing) {
			this.#outgoing = new Map();
		}
		return this.#outgoing;
	}

	#parse(options: AstroCookieGetOptions | undefined = undefined) {
		const raw = this.#request.headers.get('cookie');
		if (!raw) {
			return;
		}

		this.#requestValues = parse(raw, options);
	}
}

export { AstroCookies };
