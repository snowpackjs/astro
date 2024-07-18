import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createRedirectsFromAstroRoutes } from '../dist/index.js';

describe('Astro', () => {
	const serverConfig = {
		output: 'server',
		build: { format: 'directory' },
	};

	it('Creates a Redirects object from routes', () => {
		const routeToDynamicTargetMap = new Map(
			Array.from([
				[
					{ pathname: '/', distURL: new URL('./index.html', import.meta.url), segments: [] },
					'./.adapter/dist/entry.mjs',
				],
				[
					{ pathname: '/one', distURL: new URL('./one/index.html', import.meta.url), segments: [] },
					'./.adapter/dist/entry.mjs',
				],
			])
		);
		const _redirects = createRedirectsFromAstroRoutes({
			config: serverConfig,
			routeToDynamicTargetMap,
			dir: new URL(import.meta.url),
		});

		assert.equal(_redirects.definitions.length, 2);
	});

	describe('Supports dynamic routes', () => {
		it('Supports renaming static parts: /old/[foo] -> /new/[foo]', () => {
			const routeToDynamicTargetMap = new Map(
				Array.from([
					[
						{
							
							route: '/old/[foo]',
							segments: [
								[{ content: 'old', dynamic: false, spread: false }],
								[{ content: 'foo', dynamic: true, spread: false }],
							],
							redirect: '/new/[foo]',
							redirectRoute: {
								distURL: new URL('./index.html', import.meta.url),
								segments: [
									[{ content: 'new', dynamic: false, spread: false }],
									[{ content: 'foo', dynamic: true, spread: false }],
								],
							},
						},
						'./.adapter/dist/entry.mjs',
					],
				])
			);
			const _redirects = createRedirectsFromAstroRoutes({
				config: serverConfig,
				routeToDynamicTargetMap,
				dir: new URL(import.meta.url),
			});
			assert.deepEqual(_redirects.definitions,[
				{
					dynamic: true,
					input: '/old/:foo',
					target: '/new/:foo/index.html',
					status: 200,
					weight: 1
				}
			]);
		});

		it('Supports removing dynamic params: /old/[omit] -> /new', () => {
			const routeToDynamicTargetMap = new Map(
				Array.from([
					[
						{
							route: '/old/[omit]',
							segments: [[{ content: 'old', dynamic: false, spread: false }],
							[{ content: 'omit', dynamic: true, spread: false }]],
							redirect: '/new',
							
							redirectRoute: {
								distURL: new URL('./index.html', import.meta.url),
								segments: [[{ content: 'new', dynamic: false, spread: false }]],
							},
							
						},
						'./.adapter/dist/entry.mjs',
					],
				])
			);
			const _redirects = createRedirectsFromAstroRoutes({
				config: serverConfig,
				routeToDynamicTargetMap,
				dir: new URL(import.meta.url),
			});

			assert.deepEqual(_redirects.definitions,[
				{
					dynamic: true,
					input: '/old/:omit',
					target: '/new/index.html',
					status: 200,
					weight: 1
				}
			]);
		});

		it('Supports mapping dynamic params to a static value: /old/[foo]/ -> /new/1', () => {
			const routeToDynamicTargetMap = new Map(
				Array.from([
					[
						{
							route: '/old/[foo]',
							segments: [
								[{ content: 'old', dynamic: false, spread: false }],
								[{ content: 'foo', dynamic: true, spread: false }],
							],
							redirect: '/foo/1',
							redirectRoute: {
								distURL: new URL('./index.html', import.meta.url),
								segments: [
									[{ content: 'new', dynamic: false, spread: false }],
									[{ content: 'foo', dynamic: true, spread: false }],
								],
							},
						},
						'./.adapter/dist/entry.mjs',
					],
				])
			);
			const _redirects = createRedirectsFromAstroRoutes({
				config: serverConfig,
				routeToDynamicTargetMap,
				dir: new URL(import.meta.url),
			});

			assert.deepEqual(_redirects.definitions,[
				{
					dynamic: true,
					input: '/old/:foo',
					target: '/foo/1/index.html',
					status: 200,
					weight: 1
				}
			]);
		});


	});

	describe('Supports spread routes', () => {
		it('Supports renaming static parts: /old/[...bar] -> /new/[...bar]', () => {
			const routeToDynamicTargetMap = new Map(
				Array.from([
					[
						{
							route: '/old/[...bar]',
							segments: [
								[{ content: 'old', dynamic: false, spread: false }],
								[{ content: 'bar', dynamic: true, spread: true }],
							],
							redirect: '/new/[...bar]',
							redirectRoute: {
								distURL: new URL('./index.html', import.meta.url),
								segments: [
									[{ content: 'new', dynamic: false, spread: false }],
									[{ content: 'bar', dynamic: true, spread: true }],
								],
							},
						},
						'./.adapter/dist/entry.mjs',
					],
				])
			);
			const _redirects = createRedirectsFromAstroRoutes({
				config: serverConfig,
				routeToDynamicTargetMap,
				dir: new URL(import.meta.url),
			});


			assert.deepEqual(_redirects.definitions, [
				{
					dynamic: true,
					input: '/old/*',
					target: '/new/:splat/index.html',
					status: 200,
					weight: 1
				}
			]);
		});

		it('Supports removing spread params: /old/[...bar] -> /new', () => {
			const routeToDynamicTargetMap = new Map(
				Array.from([
					[
						{
							route: '/old/[...bar]',
							segments: [
								[{ content: 'old', dynamic: false, spread: false }],
								[{ content: 'bar', dynamic: true, spread: true }],
							],
							redirect: '/new',
							redirectRoute: {
								distURL: new URL('./index.html', import.meta.url),
								segments: [
									[{ content: 'new', dynamic: false, spread: false }],
								],
							},
						},
						'./.adapter/dist/entry.mjs',
					],
				])
			);
			const _redirects = createRedirectsFromAstroRoutes({
				config: serverConfig,
				routeToDynamicTargetMap,
				dir: new URL(import.meta.url),
			});


			assert.deepEqual(_redirects.definitions, [{
				dynamic: true,
				input: '/old/*',
				target: '/new/index.html',
				status: 200,
				weight: 1
			}]);
		});

		it('Supports mapping spread params to a static value: /old/[...bar] -> /new/1', () => {
			const routeToDynamicTargetMap = new Map(
				Array.from([
					[
						{
							route: '/old/[...bar]',
							segments: [
								[{ content: 'old', dynamic: false, spread: false }],
								[{ content: 'bar', dynamic: true, spread: true }],
							],
							redirect: '/new/1',
							redirectRoute: {
								distURL: new URL('./index.html', import.meta.url),
								segments: [
									[{ content: 'new', dynamic: false, spread: false }],
									[{ content: 'bar', dynamic: true, spread: true }],
								],
							},
						},
						'./.adapter/dist/entry.mjs',
					],
				])
			);
			const _redirects = createRedirectsFromAstroRoutes({
				config: serverConfig,
				routeToDynamicTargetMap,
				dir: new URL(import.meta.url),
			});

			assert.deepEqual(_redirects.definitions, [{
				dynamic: true,
				input: '/old/*',
				target: '/new/1/index.html',
				status: 200,
				weight: 1
			}]);
		});

		it('Supports appending spread params with a static value: /old/[...bar] -> /new/[...bar]/1', () => {
			const routeToDynamicTargetMap = new Map(
				Array.from([
					[
						{
							route: '/old/[...bar]',
							segments: [
								[{ content: 'old', dynamic: false, spread: false }],
								[{ content: 'bar', dynamic: true, spread: true }],
							],
							redirect: '/new/[...bar]/1',
							redirectRoute: {
								distURL: new URL('./index.html', import.meta.url),
								segments: [
									[{ content: 'new', dynamic: false, spread: false }],
									[{ content: 'bar', dynamic: true, spread: true }],
								],
							},
						},
						'./.adapter/dist/entry.mjs',
					],
				])
			);
			const _redirects = createRedirectsFromAstroRoutes({
				config: serverConfig,
				routeToDynamicTargetMap,
				dir: new URL(import.meta.url),
			});

			assert.deepEqual(_redirects.definitions, [{
				dynamic: true,
				input: '/old/*',
				target: '/new/:splat/1/index.html',
				status: 200,
				weight: 1
			}]);
		})
	})
});
