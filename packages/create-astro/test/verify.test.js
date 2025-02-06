import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { verify } from '../dist/index.js';
import { setup } from './utils.js';

describe('verify', async () => {
	const fixture = setup();
	const exit = (code) => {
		throw code;
	};

	it('basics', async () => {
		const context = { template: 'basics', exit };
		await verify(context);
		assert.equal(fixture.messages().length, 0, 'Did not expect `verify` to log any messages');
	});

	it('missing', async () => {
		const context = { template: 'missing', exit };
		let err = null;
		try {
			await verify(context);
		} catch (e) {
			err = e;
		}
		assert.equal(err, 1);
		assert.ok(!fixture.hasMessage('Template missing does not exist!'));
	});

	it('starlight', async () => {
		const context = { template: 'starlight', exit };
		await verify(context);
		assert.equal(fixture.messages().length, 0, 'Did not expect `verify` to log any messages');
	});

	it('starlight/tailwind', async () => {
		const context = { template: 'starlight/tailwind', exit };
		await verify(context);
		assert.equal(fixture.messages().length, 0, 'Did not expect `verify` to log any messages');
	});
});
