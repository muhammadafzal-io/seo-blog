import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'

export const revalidate = 0

async function getArticle(id: string) {
  const { data, error } = await supabase
    .from('articles')
    .select(`
      id, keyword, meta_title, meta_description,
      content, status, wp_url, updated_at, created_at,
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
  if (Array.isArray(article.clients)) return article.clients[0] || null
  return article.clients
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default async function ArticlePage({ params }: { params: { id: string } }) {
  const article = await getArticle(params.id)
  if (!article) notFound()

  const client = getClient(article)

  return (
    <div style={s.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&display=swap');
        .article-body h1 { font-family: 'Lora', serif; font-size: 2rem; font-weight: 600; margin: 1.5rem 0 1rem; color: #1a1916; line-height: 1.2; }
        .article-body h2 { font-family: 'Lora', serif; font-size: 1.5rem; font-weight: 600; margin: 2rem 0 0.75rem; color: #1a1916; }
        .article-body h3 { font-size: 1.2rem; font-weight: 600; margin: 1.5rem 0 0.5rem; color: #1a1916; }
        .article-body p  { font-size: 1.05rem; line-height: 1.8; margin-bottom: 1.25rem; color: #3a3936; }
        .article-body ul, .article-body ol { padding-left: 1.5rem; margin-bottom: 1.25rem; }
        .article-body li { font-size: 1.05rem; line-height: 1.8; color: #3a3936; margin-bottom: 0.4rem; }
        .article-body a  { color: #2563eb; text-decoration: underline; }
        .article-body strong { color: #1a1916; font-weight: 600; }
        .article-body blockquote { border-left: 3px solid #e8e5df; padding-left: 1.25rem; margin: 1.5rem 0; color: #8a8880; font-style: italic; }
      `}</style>

      {/* ── HEADER ── */}
      <header style={s.header}>
        <div style={s.headerInner}>
          <a href="/" style={s.backLink}>← Back to articles</a>
          {article.wp_url && (
            <a href={article.wp_url} target="_blank" rel="noopener noreferrer" style={s.wpLink}>
              View on WordPress ↗
            </a>
          )}
        </div>
      </header>

      {/* ── ARTICLE ── */}
      <article style={s.article}>

        {/* Meta info */}
        <div style={s.metaRow}>
          {client?.niche && <span style={s.niche}>{client.niche}</span>}
          <span style={s.date}>{timeAgo(article.updated_at)}</span>
          <span style={{
            ...s.statusBadge,
            color: article.status === 'published' ? '#16a34a' : '#d97706',
            background: article.status === 'published' ? '#f0fdf4' : '#fffbeb',
          }}>
            {article.status}
          </span>
        </div>

        {/* Title */}
        <h1 style={s.title}>
          {article.meta_title || article.keyword}
        </h1>

        {/* Description */}
        {article.meta_description && (
          <p style={s.description}>{article.meta_description}</p>
        )}

        <div style={s.divider} />

        {/* Article body */}
        <div
          className="article-body"
          style={s.body}
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        <div style={s.divider} />

        {/* Footer meta */}
        <div style={s.articleFooter}>
          <span style={s.keyword}>#{article.keyword}</span>
          {client?.domain && (
            <span style={s.domain}>{client.domain}</span>
          )}
        </div>

      </article>

      {/* ── FOOTER ── */}
      <footer style={s.footer}>
        <a href="/" style={s.footerBack}>← Back to all articles</a>
      </footer>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#fafaf8' },
  header: { borderBottom: '1px solid #e8e5df', background: '#ffffff', position: 'sticky', top: 0, zIndex: 50 },
  headerInner: { maxWidth: 760, margin: '0 auto', padding: '0 32px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  backLink: { fontSize: 14, color: '#8a8880', textDecoration: 'none', fontWeight: 500 },
  wpLink: { fontSize: 13, color: '#2563eb', textDecoration: 'none', fontFamily: 'monospace' },
  article: { maxWidth: 760, margin: '0 auto', padding: '56px 32px 80px' },
  metaRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 },
  niche: { fontSize: 11, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#8a8880', background: '#f2f0ea', padding: '3px 8px', borderRadius: 4 },
  date: { fontSize: 12, color: '#8a8880', fontFamily: 'monospace' },
  statusBadge: { fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 4, fontFamily: 'monospace' },
  title: { fontFamily: "'Lora', serif", fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 600, lineHeight: 1.15, letterSpacing: '-1px', color: '#1a1916', marginBottom: 16 },
  description: { fontSize: 18, color: '#8a8880', lineHeight: 1.65, borderLeft: '3px solid #e8e5df', paddingLeft: 16, marginBottom: 0 },
  divider: { height: 1, background: '#e8e5df', margin: '40px 0' },
  body: { fontSize: 17, lineHeight: 1.8, color: '#3a3936' },
  articleFooter: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  keyword: { fontSize: 13, color: '#8a8880', fontFamily: 'monospace' },
  domain: { fontSize: 13, color: '#8a8880', fontFamily: 'monospace' },
  footer: { borderTop: '1px solid #e8e5df', padding: '24px 32px', textAlign: 'center' },
  footerBack: { fontSize: 14, color: '#8a8880', textDecoration: 'none' },
}
