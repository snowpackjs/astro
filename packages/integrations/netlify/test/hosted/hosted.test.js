import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';

const NETLIFY_TEST_URL = 'https://curious-boba-495d6d.netlify.app';

describe('Hosted Netlify Tests', () => {
	it('Image endpoint works', async () => {
		const image = await fetch(
			`${NETLIFY_TEST_URL}/_image?href=%2F_astro%2Fpenguin.e9c64733.png&w=300&f=webp`,
		);

		assert.equal(image.status, 200);
	});

	it('passes context from edge middleware', async () => {
		const response = await fetch(`${NETLIFY_TEST_URL}/country`);
		const body = await response.text();
		assert.match(body, /has context/);
		assert.match(body, /Deno/);
	});

	it('Server returns fresh content', async () => {
		const responseOne = await fetch(`${NETLIFY_TEST_URL}/time`).then((res) => res.text());

		const responseTwo = await fetch(`${NETLIFY_TEST_URL}/time`).then((res) => res.text());

		assert.notEqual(responseOne.body, responseTwo.body);
	});
});
