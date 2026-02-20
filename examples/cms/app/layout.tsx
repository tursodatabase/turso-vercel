import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Turso CMS",
  description: "A CMS example showcasing Turso partial sync for fast Next.js builds",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", color: "#1a1a1a" }}>
        <nav
          style={{
            borderBottom: "1px solid #e5e5e5",
            padding: "1rem 2rem",
            display: "flex",
            gap: "1.5rem",
            alignItems: "center",
          }}
        >
          <a href="/" style={{ fontWeight: 700, fontSize: "1.1rem", textDecoration: "none", color: "#1a1a1a" }}>
            Turso CMS
          </a>
          <a href="/" style={{ textDecoration: "none", color: "#666" }}>Home</a>
          <a href="/admin" style={{ textDecoration: "none", color: "#666" }}>Admin</a>
        </nav>
        <main style={{ maxWidth: 960, margin: "2rem auto", padding: "0 1rem" }}>{children}</main>
      </body>
    </html>
  );
}
