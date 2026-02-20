import { createDb } from "@tursodatabase/vercel-experimental";

// ============================================================================
// Schema
// ============================================================================

const SCHEMA = `
CREATE TABLE IF NOT EXISTS authors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  bio TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  excerpt TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  author_id INTEGER NOT NULL REFERENCES authors(id),
  published_at TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS post_categories (
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, category_id)
);
`;

// ============================================================================
// Seed Data
// ============================================================================

const AUTHORS = [
  { slug: "alice-chen", name: "Alice Chen", bio: "Full-stack developer and open source enthusiast. Writes about web technologies and cloud infrastructure." },
  { slug: "bob-martinez", name: "Bob Martinez", bio: "DevOps engineer with a passion for automation. Focuses on CI/CD pipelines and container orchestration." },
  { slug: "carol-johnson", name: "Carol Johnson", bio: "Database architect and performance specialist. Expert in distributed systems and data modeling." },
  { slug: "david-kim", name: "David Kim", bio: "Frontend developer and UI/UX advocate. Passionate about accessible web design and modern frameworks." },
  { slug: "emma-wilson", name: "Emma Wilson", bio: "Cloud engineer and technical writer. Covers serverless computing and edge deployments." },
];

const CATEGORIES = [
  { slug: "technology", name: "Technology" },
  { slug: "programming", name: "Programming" },
  { slug: "devops", name: "DevOps" },
  { slug: "databases", name: "Databases" },
  { slug: "web-development", name: "Web Development" },
  { slug: "cloud", name: "Cloud" },
  { slug: "open-source", name: "Open Source" },
  { slug: "tutorials", name: "Tutorials" },
];

const PARAGRAPHS = [
  "Modern web development has evolved significantly over the past decade. With the rise of server-side rendering frameworks and edge computing, developers now have more tools than ever to build fast, reliable applications.",
  "Database performance is critical for any application at scale. By leveraging local replicas and smart caching strategies, you can dramatically reduce latency and improve the user experience.",
  "The serverless paradigm has transformed how we think about infrastructure. Instead of managing servers, developers can focus on writing code while the platform handles scaling, availability, and maintenance.",
  "Open source software continues to drive innovation across the industry. Communities around projects like Linux, PostgreSQL, and SQLite have created foundations that power millions of applications worldwide.",
  "TypeScript has become the de facto standard for large-scale JavaScript applications. Its type system catches bugs at compile time, improves editor tooling, and makes refactoring safer.",
  "Edge computing brings computation closer to users, reducing latency and improving performance. Combined with local database replicas, this approach enables truly global applications.",
  "Continuous integration and deployment pipelines are essential for modern software teams. Automated testing, building, and releasing ensures that changes reach users quickly and reliably.",
  "Web accessibility is not just a nice-to-have — it's a requirement. Building inclusive interfaces ensures your application works for everyone, regardless of their abilities or devices.",
  "Container orchestration with Kubernetes has become the standard for deploying microservices. Understanding pods, services, and deployments is crucial for modern backend development.",
  "SQLite is often overlooked for production workloads, but embedded databases offer compelling advantages: zero network latency, simplified architecture, and excellent reliability.",
  "API design is an art form that balances simplicity with flexibility. RESTful conventions, consistent naming, and clear documentation make APIs a joy to work with.",
  "Performance optimization starts with measurement. Before optimizing, instrument your code to understand where time is actually spent — the bottleneck is rarely where you expect.",
];

const POST_TITLES = [
  "Getting Started with Edge Databases",
  "Building a Real-Time Dashboard with SQLite",
  "Deploying Next.js Applications at the Edge",
  "Understanding Database Replication Strategies",
  "A Guide to TypeScript Generics",
  "Serverless Functions: Best Practices",
  "Optimizing Build Times in Large Projects",
  "Introduction to Partial Sync",
  "Creating REST APIs with Next.js",
  "Docker Containers for Development",
  "Web Performance Metrics That Matter",
  "Migrating from PostgreSQL to SQLite",
  "Designing Accessible Form Components",
  "CI/CD Pipeline Patterns for Monorepos",
  "Understanding the Edge Runtime",
  "Database Schema Design Principles",
  "Building CLI Tools with Node.js",
  "Introduction to WebAssembly",
  "Caching Strategies for Web Applications",
  "Writing Effective Unit Tests",
  "Monitoring Serverless Applications",
  "GraphQL vs REST: A Practical Comparison",
  "State Management in React Applications",
  "Securing API Endpoints",
  "Database Indexing Deep Dive",
  "Progressive Web Apps in 2024",
  "Infrastructure as Code with Terraform",
  "Building Realtime Features with WebSockets",
  "Automating Database Migrations",
  "The Future of JavaScript Runtimes",
  "Micro-Frontends Architecture",
  "Load Testing Your Applications",
  "Working with Embedded Databases",
  "Kubernetes Networking Explained",
  "Building a Design System from Scratch",
  "Zero-Downtime Deployments",
  "Understanding CORS and Security Headers",
  "Data Modeling for Document Stores",
  "Building Offline-First Applications",
  "Effective Code Review Practices",
  "Horizontal vs Vertical Scaling",
  "Building Multi-Tenant Applications",
  "Introduction to Edge Functions",
  "Advanced Git Workflows",
  "Debugging Production Issues",
  "Building a Plugin Architecture",
  "Understanding DNS and CDNs",
  "React Server Components Deep Dive",
  "Database Connection Pooling",
  "Building Developer Tools",
];

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function generateContent(index: number): string {
  const paragraphCount = 3 + (index % 4);
  const parts: string[] = [];
  for (let i = 0; i < paragraphCount; i++) {
    parts.push(PARAGRAPHS[(index + i) % PARAGRAPHS.length]);
  }
  return parts.join("\n\n");
}

function generateExcerpt(content: string): string {
  return content.slice(0, 150).trimEnd() + "...";
}

function generateDate(index: number): string {
  const now = new Date();
  const daysAgo = Math.floor((index / 50) * 180);
  const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  return date.toISOString().replace("T", " ").replace(/\.\d+Z$/, "");
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  const dbName = process.env.TURSO_DATABASE;
  if (!dbName) {
    console.error("TURSO_DATABASE environment variable is required");
    process.exit(1);
  }

  console.log(`Seeding database "${dbName}"...`);
  const db = await createDb(dbName);

  // Create tables
  for (const stmt of SCHEMA.split(";").filter((s) => s.trim())) {
    await db.execute(stmt);
  }
  console.log("Tables created.");

  // Insert authors
  for (const author of AUTHORS) {
    await db.execute(
      "INSERT OR IGNORE INTO authors (slug, name, bio) VALUES (?, ?, ?)",
      [author.slug, author.name, author.bio]
    );
  }
  console.log(`Inserted ${AUTHORS.length} authors.`);

  // Insert categories
  for (const cat of CATEGORIES) {
    await db.execute(
      "INSERT OR IGNORE INTO categories (slug, name) VALUES (?, ?)",
      [cat.slug, cat.name]
    );
  }
  console.log(`Inserted ${CATEGORIES.length} categories.`);

  // Insert posts
  for (let i = 0; i < POST_TITLES.length; i++) {
    const title = POST_TITLES[i];
    const slug = slugify(title);
    const content = generateContent(i);
    const excerpt = generateExcerpt(content);
    const authorId = (i % AUTHORS.length) + 1;
    const publishedAt = generateDate(i);

    await db.execute(
      `INSERT OR IGNORE INTO posts (slug, title, content, excerpt, status, author_id, published_at, updated_at)
       VALUES (?, ?, ?, ?, 'published', ?, ?, ?)`,
      [slug, title, content, excerpt, authorId, publishedAt, publishedAt]
    );

    // Assign 1-3 categories per post
    const catCount = 1 + (i % 3);
    for (let c = 0; c < catCount; c++) {
      const catId = ((i + c) % CATEGORIES.length) + 1;
      await db.execute(
        "INSERT OR IGNORE INTO post_categories (post_id, category_id) VALUES (?, ?)",
        [i + 1, catId]
      );
    }
  }
  console.log(`Inserted ${POST_TITLES.length} posts with categories.`);

  await db.close();
  console.log("Done! Database seeded successfully.");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
