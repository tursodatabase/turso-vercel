import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { updatePost } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDb();

  const postResult = await db.query(
    "SELECT id, slug, title, content, excerpt, status, author_id FROM posts WHERE id = ?",
    [Number(id)]
  );
  if (postResult.rows.length === 0) {
    await db.close();
    notFound();
  }

  const post = {
    id: postResult.rows[0][0] as number,
    slug: postResult.rows[0][1] as string,
    title: postResult.rows[0][2] as string,
    content: postResult.rows[0][3] as string,
    excerpt: postResult.rows[0][4] as string,
    status: postResult.rows[0][5] as string,
    author_id: postResult.rows[0][6] as number,
  };

  const authorsResult = await db.query("SELECT id, name FROM authors ORDER BY name");
  const authors = authorsResult.rows.map((row) => ({ id: row[0] as number, name: row[1] as string }));

  const catsResult = await db.query("SELECT id, name FROM categories ORDER BY name");
  const categories = catsResult.rows.map((row) => ({ id: row[0] as number, name: row[1] as string }));

  const postCatsResult = await db.query("SELECT category_id FROM post_categories WHERE post_id = ?", [post.id]);
  const selectedCats = new Set(postCatsResult.rows.map((r) => r[0] as number));

  await db.close();

  return (
    <div>
      <h1>Edit Post</h1>
      <form action={updatePost} style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: 600 }}>
        <input type="hidden" name="id" value={post.id} />
        <label>
          Title
          <input name="title" required defaultValue={post.title} style={inputStyle} />
        </label>
        <label>
          Slug
          <input name="slug" required defaultValue={post.slug} style={inputStyle} />
        </label>
        <label>
          Excerpt
          <textarea name="excerpt" rows={2} defaultValue={post.excerpt} style={inputStyle} />
        </label>
        <label>
          Content
          <textarea name="content" rows={12} defaultValue={post.content} style={inputStyle} />
        </label>
        <label>
          Author
          <select name="author_id" required defaultValue={post.author_id} style={inputStyle}>
            {authors.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </label>
        <fieldset style={{ border: "1px solid #ddd", borderRadius: "0.25rem", padding: "0.75rem" }}>
          <legend>Categories</legend>
          {categories.map((c) => (
            <label key={c.id} style={{ display: "block", margin: "0.25rem 0" }}>
              <input
                type="checkbox"
                name="categories"
                value={c.id}
                defaultChecked={selectedCats.has(c.id)}
              />{" "}
              {c.name}
            </label>
          ))}
        </fieldset>
        <label>
          Status
          <select name="status" defaultValue={post.status} style={inputStyle}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </label>
        <button
          type="submit"
          style={{
            padding: "0.5rem 1.5rem",
            background: "#0070f3",
            color: "white",
            border: "none",
            borderRadius: "0.25rem",
            cursor: "pointer",
            fontSize: "1rem",
            alignSelf: "flex-start",
          }}
        >
          Update Post
        </button>
      </form>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  padding: "0.5rem",
  border: "1px solid #ddd",
  borderRadius: "0.25rem",
  fontSize: "1rem",
  marginTop: "0.25rem",
  boxSizing: "border-box",
};
