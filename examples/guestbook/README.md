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
- `TURSO_DATABASE` - your database name (e.g., `guestbook`)

Or set them beforehand:

```bash
vercel env add TURSO_API_TOKEN
vercel env add TURSO_ORG
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

The database name is stored as an environment variable secret, not hardcoded in the source. This is important because the `TURSO_API_TOKEN` grants access to your entire Turso organization. If an attacker could inject a different database name, they could access any database in your org. By keeping `TURSO_DATABASE` as a secret in Vercel's environment variables, the database name cannot be tampered with.
