import { createDb } from "@tursodatabase/vercel-experimental";

export async function getDb() {
  return createDb(process.env.TURSO_DATABASE!, {
    bootstrapStrategy: {
      kind: "query",
      query:
        "SELECT slug FROM posts WHERE status = 'published' UNION ALL SELECT slug FROM authors UNION ALL SELECT slug FROM categories",
    },
  });
}
