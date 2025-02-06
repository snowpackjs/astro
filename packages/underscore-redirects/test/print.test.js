import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Redirects } from '../dist/index.js';

describe('Printing', () => {
	it('Formats long lines in a pretty way', () => {
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
			input: '/some-pretty-long-input-line',
			target: '/b',
			weight: 0,
			status: 200,
		});
		let out = _redirects.print();

		let [lineOne, lineTwo] = out.split('\n');

		const indexLineOne = lineOne.indexOf('/b');
		const indexLineTwo = lineTwo.indexOf('/b');
		assert.equal(indexLineOne, indexLineTwo, 'destinations lined up');

		const newIndexLineOne = lineOne.indexOf('200');
		const newIndexLineTwo = lineTwo.indexOf('200');
		assert.equal(newIndexLineOne, newIndexLineTwo, 'statuses lined up');
	});

	it('Properly prints dynamic routes', () => {
		const _redirects = new Redirects();
		_redirects.add({
			dynamic: true,
			input: '/pets/:cat',
			target: '/pets/:cat/index.html',
			status: 200,
			weight: 1,
		});
		let out = _redirects.print();
		let parts = out.split(/\s+/);

		const expectedParts = ['/pets/:cat', '/pets/:cat/index.html', '200'];
		assert.deepEqual(parts, expectedParts);
	});

	it('Properly handles force redirects', () => {
		const _redirects = new Redirects();
		_redirects.add({
			dynamic: false,
			input: '/a',
			target: '/b',
			status: 200,
			weight: 1,
			force: true,
		});
		let out = _redirects.print();
		let parts = out.split(/\s+/);

		const expectedParts = ['/a', '/b', '200!'];
		assert.deepEqual(parts, expectedParts);
	});
});
