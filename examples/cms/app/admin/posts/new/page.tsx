import { getDb } from "@/lib/db";
import { createPost } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  const db = await getDb();

  const authorsResult = await db.query("SELECT id, name FROM authors ORDER BY name");
  const authors = authorsResult.rows.map((row) => ({ id: row[0] as number, name: row[1] as string }));

  const catsResult = await db.query("SELECT id, name FROM categories ORDER BY name");
  const categories = catsResult.rows.map((row) => ({ id: row[0] as number, name: row[1] as string }));

  await db.close();

  return (
    <div>
      <h1>New Post</h1>
      <form action={createPost} style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: 600 }}>
        <label>
          Title
          <input name="title" required style={inputStyle} />
        </label>
        <label>
          Slug
          <input name="slug" required style={inputStyle} />
        </label>
        <label>
          Excerpt
          <textarea name="excerpt" rows={2} style={inputStyle} />
        </label>
        <label>
          Content
          <textarea name="content" rows={12} style={inputStyle} />
        </label>
        <label>
          Author
          <select name="author_id" required style={inputStyle}>
            {authors.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </label>
        <fieldset style={{ border: "1px solid #ddd", borderRadius: "0.25rem", padding: "0.75rem" }}>
          <legend>Categories</legend>
          {categories.map((c) => (
            <label key={c.id} style={{ display: "block", margin: "0.25rem 0" }}>
              <input type="checkbox" name="categories" value={c.id} /> {c.name}
            </label>
          ))}
        </fieldset>
        <label>
          Status
          <select name="status" style={inputStyle}>
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
          Create Post
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
