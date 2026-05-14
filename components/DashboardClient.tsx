'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PenNib, Trash, Heart, ChatCircle } from '@phosphor-icons/react';

interface Post {
  _id: string;
  title: string;
  slug: string;
  published: boolean;
  likes: string[];
  commentCount: number;
  createdAt: string;
}

export default function DashboardClient({ posts: initial }: { posts: Post[] }) {
  const [posts, setPosts] = useState<Post[]>(initial);

  async function deletePost(slug: string) {
    if (!confirm('Burn this scroll to ashes? This cannot be undone.')) return;
    const res = await fetch(`/api/posts/${slug}`, { method: 'DELETE' });
    if (res.ok) setPosts((prev) => prev.filter((p) => p.slug !== slug));
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-[#3b2a1a]" style={{ fontFamily: "'Cinzel', serif" }}>
          My Scrolls
        </h1>
        <Link href="/editor" className="flex items-center gap-2 px-4 py-2 text-sm rounded bg-[#8b3a2a] text-[#f4e4c1] hover:bg-[#3b2a1a] transition-colors" style={{ fontFamily: "'Lora', serif" }}>
          <PenNib size={16} /> New Scroll
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20 opacity-50 italic" style={{ fontFamily: "'Lora', serif" }}>
          Your quill has yet to touch parchment...
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div key={post._id} className="flex items-center justify-between p-4 rounded border border-[#c9a96e] bg-[#e8d5a3]">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-[#3b2a1a] truncate" style={{ fontFamily: "'Cinzel', serif" }}>
                  {post.title}
                </h3>
                <div className="flex items-center gap-4 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${post.published ? 'bg-green-700 text-white' : 'bg-[#8b3a2a] text-[#f4e4c1]'}`} style={{ fontFamily: "'Lora', serif" }}>
                    {post.published ? 'Published' : 'Draft'}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-[#8b3a2a]"><Heart size={12} weight="fill" />{post.likes.length}</span>
                  <span className="flex items-center gap-1 text-xs text-[#8b3a2a]"><ChatCircle size={12} weight="fill" />{post.commentCount}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Link href={`/editor?slug=${post.slug}`} className="p-2 rounded hover:bg-[#c9a96e] transition-colors text-[#3b2a1a]">
                  <PenNib size={16} />
                </Link>
                <button onClick={() => deletePost(post.slug)} className="p-2 rounded hover:bg-red-100 transition-colors text-red-700">
                  <Trash size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}