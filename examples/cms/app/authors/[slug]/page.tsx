import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";

export const revalidate = 3600;

export async function generateStaticParams() {
  const db = await getDb();
  const result = await db.query("SELECT slug FROM authors");
  return result.rows.map((row) => ({ slug: row[0] as string }));
}

export default async function AuthorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await getDb();

  const authorResult = await db.query("SELECT id, name, bio FROM authors WHERE slug = ?", [slug]);
  if (authorResult.rows.length === 0) notFound();

  const author = {
    id: authorResult.rows[0][0] as number,
    name: authorResult.rows[0][1] as string,
    bio: authorResult.rows[0][2] as string,
  };

  const postsResult = await db.query(
    `SELECT p.slug, p.title, p.excerpt, p.published_at
     FROM posts p
     WHERE p.author_id = ? AND p.status = 'published'
     ORDER BY p.published_at DESC`,
    [author.id]
  );

  const posts = postsResult.rows.map((row) => ({
    slug: row[0] as string,
    title: row[1] as string,
    excerpt: row[2] as string,
    published_at: row[3] as string,
  }));

  return (
    <div>
      <h1>{author.name}</h1>
      <p style={{ color: "#666", maxWidth: 600 }}>{author.bio}</p>
      <h2>Posts ({posts.length})</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        {posts.map((post) => (
          <article key={post.slug} style={{ borderBottom: "1px solid #eee", paddingBottom: "1.5rem" }}>
            <h3 style={{ margin: "0 0 0.5rem" }}>
              <a href={`/posts/${post.slug}`} style={{ textDecoration: "none", color: "#1a1a1a" }}>
                {post.title}
              </a>
            </h3>
            <p style={{ margin: "0 0 0.5rem", color: "#666", fontSize: "0.9rem" }}>
              {new Date(post.published_at).toLocaleDateString()}
            </p>
            <p style={{ margin: 0, color: "#444" }}>{post.excerpt}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
