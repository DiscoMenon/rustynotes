import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { connectMongoDB } from '@/lib/mongodb';
import { Post } from '@/models/Post';
import { Comment } from '@/models/Comment';
import DashboardClient from '@/components/DashboardClient';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login');

  await connectMongoDB();

  const rawPosts = await Post.find({ author: session.user.id })
    .sort({ _id: -1 })
    .lean();

  const postsWithStats = await Promise.all(
    rawPosts.map(async (post) => {
      const commentCount = await Comment.countDocuments({ post: post._id });
      return { ...post, commentCount };
    })
  );

  const posts = JSON.parse(JSON.stringify(postsWithStats));

  return <DashboardClient posts={posts} />;
}