import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    // 1. Verify secret key from N8N
    const secret = req.headers.get('x-publish-secret')
    if (secret !== process.env.PUBLISH_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Get article_id from body
    const body = await req.json()
    const { article_id } = body

    if (!article_id) {
      return NextResponse.json({ error: 'article_id required' }, { status: 400 })
    }

    // 3. Fetch article from Supabase
    const { data: article, error: fetchError } = await supabase
      .from('articles')
      .select('id, meta_title, keyword, status')
      .eq('id', article_id)
      .eq('status', 'approved')
      .single()

    if (fetchError || !article) {
      return NextResponse.json({ error: 'Article not found or not approved' }, { status: 404 })
    }

    // 4. Build the public URL for this article
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-blog.vercel.app'
    const articleUrl = `${siteUrl}/blog/${article.id}`

    // 5. Update article status to published + save URL
    const { error: updateError } = await supabase
      .from('articles')
      .update({
        status:    'published',
        wp_url:    articleUrl,
        wp_post_id: String(article.id),
        updated_at: new Date().toISOString(),
      })
      .eq('id', article_id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // 6. Return success with URL
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
