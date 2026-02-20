# Turso + Vercel Guestbook Example

A simple guestbook app demonstrating `@tursodatabase/vercel-experimental` with Next.js on Vercel.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and fill in your Turso credentials:
   ```bash
   cp .env.example .env.local
   ```

3. Get your credentials:
   - **TURSO_API_TOKEN**: Create via CLI:
     ```bash
     turso auth api-tokens mint my-vercel-token
     ```
   - **TURSO_ORG**: Your organization slug from Turso dashboard
   - **TURSO_GROUP**: Your database group (e.g., `default`, or create one with `turso group create my-project`)
   - **TURSO_DATABASE**: Your database name (e.g., `guestbook`)

4. Run locally:
   ```bash
   npm run dev
   ```

5. Open http://localhost:3000

## Deploy to Vercel

```bash
cd examples/guestbook
npm install
vercel deploy
```

When prompted, add the environment variables:
- `TURSO_API_TOKEN` - your Turso API token
- `TURSO_ORG` - your Turso organization slug
- `TURSO_GROUP` - your database group (e.g., `default`)
- `TURSO_DATABASE` - your database name (e.g., `guestbook`)

Or set them beforehand:

```bash
vercel env add TURSO_API_TOKEN
vercel env add TURSO_ORG
vercel env add TURSO_GROUP
vercel env add TURSO_DATABASE
vercel deploy --prod
```

The database will be auto-created on first request.

## How it works

- `createDb(process.env.TURSO_DATABASE!)` auto-creates the database on Turso Cloud if it doesn't exist
- Database is stored locally at `/tmp/<database-name>.db` using partial sync
- Reads fetch only the pages needed from Turso Cloud
- Writes are pushed to Turso Cloud with `db.push()`

## Security

All database access is scoped to the group configured via `TURSO_GROUP`. Even if an attacker could inject a different database name, they can only access databases within that group. The database name should still be stored as a secret environment variable in Vercel as an additional layer of defense.
