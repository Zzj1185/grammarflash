export async function onRequest({ request, env }) {
  const url = new URL(request.url)
  const q = url.searchParams.get('q') || ''
  if (!q) return new Response(JSON.stringify({ error: 'missing q' }), { status: 400, headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' } })
  const key = env.PEXELS_KEY || ''
  if (!key) return new Response(JSON.stringify({ error: 'missing key' }), { status: 500, headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' } })
  const api = `https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&per_page=5&orientation=landscape`
  const r = await fetch(api, { headers: { Authorization: key } })
  if (!r.ok) return new Response(JSON.stringify({ error: 'upstream' }), { status: 502, headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' } })
  const data = await r.json()
  const arr = Array.isArray(data?.photos) ? data.photos : []
  const p = arr[0]
  const u = p?.src?.landscape || p?.src?.large2x || p?.src?.large || p?.src?.medium || p?.src?.original || ''
  const body = { url: u, alt: p?.alt || '', color: p?.avg_color || '', page: p?.url || '', ph: p?.photographer || '', phUrl: p?.photographer_url || '' }
  return new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' } })
}
