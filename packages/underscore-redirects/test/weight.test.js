import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Redirects } from '../dist/index.js';

describe('Weight', () => {
	it('Puts higher weighted definitions on top', () => {
		const _redirects = new Redirects();
		_redirects.add({
			dynamic: false,
			input: '/a',
			target: '/b',
			weight: 0,
			status: 200,
		});
		_redirects.add({
			dynamic: false,
			input: '/c',
			target: '/d',
			weight: 0,
			status: 200,
		});
		_redirects.add({
			dynamic: false,
			input: '/e',
			target: '/f',
			weight: 1,
			status: 200,
		});
		const firstDefn = _redirects.definitions[0];
		assert.equal(firstDefn.weight, 1);
		assert.equal(firstDefn.input, '/e');
	});
});
