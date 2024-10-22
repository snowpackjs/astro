import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import * as devalue from 'devalue';
import { serializeActionResult } from '../dist/actions/runtime/virtual/shared.js';
import { REDIRECT_STATUS_CODES } from '../dist/core/constants.js';
import testAdapter from './test-adapter.js';
import { loadFixture } from './test-utils.js';

describe('Astro Actions', () => {
	let fixture;
	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/actions/',
			adapter: testAdapter(),
			base: "/base"
		});
	});

	describe('dev', () => {
		let devServer;

		before(async () => {
			devServer = await fixture.startDevServer();
		});

		after(async () => {
			await devServer.stop();
		});

		it('Does not process middleware cookie for prerendered routes', async () => {
			const cookie = new URLSearchParams();
			cookie.append(
				'_astroActionPayload',
				JSON.stringify({
					actionName: 'subscribe',
					actionResult: serializeActionResult({
						data: { channel: 'bholmesdev', subscribeButtonState: 'smashed' },
						error: undefined,
					}),
				}),
			);
			const res = await fixture.fetch('/base/subscribe-prerendered', {
				headers: {
					Cookie: cookie.toString(),
				},
			});
			const html = await res.text();
			const $ = cheerio.load(html);
			assert.equal($('body').text().trim(), 'No cookie found.');
		});

		it('Exposes subscribe action', async () => {
			const res = await fixture.fetch('/base/_actions/subscribe', {
				method: 'POST',
				body: JSON.stringify({ channel: 'bholmesdev' }),
				headers: {
					'Content-Type': 'application/json',
				},
			});

			assert.equal(res.ok, true);
			assert.equal(res.headers.get('Content-Type'), 'application/json+devalue');

			const data = devalue.parse(await res.text());
			assert.equal(data.channel, 'bholmesdev');
			assert.equal(data.subscribeButtonState, 'smashed');
		});

		it('Exposes comment action', async () => {
			const formData = new FormData();
			formData.append('channel', 'bholmesdev');
			formData.append('comment', 'Hello, World!');
			const res = await fixture.fetch('/base/_actions/comment', {
				method: 'POST',
				body: formData,
			});

			assert.equal(res.ok, true);
			assert.equal(res.headers.get('Content-Type'), 'application/json+devalue');

			const data = devalue.parse(await res.text());
			assert.equal(data.channel, 'bholmesdev');
			assert.equal(data.comment, 'Hello, World!');
		});

		it('Raises validation error on bad form data', async () => {
			const formData = new FormData();
			formData.append('channel', 'bholmesdev');
			const res = await fixture.fetch('/base/_actions/comment', {
				method: 'POST',
				body: formData,
			});

			assert.equal(res.ok, false);
			assert.equal(res.status, 400);
			assert.equal(res.headers.get('Content-Type'), 'application/json');

			const data = await res.json();
			assert.equal(data.type, 'AstroActionInputError');
		});

		it('Exposes plain formData action', async () => {
			const formData = new FormData();
			formData.append('channel', 'bholmesdev');
			formData.append('comment', 'Hello, World!');
			const res = await fixture.fetch('/base/_actions/commentPlainFormData', {
				method: 'POST',
				body: formData,
			});

			assert.equal(res.ok, true);
			assert.equal(res.headers.get('Content-Type'), 'application/json+devalue');

			const data = devalue.parse(await res.text());
			assert.equal(data.success, true);
			assert.equal(data.isFormData, true, 'Should receive plain FormData');
		});

		it('Handles special characters in action names', async () => {
			for (const name of ['with%2Fslash', 'with%20space', 'with%2Edot']) {
				const res = await fixture.fetch(`/base/_actions/${name}`, {
					method: 'POST',
					body: JSON.stringify({ name: 'ben' }),
					headers: {
						'Content-Type': 'application/json',
					},
				});
				assert.equal(res.ok, true);
				const text = await res.text();
				assert.equal(res.headers.get('Content-Type'), 'application/json+devalue');
				const data = devalue.parse(text);
				assert.equal(data, 'Hello, ben!');
			}
		});
	});

	describe('build', () => {
		let app;

		before(async () => {
			await fixture.build();
			app = await fixture.loadTestAdapterApp();
		});

		it('Exposes subscribe action', async () => {
			const req = new Request('http://example.com/base/_actions/subscribe', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ channel: 'bholmesdev' }),
			});
			const res = await app.render(req);

			assert.equal(res.ok, true);
			assert.equal(res.headers.get('Content-Type'), 'application/json+devalue');

			const data = devalue.parse(await res.text());
			assert.equal(data.channel, 'bholmesdev');
			assert.equal(data.subscribeButtonState, 'smashed');
		});

		it('Exposes comment action', async () => {
			const formData = new FormData();
			formData.append('channel', 'bholmesdev');
			formData.append('comment', 'Hello, World!');
			const req = new Request('http://example.com/base/_actions/comment', {
				method: 'POST',
				body: formData,
			});
			const res = await app.render(req);

			assert.equal(res.ok, true);
			assert.equal(res.headers.get('Content-Type'), 'application/json+devalue');

			const data = devalue.parse(await res.text());
			assert.equal(data.channel, 'bholmesdev');
			assert.equal(data.comment, 'Hello, World!');
		});

		it('Raises validation error on bad form data', async () => {
			const formData = new FormData();
			formData.append('channel', 'bholmesdev');
			const req = new Request('http://example.com/base/_actions/comment', {
				method: 'POST',
				body: formData,
			});
			const res = await app.render(req);

			assert.equal(res.ok, false);
			assert.equal(res.status, 400);
			assert.equal(res.headers.get('Content-Type'), 'application/json');

			const data = await res.json();
			assert.equal(data.type, 'AstroActionInputError');
		});

		it('Exposes plain formData action', async () => {
			const formData = new FormData();
			formData.append('channel', 'bholmesdev');
			formData.append('comment', 'Hello, World!');
			const req = new Request('http://example.com/base/_actions/commentPlainFormData', {
				method: 'POST',
				body: formData,
			});
			const res = await app.render(req);

			assert.equal(res.ok, true);
			assert.equal(res.headers.get('Content-Type'), 'application/json+devalue');

			const data = devalue.parse(await res.text());
			assert.equal(data.success, true);
			assert.equal(data.isFormData, true, 'Should receive plain FormData');
		});

		it('Response middleware fallback', async () => {
			const req = new Request('http://example.com/base/user?_astroAction=getUser', {
				method: 'POST',
				body: new FormData(),
				headers: {
					Referer: 'http://example.com/user',
				},
			});
			const res = await followExpectedRedirect(req, app);
			assert.equal(res.ok, true);

			const html = await res.text();
			let $ = cheerio.load(html);
			assert.equal($('#user').text(), 'Houston');
		});

		it('Respects custom errors', async () => {
			const req = new Request('http://example.com/base/user-or-throw?_astroAction=getUserOrThrow', {
				method: 'POST',
				body: new FormData(),
				headers: {
					Referer: 'http://example.com/user-or-throw',
				},
			});
			const res = await followExpectedRedirect(req, app);
			assert.equal(res.status, 401);

			const html = await res.text();
			let $ = cheerio.load(html);
			assert.equal($('#error-message').text(), 'Not logged in');
			assert.equal($('#error-code').text(), 'UNAUTHORIZED');
		});

		it('Ignores `_astroAction` name for GET requests', async () => {
			const req = new Request('http://example.com/base/user-or-throw?_astroAction=getUserOrThrow', {
				method: 'GET',
			});
			const res = await app.render(req);
			assert.equal(res.ok, true);

			const html = await res.text();
			let $ = cheerio.load(html);
			assert.ok($('#user'));
		});

		it('Supports effects on form input validators', async () => {
			const formData = new FormData();
			formData.set('password', 'benisawesome');
			formData.set('confirmPassword', 'benisveryawesome');

			const req = new Request('http://example.com/base/_actions/validatePassword', {
				method: 'POST',
				body: formData,
			});

			const res = await app.render(req);

			assert.equal(res.ok, false);
			assert.equal(res.status, 400);
			assert.equal(res.headers.get('Content-Type'), 'application/json');

			const data = await res.json();
			assert.equal(data.type, 'AstroActionInputError');
			assert.equal(data.issues?.[0]?.message, 'Passwords do not match');
		});

		it('Supports complex chained effects on form input validators', async () => {
			const formData = new FormData();
			formData.set('currentPassword', 'benisboring');
			formData.set('newPassword', 'benisawesome');
			formData.set('confirmNewPassword', 'benisawesome');

			const req = new Request('http://example.com/base/_actions/validatePasswordComplex', {
				method: 'POST',
				body: formData,
			});

			const res = await app.render(req);

			assert.equal(res.ok, true);
			assert.equal(res.headers.get('Content-Type'), 'application/json+devalue');

			const data = devalue.parse(await res.text());
			assert.equal(Object.keys(data).length, 2, 'More keys than expected');
			assert.deepEqual(data, {
				currentPassword: 'benisboring',
				newPassword: 'benisawesome',
			});
		});

		it('Supports input form data transforms', async () => {
			const formData = new FormData();
			formData.set('name', 'ben');
			formData.set('age', '42');

			const req = new Request('http://example.com/base/_actions/transformFormInput', {
				method: 'POST',
				body: formData,
			});

			const res = await app.render(req);

			assert.equal(res.ok, true);
			assert.equal(res.headers.get('Content-Type'), 'application/json+devalue');

			const data = devalue.parse(await res.text());
			assert.equal(data?.name, 'ben');
			assert.equal(data?.age, '42');
		});

		it('Sets status to 204 when content-length is 0', async () => {
			const req = new Request('http://example.com/base/_actions/fireAndForget', {
				method: 'POST',
				headers: {
					'Content-Length': '0',
				},
			});
			const res = await app.render(req);
			assert.equal(res.status, 204);
		});

		it('Sets status to 204 when content-type is omitted', async () => {
			const req = new Request('http://example.com/base/_actions/fireAndForget', {
				method: 'POST',
			});
			const res = await app.render(req);
			assert.equal(res.status, 204);
		});

		it('Sets status to 415 when content-type is unexpected', async () => {
			const req = new Request('http://example.com/base/_actions/fireAndForget', {
				method: 'POST',
				body: 'hey',
				headers: {
					'Content-Type': 'text/plain',
				},
			});
			const res = await app.render(req);
			assert.equal(res.status, 415);
		});

		it('Is callable from the server with rewrite', async () => {
			const req = new Request('http://example.com/base/rewrite');
			const res = await app.render(req);
			assert.equal(res.ok, true);

			const html = await res.text();
			let $ = cheerio.load(html);
			assert.equal($('[data-url]').text(), '/subscribe');
			assert.equal($('[data-channel]').text(), 'bholmesdev');
		});

		it('Returns content when the value is 0', async () => {
			const req = new Request('http://example.com/base/_actions/zero', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Content-Length': '0',
				},
			});
			const res = await app.render(req);
			assert.equal(res.status, 200);
			const value = devalue.parse(await res.text());
			assert.equal(value, 0);
		});

		it('Returns content when the value is false', async () => {
			const req = new Request('http://example.com/base/_actions/false', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Content-Length': '0',
				},
			});
			const res = await app.render(req);
			assert.equal(res.status, 200);

			const value = devalue.parse(await res.text());
			assert.equal(value, false);
		});

		it('Supports complex values: Date, Set, URL', async () => {
			const req = new Request('http://example.com/base/_actions/complexValues', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Content-Length': '0',
				},
			});
			const res = await app.render(req);
			assert.equal(res.status, 200);
			assert.equal(res.headers.get('Content-Type'), 'application/json+devalue');

			const value = devalue.parse(await res.text(), {
				URL: (href) => new URL(href),
			});
			assert.ok(value.date instanceof Date);
			assert.ok(value.set instanceof Set);
		});

		it('Supports discriminated union for different form fields', async () => {
			const formData = new FormData();
			formData.set('type', 'first-chunk');
			formData.set('alt', 'Cool image');
			formData.set('image', new File([''], 'chunk-1.png'));
			const reqFirst = new Request('http://example.com/base/_actions/imageUploadInChunks', {
				method: 'POST',
				body: formData,
			});

			const resFirst = await app.render(reqFirst);
			assert.equal(resFirst.status, 200);
			assert.equal(resFirst.headers.get('Content-Type'), 'application/json+devalue');
			const data = devalue.parse(await resFirst.text());
			const uploadId = data?.uploadId;
			assert.ok(uploadId);

			const formDataRest = new FormData();
			formDataRest.set('type', 'rest-chunk');
			formDataRest.set('uploadId', 'fake');
			formDataRest.set('image', new File([''], 'chunk-2.png'));
			const reqRest = new Request('http://example.com/base/_actions/imageUploadInChunks', {
				method: 'POST',
				body: formDataRest,
			});

			const resRest = await app.render(reqRest);
			assert.equal(resRest.status, 200);
			assert.equal(resRest.headers.get('Content-Type'), 'application/json+devalue');
			const dataRest = devalue.parse(await resRest.text());
			assert.equal('fake', dataRest?.uploadId);
		});

		it('Handles special characters in action names', async () => {
			for (const name of ['with%2Fslash', 'with%20space', 'with%2Edot']) {
				const req = new Request(`http://example.com/base/_actions/${name}`, {
					method: 'POST',
					body: JSON.stringify({ name: 'ben' }),
					headers: {
						'Content-Type': 'application/json',
					},
				});
				const res = await app.render(req);
				assert.equal(res.ok, true);
				const text = await res.text();
				assert.equal(res.headers.get('Content-Type'), 'application/json+devalue');
				const data = devalue.parse(text);
				assert.equal(data, 'Hello, ben!');
			}
		});
	});
});

/**
 * Follow an expected redirect response.
 *
 * @param {Request} req
 * @param {*} app
 * @returns {Promise<Response>}
 */
async function followExpectedRedirect(req, app) {
	const redirect = await app.render(req, { addCookieHeader: true });
	assert.ok(
		REDIRECT_STATUS_CODES.includes(redirect.status),
		`Expected redirect status, got ${redirect.status}`,
	);

	const redirectUrl = new URL(redirect.headers.get('Location'), req.url);
	const redirectReq = new Request(redirectUrl, {
		headers: {
			Cookie: redirect.headers.get('Set-Cookie'),
		},
	});
	return app.render(redirectReq);
}
