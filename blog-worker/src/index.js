const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

const TOPIC_POOL = [
  'How small businesses can cut their internet bill without switching providers',
  'VoIP vs traditional phone systems: what SMBs need to know',
  'Why most small businesses are overpaying for cybersecurity — and what to do about it',
  'SD-WAN explained for non-technical business owners',
  'Cloud migration mistakes that cost companies money (and how to avoid them)',
  'How to evaluate a UCaaS provider: a checklist for business owners',
  'What happens when your telecom contract expires — and why you should care 90 days early',
  'The hidden costs of managing your own IT infrastructure',
  'Contact center in the cloud: is CCaaS right for your business?',
  'How construction companies are saving on connectivity without sacrificing reliability',
  "Fiber internet for business: when it's worth it and when it isn't",
  'Why your managed IT provider might be leaving money on the table',
  'Cybersecurity basics every small business owner should know',
  'What is SASE and should your business care about it?',
  'How to negotiate a better deal on your next business phone system',
  'The real cost of business internet downtime — and how to prevent it',
  'What to ask before signing any technology contract',
  'Fixed wireless vs fiber: which is right for your business location?',
  'How a technology advisor is different from a vendor — and why it matters',
  'Five signs your current IT setup is costing you more than it should',
]

async function generatePost(topic, anthropicKey) {
  const prompt = `You are writing a blog post for The Interesting Group (theinterestinggroup.com), a technology advisory firm that helps small and mid-size businesses across the US source, negotiate, and manage their technology vendors — at no cost to the client (vendors pay the fees).

Write a blog post on this topic: "${topic}"

Requirements:
- Target audience: business owners and operators at companies with 10-150 employees, anywhere in the US
- Tone: direct, confident, helpful — like a trusted advisor, not a salesperson
- Length: 550-750 words
- Structure: H1 title, 3-4 sections with H2 headers, brief conclusion with a soft CTA to book a free call
- SEO: naturally include industry and category keywords — do NOT mention specific cities or states
- Do NOT mention specific vendor names or prices
- Do NOT be salesy or use buzzwords like "leverage" or "synergy"
- End with a single sentence CTA linking to the contact page

Return a JSON object with exactly these fields:
{
  "title": "the H1 title",
  "slug": "url-friendly-slug",
  "excerpt": "2-sentence summary for the blog listing page",
  "tags": ["tag1", "tag2", "tag3"],
  "body": "the full post body in markdown"
}`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': anthropicKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  const data = await response.json()
  const text = data.content[0].text
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  return JSON.parse(jsonMatch[0])
}

async function handleCron(env) {
  const usedKeys = await env.BLOG_KV.list({ prefix: 'used-topic:' })
  const usedTopics = new Set(usedKeys.keys.map(k => k.name.replace('used-topic:', '')))
  const available = TOPIC_POOL.filter(t => !usedTopics.has(t))
  const topic = available.length > 0
    ? available[Math.floor(Math.random() * available.length)]
    : TOPIC_POOL[Math.floor(Math.random() * TOPIC_POOL.length)]

  const post = await generatePost(topic, env.ANTHROPIC_API_KEY)
  const id = `post-${Date.now()}`
  const draft = {
    id,
    ...post,
    status: 'draft',
    topic,
    createdAt: new Date().toISOString(),
    publishedAt: null,
  }

  await env.BLOG_KV.put(`draft:${id}`, JSON.stringify(draft))
  await env.BLOG_KV.put(`used-topic:${topic}`, '1')
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
