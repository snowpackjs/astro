import { db, Comment, Likes, eq, sql } from 'astro:db';
import { defineAction, defineFormAction, z } from 'astro:actions';

export const server = {
	blog: {
		like: defineAction({
			input: z.object({ postId: z.string() }),
			handler: async ({ postId }) => {
				await new Promise((r) => setTimeout(r, 200));

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

		comment: defineFormAction({
			input: z.object({
				postId: z.string(),
				author: z.string(),
				body: z.string().min(50),
			}),
			handler: async ({ postId, author, body }) => {
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
	},
};
