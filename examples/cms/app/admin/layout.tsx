export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <nav
        style={{
          background: "#f8f8f8",
          padding: "0.75rem 1rem",
          borderRadius: "0.5rem",
          marginBottom: "2rem",
          display: "flex",
          gap: "1rem",
          alignItems: "center",
        }}
      >
        <strong>Admin</strong>
        <a href="/admin" style={{ textDecoration: "none", color: "#0070f3" }}>Dashboard</a>
        <a href="/admin/posts/new" style={{ textDecoration: "none", color: "#0070f3" }}>New Post</a>
      </nav>
      {children}
    </div>
  );
}
