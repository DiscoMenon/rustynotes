'use client';

import { useState } from 'react';

export default function FollowButton({ userId, isFollowing: init }: { userId: string; isFollowing: boolean }) {
  const [following, setFollowing] = useState(init);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    const res = await fetch(`/api/users/${userId}/follow`, { method: 'POST' });
    if (res.ok) setFollowing((f) => !f);
    setLoading(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`px-4 py-2 text-sm rounded border-2 transition-colors disabled:opacity-50 ${following ? 'bg-[#8b3a2a] text-[#f4e4c1] border-[#8b3a2a]' : 'border-[#8b3a2a] text-[#8b3a2a] hover:bg-[#8b3a2a] hover:text-[#f4e4c1]'}`}
      style={{ fontFamily: "'Lora', serif" }}
    >
      {loading ? '...' : following ? 'Unfollow' : 'Follow'}
    </button>
  );
}