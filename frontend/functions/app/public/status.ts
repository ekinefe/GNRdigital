// GET /api/status (GNR-126): the address an uptime monitor pings. Public, so it says only whether the site and its
// database answer: no secrets, no counts, no versions. 200 when fine, 503 when the database is bound but fails or
// its tables were never created (db: "unmigrated"), so an uptime monitor catches a database without migrations.
import { checkDb } from '../../infra/d1.ts';
import { jsonNoStore } from '../../infra/http.ts';

type Context = { request: Request; env: { DB?: unknown } };

async function status({ env }: Context): Promise<Response> {
  const db = await checkDb(env.DB);
  const broken = db === 'error' || db === 'unmigrated';
  return jsonNoStore({ ok: !broken, db }, broken ? 503 : 200);
}

export const statusRoute = { onRequestGet: status };
