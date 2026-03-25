'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'
import { uploadImage } from '@/lib/upload'

const MAGAZINE_CATEGORIES = [
  { key: 'editor', label: 'ìëí° ì¶ì²' },
  { key: 'neighborhood', label: 'ì´ëë¤ì´ë' },
  { key: 'realestate', label: 'ë¶ëì° ê°ì´ë' },
  { key: 'living', label: 'ìí ì ë³´' },
  { key: 'legal', label: 'ë²ë¥ /ë¹ì' },
  { key: 'construction', label: 'ê±´ì¶/ì¸íë¦¬ì´' },
  { key: 'finance', label: 'ì£¼íìµì' },
  { key: 'topic', label: 'ë§ì§/ë¬¸í' },
  { key: 'info', label: 'ë´ì¤' },
]

export default function AdminMagazinePage() {
  const supabase = createClient()
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showEditor, setShowEditor] = useState(false)
  const [filterCat, setFilterCat] = useState('all')

  useEffect(() => { fetchPosts() }, [filterCat])

  async function fetchPosts() {
    setLoading(true)
    let query = supabase
      .from('posts')
      .select('*')
      .in('type', ['magazine', 'notice'])
      .order('created_at', { ascending: false })
      .limit(50)
    if (filterCat !== 'all') query = query.eq('category', filterCat)
    const { data } = await query
    if (data) setPosts(data)
    setLoading(false)
  }

  async function deletePost(id: string) {
    if (!confirm('ì­ì íìê² ìµëê¹?')) return
    await supabase.from('posts').delete().eq('id', id)
    fetchPosts()
  }

  async function togglePublished(id: string, current: boolean | null) {
    const newVal = !(current === null || current === true)
    const { error } = await supabase.from('posts').update({ published: newVal }).eq('id', id)
    if (error) { alert('ë³ê²½ ì¤í¨: ' + error.message); return }
    setPosts(prev => prev.map(p => p.id === id ? { ...p, published: newVal } : p))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">ë§¤ê±°ì§ ê´ë¦¬</h1>
        <button
          onClick={() => setShowEditor(!showEditor)}
          className="bg-black text-white px-4 py-1.5 rounded-full text-sm hover:bg-gray-800"
        >
          {showEditor ? 'ëª©ë¡ ë³´ê¸°' : '+ ì ë§¤ê±°ì§ ê¸'}
        </button>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {[
          { key: 'all', label: 'ì ì²´' },
          { key: 'editor', label: 'ìëí° í½' },
          { key: 'neighborhood', label: 'ì´ëë¤ì´ë' },
          { key: 'realestate', label: 'ë¶ëì°' },
          { key: 'legal', label: 'ë¶ëì° ë²ë¥ ' },
          { key: 'living', label: 'ìíì ë³´' },
          { key: 'construction', label: 'ê±´ì¶/ì¸íë¦¬ì´' },
          { key: 'finance', label: 'ì£¼íìµì' },
        ].map(cat => (
          <button
            key={cat.key}
            onClick={() => setFilterCat(cat.key)}
            className={`px-3 py-1 text-xs rounded-full ${filterCat === cat.key ? 'bg-black text-white' : 'bg-gray-100 text-secondary hover:bg-gray-200'}`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {showEditor ? (
        <MagazineEditor
          supabase={supabase}
          onPublish={() => { setShowEditor(false); fetchPosts() }}
        />
      ) : (
        <div className="space-y-3">
          {loading ? (
            <p className="text-center py-8 text-muted text-sm">ë¶ë¬ì¤ë ì¤...</p>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border rounded-lg">
              <p className="text-muted text-sm mb-2">ë§¤ê±°ì§ ì½íì¸ ê° ììµëë¤</p>
              <button onClick={() => setShowEditor(true)} className="text-sm text-primary hover:underline">
                ì²« ë§¤ê±°ì§ ê¸ ìì±íê¸°
              </button>
            </div>
          ) : posts.map((post) => (
            <div key={post.id} className="flex items-start gap-4 p-4 border border-border rounded-lg hover:bg-gray-50">
              {post.thumbnail && (
                <img src={post.thumbnail} alt="" className="w-20 h-14 object-cover rounded" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-1.5 py-0.5 rounded ${post.type === 'notice' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                    {post.type === 'notice' ? 'ê³µì§' : 'ë§¤ê±°ì§'}
                  </span>
                  <span className="text-xs text-muted">{post.category}</span>
                </div>
                <Link href={`/post/${post.id}`} className="text-sm font-medium hover:underline line-clamp-1">
                  {post.title}
                </Link>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted">
                  <span>{new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
                  <span>ì¡°í {post.views || 0}</span>
                  {post.tags?.length > 0 && post.tags.map((t: string) => (
                    <span key={t} className="bg-gray-100 px-1.5 py-0.5 rounded">#{t}</span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1 shrink-0 items-end">
                <button
                  onClick={() => togglePublished(post.id, post.published)}
                  className={`text-xs px-2 py-0.5 rounded-full ${post.published === false ? 'bg-gray-200 text-gray-500' : 'bg-green-100 text-green-700'}`}
                >
                  {post.published === false ? 'ë¹ê³µê°' : 'ê³µê°'}
                </button>
                <button onClick={() => deletePost(post.id)} className="text-xs text-red-500 hover:underline">ì­ì </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function MagazineEditor({ supabase, onPublish }: { supabase: any; onPublish: () => void }) {
  const [type, setType] = useState<'magazine' | 'notice'>('magazine')
  const [category, setCategory] = useState(MAGAZINE_CATEGORIES[0].key)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [thumbnail, setThumbnail] = useState('')
  const [tags, setTags] = useState('')
  const [uploading, setUploading] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [region, setRegion] = useState('ny')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const contentRef = useRef<HTMLTextAreaElement>(null)

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>, isThumbnail = false) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const url = await uploadImage(file)
    setUploading(false)

    if (!url) {
      alert('ì´ë¯¸ì§ ìë¡ëì ì¤í¨íìµëë¤')
      return
    }

    if (isThumbnail) {
      setThumbnail(url)
    } else {
      // ìëí°ì ì´ë¯¸ì§ ì½ì
      const textarea = contentRef.current
      if (textarea) {
        const pos = textarea.selectionStart
        const before = content.substring(0, pos)
        const after = content.substring(pos)
        const imgTag = `\n![ì´ë¯¸ì§](${url})\n`
        setContent(before + imgTag + after)
      }
    }
  }

  async function handlePublish() {
    if (!title.trim() || !content.trim()) {
      alert('ì ëª©ê³¼ ë´ì©ì ìë ¥í´ì£¼ì¸ì')
      return
    }

    setPublishing(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { alert('ë¡ê·¸ì¸ íì'); setPublishing(false); return }

    const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean)

    const { error } = await supabase.from('posts').insert({
      user_id: user.id,
      type,
      category: type === 'notice' ? 'topic' : category,
      title: title.trim(),
      content: content.trim(),
      thumbnail: thumbnail || null,
      tags: tagArray.length > 0 ? tagArray : null,
      region,
    })

    if (error) {
      alert('ê²ì ì¤í¨: ' + error.message)
    } else {
      onPublish()
    }
    setPublishing(false)
  }

  return (
    <div className="space-y-4">
      {/* ì í ì í */}
      <div className="flex gap-2">
        {(['magazine', 'notice'] as const).map(t => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`px-4 py-1.5 text-sm rounded-full ${type === t ? 'bg-black text-white' : 'bg-gray-100 text-secondary'}`}
          >
            {t === 'magazine' ? 'ë§¤ê±°ì§' : 'ê³µì§'}
          </button>
        ))}
      </div>

      {/* ì¹´íê³ ë¦¬ */}
      {type === 'magazine' && (
        <div>
          <label className="block text-sm font-medium mb-1.5">ì¹´íê³ ë¦¬</label>
          <div className="flex flex-wrap gap-2">
            {MAGAZINE_CATEGORIES.map(cat => (
              <button
                key={cat.key}
                onClick={() => setCategory(cat.key)}
                className={`px-3 py-1 text-xs rounded-full ${category === cat.key ? 'bg-black text-white' : 'bg-gray-100 text-secondary hover:bg-gray-200'}`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ëí ì´ë¯¸ì§ */}
      <div>
        <label className="block text-sm font-medium mb-1.5">ëí ì´ë¯¸ì§</label>
        {thumbnail ? (
          <div className="relative inline-block">
            <img src={thumbnail} alt="ì¸ë¤ì¼" className="w-48 h-32 object-cover rounded-lg border border-border" />
            <button
              onClick={() => setThumbnail('')}
              className="absolute -top-2 -right-2 w-6 h-6 bg-black text-white rounded-full text-xs flex items-center justify-center"
            >
              â
            </button>
          </div>
        ) : (
          <label className="block w-48 h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-gray-50 flex items-center justify-center">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageUpload(e, true)}
            />
            <span className="text-sm text-muted">{uploading ? 'ìë¡ë ì¤...' : '+ ì´ë¯¸ì§ ì í'}</span>
          </label>
        )}
      </div>

      {/* ì ëª© */}
      <div>
        <label className="block text-sm font-medium mb-1.5">ì ëª©</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="ë§¤ê±°ì§ ì ëª©ì ìë ¥íì¸ì"
          className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-black"
        />
      </div>

      {/* ë³¸ë¬¸ ìëí° */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm font-medium">ë³¸ë¬¸</label>
          <div className="flex gap-2">
            <label className="text-xs text-muted cursor-pointer hover:text-primary">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={(e) => handleImageUpload(e, false)}
              />
              ð· ì´ë¯¸ì§ ì½ì
            </label>
          </div>
        </div>
        <textarea
          ref={contentRef}
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="ë³¸ë¬¸ì ìì±íì¸ì. ë§í¬ë¤ì´ íìì ì§ìí©ëë¤.&#10;&#10;## ìì ëª©&#10;ë³¸ë¬¸ ë´ì©...&#10;&#10;**êµµê²**, *ê¸°ì¸ì*, [ë§í¬](url)"
          className="w-full px-4 py-3 border border-border rounded-lg text-sm min-h-[400px] resize-y focus:outline-none focus:border-black font-mono"
        />
        <p className="text-xs text-muted mt-1">ë§í¬ë¤ì´ ì§ì: ## ì ëª©, **êµµê²**, *ê¸°ì¸ì*, ![ì´ë¯¸ì§](url), [ë§í¬](url)</p>
      </div>

      {/* íê·¸ */}
      <div>
        <label className="block text-sm font-medium mb-1.5">íê·¸ (ì¼íë¡ êµ¬ë¶)</label>
        <input
          type="text"
          value={tags}
          onChange={e => setTags(e.target.value)}
          placeholder="ë¶ëì°, ë´ì, 2025ì ë§"
          className="w-full px-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-black"
        />
      </div>

      {/* ê²ì ë²í¼ */}
      <div className="flex items-center gap-3 pt-4 border-t border-border">
        <button
          onClick={handlePublish}
          disabled={publishing}
          className="bg-black text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
        >
          {publishing ? 'ê²ì ì¤...' : 'ê²ìíê¸°'}
        </button>
        <button
          onClick={onPublish}
          className="px-6 py-2.5 border border-border rounded-full text-sm hover:bg-gray-50"
        >
          ì·¨ì
        </button>
      </div>
    </div>
  )
}
