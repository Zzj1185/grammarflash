export async function onRequest({ request, env }) {
  const url = new URL(request.url)
  const q = url.searchParams.get('q') || ''
  if (!q) return new Response(JSON.stringify({ error: 'missing q' }), { status: 400, headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' } })
  const key = env.PEXELS_KEY || ''

  let body = null
  if (key) {
    try {
      const api = `https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&per_page=5&orientation=landscape`
      const r = await fetch(api, { headers: { Authorization: key } })
      if (r.ok) {
        const data = await r.json()
        const arr = Array.isArray(data?.photos) ? data.photos : []
        const p = arr[0]
        const u = p?.src?.landscape || p?.src?.large2x || p?.src?.large || p?.src?.medium || p?.src?.original || ''
        if (u) {
          body = { url: u, alt: p?.alt || '', color: p?.avg_color || '', page: p?.url || '', ph: p?.photographer || '', phUrl: p?.photographer_url || '' }
        }
      }
    } catch {}
  }

  if (!body) {
    const fallback = `https://source.unsplash.com/1200x800/?${encodeURIComponent(q)}`
    body = { url: fallback, alt: q, color: '', page: '', ph: '', phUrl: '' }
  }

  return new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' } })
}
