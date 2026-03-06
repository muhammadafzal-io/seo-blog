import { supabase } from '@/lib/supabase'

export const revalidate = 0

// Show these statuses — covers all articles that have content
const VISIBLE_STATUSES = ['written', 'need_revision', 'approved', 'published']

async function getArticles() {
  const { data, error } = await supabase
    .from('articles')
    .select(`
      id,
      keyword,
      meta_title,
      meta_description,
      status,
      content,
      wp_url,
      updated_at,
      client_id,
      clients (
        name,
        niche,
        domain
      )
    `)
    .in('status', VISIBLE_STATUSES)
    .not('content', 'is', null)        
    .order('updated_at', { ascending: false })
    .limit(20)

  if (error) {
    console.error('Supabase error:', error.message, error.details)
    return []
  }
  return data || []
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return `${Math.floor(days / 30)}mo ago`
}

// Status badge config
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  published: { label: 'Published', color: '#16a34a', bg: '#f0fdf4' },
  approved: { label: 'Approved', color: '#2563eb', bg: '#eff6ff' },
  written: { label: 'Written', color: '#d97706', bg: '#fffbeb' },
  need_revision: { label: 'Revising', color: '#9333ea', bg: '#faf5ff' },
}

// Get client niche safely — Supabase can return object or array
function getClient(article: any) {
  if (!article.clients) return null
  if (Array.isArray(article.clients)) return article.clients[0] || null
  return article.clients
}

export default async function Home() {
  const articles = await getArticles()
  const publishedCount = articles.filter((a: any) => a.status === 'published').length

  return (
    <div style={s.page}>

      {/* ── HEADER ── */}
      <header style={s.header}>
        <div style={s.headerInner}>
          <div style={s.logo}>
            <span style={s.logoMark}>◆</span>
            <span style={s.logoText}>SEO Blog</span>
          </div>
          <div style={s.headerRight}>
            <span style={s.liveTag}>● Live</span>
            <span style={s.articleCount}>{articles.length} articles</span>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section style={s.hero}>
        <p style={s.heroEye}>SEO Content Pipeline</p>
        <h1 style={s.heroTitle}>
          Fresh articles,<br />
          <em style={s.heroItalic}>published automatically.</em>
        </h1>
        <p style={s.heroDesc}>
          Every article is researched, written, and reviewed by AI agents —
          optimised for search engines and published on schedule.
        </p>

        {/* Stats row */}
        <div style={s.statsRow}>
          {[
            { num: articles.length, label: 'Total Articles' },
            { num: publishedCount, label: 'Published' },
            { num: articles.length - publishedCount, label: 'In Pipeline' },
          ].map((stat, i) => (
            <div key={i} style={s.stat}>
              <span style={s.statNum}>{stat.num}</span>
              <span style={s.statLabel}>{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      <div style={s.divider} />

      {/* ── ARTICLE GRID ── */}
      <main style={s.main}>
        {articles.length === 0 ? (
          <EmptyState />
        ) : (
          <div style={s.grid}>
              {articles.map((article: any, i: number) => {
                const client = getClient(article)
                const statusCfg = STATUS_CONFIG[article.status] || STATUS_CONFIG.written
                const href = article.wp_url || `/blog/${article.id}`

                return (
                  <a
                    key={article.id}
                  href={href}
                  target={article.wp_url ? '_blank' : '_self'}
                  rel={article.wp_url ? 'noopener noreferrer' : undefined}
                  style={{ ...s.card, animationDelay: `${i * 0.05}s` }}
                  className="article-card"
                >
                  {/* Card top */}
                  <div style={s.cardTop}>
                    <div style={s.cardMeta}>
                      {client?.niche && (
                        <span style={s.niche}>{client.niche}</span>
                      )}
                      <span style={s.date}>{timeAgo(article.updated_at)}</span>
                    </div>
                    {/* Status badge */}
                    <span style={{
                      ...s.statusBadge,
                      color: statusCfg.color,
                      background: statusCfg.bg,
                    }}>
                      {statusCfg.label}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 style={s.cardTitle}>
                    {article.meta_title || article.keyword}
                  </h2>

                  {/* Description */}
                  {article.meta_description && (
                    <p style={s.cardDesc}>
                      {article.meta_description.slice(0, 120)}
                      {article.meta_description.length > 120 ? '…' : ''}
                    </p>
                  )}

                  {/* Footer */}
                  <div style={s.cardFooter}>
                    <span style={s.keyword}>#{article.keyword}</span>
                    <span style={s.readMore}>
                      {article.status === 'published' ? 'Read →' : 'Preview →'}
                    </span>
                  </div>
                </a>
              )
            })}
          </div>
        )}
      </main>

      {/* ── FOOTER ── */}
      <footer style={s.footer}>
        <span style={s.footerText}>Powered by AI Agents · Auto-published</span>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .article-card {
          animation: fadeUp .5s ease both;
          transition: box-shadow .2s ease, transform .2s ease !important;
        }
        .article-card:hover {
          transform: translateY(-3px) !important;
          box-shadow: 0 12px 40px rgba(0,0,0,.08) !important;
        }
      `}</style>
    </div>
  )
}

function EmptyState() {
  return (
    <div style={s.empty}>
      <div style={s.emptyIcon}>✦</div>
      <p style={s.emptyTitle}>Articles coming soon</p>
      <p style={s.emptyDesc}>AI agents are writing your first articles. Check back shortly.</p>
      <div style={s.debugBox}>
        <p style={s.debugTitle}>Nothing showing? Check these:</p>
        <p style={s.debugItem}>1. Go to Supabase → articles table → confirm rows exist with content filled in</p>
        <p style={s.debugItem}>2. Status must be one of: written, approved, published</p>
        <p style={s.debugItem}>3. Run WF2 manually in n8n to generate articles</p>
        <p style={s.debugItem}>4. Check Vercel logs for any Supabase errors</p>
      </div>
    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#fafaf8', fontFamily: "'DM Sans', sans-serif" },
  header: { borderBottom: '1px solid #e8e5df', background: '#ffffff', position: 'sticky', top: 0, zIndex: 50 },
  headerInner: { maxWidth: 1100, margin: '0 auto', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  logo: { display: 'flex', alignItems: 'center', gap: 10 },
  logoMark: { fontSize: 16, color: '#1a1916' },
  logoText: { fontSize: 16, fontWeight: 600, color: '#1a1916', letterSpacing: '-0.3px' },
  headerRight: { display: 'flex', alignItems: 'center', gap: 16 },
  liveTag: { fontSize: 12, color: '#16a34a', fontWeight: 500 },
  articleCount: { fontSize: 12, color: '#8a8880', fontFamily: 'monospace' },

  hero: { maxWidth: 700, margin: '0 auto', padding: '80px 32px 64px', textAlign: 'center' },
  heroEye: { fontFamily: 'monospace', fontSize: 11, letterSpacing: '3px', textTransform: 'uppercase', color: '#8a8880', marginBottom: 20 },
  heroTitle: { fontFamily: "'Lora', serif", fontSize: 'clamp(36px, 5vw, 58px)', fontWeight: 400, lineHeight: 1.1, letterSpacing: '-1.5px', color: '#1a1916', marginBottom: 20 },
  heroItalic: { fontStyle: 'italic', color: '#1a1916' },
  heroDesc: { fontSize: 16, color: '#8a8880', lineHeight: 1.7, maxWidth: 480, margin: '0 auto 36px' },

  statsRow: { display: 'flex', justifyContent: 'center', gap: 40, marginTop: 8 },
  stat: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  statNum: { fontFamily: "'Lora', serif", fontSize: 32, fontWeight: 600, color: '#1a1916', lineHeight: 1 },
  statLabel: { fontFamily: 'monospace', fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#8a8880' },

  divider: { height: 1, background: '#e8e5df', maxWidth: 1100, margin: '0 auto 56px' },
  main: { maxWidth: 1100, margin: '0 auto', padding: '0 32px 80px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 },
  card: { background: '#ffffff', border: '1px solid #e8e5df', borderRadius: 14, padding: '28px', display: 'flex', flexDirection: 'column', gap: 14, cursor: 'pointer', textDecoration: 'none', color: 'inherit' },
  cardTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  cardMeta: { display: 'flex', alignItems: 'center', gap: 10 },
  niche: { fontSize: 11, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#8a8880', background: '#f2f0ea', padding: '3px 8px', borderRadius: 4 },
  date: { fontSize: 12, color: '#8a8880', fontFamily: 'monospace' },
  statusBadge: { fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 4, fontFamily: 'monospace' },
  cardTitle: { fontFamily: "'Lora', serif", fontSize: 20, fontWeight: 600, lineHeight: 1.3, letterSpacing: '-0.3px', color: '#1a1916' },
  cardDesc: { fontSize: 14, color: '#8a8880', lineHeight: 1.65, flex: 1 },
  cardFooter: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, borderTop: '1px solid #f2f0ea', marginTop: 4 },
  keyword: { fontSize: 12, color: '#8a8880', fontFamily: 'monospace' },
  readMore: { fontSize: 13, fontWeight: 500, color: '#1a1916' },

  empty: { textAlign: 'center', padding: '80px 32px' },
  emptyIcon: { fontSize: 32, color: '#e8e5df', marginBottom: 16 },
  emptyTitle: { fontFamily: "'Lora', serif", fontSize: 24, fontWeight: 600, color: '#1a1916', marginBottom: 8 },
  emptyDesc: { fontSize: 15, color: '#8a8880', marginBottom: 32 },
  debugBox: { maxWidth: 480, margin: '0 auto', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '20px 24px', textAlign: 'left' },
  debugTitle: { fontSize: 13, fontWeight: 600, color: '#92400e', marginBottom: 10, fontFamily: 'monospace' },
  debugItem: { fontSize: 13, color: '#78350f', marginBottom: 6, lineHeight: 1.5 },

  footer: { borderTop: '1px solid #e8e5df', padding: '24px 32px', textAlign: 'center' },
  footerText: { fontSize: 12, color: '#8a8880', fontFamily: 'monospace', letterSpacing: '0.5px' },
}
