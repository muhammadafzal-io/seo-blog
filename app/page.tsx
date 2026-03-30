import { supabase } from '@/lib/supabase'

export const revalidate = 0

// Updated to include the initial pipeline statuses
const VISIBLE_STATUSES = ['new', 'processing', 'written', 'need_revision', 'approved', 'published']

async function getArticles() {
  const { data, error } = await supabase
    .from('articles')
    .select(`
      id, keyword, meta_title, meta_description,
      status, content, wp_url, updated_at, client_id,
      featured_image_url,
      clients ( name, niche, domain )
    `)
    .in('status', VISIBLE_STATUSES)
    // Removed the .not('content', 'is', null) to show pipeline articles
    .order('updated_at', { ascending: false })
    .limit(20)

  if (error) { console.error('Supabase error:', error.message); return [] }
  return data || []
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const STATUS = {
  published: { label: 'Published', dot: '#22c55e' },
  approved: { label: 'Approved', dot: '#3b82f6' },
  written: { label: 'Written', dot: '#f59e0b' },
  need_revision: { label: 'Revision', dot: '#a855f7' },
  processing: { label: 'Writing...', dot: '#3b82f6' }, // Added
  new: { label: 'Queued', dot: '#767676' },            // Added
} as const

function getClient(a: any) {
  const c = a.clients;
  if (!c) return { name: 'Internal', niche: 'General', domain: '' };
  return Array.isArray(c) ? c[0] : c;
}

export default async function Home() {
  const articles = await getArticles()
  const publishedCount = articles.filter((a: any) => a.status === 'published').length

  // Logic to handle empty or single article states
  const featured = articles.length > 0 ? articles[0] : null
  const rest = articles.length > 1 ? articles.slice(1) : []

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;1,9..144,300;1,9..144,400&family=Instrument+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --ink:     #0d0d0d;
          --ink-2:   #1c1c1c;
          --ink-3:   #3a3a3a;
          --muted:   #767676;
          --muted-2: #a0a0a0;
          --rule:    #e8e4de;
          --surface: #faf9f7;
          --card:    #ffffff;
          --accent:  #c4622d;
          --gold:    #b8976a;
          --sans:    'Instrument Sans', sans-serif;
          --serif:   'Fraunces', serif;
          --mono:    'DM Mono', monospace;
        }

        body { background: var(--surface); color: var(--ink); font-family: var(--sans); }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }

        .reveal { animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both; }
        .processing-pulse { animation: pulse 2s infinite ease-in-out; }

        .card-link { text-decoration: none; color: inherit; display: block; height: 100%; }
        .card-link:hover .card-img img  { transform: scale(1.05); }
        .card-link:hover .card-arrow    { transform: translateX(4px); }
        .card-link:hover .card-surface  { box-shadow: 0 8px 40px rgba(0,0,0,0.08); transform: translateY(-2px); }

        .featured-link { text-decoration: none; color: inherit; display: block; }
        .featured-link:hover .feat-img img { transform: scale(1.04); filter: brightness(0.88); }
        .featured-link:hover .feat-cta     { background: var(--gold) !important; }

        .card-surface { transition: all 0.3s ease; height: 100%; }
        .card-img { overflow: hidden; position: relative; }
        .card-img img {
          transition: transform 0.6s cubic-bezier(0.16,1,0.3,1);
          width: 100%; height: 100%; object-fit: cover; display: block;
        }

        hr.rule { border: none; border-top: 1px solid var(--rule); }

        .tag {
          font-family: var(--mono);
          font-size: 10px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--muted);
        }

        .status-dot {
          display: inline-block;
          width: 6px; height: 6px;
          border-radius: 50%;
          vertical-align: middle;
          margin-right: 5px;
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: 'var(--surface)' }}>

        {/* ── NAV ── */}
        <nav style={{
          borderBottom: '1px solid var(--rule)',
          background: 'rgba(250,249,247,0.92)',
          backdropFilter: 'blur(12px)',
          position: 'sticky', top: 0, zIndex: 100,
        }}>
          <div style={{
            maxWidth: 1200, margin: '0 auto',
            padding: '0 32px', height: 60,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontFamily: 'var(--serif)', fontSize: 20, color: 'var(--ink)' }}>The Brief</span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--accent)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>AI-Powered</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)' }}>{articles.length} articles</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--mono)', fontSize: 11, color: '#22c55e' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 0 2px rgba(34,197,94,0.25)' }} />
                Live
              </span>
            </div>
          </div>
        </nav>

        {/* ── HEADER ── */}
        <header style={{ maxWidth: 1200, margin: '0 auto', padding: '72px 32px 56px' }}>
          <div className="reveal">
            <p className="tag" style={{ marginBottom: 20 }}>SEO Content — Managed by AI Agents</p>
            <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(42px, 6vw, 80px)', fontWeight: 300, lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: 24 }}>
              Stories that rank.<br />
              <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Automatically.</em>
            </h1>
          </div>

          <div className="reveal" style={{ display: 'flex', alignItems: 'center', gap: 40, flexWrap: 'wrap', marginTop: 32 }}>
            {[
              { n: articles.length, l: 'Total' },
              { n: publishedCount, l: 'Published' },
              { n: articles.length - publishedCount, l: 'Pipeline' },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontFamily: 'var(--serif)', fontSize: 36, fontWeight: 300 }}>{s.n}</span>
                <span className="tag">{s.l}</span>
              </div>
            ))}
          </div>
        </header>

        <hr className="rule" style={{ maxWidth: 1200, margin: '0 auto 64px' }} />

        {/* ── MAIN ── */}
        <main style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px 100px' }}>
          {articles.length === 0 ? (
            <EmptyState />
          ) : (
              <>
              {featured && (
                  <div className="reveal" style={{ marginBottom: 80 }}>
                    <p className="tag" style={{ marginBottom: 20 }}>Featured Story</p>
                  <FeaturedCard article={featured} />
                </div>
              )}

              {rest.length > 0 && (
                <>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
                      <p className="tag">Latest Updates</p>
                      <span className="tag">{rest.length} Articles</span>
                  </div>
                  <div style={{
                    display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                      gap: 24,
                  }}>
                    {rest.map((article: any, i: number) => (
                      <div key={article.id} className="reveal" style={{ animationDelay: `${0.1 + i * 0.05}s` }}>
                        <ArticleCard article={article} />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </main>
      </div>
    </>
  )
}

// ── FEATURED CARD ─────────────────────────────────────────────
function FeaturedCard({ article }: { article: any }) {
  const client = getClient(article)
  const href = article.wp_url || `/blog/${article.id}`

  return (
    <a href={href} className="featured-link" style={{ display: 'block', position: 'relative', borderRadius: 20, overflow: 'hidden', minHeight: 520, background: '#0d0d0d' }}>
      <div className="feat-img" style={{ position: 'absolute', inset: 0 }}>
        <img src={article.featured_image_url || "/featured-hero.svg"} alt="Hero" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)', zIndex: 1 }} />

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 40, zIndex: 2 }}>
        <span className="tag" style={{ color: 'var(--gold)', marginBottom: 16, display: 'block' }}>{client.niche}</span>
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(24px, 4vw, 48px)', color: '#fff', fontWeight: 300, marginBottom: 20, maxWidth: 800 }}>
          {article.meta_title || article.keyword}
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="tag" style={{ color: 'rgba(255,255,255,0.5)' }}>#{article.keyword}</span>
          <span className="feat-cta" style={{ background: '#fff', color: '#000', padding: '12px 24px', borderRadius: 8, fontWeight: 600, fontSize: 14 }}>Read Article →</span>
        </div>
      </div>
    </a>
  )
}

// ── ARTICLE CARD ──────────────────────────────────────────────
function ArticleCard({ article }: { article: any }) {
  const client = getClient(article)
  const statusCfg = STATUS[article.status as keyof typeof STATUS] || STATUS.new
  const isProcessing = article.status === 'processing'
  const href = article.wp_url || `/blog/${article.id}`

  return (
    <a href={href} className={`card-link ${isProcessing ? 'processing-pulse' : ''}`}>
      <div className="card-surface" style={{ background: 'var(--card)', border: '1px solid var(--rule)', borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div className="card-img" style={{ height: 220, background: '#f0f0f0' }}>
          {article.featured_image_url ? (
            <img src={article.featured_image_url} alt={article.keyword} />
          ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, color: '#ccc', fontFamily: 'var(--serif)' }}>
                {article.keyword?.[0].toUpperCase() || 'A'}
            </div>
          )}
        </div>

        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <span className="tag" style={{ color: 'var(--accent)' }}>{client.niche}</span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', display: 'flex', alignItems: 'center' }}>
              <span className="status-dot" style={{ background: statusCfg.dot }} />
              {statusCfg.label}
            </span>
          </div>

          <h3 style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 400, lineHeight: 1.3, marginBottom: 12, color: 'var(--ink)' }}>
            {article.meta_title || article.keyword}
          </h3>

          <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid var(--rule)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="tag">{timeAgo(article.updated_at)}</span>
            <span style={{ fontSize: 13, fontWeight: 600 }}>View <span className="card-arrow">→</span></span>
          </div>
        </div>
      </div>
    </a>
  )
}

function EmptyState() {
  return (
    <div style={{ textAlign: 'center', padding: '100px 0' }}>
      <h2 style={{ fontFamily: 'var(--serif)', fontSize: 32, fontWeight: 300 }}>Queueing articles...</h2>
      <p className="tag" style={{ marginTop: 12 }}>The AI agents are hard at work.</p>
    </div>
  )
}