# Turso CMS Example — Partial Sync for Fast Next.js Builds

This example demonstrates how Turso's **partial sync** eliminates redundant network round trips during `next build`, turning 63+ independent database queries into a handful of segment fetches from a single local SQLite replica.

## The Problem

Next.js builds pages independently during Static Site Generation (SSG). A content site with 50 posts, 8 categories, and 5 authors generates 63+ pages — each making its own database query over the network. That's 63+ round trips at build time.

## The Solution

Turso partial sync creates a **local SQLite replica** that lazily fetches data on demand. Combined with `createDb`'s instance caching, all pages share **one replica** during the build:

```
next build
  ├── generateStaticParams (posts)    ─┐
  ├── generateStaticParams (categories)│  All call getDb() → same cached instance
  ├── generateStaticParams (authors)   │  Bootstrap query pre-fetches slug index
  ├── /posts/getting-started...        │  Subsequent queries hit local replica
  ├── /posts/building-a-dashboard...   │  Partial sync fetches missing segments
  ├── /categories/technology...        │  (128KB each) on demand
  ├── /authors/alice-chen...           │
  └── ... (63+ pages total)           ─┘
```

**Key mechanisms:**

1. `createDb` caches instances in a module-level `Map` — all pages share ONE database connection
2. The `query` bootstrap strategy pre-fetches the slug index that `generateStaticParams` needs
3. Subsequent page renders query the local SQLite replica; partial sync lazily fetches missing 128KB segments
4. Static pages do NOT call `db.close()` — this preserves the singleton across the build

## Setup

### Prerequisites

- A [Turso](https://turso.tech) account
- Turso CLI installed (`curl -sSfL https://get.tur.so/install.sh | bash`)

### 1. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in your values:

```
TURSO_API_TOKEN=   # turso auth api-tokens mint my-vercel-token
TURSO_ORG=         # turso org list
TURSO_GROUP=       # turso group create my-project
TURSO_DATABASE=    # any name, e.g. "cms-example"
```

### 2. Install dependencies

```bash
npm install
```

### 3. Seed the database

```bash
npm run seed
```

This creates tables and inserts 5 authors, 8 categories, and 50 published posts.

### 4. Build

```bash
npm run build
```

You should see 63+ static pages generated. Watch the build output — despite all those pages, the database only fetches a handful of segments from the remote server.

### 5. Run

```bash
npm run start
# or for development:
npm run dev
```

## Admin Section

Visit `/admin` to manage posts:

- **Dashboard** — table of all posts with status and edit links
- **New Post** — create a post with title, content, author, categories, and status
- **Edit Post** — update any existing post

Admin pages use `force-dynamic` and call `db.close()` after each request (serverless lifecycle). Server actions call `revalidatePath('/')` to trigger ISR revalidation of static pages.

## How It Works

### Build Time (SSG)

Static pages (`/`, `/posts/[slug]`, `/categories/[slug]`, `/authors/[slug]`) all share one `createDb` instance. The bootstrap query fetches the slug index, and partial sync lazily pulls 128KB segments as each page queries for its content. The local replica caches everything — later pages in the build often hit data that was already fetched.

### Runtime (Serverless)

Admin pages create a fresh database connection per request and close it when done. Server actions write via `db.execute()` and call `revalidatePath()` to update the static pages via ISR.
