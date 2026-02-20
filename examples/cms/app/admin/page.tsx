import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const db = await getDb();

  const result = await db.query(
    `SELECT p.id, p.title, p.slug, p.status, p.published_at, a.name AS author_name
     FROM posts p
     JOIN authors a ON a.id = p.author_id
     ORDER BY p.updated_at DESC`
  );

  const posts = result.rows.map((row) => ({
    id: row[0] as number,
    title: row[1] as string,
    slug: row[2] as string,
    status: row[3] as string,
    published_at: row[4] as string | null,
    author_name: row[5] as string,
  }));

  await db.close();

  return (
    <div>
      <h1>All Posts</h1>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #e5e5e5", textAlign: "left" }}>
            <th style={{ padding: "0.5rem" }}>Title</th>
            <th style={{ padding: "0.5rem" }}>Author</th>
            <th style={{ padding: "0.5rem" }}>Status</th>
            <th style={{ padding: "0.5rem" }}>Published</th>
            <th style={{ padding: "0.5rem" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr key={post.id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: "0.5rem" }}>
                <a href={`/posts/${post.slug}`} style={{ color: "#0070f3" }}>
                  {post.title}
                </a>
              </td>
              <td style={{ padding: "0.5rem" }}>{post.author_name}</td>
              <td style={{ padding: "0.5rem" }}>
                <span
                  style={{
                    background: post.status === "published" ? "#e6f4ea" : "#fef7e0",
                    color: post.status === "published" ? "#1e7e34" : "#856404",
                    padding: "0.15rem 0.5rem",
                    borderRadius: "0.25rem",
                    fontSize: "0.85rem",
                  }}
                >
                  {post.status}
                </span>
              </td>
              <td style={{ padding: "0.5rem", color: "#666", fontSize: "0.9rem" }}>
                {post.published_at ? new Date(post.published_at).toLocaleDateString() : "—"}
              </td>
              <td style={{ padding: "0.5rem" }}>
                <a href={`/admin/posts/${post.id}/edit`} style={{ color: "#0070f3" }}>
                  Edit
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
