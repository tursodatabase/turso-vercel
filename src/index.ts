import { join } from "node:path";
import { tmpdir } from "node:os";
import { createClient } from "@tursodatabase/api";
import { connect, type Database, type DatabaseOpts } from "@tursodatabase/sync";
import { waitUntil } from "@vercel/functions";

// ============================================================================
// Types
// ============================================================================

export interface QueryResult {
  columns: string[];
  rows: unknown[][];
}

export interface DatabaseOptions {
  bootstrapStrategy?: NonNullable<DatabaseOpts["partialSyncExperimental"]>["bootstrapStrategy"];
}

export interface CreateDbOptions extends DatabaseOptions {
  group?: string;
}

interface Credentials {
  url: string;
  authToken: string;
}

// ============================================================================
// State
// ============================================================================

const instances = new Map<string, Promise<TursoDatabase>>();
const credentials = new Map<string, Credentials>();
const connections = new Set<TursoDatabase>();
const closeChecks = new Map<TursoDatabase, () => void>();

let apiClient: ReturnType<typeof createClient> | null = null;
let apiClientOrg: string | null = null;

// ============================================================================
// Database Class
// ============================================================================

export class TursoDatabase {
  readonly name: string;
  private db: Database;
  private dirty = false;

  private constructor(name: string, db: Database) {
    this.name = name;
    this.db = db;
  }

  static async open(
    name: string,
    localPath: string,
    url: string,
    authToken: string,
    options?: DatabaseOptions
  ): Promise<TursoDatabase> {
    const opts: DatabaseOpts = { path: localPath, url, authToken };

    opts.partialSyncExperimental = {
      bootstrapStrategy: options?.bootstrapStrategy ?? { kind: "prefix", length: 128 * 1024 },
      segmentSize: 128 * 1024,
    };

    const db = await connect(opts);
    await db.pull();
    return new TursoDatabase(name, db);
  }

  async query(sql: string, params?: unknown[]): Promise<QueryResult> {
    const stmt = this.db.prepare(sql);
    try {
      const columns = stmt.columns().map((c) => c.name);
      const rows = await stmt.all(...(params ?? []));
      return { columns, rows: rows.map((row) => Object.values(row)) };
    } finally {
      stmt.close();
    }
  }

  async execute(sql: string, params?: unknown[]): Promise<void> {
    const stmt = this.db.prepare(sql);
    try {
      await stmt.run(...(params ?? []));
      this.dirty = true;
    } finally {
      stmt.close();
    }
  }

  async push(): Promise<void> {
    if (!this.dirty) return;
    await this.db.push();
    this.dirty = false;
  }

  async pull(): Promise<void> {
    await this.db.pull();
  }

  async close(): Promise<void> {
    connections.delete(this);
    closeChecks.get(this)?.();
    closeChecks.delete(this);
    try {
      await this.push();
    } finally {
      instances.delete(this.name);
      await this.db.close();
    }
  }
}

// ============================================================================
// Public API
// ============================================================================

export function createDb(name: string, options?: CreateDbOptions): Promise<TursoDatabase> {
  const existing = instances.get(name);
  if (existing) return existing;

  const promise = initDb(name, options);
  instances.set(name, promise);
  promise.catch(() => instances.delete(name));

  promise.then((db) => {
    connections.add(db);
    waitUntil(
      new Promise<void>((resolve) => {
        closeChecks.set(db, resolve);
        setTimeout(resolve, 5000);
      }).then(() => {
        closeChecks.delete(db);
        if (connections.has(db)) {
          console.warn(
            `Database "${db.name}" was not closed. ` +
              "Call db.close() to ensure writes are pushed and errors are surfaced."
          );
        }
      })
    );
  });

  return promise;
}

// ============================================================================
// Internals
// ============================================================================

async function initDb(name: string, options?: CreateDbOptions): Promise<TursoDatabase> {
  const creds = await ensureDb(name, options?.group);
  const localPath = join(tmpdir(), `${name}.db`);
  return TursoDatabase.open(name, localPath, creds.url, creds.authToken, options);
}

async function ensureDb(name: string, group?: string): Promise<Credentials> {
  const cached = credentials.get(name);
  if (cached) return cached;

  const client = getClient();
  let db: { hostname?: string } | undefined;

  try {
    db = await client.databases.get(name);
  } catch (err) {
    if (isNotFound(err)) {
      db = await client.databases.create(name, { group: group ?? "default" });
    } else {
      throw err;
    }
  }

  if (!db?.hostname) {
    throw new Error(`Failed to get hostname for database: ${name}`);
  }

  const token = await client.databases.createToken(name, { authorization: "full-access" });
  const creds: Credentials = { url: `libsql://${db.hostname}`, authToken: token.jwt };
  credentials.set(name, creds);

  return creds;
}

function getClient(): ReturnType<typeof createClient> {
  const org = requireEnv("TURSO_ORG");

  if (!apiClient || apiClientOrg !== org) {
    apiClient = createClient({ org, token: requireEnv("TURSO_API_TOKEN") });
    apiClientOrg = org;
  }

  return apiClient;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} environment variable is required`);
  return value;
}

function isNotFound(err: unknown): boolean {
  return err instanceof Error && "status" in err && (err as { status: number }).status === 404;
}

// Backwards compatibility alias
export { TursoDatabase as VercelDatabase };
