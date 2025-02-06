import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createOutgoingHttpHeaders } from '../../../dist/core/app/createOutgoingHttpHeaders.js';

describe('createOutgoingHttpHeaders', () => {
	it('undefined input headers', async () => {
		const result = createOutgoingHttpHeaders(undefined);
		assert.equal(result, undefined);
	});

	it('null input headers', async () => {
		const result = createOutgoingHttpHeaders(undefined);
		assert.equal(result, undefined);
	});

	it('Empty Headers', async () => {
		const headers = new Headers();
		const result = createOutgoingHttpHeaders(headers);
		assert.equal(result, undefined);
	});

	it('Headers with single key', async () => {
		const headers = new Headers();
		headers.append('x-test', 'hello world');
		const result = createOutgoingHttpHeaders(headers);
		assert.deepEqual(result, { 'x-test': 'hello world' });
	});

	it('Headers with multiple keys', async () => {
		const headers = new Headers();
		headers.append('x-test1', 'hello');
		headers.append('x-test2', 'world');
		const result = createOutgoingHttpHeaders(headers);
		assert.deepEqual(result, { 'x-test1': 'hello', 'x-test2': 'world' });
	});

	it('Headers with multiple values (not set-cookie)', async () => {
		const headers = new Headers();
		headers.append('x-test', 'hello');
		headers.append('x-test', 'world');
		const result = createOutgoingHttpHeaders(headers);
		assert.deepEqual(result, { 'x-test': 'hello, world' });
	});

	it('Headers with multiple values (set-cookie special case)', async () => {
		const headers = new Headers();
		headers.append('set-cookie', 'hello');
		headers.append('set-cookie', 'world');
		const result = createOutgoingHttpHeaders(headers);
		assert.deepEqual(result, { 'set-cookie': ['hello', 'world'] });
	});

	it('Headers with multiple values (set-cookie case handling)', async () => {
		const headers = new Headers();
		headers.append('Set-cookie', 'hello');
		headers.append('Set-Cookie', 'world');
		const result = createOutgoingHttpHeaders(headers);
		assert.deepEqual(result, { 'set-cookie': ['hello', 'world'] });
	});

	it('Headers with all use cases', async () => {
		const headers = new Headers();
		headers.append('x-single', 'single');
		headers.append('x-triple', 'one');
		headers.append('x-triple', 'two');
		headers.append('x-triple', 'three');
		headers.append('Set-cookie', 'hello');
		headers.append('Set-Cookie', 'world');
		const result = createOutgoingHttpHeaders(headers);
		assert.deepEqual(result, {
			'x-single': 'single',
			'x-triple': 'one, two, three',
			'set-cookie': ['hello', 'world'],
		});
	});
});
