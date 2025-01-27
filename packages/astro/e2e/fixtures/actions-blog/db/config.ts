import { column, defineDb, defineTable } from "astro:db";

const Comment = defineTable({
  columns: {
    postId: column.text(),
    author: column.text(),
    body: column.text(),
  },
});

const Likes = defineTable({
  columns: {
    postId: column.text(),
    likes: column.number(),
  },
});

// https://astro.build/db/config
export default defineDb({
  tables: { Comment, Likes },
});
