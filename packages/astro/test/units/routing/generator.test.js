import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getRouteGenerator } from '../../../dist/core/routing/manifest/generator.js';

describe('routing - generator', () => {
	[
		{
			routeData: [],
			trailingSlash: 'never',
			params: {},
			path: '/',
		},
		{
			routeData: [],
			trailingSlash: 'always',
			params: {},
			path: '/',
		},
		{
			routeData: [[{ spread: false, content: 'test', dynamic: false }]],
			trailingSlash: 'never',
			params: {},
			path: '/test',
		},
		{
			routeData: [[{ spread: false, content: 'test', dynamic: false }]],
			trailingSlash: 'always',
			params: {},
			path: '/test/',
		},
		{
			routeData: [[{ spread: false, content: 'test', dynamic: false }]],
			trailingSlash: 'always',
			params: { foo: 'bar' },
			path: '/test/',
		},
		{
			routeData: [[{ spread: false, content: 'foo', dynamic: true }]],
			trailingSlash: 'always',
			params: { foo: 'bar' },
			path: '/bar/',
		},
		{
			routeData: [[{ spread: false, content: 'foo', dynamic: true }]],
			trailingSlash: 'never',
			params: { foo: 'bar' },
			path: '/bar',
		},
		{
			routeData: [[{ spread: true, content: '...foo', dynamic: true }]],
			trailingSlash: 'never',
			params: {},
			path: '/',
		},
		{
			routeData: [
				[
					{ spread: true, content: '...foo', dynamic: true },
					{ spread: false, content: '-', dynamic: false },
					{ spread: true, content: '...bar', dynamic: true },
				],
			],
			trailingSlash: 'never',
			params: { foo: 'one', bar: 'two' },
			path: '/one-two',
		},
		{
			routeData: [
				[
					{ spread: true, content: '...foo', dynamic: true },
					{ spread: false, content: '-', dynamic: false },
					{ spread: true, content: '...bar', dynamic: true },
				],
			],
			trailingSlash: 'never',
			params: {},
			path: '/-',
		},
		{
			routeData: [
				[{ spread: true, content: '...foo', dynamic: true }],
				[{ spread: true, content: '...bar', dynamic: true }],
			],
			trailingSlash: 'never',
			params: { foo: 'one' },
			path: '/one',
		},
		{
			routeData: [
				[{ spread: false, content: 'fix', dynamic: false }],
				[{ spread: true, content: '...foo', dynamic: true }],
				[{ spread: true, content: '...bar', dynamic: true }],
			],
			trailingSlash: 'never',
			params: { foo: 'one' },
			path: '/fix/one',
		},
		{
			routeData: [
				[{ spread: false, content: 'fix', dynamic: false }],
				[{ spread: true, content: '...foo', dynamic: true }],
				[{ spread: true, content: '...bar', dynamic: true }],
			],
			trailingSlash: 'always',
			params: { foo: 'one' },
			path: '/fix/one/',
		},
		{
			routeData: [
				[{ spread: false, content: 'fix', dynamic: false }],
				[{ spread: true, content: '...foo', dynamic: true }],
				[{ spread: true, content: '...bar', dynamic: true }],
			],
			trailingSlash: 'never',
			params: { foo: 'one', bar: 'two' },
			path: '/fix/one/two',
		},
		{
			routeData: [
				[{ spread: false, content: 'fix', dynamic: false }],
				[{ spread: true, content: '...foo', dynamic: true }],
				[{ spread: true, content: '...bar', dynamic: true }],
			],
			trailingSlash: 'never',
			params: { foo: 'one&two' },
			path: '/fix/one&two',
		},
		{
			routeData: [
				[{ spread: false, content: 'fix', dynamic: false }],
				[{ spread: false, content: 'page', dynamic: true }],
			],
			trailingSlash: 'never',
			params: { page: 1 },
			path: '/fix/1',
		},
	].forEach(({ routeData, trailingSlash, params, path }) => {
		it(`generates ${path}`, () => {
			const generator = getRouteGenerator(routeData, trailingSlash);
			assert.equal(generator(params), path);
		});
	});

	it('should throw an error when a dynamic parameter is missing', () => {
		const generator = getRouteGenerator(
			[[{ spread: false, content: 'foo', dynamic: true }]],
			'never',
		);
		assert.throws(() => generator({}), TypeError);
	});
});
