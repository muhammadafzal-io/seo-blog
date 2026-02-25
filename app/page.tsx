import { supabase } from '@/lib/supabase'

// --- FIX START ---
// Yeh line add karein taake home page cache na ho aur naya article foran dikhaye
export const revalidate = 0;
// --- FIX END ---

async function getArticles() {
  // Agar pichle step m database relationship fix nahi ki thi, 
  // toh 'clients' wala hissa hata dein warna length 0 aayegi.
  const { data, error } = await supabase
    .from('articles')
    .select(`
      id,
      keyword,
      meta_title,
      meta_description,
      quality_score,
      status,
      updated_at,
      clients (
        name,
        niche,
        domain
      )
    `)
    .eq('status', 'published')
    .order('updated_at', { ascending: false })
    .limit(20)

  if (error) {
    console.error('Supabase error:', error)
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

export default async function Home() {
  const articles = await getArticles()

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
            {/* Ab yeh count hamesha updated rahega */}
            <span style={s.articleCount}>{articles.length} articles</span>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section style={s.hero}>
        <p style={s.heroEye}>SEO Web Site</p>
        <h1 style={s.heroTitle}>
          Fresh articles,<br />
          <em style={s.heroItalic}>published automatically.</em>
        </h1>
        <p style={s.heroDesc}>
          Every article is researched, written, and reviewed by AI agents —
          optimised for search engines and published on schedule.
        </p>
      </section>

      <div style={s.divider} />

      {/* ── ARTICLE LIST ── */}
      <main style={s.main}>
        {articles.length === 0 ? (
          <div style={s.empty}>
            <div style={s.emptyIcon}>✦</div>
            <p style={s.emptyTitle}>Articles coming soon</p>
            <p style={s.emptyDesc}>AI agents are writing your first articles. Check back shortly.</p>
          </div>
        ) : (
          <div style={s.grid}>
            {articles.map((article: any, i: number) => (
              <a
                key={article.id}
                href={`/blog/${article.id}`}
                style={{
                  ...s.card,
                  animationDelay: `${i * 0.05}s`,
                }}
                className="article-card"
              >
                {/* Card top */}
                <div style={s.cardTop}>
                  <div style={s.cardMeta}>
                    {/* Safe check for clients */}
                    {article.clients?.[0]?.niche ? (
                      <span style={s.niche}>{article.clients[0].niche}</span>
                    ) : (article.clients?.niche && (
                       // Agar single object return ho raha hai (not array)
                       <span style={s.niche}>{article.clients.niche}</span>
                    ))}
                    
                    <span style={s.date}>{timeAgo(article.updated_at)}</span>
                  </div>
                  {article.quality_score >= 80 && (
                    <span style={s.scoreBadge}>★ {article.quality_score}</span>
                  )}
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
                  <span style={s.readMore}>Read →</span>
                </div>
              </a>
            ))}
          </div>
        )}
      </main>

      {/* ── FOOTER ── */}
      <footer style={s.footer}>
        <span style={s.footerText}>Powered by AI Agents · Auto-published</span>
      </footer>

      <style>{`
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

// ── Styles ──────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#fafaf8' },
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
  heroDesc: { fontSize: 16, color: '#8a8880', lineHeight: 1.7, maxWidth: 480, margin: '0 auto' },
  divider: { height: 1, background: '#e8e5df', maxWidth: 1100, margin: '0 auto 56px' },
  main: { maxWidth: 1100, margin: '0 auto', padding: '0 32px 80px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 },
  card: { background: '#ffffff', border: '1px solid #e8e5df', borderRadius: 14, padding: '28px', display: 'flex', flexDirection: 'column', gap: 14, cursor: 'pointer', textDecoration: 'none', color: 'inherit' },
  cardTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  cardMeta: { display: 'flex', alignItems: 'center', gap: 10 },
  niche: { fontSize: 11, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#8a8880', background: '#f2f0ea', padding: '3px 8px', borderRadius: 4 },
  date: { fontSize: 12, color: '#8a8880', fontFamily: 'monospace' },
  scoreBadge: { fontSize: 11, fontWeight: 600, color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: 4, fontFamily: 'monospace' },
  cardTitle: { fontFamily: "'Lora', serif", fontSize: 20, fontWeight: 600, lineHeight: 1.3, letterSpacing: '-0.3px', color: '#1a1916' },
  cardDesc: { fontSize: 14, color: '#8a8880', lineHeight: 1.65, flex: 1 },
  cardFooter: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, borderTop: '1px solid #f2f0ea', marginTop: 4 },
  keyword: { fontSize: 12, color: '#8a8880', fontFamily: 'monospace' },
  readMore: { fontSize: 13, fontWeight: 500, color: '#1a1916' },
  empty: { textAlign: 'center', padding: '100px 32px' },
  emptyIcon: { fontSize: 32, color: '#e8e5df', marginBottom: 16 },
  emptyTitle: { fontFamily: "'Lora', serif", fontSize: 24, fontWeight: 600, color: '#1a1916', marginBottom: 8 },
  emptyDesc: { fontSize: 15, color: '#8a8880' },
  footer: { borderTop: '1px solid #e8e5df', padding: '24px 32px', textAlign: 'center' },
  footerText: { fontSize: 12, color: '#8a8880', fontFamily: 'monospace', letterSpacing: '0.5px' },
}
