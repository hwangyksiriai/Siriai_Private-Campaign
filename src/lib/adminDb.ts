/**
 * siriai-admin과 동일한 Postgres(DATABASE_URL)에 직접 연결.
 * RLS를 우회하는 세션 풀러 연결이라 Node 런타임 API 라우트에서만 사용해야 해요.
 */
import { Pool } from "pg";

let pool: Pool | null = null;

export function adminDb(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 1,
      ssl: { rejectUnauthorized: false },
    });
  }
  return pool;
}
