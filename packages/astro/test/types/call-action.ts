import { describe, it } from 'node:test';
import { expectTypeOf } from 'expect-type';
import { type ActionReturnType, defineAction } from '../../dist/actions/runtime/virtual/server.js';
import type { APIContext } from '../../dist/types/public/context.js';
import { z } from '../../zod.mjs';

describe('Astro.callAction', () => {
	it('Infers JSON action result on callAction', async () => {
		const context: APIContext = {} as any;
		const action = defineAction({
			input: z.object({
				name: z.string(),
			}),
			handler: async ({ name }) => {
				return { name };
			},
		});
		const result = await context.callAction(action, { name: 'Ben' });
		expectTypeOf<typeof result>().toEqualTypeOf<ActionReturnType<typeof action>>();
	});

	it('Infers form action result on callAction', async () => {
		const context: APIContext = {} as any;
		const action = defineAction({
			accept: 'form',
			input: z.object({
				name: z.string(),
			}),
			handler: async ({ name }) => {
				return { name };
			},
		});
		const result = await context.callAction(action, new FormData());
		expectTypeOf<typeof result>().toEqualTypeOf<ActionReturnType<typeof action>>();
	});

	it('Infers orThrow action result on callAction', async () => {
		const context: APIContext = {} as any;
		const action = defineAction({
			accept: 'form',
			input: z.object({
				name: z.string(),
			}),
			handler: async ({ name }) => {
				return { name };
			},
		});
		const result = await context.callAction(action.orThrow, new FormData());
		expectTypeOf<typeof result>().toEqualTypeOf<ActionReturnType<(typeof action)['orThrow']>>();
	});
});
