import { supabase } from "@/lib/supabase"
import { notFound } from "next/dist/client/components/navigation"


async function getArticle(id: string) {
  const { data, error } = await supabase
    .from('articles')
    .select(`
      id, keyword, meta_title, meta_description,
      content, quality_score, status, updated_at,
      clients ( name, niche, domain, tone )
    `)
    .eq('id', id)
    .single()

  if (error || !data) return null
  return data
}

export default async function ArticlePage({ params }: { params: { id: string } }) {
  const article = await getArticle(params.id)
  if (!article) notFound()

  const date = new Date(article.updated_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  })

  return (
    <div style={s.page}>

      {/* Header */}
      <header style={s.header}>
        <div style={s.headerInner}>
          <a href="/" style={s.back}>← All Articles</a>
          <div style={s.logo}>
            <span>◆</span>
            <span style={{ fontWeight: 600, fontSize: 15 }}>SEO Blog</span>
          </div>
        </div>
      </header>

      {/* Article */}
      <article style={s.article}>

        {/* Meta top */}
        <div style={s.metaTop}>
        {article.clients?.[0]?.niche && (
  <span style={s.niche}>{article.clients[0].niche}</span>
)}
          <span style={s.date}>{date}</span>
          {article.quality_score >= 80 && (
            <span style={s.score}>★ {article.quality_score}/100</span>
          )}
        </div>

        {/* Title */}
        <h1 style={s.title}>{article.meta_title || article.keyword}</h1>

        {/* Description */}
        {article.meta_description && (
          <p style={s.desc}>{article.meta_description}</p>
        )}

        <div style={s.divider} />

        {/* Content */}
        <div
          style={s.content}
          dangerouslySetInnerHTML={{ __html: article.content || '' }}
        />

        {/* Footer */}
        <div style={s.articleFooter}>
          <span style={s.keyword}>#{article.keyword}</span>
          {(article.clients as any)?.domain && (
            <span style={s.domain}>{(article.clients as any).domain}</span>
          )}
        </div>
      </article>

      <style>{`
        .article-content h1 { font-family: 'Lora', serif; font-size: 32px; font-weight: 600; margin: 32px 0 16px; color: #1a1916; line-height: 1.2; letter-spacing: -0.5px; }
        .article-content h2 { font-family: 'Lora', serif; font-size: 26px; font-weight: 600; margin: 40px 0 14px; color: #1a1916; line-height: 1.25; }
        .article-content h3 { font-size: 20px; font-weight: 600; margin: 28px 0 10px; color: #1a1916; }
        .article-content p  { font-size: 17px; line-height: 1.8; color: #3d3b35; margin-bottom: 20px; }
        .article-content ul, .article-content ol { padding-left: 28px; margin-bottom: 20px; }
        .article-content li { font-size: 16px; line-height: 1.75; color: #3d3b35; margin-bottom: 6px; }
        .article-content strong { color: #1a1916; font-weight: 600; }
        .article-content a { color: #1a1916; text-decoration: underline; }
        .article-content blockquote { border-left: 3px solid #e8e5df; padding-left: 20px; margin: 24px 0; color: #8a8880; font-style: italic; }
      `}</style>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#fafaf8' },

  header: {
    borderBottom: '1px solid #e8e5df',
    background: '#ffffff',
    position: 'sticky',
    top: 0,
    zIndex: 50,
  },
  headerInner: {
    maxWidth: 780,
    margin: '0 auto',
    padding: '0 32px',
    height: 64,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  back: {
    fontSize: 14,
    color: '#8a8880',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    transition: 'color .15s',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 15,
    color: '#1a1916',
  },

  article: {
    maxWidth: 720,
    margin: '0 auto',
    padding: '56px 32px 100px',
  },

  metaTop: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  niche: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '2px',
    textTransform: 'uppercase',
    color: '#8a8880',
    background: '#f2f0ea',
    padding: '3px 9px',
    borderRadius: 4,
  },
  date: {
    fontSize: 13,
    color: '#8a8880',
    fontFamily: 'monospace',
  },
  score: {
    fontSize: 12,
    color: '#16a34a',
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    padding: '2px 8px',
    borderRadius: 4,
    fontFamily: 'monospace',
  },

  title: {
    fontFamily: "'Lora', serif",
    fontSize: 'clamp(28px, 4vw, 44px)',
    fontWeight: 600,
    lineHeight: 1.15,
    letterSpacing: '-1px',
    color: '#1a1916',
    marginBottom: 16,
  },

  desc: {
    fontSize: 18,
    color: '#8a8880',
    lineHeight: 1.65,
    fontStyle: 'italic',
    marginBottom: 0,
  },

  divider: {
    height: 1,
    background: '#e8e5df',
    margin: '32px 0',
  },

  content: {
    fontSize: 17,
    lineHeight: 1.8,
    color: '#3d3b35',
  },

  articleFooter: {
    marginTop: 56,
    paddingTop: 24,
    borderTop: '1px solid #e8e5df',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  keyword: {
    fontSize: 13,
    color: '#8a8880',
    fontFamily: 'monospace',
  },
  domain: {
    fontSize: 13,
    color: '#8a8880',
    fontFamily: 'monospace',
  },
}
