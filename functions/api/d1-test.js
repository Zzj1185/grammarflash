export async function onRequest({ request, env }) {
  const headers = {
    'content-type': 'application/json',
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'content-type',
    'access-control-allow-methods': 'GET,POST,OPTIONS'
  }
  if (request.method === 'OPTIONS') return new Response('', { status: 204, headers })
  const db = env.DB
  if (!db) return new Response(JSON.stringify({ error: 'missing D1 binding DB' }), { status: 500, headers })
  try {
    if (request.method === 'GET') {
      const u = new URL(request.url)
      const sql = u.searchParams.get('sql')
      const p = u.searchParams.get('params')
      if (!sql) {
        const r = await db.prepare('SELECT 1 AS ok').first()
        return new Response(JSON.stringify({ ok: true, result: r }), { status: 200, headers })
      }
      let params = []
      if (p) {
        try { params = JSON.parse(p) } catch { params = [] }
      }
      const stmt = db.prepare(sql)
      const bound = Array.isArray(params) ? stmt.bind(...params) : stmt
      const head = sql.trim().split(/\s+/)[0].toUpperCase()
      const isSelect = head === 'SELECT' || head === 'WITH'
      const res = isSelect ? await bound.all() : await bound.run()
      return new Response(JSON.stringify(res), { status: 200, headers })
    }
    if (request.method === 'POST') {
      const { sql, params } = await request.json().catch(() => ({ sql: '', params: [] }))
      if (!sql) return new Response(JSON.stringify({ error: 'missing sql' }), { status: 400, headers })
      const stmt = db.prepare(sql)
      const bound = Array.isArray(params) ? stmt.bind(...params) : stmt
      const head = sql.trim().split(/\s+/)[0].toUpperCase()
      const isSelect = head === 'SELECT' || head === 'WITH'
      const res = isSelect ? await bound.all() : await bound.run()
      return new Response(JSON.stringify(res), { status: 200, headers })
    }
    return new Response(JSON.stringify({ error: 'method' }), { status: 405, headers })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers })
  }
}
