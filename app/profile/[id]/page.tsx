import { connectMongoDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { Post } from '@/models/Post';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Image from 'next/image';
import PostCard from '@/components/post/PostCard';
import FollowButton from '@/components/FollowButton';

export default async function ProfilePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  await connectMongoDB();

  const rawUser = await User.findById(params.id).lean() as Record<string, unknown>;
  if (!rawUser) notFound();

  const rawPosts = await Post.find({ author: rawUser._id, published: true })
    .sort({ _id: -1 })
    .populate('author', 'name email image')
    .lean();

  const user = JSON.parse(JSON.stringify(rawUser));
  const posts = JSON.parse(JSON.stringify(rawPosts));

  const isOwn = session?.user?.id === params.id;
  const isFollowing = session?.user?.id
    ? ((rawUser.followers as string[] | undefined) ?? []).map(String).includes(session.user.id)
    : false;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center gap-6 mb-10">
        {user.image ? (
          <Image src={user.image} alt={user.name} width={80} height={80} className="rounded-full" style={{ filter: 'sepia(30%)' }} />
        ) : (
          <div className="w-20 h-20 rounded-full bg-[#8b3a2a] flex items-center justify-center text-[#f4e4c1] text-3xl font-bold">
            {user.name[0].toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-3xl font-bold text-[#3b2a1a]" style={{ fontFamily: "'Cinzel', serif" }}>{user.name}</h1>
          <p className="text-sm opacity-60 mt-1" style={{ fontFamily: "'Lora', serif" }}>{user.email}</p>
          <div className="flex gap-4 mt-2 text-sm text-[#3b2a1a]" style={{ fontFamily: "'Lora', serif" }}>
            <span><strong>{user.followers?.length ?? 0}</strong> followers</span>
            <span><strong>{user.following?.length ?? 0}</strong> following</span>
          </div>
        </div>
        {!isOwn && session && (
          <div className="ml-auto">
            <FollowButton userId={params.id} isFollowing={isFollowing} />
          </div>
        )}
      </div>

      <h2 className="text-2xl font-bold text-[#3b2a1a] mb-6" style={{ fontFamily: "'Cinzel', serif" }}>
        Scrolls by {user.name}
      </h2>

      {posts.length === 0 ? (
        <p className="opacity-50 italic text-sm" style={{ fontFamily: "'Lora', serif" }}>This scribe has yet to publish their works...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((p: typeof posts[0]) => <PostCard key={p._id} post={p} />)}
        </div>
      )}
    </div>
  );
}