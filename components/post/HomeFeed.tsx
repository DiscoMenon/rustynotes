'use client';

import { useState } from 'react';
import PostCard from './PostCard';

interface Post {
  _id: string;
  title: string;
  slug: string;
  content: string;
  author: { _id: string; name: string; image?: string };
  tags: string[];
  likes: string[];
  coverImage?: string;
  createdAt: string;
}

export default function HomeFeed({ initialPosts, allTags }: { initialPosts: Post[]; allTags: string[] }) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [cursor, setCursor] = useState<string | null>(
    initialPosts.length > 0 ? initialPosts[initialPosts.length - 1]._id : null
  );
  const [hasMore, setHasMore] = useState(initialPosts.length === 10);
  const [loading, setLoading] = useState(false);

  const filtered = selectedTag ? posts.filter((p) => p.tags.includes(selectedTag)) : posts;

  async function loadMore() {
    if (!cursor || loading) return;
    setLoading(true);
    const params = new URLSearchParams({ cursor });
    if (selectedTag) params.set('tag', selectedTag);
    const res = await fetch(`/api/posts?${params}`);
    const data = await res.json();
    setPosts((prev) => [...prev, ...data.posts]);
    setCursor(data.nextCursor);
    setHasMore(data.hasMore);
    setLoading(false);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-4xl font-bold text-center text-[#3b2a1a] mb-2" style={{ fontFamily: "'Cinzel', serif" }}>
        The Scrolls
      </h1>
      <p className="text-center text-[#3b2a1a] opacity-60 mb-8 italic" style={{ fontFamily: "'Lora', serif" }}>
        Ancient tales, inscribed for posterity
      </p>

      {/* Tag filters */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${!selectedTag ? 'bg-[#8b3a2a] text-[#f4e4c1] border-[#8b3a2a]' : 'border-[#8b3a2a] text-[#8b3a2a] hover:bg-[#8b3a2a] hover:text-[#f4e4c1]'}`}
            style={{ fontFamily: "'Lora', serif" }}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${selectedTag === tag ? 'bg-[#8b3a2a] text-[#f4e4c1] border-[#8b3a2a]' : 'border-[#8b3a2a] text-[#8b3a2a] hover:bg-[#8b3a2a] hover:text-[#f4e4c1]'}`}
              style={{ fontFamily: "'Lora', serif" }}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Posts grid */}
      {filtered.length === 0 ? (
        <p className="text-center opacity-50 italic mt-20" style={{ fontFamily: "'Lora', serif" }}>
          No scrolls found in these archives...
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}

      {/* Load more */}
      {hasMore && (
        <div className="flex justify-center mt-10">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-6 py-2 rounded border-2 border-[#8b3a2a] text-[#8b3a2a] hover:bg-[#8b3a2a] hover:text-[#f4e4c1] transition-colors disabled:opacity-50"
            style={{ fontFamily: "'Lora', serif" }}
          >
            {loading ? 'Unrolling the scroll...' : 'Unfurl more scrolls'}
          </button>
        </div>
      )}
    </div>
  );
}