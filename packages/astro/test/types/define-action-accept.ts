import { describe, it } from 'node:test';
import { expectTypeOf } from 'expect-type';
import { defineAction } from '../../dist/actions/runtime/virtual/server.js';
import { z } from '../../zod.mjs';

describe('defineAction accept', () => {
	it('accepts type `any` when input is omitted with accept json', async () => {
		const action = defineAction({
			handler: () => {},
		});
		expectTypeOf(action).parameter(0).toBeAny();
		expectTypeOf(action).parameter(0).not.toEqualTypeOf<FormData>();

		const jsonAction = defineAction({
			accept: 'json',
			handler: () => {},
		});
		expectTypeOf(jsonAction).parameter(0).toBeAny();
		expectTypeOf(jsonAction).parameter(0).not.toEqualTypeOf<FormData>();
	});
	it('accepts type `FormData` when input is omitted with accept form', async () => {
		const action = defineAction({
			accept: 'form',
			handler: () => {},
		});
		expectTypeOf(action).parameter(0).toEqualTypeOf<FormData>();
	});

	it('accept type safe values for input with accept json', async () => {
		const action = defineAction({
			input: z.object({ name: z.string() }),
			handler: () => {},
		});
		expectTypeOf(action).parameter(0).toEqualTypeOf<{ name: string }>();
	});

	it('accepts type `FormData` for all inputs with accept form', async () => {
		const action = defineAction({
			accept: 'form',
			input: z.object({ name: z.string() }),
			handler: () => {},
		});
		expectTypeOf(action).parameter(0).toEqualTypeOf<FormData>();
	});
});
