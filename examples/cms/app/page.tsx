import { getDb } from "@/lib/db";

export const revalidate = 3600;

export default async function HomePage() {
  const db = await getDb();
  const result = await db.query(
    `SELECT p.slug, p.title, p.excerpt, p.published_at, a.name AS author_name, a.slug AS author_slug
     FROM posts p
     JOIN authors a ON a.id = p.author_id
     WHERE p.status = 'published'
     ORDER BY p.published_at DESC
     LIMIT 20`
  );

  const posts = result.rows.map((row) => ({
    slug: row[0] as string,
    title: row[1] as string,
    excerpt: row[2] as string,
    published_at: row[3] as string,
    author_name: row[4] as string,
    author_slug: row[5] as string,
  }));

  return (
    <div>
      <h1>Latest Posts</h1>
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
