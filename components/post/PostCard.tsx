// components/post/PostCard.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, ChatCircle } from '@phosphor-icons/react';

interface Author {
  _id: string;
  name: string;
  avatar?: string;
}

interface Post {
  _id: string;
  title: string;
  slug: string;
  content: string;
  author: Author;
  tags: string[];
  likes: string[];
  coverImage?: string;
  commentCount?: number;
  createdAt: string | Date;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

function formatInscriptionDate(date: string | Date): string {
  const d = new Date(date);

  const day = d.getDate();
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const v = day % 100;
  const suffix = suffixes[(v - 20) % 10] ?? suffixes[v] ?? suffixes[0];

  const month = new Intl.DateTimeFormat('en-GB', { month: 'long' }).format(d);
  const year = d.getFullYear();

  return `Inscribed on the ${day}${suffix} of ${month}, ${year}`;
}

export default function PostCard({ post }: { post: Post }) {
  const excerpt = stripHtml(post.content).slice(0, 150).trimEnd() + '...';

  return (
    <Link href={`/posts/${post.slug}`}>
      <article
        className="rounded-lg overflow-hidden border border-[#c9a96e] bg-[#f4e4c1] hover:bg-[#e8d5a3] transition-colors duration-200 shadow-md cursor-pointer"
      >
        {/* Cover Image */}
        {post.coverImage && (
          <div className="relative w-full h-48 overflow-hidden">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
              style={{ filter: 'sepia(60%)' }}
            />
          </div>
        )}

        <div className="p-5 space-y-3">
          {/* Title */}
          <h2
            className="text-xl font-bold text-[#3b2a1a] leading-snug"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            {post.title}
          </h2>

          {/* Author */}
          <div className="flex items-center gap-2">
            {post.author.avatar ? (
              <Image
                src={post.author.avatar}
                alt={post.author.name}
                width={28}
                height={28}
                className="rounded-full object-cover"
                style={{ filter: 'sepia(30%)' }}
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-[#8b3a2a] flex items-center justify-center text-[#f4e4c1] text-xs font-bold">
                {post.author.name[0].toUpperCase()}
              </div>
            )}
            <span
              className="text-sm text-[#3b2a1a] font-medium"
              style={{ fontFamily: "'Lora', serif" }}
            >
              {post.author.name}
            </span>
          </div>

          {/* Excerpt */}
          <p
            className="text-sm text-[#3b2a1a] opacity-80 leading-relaxed"
            style={{ fontFamily: "'Lora', serif" }}
          >
            {excerpt}
          </p>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-xs rounded-full bg-[#8b3a2a] text-[#f4e4c1]"
                  style={{ fontFamily: "'Lora', serif" }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-1">
            {/* Likes + Comments */}
            <div className="flex items-center gap-4 text-[#8b3a2a]">
              <span className="flex items-center gap-1 text-sm">
                <Heart size={16} weight="fill" />
                {post.likes.length}
              </span>
              <span className="flex items-center gap-1 text-sm">
                <ChatCircle size={16} weight="fill" />
                {post.commentCount ?? 0}
              </span>
            </div>

            {/* Timestamp */}
            <span
              className="text-xs text-[#3b2a1a] opacity-60 italic"
              style={{ fontFamily: "'Lora', serif" }}
            >
              {formatInscriptionDate(post.createdAt)}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}