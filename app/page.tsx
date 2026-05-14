import { connectMongoDB } from '@/lib/mongodb';
import { Post } from '@/models/Post';
import HomeFeed from '@/components/post/HomeFeed';

export default async function HomePage() {
  await connectMongoDB();

  const rawPosts = await Post.find({ published: true })
    .sort({ _id: -1 })
    .limit(10)
    .populate('author', 'name email image')
    .lean();

  const allTagDocs = await Post.find({ published: true }).select('tags').lean();
  const allTags = [...new Set(allTagDocs.flatMap((p) => p.tags))];

  const posts = JSON.parse(JSON.stringify(rawPosts));

  return <HomeFeed initialPosts={posts} allTags={allTags} />;
}