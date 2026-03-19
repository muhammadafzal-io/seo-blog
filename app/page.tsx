import { supabase } from '@/lib/supabase'

export const revalidate = 0

const VISIBLE_STATUSES = ['written', 'need_revision', 'approved', 'published']

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
    .not('content', 'is', null)
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
} as const

function getClient(a: any) {
  if (!a.clients) return null
  return Array.isArray(a.clients) ? a.clients[0] : a.clients
}

export default async function Home() {
  const articles = await getArticles()
  const published = articles.filter((a: any) => a.status === 'published').length
  const featured = articles[0]
  const rest = articles.slice(1)

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
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        .reveal { animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both; }
        .fade   { animation: fadeIn 0.8s ease both; }

        .card-link { text-decoration: none; color: inherit; display: block; }
        .card-link:hover .card-img img  { transform: scale(1.05); }
        .card-link:hover .card-arrow    { transform: translateX(4px); }
        .card-link:hover .card-surface  { box-shadow: 0 8px 40px rgba(0,0,0,0.10); transform: translateY(-2px); }

        .featured-link { text-decoration: none; color: inherit; display: block; }
        .featured-link:hover .feat-img img { transform: scale(1.04); filter: brightness(0.88); }
        .featured-link:hover .feat-arrow   { transform: translateX(5px); }
        .featured-link:hover .feat-cta     { background: var(--gold) !important; }

        .card-surface { transition: box-shadow 0.3s ease, transform 0.3s ease; }

        .card-img { overflow: hidden; }
        .card-img img {
          transition: transform 0.6s cubic-bezier(0.16,1,0.3,1);
          width: 100%; height: 100%; object-fit: cover; display: block;
        }

        .feat-img { overflow: hidden; }
        .feat-img img {
          transition: transform 0.7s cubic-bezier(0.16,1,0.3,1), filter 0.7s ease;
          width: 100%; height: 100%; object-fit: cover; display: block;
        }

        .card-arrow, .feat-arrow { display: inline-block; transition: transform 0.25s ease; }
        .feat-cta { transition: background 0.25s ease !important; }

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
              <span style={{
                fontFamily: 'var(--serif)', fontSize: 20,
                fontWeight: 400, color: 'var(--ink)', letterSpacing: '-0.02em',
              }}>
                The Brief
              </span>
              <span style={{
                fontFamily: 'var(--mono)', fontSize: 9,
                color: 'var(--accent)', letterSpacing: '0.12em',
                textTransform: 'uppercase', marginTop: 3,
              }}>
                AI-Powered
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)' }}>
                {articles.length} articles
              </span>
              <span style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontFamily: 'var(--mono)', fontSize: 11, color: '#22c55e',
              }}>
                <span style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: '#22c55e', display: 'inline-block',
                  boxShadow: '0 0 0 2px rgba(34,197,94,0.25)',
                }} />
                Live
              </span>
            </div>
          </div>
        </nav>

        {/* ── HEADER ── */}
        <header style={{ maxWidth: 1200, margin: '0 auto', padding: '72px 32px 56px' }}>
          <div className="reveal" style={{ animationDelay: '0.05s' }}>
            <p className="tag" style={{ marginBottom: 20 }}>
              SEO Content — Researched, Written & Published by AI
            </p>
            <h1 style={{
              fontFamily: 'var(--serif)',
              fontSize: 'clamp(42px, 6vw, 80px)',
              fontWeight: 300, lineHeight: 1.05,
              letterSpacing: '-0.03em',
              color: 'var(--ink)',
              maxWidth: 720, marginBottom: 24,
            }}>
              Stories that rank.<br />
              <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Automatically.</em>
            </h1>
          </div>

          <div className="reveal" style={{
            animationDelay: '0.15s',
            display: 'flex', alignItems: 'center', gap: 40, flexWrap: 'wrap',
          }}>
            {[
              { n: articles.length, l: 'Total' },
              { n: published, l: 'Published' },
              { n: articles.length - published, l: 'In Pipeline' },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{
                  fontFamily: 'var(--serif)', fontSize: 36,
                  fontWeight: 300, color: 'var(--ink)',
                  lineHeight: 1, letterSpacing: '-0.04em',
                }}>
                  {s.n}
                </span>
                <span className="tag">{s.l}</span>
              </div>
            ))}
          </div>
        </header>

        <hr className="rule" style={{ maxWidth: 1200, margin: '0 auto 64px', padding: '0 32px' }} />

        {/* ── MAIN ── */}
        <main style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px 100px' }}>

          {articles.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {/* ── FEATURED ── */}
              {featured && (
                <div className="reveal" style={{ animationDelay: '0.2s', marginBottom: 80 }}>
                  <p className="tag" style={{ marginBottom: 20 }}>Featured</p>
                  <FeaturedCard article={featured} />
                </div>
              )}

              {/* ── GRID ── */}
              {rest.length > 0 && (
                <>
                  <div style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', marginBottom: 32,
                  }}>
                    <p className="tag">Latest Articles</p>
                    <span className="tag">{rest.length} more</span>
                  </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: 20,
                  }}>
                    {rest.map((article: any, i: number) => (
                      <div
                        key={article.id}
                        className="reveal"
                        style={{ animationDelay: `${0.1 + i * 0.06}s` }}
                      >
                        <ArticleCard article={article} />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </main>

        {/* ── FOOTER ── */}
        <footer style={{
          borderTop: '1px solid var(--rule)',
          padding: '32px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          maxWidth: 1200, margin: '0 auto',
          flexWrap: 'wrap', gap: 16,
        }}>
          <span style={{
            fontFamily: 'var(--serif)', fontSize: 16,
            fontWeight: 300, color: 'var(--ink)',
          }}>
            The Brief
          </span>
          <span className="tag">Powered by AI Agents · Auto-published</span>
        </footer>

      </div>
    </>
  )
}

// ── FEATURED CARD ─────────────────────────────────────────────
function FeaturedCard({ article }: { article: any }) {
  const client = article.clients
    ? Array.isArray(article.clients) ? article.clients[0] : article.clients
    : null
  const href = article.wp_url || `/blog/${article.id}`

  return (
    <a
      href={href}
      target={article.wp_url ? '_blank' : '_self'}
      rel={article.wp_url ? 'noopener noreferrer' : undefined}
      className="featured-link"
      style={{
        display: 'block', position: 'relative',
        borderRadius: 20, overflow: 'hidden',
        minHeight: 520, background: '#0d0d0d',
        textDecoration: 'none',
      }}
    >
      {/* Always load hero image from public folder */}
      <div className="feat-img" style={{ position: 'absolute', inset: 0 }}>
        <img
          src="/featured-hero.svg"
          alt="Featured"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>

      {/* Bottom gradient */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(10,8,6,0.97) 0%, rgba(10,8,6,0.75) 45%, rgba(10,8,6,0.15) 75%, transparent 100%)',
        zIndex: 1,
      }} />
      {/* Left gradient */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to right, rgba(10,8,6,0.6) 0%, transparent 60%)',
        zIndex: 1,
      }} />

      {/* Top bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        padding: '24px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        zIndex: 2,
      }}>
        <span style={{
          fontFamily: 'var(--mono)', fontSize: 10,
          letterSpacing: '0.14em', textTransform: 'uppercase',
          color: 'var(--gold)',
          background: 'rgba(184,151,106,0.12)',
          border: '1px solid rgba(184,151,106,0.25)',
          padding: '5px 12px', borderRadius: 3,
        }}>
          {client?.niche || 'Featured'}
        </span>
        <span style={{
          fontFamily: 'var(--mono)', fontSize: 9,
          letterSpacing: '0.1em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.4)',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)',
          padding: '5px 12px', borderRadius: 3,
        }}>
          ✦ AI Written
        </span>
      </div>

      {/* Content */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '40px 40px 44px', zIndex: 2,
      }}>
        {/* Eyebrow */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <div style={{ width: 28, height: 1, background: 'var(--gold)' }} />
          <span style={{
            fontFamily: 'var(--mono)', fontSize: 10,
            letterSpacing: '0.16em', textTransform: 'uppercase',
            color: 'var(--gold)',
          }}>
            Editor's Pick
          </span>
        </div>

        {/* Title */}
        <h2 style={{
          fontFamily: 'var(--serif)',
          fontSize: 'clamp(28px, 4vw, 52px)',
          fontWeight: 300, lineHeight: 1.08,
          letterSpacing: '-0.03em',
          color: '#ffffff', marginBottom: 16, maxWidth: 680,
          textShadow: '0 2px 20px rgba(0,0,0,0.4)',
        }}>
          SEO Friendly Automated Generated Articles
        </h2>

        {/* Description */}
        {article.meta_description && (
          <p style={{
            fontFamily: 'var(--sans)', fontSize: 15,
            lineHeight: 1.65, color: 'rgba(255,255,255,0.6)',
            maxWidth: 560, marginBottom: 32,
          }}>
            {article.meta_description.slice(0, 160)}
            {article.meta_description.length > 160 ? '…' : ''}
          </p>
        )}

        {/* Bottom row */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
        }}>
          <span style={{
            fontFamily: 'var(--mono)', fontSize: 11,
            color: 'rgba(255,255,255,0.35)', letterSpacing: '0.04em',
          }}>
            #{article.keyword}
          </span>
          <span
            className="feat-cta"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 600,
              letterSpacing: '0.02em', color: '#0d0d0d',
              background: '#ffffff', padding: '11px 22px', borderRadius: 6,
            }}
          >
            Read Full Article
            <span className="feat-arrow" style={{ fontSize: 15 }}>→</span>
          </span>
        </div>
      </div>

      {/* Decorative ticks */}
      <div style={{
        position: 'absolute', right: 32, top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        zIndex: 2, opacity: 0.25,
      }}>
        {[...Array(5)].map((_, i) => (
          <div key={i} style={{
            width: 1, height: i === 2 ? 20 : 8,
            background: '#ffffff', borderRadius: 1,
          }} />
        ))}
      </div>
    </a>
  )
}

// ── ARTICLE CARD ──────────────────────────────────────────────
function ArticleCard({ article }: { article: any }) {
  const client = getClient(article)
  const statusCfg = STATUS[article.status as keyof typeof STATUS] || STATUS.written
  const href = article.wp_url || `/blog/${article.id}`

  return (
    <a
      href={href}
      target={article.wp_url ? '_blank' : '_self'}
      rel={article.wp_url ? 'noopener noreferrer' : undefined}
      className="card-link"
    >
      <div className="card-surface" style={{
        background: 'var(--card)',
        border: '1px solid var(--rule)',
        borderRadius: 12, overflow: 'hidden',
        height: '100%', display: 'flex', flexDirection: 'column',
      }}>
        {/* Thumbnail */}
        <div className="card-img" style={{
          height: 200, flexShrink: 0,
          background: 'linear-gradient(135deg, #f5f3ef, #ece9e3)',
        }}>
          {article.featured_image_url ? (
            <img
              src={article.featured_image_url}
              alt={article.meta_title || article.keyword}
              style={{ height: 200 }}
            />
          ) : (
            <div style={{
              height: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--serif)', fontSize: 48,
              color: '#d4cfc6', letterSpacing: '-0.02em',
            }}>
              {(article.keyword || 'A')[0].toUpperCase()}
            </div>
          )}
        </div>

        {/* Body */}
        <div style={{
          padding: '20px 22px 22px',
          display: 'flex', flexDirection: 'column', gap: 10, flex: 1,
        }}>
          {/* Top row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="tag" style={{ color: client?.niche ? 'var(--accent)' : 'var(--muted-2)' }}>
              {client?.niche || 'General'}
            </span>
            <span style={{
              fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted-2)',
              display: 'flex', alignItems: 'center',
            }}>
              <span className="status-dot" style={{ background: statusCfg.dot }} />
              {statusCfg.label}
            </span>
          </div>

          {/* Title */}
          <h3 style={{
            fontFamily: 'var(--serif)', fontSize: 18,
            fontWeight: 400, lineHeight: 1.3,
            letterSpacing: '-0.02em', color: 'var(--ink)',
          }}>
            {article.meta_title || article.keyword}
          </h3>

          {/* Description */}
          {article.meta_description && (
            <p style={{
              fontSize: 13, color: 'var(--muted)',
              lineHeight: 1.6, flex: 1,
            }}>
              {article.meta_description.slice(0, 100)}
              {article.meta_description.length > 100 ? '…' : ''}
            </p>
          )}

          {/* Footer */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            paddingTop: 14, borderTop: '1px solid var(--rule)',
          }}>
            <span className="tag">{timeAgo(article.updated_at)}</span>
            <span style={{
              fontFamily: 'var(--sans)', fontSize: 12, fontWeight: 500,
              color: 'var(--ink-3)',
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              Read <span className="card-arrow">→</span>
            </span>
          </div>
        </div>
      </div>
    </a>
  )
}

// ── EMPTY STATE ───────────────────────────────────────────────
function EmptyState() {
  return (
    <div style={{ textAlign: 'center', padding: '120px 32px' }}>
      <p style={{
        fontFamily: 'var(--serif)',
        fontSize: 'clamp(32px, 5vw, 56px)',
        fontWeight: 300, color: 'var(--ink)',
        letterSpacing: '-0.03em', marginBottom: 16,
      }}>
        Articles incoming.
      </p>
      <p style={{
        fontFamily: 'var(--mono)', fontSize: 12,
        color: 'var(--muted)', letterSpacing: '0.04em',
      }}>
        AI agents are researching and writing. Check back shortly.
      </p>
    </div>
  )
}
