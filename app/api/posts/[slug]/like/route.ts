import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import mongoose from "mongoose";
import { authOptions } from "@/lib/auth";
import { connectMongoDB } from "@/lib/mongodb";
import { Post } from "@/models/Post";

type RouteContext = { params: { slug: string } };

function normalizeSlugParam(slug: string | undefined): string {
  return (slug ?? "").trim().toLowerCase();
}

export async function POST(_request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const slug = normalizeSlugParam(context.params.slug);
  if (!slug) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  if (!mongoose.isValidObjectId(session.user.id)) {
    return NextResponse.json({ error: "Invalid session." }, { status: 400 });
  }

  await connectMongoDB();

  const post = await Post.findOne({ slug }).select("_id likes");
  if (!post) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const userId = new mongoose.Types.ObjectId(session.user.id);
  const alreadyLiked = post.likes.some((id) => id.equals(userId));

  if (alreadyLiked) {
    await Post.updateOne({ _id: post._id }, { $pull: { likes: userId } });
  } else {
    await Post.updateOne({ _id: post._id }, { $addToSet: { likes: userId } });
  }

  const updated = await Post.findById(post._id).select("likes").lean();
  const likeCount = updated?.likes?.length ?? 0;

  return NextResponse.json({
    liked: !alreadyLiked,
    likeCount,
  });
}
