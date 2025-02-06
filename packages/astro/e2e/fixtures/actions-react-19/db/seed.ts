import { db, Likes, Comment } from "astro:db";

// https://astro.build/db/seed
export default async function seed() {
  await db.insert(Likes).values({
    postId: "first-post.md",
    likes: 10,
  });

  await db.insert(Comment).values({
    postId: "first-post.md",
    author: "Alice",
    body: "Great post!",
  });
}
