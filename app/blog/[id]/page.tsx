import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'

export const revalidate = 0

async function getArticle(id: string) {
  const { data, error } = await supabase
    .from('articles')
    .select(`
      id, keyword, meta_title, meta_description,
      content, status, wp_url, updated_at, created_at,
      featured_image_url, image_prompt,
      clients ( name, niche, domain )
    `)
    .eq('id', id)
    .not('content', 'is', null)
    .single()

  if (error || !data) return null
  return data
}

function getClient(article: any) {
  if (!article.clients) return null
  return Array.isArray(article.clients) ? article.clients[0] : article.clients
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
}

function readingTime(content: string) {
  const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length
  return Math.max(1, Math.round(words / 200))
}

export default async function ArticlePage({ params }: { params: { id: string } }) {
  const article = await getArticle(params.id)
  if (!article) notFound()

  const client = getClient(article)
  const minutes = readingTime(article.content || '')

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
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .reveal { animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both; }

        /* Article typography */
        .prose h1 { font-family: var(--serif); font-size: clamp(1.6rem, 3vw, 2.2rem); font-weight: 400; line-height: 1.2; letter-spacing: -0.025em; color: var(--ink); margin: 2.5rem 0 1rem; }
        .prose h2 { font-family: var(--serif); font-size: clamp(1.3rem, 2.5vw, 1.7rem); font-weight: 400; line-height: 1.25; letter-spacing: -0.02em; color: var(--ink); margin: 2.2rem 0 0.9rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--rule); }
        .prose h3 { font-family: var(--sans); font-size: 1.1rem; font-weight: 600; color: var(--ink-2); margin: 1.8rem 0 0.6rem; letter-spacing: -0.01em; }
        .prose p  { font-size: 1.05rem; line-height: 1.82; color: var(--ink-3); margin-bottom: 1.4rem; font-family: var(--sans); }
        .prose p:first-child { font-size: 1.15rem; color: var(--ink-2); }
        .prose ul, .prose ol { padding-left: 1.6rem; margin-bottom: 1.4rem; }
        .prose li { font-size: 1rem; line-height: 1.75; color: var(--ink-3); margin-bottom: 0.5rem; }
        .prose a  { color: var(--accent); text-decoration: underline; text-underline-offset: 3px; }
        .prose strong { color: var(--ink); font-weight: 600; }
        .prose blockquote { border-left: 2px solid var(--gold); padding: 0.5rem 0 0.5rem 1.5rem; margin: 2rem 0; font-family: var(--serif); font-style: italic; font-size: 1.15rem; color: var(--muted); line-height: 1.6; }
        .prose hr { border: none; border-top: 1px solid var(--rule); margin: 2.5rem 0; }

        .back-link { text-decoration: none; }
        .back-link:hover .back-arrow { transform: translateX(-3px); }
        .back-arrow { display: inline-block; transition: transform 0.2s ease; }
      `}</style>

      <div style={{ minHeight: '100vh', background: 'var(--surface)' }}>

        {/* ── STICKY NAV ── */}
        <nav style={{
          borderBottom: '1px solid var(--rule)',
          background: 'rgba(250,249,247,0.92)',
          backdropFilter: 'blur(12px)',
          position: 'sticky', top: 0, zIndex: 100,
        }}>
          <div style={{
            maxWidth: 1200, margin: '0 auto', padding: '0 32px',
            height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <a href="/" className="back-link" style={{
              display: 'flex', alignItems: 'center', gap: 8,
              fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 500, color: 'var(--muted)',
            }}>
              <span className="back-arrow">←</span>
              All articles
            </a>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted-2)' }}>
                {minutes} min read
              </span>
              {article.wp_url && (
                <a href={article.wp_url} target="_blank" rel="noopener noreferrer" style={{
                  fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--accent)',
                  textDecoration: 'none',
                }}>
                  WordPress ↗
                </a>
              )}
            </div>
          </div>
        </nav>

        {/* ── HERO IMAGE ── */}
        {article.featured_image_url && (
          <div style={{
            width: '100%', height: 'clamp(300px, 45vw, 580px)',
            overflow: 'hidden', position: 'relative',
            background: 'var(--ink)',
          }}>
            <img
              src={article.featured_image_url}
              alt={article.meta_title || article.keyword}
              style={{
                width: '100%', height: '100%', objectFit: 'cover',
                display: 'block', opacity: 0.88,
              }}
            />
            {/* Bottom fade */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to bottom, transparent 55%, rgba(250,249,247,0.6) 100%)',
            }} />
            {/* AI badge */}
            <span style={{
              position: 'absolute', bottom: 20, right: 24,
              fontFamily: 'var(--mono)', fontSize: 10,
              color: 'rgba(255,255,255,0.6)',
              background: 'rgba(13,13,13,0.45)',
              padding: '4px 10px', borderRadius: 3,
              letterSpacing: '0.06em',
            }}>
              ✦ AI Generated
            </span>
          </div>
        )}

        {/* ── ARTICLE ── */}
        <div style={{ maxWidth: 1220, margin: '0 auto', padding: '0 32px' }}>

          {/* Header */}
          <header className="reveal" style={{ padding: '56px 0 40px', animationDelay: '0.1s' }}>
            {/* Meta row */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 16,
              flexWrap: 'wrap', marginBottom: 28,
            }}>
              {client?.niche && (
                <span style={{
                  fontFamily: 'var(--mono)', fontSize: 10,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: 'var(--accent)',
                }}>
                  {client.niche}
                </span>
              )}
              <span style={{
                width: 3, height: 3, borderRadius: '50%',
                background: 'var(--muted-2)', display: 'inline-block',
              }} />
              <span style={{
                fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)',
              }}>
                {formatDate(article.updated_at)}
              </span>
              <span style={{
                width: 3, height: 3, borderRadius: '50%',
                background: 'var(--muted-2)', display: 'inline-block',
              }} />
              <span style={{
                fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)',
              }}>
                {minutes} min read
              </span>
            </div>

            {/* Title */}
            <h1 style={{
              fontFamily: 'var(--serif)',
              fontSize: 'clamp(32px, 5vw, 54px)',
              fontWeight: 300,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              color: 'var(--ink)',
              marginBottom: 24,
            }}>
              {article.meta_title || article.keyword}
            </h1>

            {/* Lead / description */}
            {article.meta_description && (
              <p style={{
                fontFamily: 'var(--sans)',
                fontSize: 18,
                lineHeight: 1.65,
                color: 'var(--muted)',
                borderLeft: '2px solid var(--gold)',
                paddingLeft: 20,
                fontStyle: 'italic',
              }}>
                {article.meta_description}
              </p>
            )}
          </header>

          {/* Divider */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 16, marginBottom: 48,
          }}>
            <div style={{ height: 1, background: 'var(--rule)', flex: 1 }} />
            <span style={{
              fontFamily: 'var(--mono)', fontSize: 9,
              color: 'var(--muted-2)', letterSpacing: '0.12em', textTransform: 'uppercase',
            }}>
              Article
            </span>
            <div style={{ height: 1, background: 'var(--rule)', flex: 1 }} />
          </div>

          {/* Body */}
          <div
            className="prose reveal"
            style={{ animationDelay: '0.2s', paddingBottom: 80 }}
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Article footer */}
          <footer style={{
            borderTop: '1px solid var(--rule)',
            padding: '32px 0 80px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted-2)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Keyword
              </span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--ink-3)' }}>
                #{article.keyword}
              </span>
            </div>
            {client?.domain && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, textAlign: 'right' }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted-2)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Domain
                </span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--ink-3)' }}>
                  {client.domain}
                </span>
              </div>
            )}
          </footer>
        </div>

        {/* ── BOTTOM NAV ── */}
        <div style={{
          borderTop: '1px solid var(--rule)',
          padding: '24px 32px',
          display: 'flex',
          justifyContent: 'center',
        }}>
          <a href="/" style={{
            fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 500,
            color: 'var(--muted)', textDecoration: 'none',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            ← Back to all articles
          </a>
        </div>

      </div>
    </>
  )
}
