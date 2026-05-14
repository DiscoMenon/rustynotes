'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Comment {
  _id: string;
  body: string;
  author: { _id: string; name: string; image?: string };
  createdAt: string;
  parentComment?: string;
}

export default function CommentSection({ postSlug }: { postSlug: string }) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/posts/${postSlug}/comments`)
      .then((r) => r.json())
      .then((d) => { setComments(d.comments ?? []); setLoading(false); });
  }, [postSlug]);

  async function submit() {
    if (!body.trim()) return;
    setSubmitting(true);
    const res = await fetch(`/api/posts/${postSlug}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body }),
    });
    if (res.ok) {
      const data = await res.json();
      setComments((prev) => [...prev, data.comment]);
      setBody('');
    }
    setSubmitting(false);
  }

  const topLevel = comments.filter((c) => !c.parentComment);

  return (
    <div>
      <h3 className="text-xl font-bold text-[#3b2a1a] mb-6" style={{ fontFamily: "'Cinzel', serif" }}>
        Inscriptions ({comments.length})
      </h3>

      {session && (
        <div className="mb-8">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Leave your mark upon this scroll..."
            rows={3}
            className="w-full p-3 rounded border border-[#c9a96e] bg-[#f4e4c1] text-[#3b2a1a] resize-none focus:outline-none focus:border-[#8b3a2a]"
            style={{ fontFamily: "'Lora', serif" }}
          />
          <button
            onClick={submit}
            disabled={submitting || !body.trim()}
            className="mt-2 px-4 py-2 text-sm rounded bg-[#8b3a2a] text-[#f4e4c1] hover:bg-[#3b2a1a] transition-colors disabled:opacity-50"
            style={{ fontFamily: "'Lora', serif" }}
          >
            {submitting ? 'Dipping the quill...' : 'Inscribe'}
          </button>
        </div>
      )}

      {loading ? (
        <p className="opacity-50 italic text-sm" style={{ fontFamily: "'Lora', serif" }}>Unrolling the scroll...</p>
      ) : topLevel.length === 0 ? (
        <p className="opacity-50 italic text-sm" style={{ fontFamily: "'Lora', serif" }}>No inscriptions yet. Be the first to leave your mark.</p>
      ) : (
        <div className="space-y-4">
          {topLevel.map((c) => (
            <div key={c._id} className="p-4 rounded border border-[#c9a96e] bg-[#e8d5a3]">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-[#8b3a2a] flex items-center justify-center text-[#f4e4c1] text-xs font-bold">
                  {c.author.name[0].toUpperCase()}
                </div>
                <span className="text-sm font-medium text-[#3b2a1a]" style={{ fontFamily: "'Lora', serif" }}>{c.author.name}</span>
              </div>
              <p className="text-sm text-[#3b2a1a] leading-relaxed" style={{ fontFamily: "'Lora', serif" }}>{c.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}