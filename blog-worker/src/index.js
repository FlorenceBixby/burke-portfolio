const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

const TOPIC_CATEGORIES = [
  'internet connectivity and fiber',
  'VoIP and business phone systems',
  'UCaaS (unified communications)',
  'CCaaS (contact center)',
  'cloud infrastructure and migration',
  'cybersecurity',
  'SD-WAN and SASE',
  'IT managed services',
  'technology contract negotiation',
]

async function generatePost(anthropicKey, recentTopics) {
  const avoidList = recentTopics.length > 0
    ? recentTopics.map(t => `- ${t}`).join('\n')
    : '(none yet — this is one of the first posts)'

  const prompt = `You are writing a blog post for The Interesting Group (theinterestinggroup.com), a technology advisory firm that helps small and mid-size businesses across the US source, negotiate, and manage their technology vendors — at no cost to the client (vendors pay the fees).

Step 1 — Research: Use web search to find what's genuinely trending right now (last 30-60 days) in one of these categories, something a business owner would actually be curious about or worried about — a real news story, industry shift, new threat, or emerging technology, not an evergreen basics topic:
${TOPIC_CATEGORIES.map(c => `- ${c}`).join('\n')}

Do not write about any of these topics we've already covered recently:
${avoidList}

Step 2 — Write: Once you've identified a specific, current angle, write a blog post about it.

Requirements:
- Target audience: business owners and operators at companies with 10-150 employees, anywhere in the US
- Tone: direct, confident, helpful — like a trusted advisor, not a salesperson
- Length: 550-750 words
- Structure: H1 title, 3-4 sections with H2 headers, brief conclusion with a soft CTA to book a free call
- SEO: naturally include industry and category keywords — do NOT mention specific cities or states
- Do NOT mention specific vendor names or prices
- Do NOT be salesy or use buzzwords like "leverage" or "synergy"
- End with a single sentence CTA linking to the contact page

Once research is complete, respond with ONLY a JSON object as your final message, with exactly these fields:
{
  "title": "the H1 title",
  "slug": "url-friendly-slug",
  "excerpt": "2-sentence summary for the blog listing page",
  "tags": ["tag1", "tag2", "tag3"],
  "topic": "the specific trending topic/angle you chose, one sentence",
  "body": "the full post body in markdown"
}`

  const messages = [{ role: 'user', content: prompt }]

  for (let i = 0; i < 4; i++) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 4096,
        tools: [{ type: 'web_search_20260209', name: 'web_search' }],
        messages,
      }),
    })

    const data = await response.json()

    if (data.stop_reason === 'pause_turn') {
      messages.push({ role: 'assistant', content: data.content })
      continue
    }

    const text = data.content.filter(b => b.type === 'text').map(b => b.text).join('\n')
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    return JSON.parse(jsonMatch[0])
  }

  throw new Error('Post generation did not complete after multiple search iterations')
}

async function handleCron(env) {
  const usedKeys = await env.BLOG_KV.list({ prefix: 'used-topic:' })
  const recentTopics = usedKeys.keys.map(k => k.name.replace('used-topic:', ''))

  const post = await generatePost(env.ANTHROPIC_API_KEY, recentTopics)
  const id = `post-${Date.now()}`
  const draft = {
    id,
    ...post,
    status: 'draft',
    createdAt: new Date().toISOString(),
    publishedAt: null,
  }

  await env.BLOG_KV.put(`draft:${id}`, JSON.stringify(draft))
  await env.BLOG_KV.put(`used-topic:${post.topic}`, '1')
  console.log(`Draft created: ${post.title}`)
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}

function unauthorized() {
  return json({ error: 'Unauthorized' }, 401)
}

function checkAuth(request, env) {
  const auth = request.headers.get('Authorization') || ''
  const token = auth.replace('Bearer ', '')
  return token === (env.ADMIN_PASSWORD || 'tig-admin-2025')
}

async function handleRequest(request, env) {
  const url = new URL(request.url)
  const path = url.pathname

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS })
  }

  // GET /api/blog — published posts (public)
  if (request.method === 'GET' && path === '/api/blog') {
    const list = await env.BLOG_KV.list({ prefix: 'published:' })
    const posts = await Promise.all(
      list.keys.map(k => env.BLOG_KV.get(k.name, 'json'))
    )
    const sorted = posts
      .filter(Boolean)
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    return json(sorted)
  }

  // GET /api/blog/:slug — single published post (public)
  if (request.method === 'GET' && path.startsWith('/api/blog/') && !path.includes('/admin')) {
    const slug = path.replace('/api/blog/', '')
    const list = await env.BLOG_KV.list({ prefix: 'published:' })
    const posts = await Promise.all(list.keys.map(k => env.BLOG_KV.get(k.name, 'json')))
    const post = posts.filter(Boolean).find(p => p.slug === slug)
    if (!post) return json({ error: 'Not found' }, 404)
    return json(post)
  }

  // All admin routes require auth
  if (!checkAuth(request, env)) return unauthorized()

  // GET /api/admin/drafts — list drafts
  if (request.method === 'GET' && path === '/api/admin/drafts') {
    const list = await env.BLOG_KV.list({ prefix: 'draft:' })
    const drafts = await Promise.all(list.keys.map(k => env.BLOG_KV.get(k.name, 'json')))
    const sorted = drafts
      .filter(Boolean)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    return json(sorted)
  }

  // POST /api/admin/approve/:id — publish a draft
  if (request.method === 'POST' && path.startsWith('/api/admin/approve/')) {
    const id = path.replace('/api/admin/approve/', '')
    const draft = await env.BLOG_KV.get(`draft:${id}`, 'json')
    if (!draft) return json({ error: 'Draft not found' }, 404)
    const published = { ...draft, status: 'published', publishedAt: new Date().toISOString() }
    await env.BLOG_KV.put(`published:${id}`, JSON.stringify(published))
    await env.BLOG_KV.delete(`draft:${id}`)
    return json({ success: true, post: published })
  }

  // DELETE /api/admin/draft/:id — reject/delete a draft
  if (request.method === 'DELETE' && path.startsWith('/api/admin/draft/')) {
    const id = path.replace('/api/admin/draft/', '')
    await env.BLOG_KV.delete(`draft:${id}`)
    return json({ success: true })
  }

  // POST /api/admin/generate — manually trigger a post generation
  if (request.method === 'POST' && path === '/api/admin/generate') {
    await handleCron(env)
    return json({ success: true, message: 'Draft generated' })
  }

  return json({ error: 'Not found' }, 404)
}

export default {
  async fetch(request, env) {
    return handleRequest(request, env)
  },
  async scheduled(event, env) {
    await handleCron(env)
  },
}
