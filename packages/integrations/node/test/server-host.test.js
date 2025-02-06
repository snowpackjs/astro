import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { hostOptions } from '../dist/standalone.js';

describe('host', () => {
	it('returns "0.0.0.0" when host is true', () => {
		const options = { host: true };
		assert.equal(hostOptions(options.host), '0.0.0.0');
	});

	it('returns "localhost" when host is false', () => {
		const options = { host: false };
		assert.equal(hostOptions(options.host), 'localhost');
	});

	it('returns the value of host when host is a string', () => {
		const host = '1.1.1.1';
		const options = { host };
		assert.equal(hostOptions(options.host), host);
	});
});
