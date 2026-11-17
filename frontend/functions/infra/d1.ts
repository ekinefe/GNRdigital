// The one D1 shape the Worker code needs, so handlers and repositories do not each declare their own.
// A real D1Database satisfies it; the tests use functions/_test/testD1.js.
export type D1Statement = {
  bind: (...values: unknown[]) => D1Statement;
  all: <T = unknown>() => Promise<{ results: T[] }>;
  first: <T = unknown>() => Promise<T | null>;
  run: () => Promise<{ meta?: { changes?: number; last_row_id?: number } }>;
};
export type D1 = { prepare: (sql: string) => D1Statement };

/** The binding from `env.DB`, or null while the database does not exist yet. */
export const dbOf = (env: { DB?: unknown }): D1 | null => (env.DB ? (env.DB as D1) : null);

export type DbState = 'ok' | 'missing' | 'unmigrated' | 'error';

// Tables the public pages read. If any is absent the migrations were not applied (for example a freshly created
// database after a Worker rename) and /api/projects, /api/posts and the legal pages answer 500.
export const REQUIRED_TABLES = ['posts', 'projects', 'legal_documents'] as const;

/**
 * Whether the database is usable: 'missing' when it is not bound yet, 'unmigrated' when it answers but the tables
 * the public pages need do not exist (run `npm run db:migrate:remote`), 'error' when it is bound but fails.
 */
export async function checkDb(binding: unknown): Promise<DbState> {
  if (!binding) return 'missing';
  try {
    // one ? per entry in REQUIRED_TABLES
    const row = await (binding as D1)
      .prepare("SELECT COUNT(*) AS n FROM sqlite_master WHERE type = 'table' AND name IN (?, ?, ?)")
      .bind(...REQUIRED_TABLES)
      .first<{ n: number }>();
    return (row?.n ?? 0) === REQUIRED_TABLES.length ? 'ok' : 'unmigrated';
  } catch {
    return 'error';
  }
}
