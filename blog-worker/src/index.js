const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

const TOPIC_POOL = [
  'How the right technology stack becomes a competitive advantage, not just a cost center',
  'Five technology upgrades that pay for themselves within a year',
  'What fast-growing companies do differently with their technology vendors',
  'How better connectivity translates directly into team productivity',
  'The ROI case for moving your phone system to the cloud',
  'How automating routine IT tasks frees your team for higher-value work',
  'What separates a technology investment from a technology expense',
  'Building a technology roadmap that scales with your growth',
  'Why the fastest-growing SMBs treat vendor management as a competitive edge',
  'The productivity case for consolidating your business communications tools',
  'How to calculate the real ROI of your technology contracts',
  'What efficient IT operations actually look like at a growing company',
  'How SD-WAN improves performance for distributed and multi-location teams',
  'The connection between reliable technology and a better customer experience',
  'How to negotiate technology contracts that scale with you, not against you',
  'Why some businesses get more value from the same technology spend',
  'How the right managed IT partner increases your team’s output',
  'What to look for in a technology advisor who actually drives growth',
  'How cloud migration can boost performance, not just cut costs',
  'The efficiency gains hiding in your current technology contracts',
]

async function generatePost(topic, anthropicKey) {
  const prompt = `You are writing a blog post for The Interesting Group (theinterestinggroup.com), a technology advisory firm that helps small and mid-size businesses across the US source, negotiate, and manage their technology vendors — at no cost to the client (vendors pay the fees).

Write a blog post on this topic: "${topic}"

Requirements:
- Target audience: business owners and operators at companies with 10-150 employees, anywhere in the US
- Tone: direct, confident, helpful — like a trusted advisor, not a salesperson
- Angle: frame the topic around revenue, productivity, and efficiency gains — what businesses get by investing well. Do NOT use fear, threat, or urgency-based framing (no "hackers are coming for you," no scare statistics, no doom-and-gloom hooks). Growth and opportunity, not risk avoidance
- Impact bar: every point should be a high-leverage move — meaningful ROI relative to the effort required. Cost-cutting and minor efficiency tweaks can appear as supporting detail, but should never be the main point of the post, and never center on trivial savings that aren't worth a business owner's time (e.g., a small per-seat price difference across a software subscription). The main argument should always be about a real, needle-moving business outcome
- Length: 550-750 words
- Structure: H1 title, 3-4 sections with H2 headers, brief conclusion with a soft CTA to book a free call
- Write every section as clean, flowing prose paragraphs. Do NOT use bullet points, numbered lists, dashes as list markers, or any other list formatting anywhere in the body — express everything in full sentences, the way a well-written article or op-ed reads
- Do NOT use emojis, asterisks, or other symbols for emphasis
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
  if (!env.ADMIN_PASSWORD) return false
  const auth = request.headers.get('Authorization') || ''
  const token = auth.replace('Bearer ', '')
  return token === env.ADMIN_PASSWORD
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

  // POST /api/admin/regenerate/:id — rewrite a draft's content with the current prompt, same topic
  if (request.method === 'POST' && path.startsWith('/api/admin/regenerate/')) {
    const id = path.replace('/api/admin/regenerate/', '')
    const existing = await env.BLOG_KV.get(`draft:${id}`, 'json')
    if (!existing) return json({ error: 'Draft not found' }, 404)
    const post = await generatePost(existing.topic, env.ANTHROPIC_API_KEY)
    const draft = { ...existing, ...post, createdAt: new Date().toISOString() }
    await env.BLOG_KV.put(`draft:${id}`, JSON.stringify(draft))
    return json({ success: true, post: draft })
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
