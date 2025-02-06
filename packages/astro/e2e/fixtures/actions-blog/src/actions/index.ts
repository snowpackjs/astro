import { db, Comment, Likes, eq, sql } from 'astro:db';
import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { getCollection } from 'astro:content';

export const server = {
	logout: defineAction({
		handler: async () => {
			await new Promise((r) => setTimeout(r, 500));
		},
	}),
	blog: {
		like: defineAction({
			input: z.object({ postId: z.string() }),
			handler: async ({ postId }) => {
				await new Promise((r) => setTimeout(r, 500));

				const { likes } = await db
					.update(Likes)
					.set({
						likes: sql`likes + 1`,
					})
					.where(eq(Likes.postId, postId))
					.returning()
					.get();

				return likes;
			},
		}),

		comment: defineAction({
			accept: 'form',
			input: z.object({
				postId: z.string(),
				author: z.string(),
				body: z.string().min(10),
			}),
			handler: async ({ postId, author, body }) => {
				if (!(await getCollection('blog')).find((b) => b.id === postId)) {
					throw new ActionError({
						code: 'NOT_FOUND',
						message: 'Post not found',
					});
				}

				const comment = await db
					.insert(Comment)
					.values({
						postId,
						body,
						author,
					})
					.returning()
					.get();
				return comment;
			},
		}),

		lotsOfStuff: defineAction({
			accept: 'form',
			input: z.object({
				one: z.string().min(3),
				two: z.string().min(3),
				three: z.string().min(3),
				four: z.string().min(3),
				five: z.string().min(3),
				six: z.string().min(3),
				seven: z.string().min(3),
				eight: z.string().min(3),
				nine: z.string().min(3),
				ten: z.string().min(3),
			}),
			handler(form) {
				return form;
			},
		}),
	},
	sum: defineAction({
		accept: 'form',
		input: z.object({
			a: z.number(),
			b: z.number(),
		}),
		async handler({ a, b }) {
			return a + b;
		},
	}),
};
