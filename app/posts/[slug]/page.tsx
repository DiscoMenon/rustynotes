import { connectMongoDB } from '@/lib/mongodb';
import { Post } from '@/models/Post';
import { Comment } from '@/models/Comment';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import PostCard from '@/components/post/PostCard';
import LikeButton from '@/components/post/LikeButton';
import CommentSection from '@/components/post/CommentSection';

function formatInscriptionDate(date: Date | string) {
  const d = new Date(date);
  const day = d.getDate();
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const v = day % 100;
  const suffix = suffixes[(v - 20) % 10] ?? suffixes[v] ?? suffixes[0];
  const month = new Intl.DateTimeFormat('en-GB', { month: 'long' }).format(d);
  return `Inscribed on the ${day}${suffix} of ${month}, ${d.getFullYear()}`;
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  await connectMongoDB();

  const raw = await Post.findOne({ slug: params.slug, published: true })
    .populate('author', 'name email image')
    .lean();

  if (!raw) notFound();

  const post = JSON.parse(JSON.stringify(raw));

  const relatedRaw = await Post.find({
    published: true,
    tags: { $in: raw.tags },
    _id: { $ne: raw._id },
  }).limit(3).populate('author', 'name email image').lean();

  const related = JSON.parse(JSON.stringify(relatedRaw));

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Cover image */}
      {post.coverImage && (
        <div className="relative w-full h-64 rounded-lg overflow-hidden mb-8">
          <Image src={post.coverImage} alt={post.title} fill className="object-cover" style={{ filter: 'sepia(60%)' }} />
        </div>
      )}

      {/* Title */}
      <h1 className="text-4xl font-bold text-[#3b2a1a] mb-4 leading-tight" style={{ fontFamily: "'Cinzel', serif" }}>
        {post.title}
      </h1>

      {/* Author + date */}
      <div className="flex items-center gap-3 mb-6">
        {post.author.image ? (
          <Image src={post.author.image} alt={post.author.name} width={40} height={40} className="rounded-full" style={{ filter: 'sepia(30%)' }} />
        ) : (
          <div className="w-10 h-10 rounded-full bg-[#8b3a2a] flex items-center justify-center text-[#f4e4c1] font-bold">
            {post.author.name[0].toUpperCase()}
          </div>
        )}
        <div>
          <Link href={`/profile/${post.author._id}`} className="text-sm font-medium text-[#3b2a1a] hover:text-[#8b3a2a]" style={{ fontFamily: "'Lora', serif" }}>
            {post.author.name}
          </Link>
          <p className="text-xs opacity-60 italic" style={{ fontFamily: "'Lora', serif" }}>
            {formatInscriptionDate(post.createdAt)}
          </p>
        </div>
      </div>

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {post.tags.map((tag: string) => (
            <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-[#8b3a2a] text-[#f4e4c1]" style={{ fontFamily: "'Lora', serif" }}>
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Divider */}
      <div className="border-t-2 border-[#c9a96e] mb-8" />

      {/* Body */}
      <div
        className="prose prose-stone max-w-none text-[#3b2a1a] leading-relaxed"
        style={{ fontFamily: "'Lora', serif" }}
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Divider */}
      <div className="border-t-2 border-[#c9a96e] my-10" />

      {/* Like button */}
      <LikeButton postId={post._id} likes={post.likes} slug={params.slug} />

      {/* Comments */}
      <div className="mt-10">
        <CommentSection postSlug={params.slug} />
      </div>

      {/* Related posts */}
      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-[#3b2a1a] mb-6" style={{ fontFamily: "'Cinzel', serif" }}>
            Related Scrolls
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {related.map((p: typeof post) => <PostCard key={p._id} post={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}