import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";

export const revalidate = 3600;

export async function generateStaticParams() {
  const db = await getDb();
  const result = await db.query("SELECT slug FROM posts WHERE status = 'published'");
  return result.rows.map((row) => ({ slug: row[0] as string }));
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await getDb();

  const postResult = await db.query(
    `SELECT p.id, p.title, p.content, p.published_at, p.updated_at,
            a.name AS author_name, a.slug AS author_slug, a.bio AS author_bio
     FROM posts p
     JOIN authors a ON a.id = p.author_id
     WHERE p.slug = ? AND p.status = 'published'`,
    [slug]
  );

  if (postResult.rows.length === 0) notFound();

  const row = postResult.rows[0];
  const post = {
    id: row[0] as number,
    title: row[1] as string,
    content: row[2] as string,
    published_at: row[3] as string,
    updated_at: row[4] as string,
    author_name: row[5] as string,
    author_slug: row[6] as string,
    author_bio: row[7] as string,
  };

  const catResult = await db.query(
    `SELECT c.name, c.slug FROM categories c
     JOIN post_categories pc ON pc.category_id = c.id
     WHERE pc.post_id = ?`,
    [post.id]
  );
  const categories = catResult.rows.map((r) => ({ name: r[0] as string, slug: r[1] as string }));

  return (
    <article>
      <h1>{post.title}</h1>
      <p style={{ color: "#666", fontSize: "0.9rem" }}>
        By{" "}
        <a href={`/authors/${post.author_slug}`} style={{ color: "#0070f3" }}>
          {post.author_name}
        </a>{" "}
        &middot; {new Date(post.published_at).toLocaleDateString()}
      </p>
      {categories.length > 0 && (
        <p style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {categories.map((cat) => (
            <a
              key={cat.slug}
              href={`/categories/${cat.slug}`}
              style={{
                background: "#f0f0f0",
                padding: "0.25rem 0.75rem",
                borderRadius: "1rem",
                fontSize: "0.85rem",
                textDecoration: "none",
                color: "#444",
              }}
            >
              {cat.name}
            </a>
          ))}
        </p>
      )}
      <div style={{ lineHeight: 1.7, marginTop: "2rem" }}>
        {post.content.split("\n\n").map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>
    </article>
  );
}
