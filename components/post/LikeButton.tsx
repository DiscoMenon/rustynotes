'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Heart } from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';

export default function LikeButton({ postId, likes, slug }: { postId: string; likes: string[]; slug: string }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [likeList, setLikeList] = useState<string[]>(likes);
  const liked = session?.user?.id ? likeList.includes(session.user.id) : false;

  async function toggle() {
    if (!session) { router.push('/login'); return; }
    const res = await fetch(`/api/posts/${slug}/like`, { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      setLikeList(data.likes);
    }
  }

  return (
    <button onClick={toggle} className={`flex items-center gap-2 px-4 py-2 rounded border-2 transition-colors ${liked ? 'bg-[#8b3a2a] text-[#f4e4c1] border-[#8b3a2a]' : 'border-[#8b3a2a] text-[#8b3a2a] hover:bg-[#8b3a2a] hover:text-[#f4e4c1]'}`} style={{ fontFamily: "'Lora', serif" }}>
      <Heart size={18} weight={liked ? 'fill' : 'regular'} />
      <span>{likeList.length} {likeList.length === 1 ? 'soul moved' : 'souls moved'}</span>
    </button>
  );
}