"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";

export async function createPost(formData: FormData) {
  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const content = formData.get("content") as string;
  const excerpt = formData.get("excerpt") as string;
  const authorId = Number(formData.get("author_id"));
  const status = formData.get("status") as string;
  const categoryIds = formData.getAll("categories").map(Number);

  const db = await getDb();

  await db.execute(
    `INSERT INTO posts (slug, title, content, excerpt, status, author_id, published_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
    [slug, title, content, excerpt, status, authorId, status === "published" ? new Date().toISOString() : null]
  );

  // Get the inserted post id
  const result = await db.query("SELECT id FROM posts WHERE slug = ?", [slug]);
  const postId = result.rows[0][0] as number;

  for (const catId of categoryIds) {
    await db.execute("INSERT INTO post_categories (post_id, category_id) VALUES (?, ?)", [postId, catId]);
  }

  await db.close();

  revalidatePath("/");
  redirect("/admin");
}

export async function updatePost(formData: FormData) {
  const id = Number(formData.get("id"));
  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const content = formData.get("content") as string;
  const excerpt = formData.get("excerpt") as string;
  const authorId = Number(formData.get("author_id"));
  const status = formData.get("status") as string;
  const categoryIds = formData.getAll("categories").map(Number);

  const db = await getDb();

  // Check if we need to set published_at
  const existing = await db.query("SELECT status, published_at FROM posts WHERE id = ?", [id]);
  const wasPublished = existing.rows[0]?.[0] === "published";
  const existingPublishedAt = existing.rows[0]?.[1] as string | null;
  const publishedAt =
    status === "published" && !wasPublished
      ? new Date().toISOString()
      : existingPublishedAt;

  await db.execute(
    `UPDATE posts SET slug = ?, title = ?, content = ?, excerpt = ?, status = ?,
     author_id = ?, published_at = ?, updated_at = datetime('now')
     WHERE id = ?`,
    [slug, title, content, excerpt, status, authorId, publishedAt, id]
  );

  // Replace categories
  await db.execute("DELETE FROM post_categories WHERE post_id = ?", [id]);
  for (const catId of categoryIds) {
    await db.execute("INSERT INTO post_categories (post_id, category_id) VALUES (?, ?)", [id, catId]);
  }

  await db.close();

  revalidatePath("/");
  redirect("/admin");
}
