import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import testAdapter from './test-adapter.js';
import { loadFixture } from './test-utils.js';

describe('CSRF origin check', () => {
	let app;

	before(async () => {
		const fixture = await loadFixture({
			root: './fixtures/csrf-check-origin/',
			adapter: testAdapter(),
		});
		await fixture.build();
		app = await fixture.loadTestAdapterApp();
	});

	it("return 403 when the origin doesn't match and calling a POST", async () => {
		let request;
		let response;
		request = new Request('http://example.com/api/', {
			headers: { origin: 'http://loreum.com', 'content-type': 'multipart/form-data' },
			method: 'POST',
		});
		response = await app.render(request);
		assert.equal(response.status, 403);

		// case where content-type has different casing
		request = new Request('http://example.com/api/', {
			headers: { origin: 'http://loreum.com', 'content-type': 'MULTIPART/FORM-DATA' },
			method: 'POST',
		});
		response = await app.render(request);
		assert.equal(response.status, 403);

		request = new Request('http://example.com/api/', {
			headers: { origin: 'http://loreum.com', 'content-type': 'application/x-www-form-urlencoded' },
			method: 'POST',
		});
		response = await app.render(request);
		assert.equal(response.status, 403);

		request = new Request('http://example.com/api/', {
			headers: { origin: 'http://loreum.com', 'content-type': 'text/plain' },
			method: 'POST',
		});
		response = await app.render(request);
		assert.equal(response.status, 403);

		request = new Request('http://example.com/api/', {
			headers: {
				origin: 'http://loreum.com',
				'content-type': 'application/x-www-form-urlencoded; some-other-value',
			},
			method: 'POST',
		});
		response = await app.render(request);
		assert.equal(response.status, 403);

		request = new Request('http://example.com/api/', {
			headers: { origin: 'http://loreum.com' },
			method: 'POST',
			credentials: 'include',
			body: new Blob(['a=b'], {}),
		});
		response = await app.render(request);
		assert.equal(response.status, 403);
	});

	it("return 403 when the origin doesn't match and calling a PUT", async () => {
		let request;
		let response;
		request = new Request('http://example.com/api/', {
			headers: { origin: 'http://loreum.com', 'content-type': 'multipart/form-data' },
			method: 'PUT',
		});
		response = await app.render(request);
		assert.equal(response.status, 403);

		request = new Request('http://example.com/api/', {
			headers: { origin: 'http://loreum.com', 'content-type': 'application/x-www-form-urlencoded' },
			method: 'PUT',
		});
		response = await app.render(request);
		assert.equal(response.status, 403);

		request = new Request('http://example.com/api/', {
			headers: { origin: 'http://loreum.com', 'content-type': 'text/plain' },
			method: 'PUT',
		});
		response = await app.render(request);
		assert.equal(response.status, 403);
	});

	it("return 403 when the origin doesn't match and calling a DELETE", async () => {
		let request;
		let response;
		request = new Request('http://example.com/api/', {
			headers: { origin: 'http://loreum.com', 'content-type': 'multipart/form-data' },
			method: 'DELETE',
		});
		response = await app.render(request);
		assert.equal(response.status, 403);

		request = new Request('http://example.com/api/', {
			headers: { origin: 'http://loreum.com', 'content-type': 'application/x-www-form-urlencoded' },
			method: 'DELETE',
		});
		response = await app.render(request);
		assert.equal(response.status, 403);

		request = new Request('http://example.com/api/', {
			headers: { origin: 'http://loreum.com', 'content-type': 'text/plain' },
			method: 'DELETE',
		});
		response = await app.render(request);
		assert.equal(response.status, 403);
	});

	it("return 403 when the origin doesn't match and calling a PATCH", async () => {
		let request;
		let response;
		request = new Request('http://example.com/api/', {
			headers: { origin: 'http://loreum.com', 'content-type': 'multipart/form-data' },
			method: 'PATCH',
		});
		response = await app.render(request);
		assert.equal(response.status, 403);

		request = new Request('http://example.com/api/', {
			headers: { origin: 'http://loreum.com', 'content-type': 'application/x-www-form-urlencoded' },
			method: 'PATCH',
		});
		response = await app.render(request);
		assert.equal(response.status, 403);

		request = new Request('http://example.com/api/', {
			headers: { origin: 'http://loreum.com', 'content-type': 'text/plain' },
			method: 'PATCH',
		});
		response = await app.render(request);
		assert.equal(response.status, 403);
	});

	it("return a 200 when the origin doesn't match but calling a GET", async () => {
		let request;
		let response;
		request = new Request('http://example.com/api/', {
			headers: { origin: 'http://loreum.com', 'content-type': 'multipart/form-data' },
			method: 'GET',
		});
		response = await app.render(request);
		assert.equal(response.status, 200);
		assert.deepEqual(await response.json(), {
			something: 'true',
		});

		request = new Request('http://example.com/api/', {
			headers: { origin: 'http://loreum.com', 'content-type': 'application/x-www-form-urlencoded' },
			method: 'GET',
		});
		response = await app.render(request);
		assert.equal(response.status, 200);
		assert.deepEqual(await response.json(), {
			something: 'true',
		});

		request = new Request('http://example.com/api/', {
			headers: { origin: 'http://loreum.com', 'content-type': 'text/plain' },
			method: 'GET',
		});
		response = await app.render(request);
		assert.equal(response.status, 200);
		assert.deepEqual(await response.json(), {
			something: 'true',
		});
	});

	it('return 200 when calling POST/PUT/DELETE/PATCH with the correct origin', async () => {
		let request;
		let response;
		request = new Request('http://example.com/api/', {
			headers: { origin: 'http://example.com', 'content-type': 'multipart/form-data' },
			method: 'POST',
		});
		response = await app.render(request);
		assert.equal(response.status, 200);
		assert.deepEqual(await response.json(), {
			something: 'true',
		});

		request = new Request('http://example.com/api/', {
			headers: {
				origin: 'http://example.com',
				'content-type': 'application/x-www-form-urlencoded',
			},
			method: 'PUT',
		});
		response = await app.render(request);
		assert.equal(response.status, 200);
		assert.deepEqual(await response.json(), {
			something: 'true',
		});

		request = new Request('http://example.com/api/', {
			headers: { origin: 'http://example.com', 'content-type': 'text/plain' },
			method: 'PATCH',
		});
		response = await app.render(request);
		assert.equal(response.status, 200);
		assert.deepEqual(await response.json(), {
			something: 'true',
		});
	});
});
