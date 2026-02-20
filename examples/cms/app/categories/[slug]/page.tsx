import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";

export const revalidate = 3600;

export async function generateStaticParams() {
  const db = await getDb();
  const result = await db.query("SELECT slug FROM categories");
  return result.rows.map((row) => ({ slug: row[0] as string }));
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await getDb();

  const catResult = await db.query("SELECT id, name FROM categories WHERE slug = ?", [slug]);
  if (catResult.rows.length === 0) notFound();

  const category = { id: catResult.rows[0][0] as number, name: catResult.rows[0][1] as string };

  const postsResult = await db.query(
    `SELECT p.slug, p.title, p.excerpt, p.published_at, a.name AS author_name, a.slug AS author_slug
     FROM posts p
     JOIN authors a ON a.id = p.author_id
     JOIN post_categories pc ON pc.post_id = p.id
     WHERE pc.category_id = ? AND p.status = 'published'
     ORDER BY p.published_at DESC`,
    [category.id]
  );

  const posts = postsResult.rows.map((row) => ({
    slug: row[0] as string,
    title: row[1] as string,
    excerpt: row[2] as string,
    published_at: row[3] as string,
    author_name: row[4] as string,
    author_slug: row[5] as string,
  }));

  return (
    <div>
      <h1>Category: {category.name}</h1>
      <p style={{ color: "#666" }}>{posts.length} post{posts.length !== 1 ? "s" : ""}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        {posts.map((post) => (
          <article key={post.slug} style={{ borderBottom: "1px solid #eee", paddingBottom: "1.5rem" }}>
            <h2 style={{ margin: "0 0 0.5rem" }}>
              <a href={`/posts/${post.slug}`} style={{ textDecoration: "none", color: "#1a1a1a" }}>
                {post.title}
              </a>
            </h2>
            <p style={{ margin: "0 0 0.5rem", color: "#666", fontSize: "0.9rem" }}>
              By{" "}
              <a href={`/authors/${post.author_slug}`} style={{ color: "#0070f3" }}>
                {post.author_name}
              </a>{" "}
              &middot; {new Date(post.published_at).toLocaleDateString()}
            </p>
            <p style={{ margin: 0, color: "#444" }}>{post.excerpt}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
