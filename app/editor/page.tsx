'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PenNib } from '@phosphor-icons/react';

export default function EditorPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editSlug = searchParams.get('slug');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [savedSlug, setSavedSlug] = useState<string | null>(editSlug);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  useEffect(() => {
    if (!editSlug) return;
    fetch(`/api/posts/${editSlug}`).then((r) => r.json()).then((d) => {
      if (d.post) {
        setTitle(d.post.title);
        setContent(d.post.content);
        setTags(d.post.tags.join(', '));
        setSavedSlug(editSlug);
      }
    });
  }, [editSlug]);

  async function save(publish = false) {
    if (!title.trim()) return alert('A scroll must have a title.');
    publish ? setPublishing(true) : setSaving(true);

    const body = {
      title,
      content,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      published: publish,
    };

    let res;
    if (savedSlug) {
      res = await fetch(`/api/posts/${savedSlug}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    } else {
      res = await fetch('/api/posts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    }

    const data = await res.json();
    if (data.post) {
      setSavedSlug(data.post.slug);
      if (publish) router.push(`/posts/${data.post.slug}`);
    }

    setSaving(false);
    setPublishing(false);
  }

  if (status === 'loading') return (
    <div className="flex items-center justify-center min-h-[60vh] italic opacity-50" style={{ fontFamily: "'Lora', serif" }}>
      Dipping the quill...
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-[#3b2a1a] mb-8" style={{ fontFamily: "'Cinzel', serif" }}>
        {editSlug ? 'Amend the Scroll' : 'Begin a New Scroll'}
      </h1>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title of your scroll..."
        className="w-full text-2xl font-bold bg-transparent border-b-2 border-[#c9a96e] focus:border-[#8b3a2a] outline-none pb-2 mb-6 text-[#3b2a1a] placeholder-[#3b2a1a]/40"
        style={{ fontFamily: "'Cinzel', serif" }}
      />

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Let the ink flow upon the parchment..."
        rows={20}
        className="w-full p-4 rounded border border-[#c9a96e] bg-[#f4e4c1] text-[#3b2a1a] resize-none focus:outline-none focus:border-[#8b3a2a] leading-relaxed"
        style={{ fontFamily: "'Lora', serif" }}
      />

      <input
        type="text"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        placeholder="Tags, separated by commas..."
        className="w-full mt-4 p-3 rounded border border-[#c9a96e] bg-[#f4e4c1] text-[#3b2a1a] focus:outline-none focus:border-[#8b3a2a]"
        style={{ fontFamily: "'Lora', serif" }}
      />

      <div className="flex items-center gap-3 mt-6">
        <button onClick={() => save(false)} disabled={saving} className="px-4 py-2 text-sm rounded border-2 border-[#8b3a2a] text-[#8b3a2a] hover:bg-[#8b3a2a] hover:text-[#f4e4c1] transition-colors disabled:opacity-50" style={{ fontFamily: "'Lora', serif" }}>
          {saving ? 'Preserving...' : 'Save Draft'}
        </button>
        <button onClick={() => save(true)} disabled={publishing} className="flex items-center gap-2 px-4 py-2 text-sm rounded bg-[#8b3a2a] text-[#f4e4c1] hover:bg-[#3b2a1a] transition-colors disabled:opacity-50" style={{ fontFamily: "'Lora', serif" }}>
          <PenNib size={16} />
          {publishing ? 'Sealing the scroll...' : 'Publish'}
        </button>
      </div>
    </div>
  );
}