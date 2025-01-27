import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { GlobalConfig } from '../dist/config.js';

describe('GlobalConfig', () => {
	it('initializes when expected arguments are given', () => {
		const config = new GlobalConfig({ name: 'TEST_NAME' });
		assert(config instanceof GlobalConfig);
	});
});
