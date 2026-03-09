import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

// GET - browser se test karne ke liye
export async function GET() {
  return NextResponse.json({
    status: 'API running ✅',
    secret_set: !!process.env.PUBLISH_SECRET,
  })
}

export async function POST(req: NextRequest) {
  try {
    // ── 1. Auth check ─────────────────────────────────────────
    const secret = req.headers.get('x-api-key') || req.headers.get('authorization')
    if (process.env.PUBLISH_SECRET && secret !== process.env.PUBLISH_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ── 2. Parse body ─────────────────────────────────────────
    const body = await req.json()
    const { article_id } = body

    if (!article_id) {
      return NextResponse.json({ error: 'article_id required' }, { status: 400 })
    }

    // ── 3. Check article exists ───────────────────────────────
    const { data: article, error: fetchError } = await supabase
      .from('articles')
      .select('id, meta_title, keyword, status')
      .eq('id', article_id)
      .single()

    if (fetchError || !article) {
      return NextResponse.json({
        error: 'Article not found',
        details: fetchError?.message,
        article_id,
      }, { status: 404 })
    }

    const siteUrl = 'https://seo-blog-sage.vercel.app'
    const articleUrl = `${siteUrl}/blog/${article.id}`

    // ── 4. Update database ────────────────────────────────────
    const { error: updateError } = await supabase
      .from('articles')
      .update({
        status: 'published',
        wp_url: articleUrl,
        wp_post_id: String(article.id),
        updated_at: new Date().toISOString(),
      })
      .eq('id', article_id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // ── 5. Clear cache so page shows immediately ──────────────
    revalidatePath(`/blog/${article.id}`)
    revalidatePath('/')

    // ── 6. Return success ─────────────────────────────────────
    return NextResponse.json({
      success: true,
      article_id: article.id,
      url: articleUrl,
      title: article.meta_title || article.keyword,
    })

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}