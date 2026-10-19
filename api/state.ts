import { neon } from '@neondatabase/serverless';
import { timingSafeEqual } from 'node:crypto';

const sql = neon(process.env.DATABASE_URL as string);

let ready: Promise<unknown> | null = null;

function ensureTable() {
  if (!ready) {
    ready = sql`
      CREATE TABLE IF NOT EXISTS app_state (
        id text PRIMARY KEY,
        data jsonb NOT NULL,
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `;
  }
  return ready;
}

function authorized(header: unknown): boolean {
  const expected = process.env.APP_KEY || '';
  if (!expected || typeof header !== 'string') return false;
  const a = Buffer.from(header);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');

  if (!authorized(req.headers['x-app-key'])) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }

  try {
    await ensureTable();

    if (req.method === 'GET') {
      const rows = await sql`SELECT data, updated_at FROM app_state WHERE id = 'default'`;
      if (!rows.length) {
        res.status(200).json({ data: null, updatedAt: null });
        return;
      }
      res.status(200).json({ data: rows[0].data, updatedAt: rows[0].updated_at });
      return;
    }

    if (req.method === 'PUT' || req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const data = body?.data;

      if (!data || typeof data !== 'object') {
        res.status(400).json({ error: 'missing data' });
        return;
      }

      const serialized = JSON.stringify(data);
      if (serialized.length > 5_000_000) {
        res.status(413).json({ error: 'payload too large' });
        return;
      }

      const rows = await sql`
        INSERT INTO app_state (id, data, updated_at)
        VALUES ('default', ${serialized}::jsonb, now())
        ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = now()
        RETURNING updated_at
      `;

      res.status(200).json({ ok: true, updatedAt: rows[0].updated_at });
      return;
    }

    res.setHeader('Allow', 'GET, PUT');
    res.status(405).json({ error: 'method not allowed' });
  } catch (err) {
    console.error('state api error', err);
    res.status(500).json({ error: 'server error' });
  }
}
