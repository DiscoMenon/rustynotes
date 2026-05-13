import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import mongoose from "mongoose";
import { authOptions } from "@/lib/auth";
import { connectMongoDB } from "@/lib/mongodb";
import { Comment } from "@/models/Comment";
import { Post } from "@/models/Post";

type RouteContext = { params: { slug: string } };

function normalizeSlugParam(slug: string | undefined): string {
  return (slug ?? "").trim().toLowerCase();
}

function normalizeBodyTags(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const out = new Set<string>();
  for (const item of raw) {
    if (typeof item !== "string") continue;
    const s = item.trim().toLowerCase();
    if (s) out.add(s);
  }
  return Array.from(out);
}

function authorIdString(author: unknown): string {
  if (author instanceof mongoose.Types.ObjectId) return author.toString();
  if (
    author &&
    typeof author === "object" &&
    "_id" in author &&
    (author as { _id: unknown })._id instanceof mongoose.Types.ObjectId
  ) {
    return String((author as { _id: mongoose.Types.ObjectId })._id);
  }
  if (author && typeof author === "object" && "_id" in author) {
    return String((author as { _id: unknown })._id);
  }
  return String(author);
}

async function loadCommentsForPost(postId: mongoose.Types.ObjectId) {
  return Comment.find({ post: postId })
    .sort({ createdAt: 1 })
    .populate("author", "name email image")
    .lean();
}

export async function GET(_request: Request, context: RouteContext) {
  const slug = normalizeSlugParam(context.params.slug);
  if (!slug) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  await connectMongoDB();

  const session = await getServerSession(authOptions);
  const post = await Post.findOne({ slug })
    .populate("author", "name email image")
    .lean();

  if (!post) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const postAuthorId = authorIdString(post.author);

  if (!post.published) {
    if (!session?.user?.id || session.user.id !== postAuthorId) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }
  }

  const comments = await loadCommentsForPost(post._id as mongoose.Types.ObjectId);

  return NextResponse.json({
    post: {
      ...post,
      likes: post.likes ?? [],
      comments,
    },
  });
}

export async function PUT(request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const slug = normalizeSlugParam(context.params.slug);
  if (!slug) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const body = json as {
    title?: string;
    content?: string;
    published?: boolean;
    tags?: unknown;
  };

  await connectMongoDB();

  const post = await Post.findOne({ slug });
  if (!post) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  if (post.author.toString() !== session.user.id) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  if (body.title !== undefined) {
    const nextTitle = String(body.title).trim();
    if (!nextTitle) {
      return NextResponse.json({ error: "Title cannot be empty." }, { status: 400 });
    }
    post.title = nextTitle;
  }

  if (body.content !== undefined) {
    post.content = typeof body.content === "string" ? body.content : "";
  }

  if (body.published !== undefined) {
    post.published = Boolean(body.published);
  }

  if (body.tags !== undefined) {
    post.tags = normalizeBodyTags(body.tags);
  }

  try {
    await post.save();
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not update post." }, { status: 500 });
  }

  const updated = await Post.findById(post._id)
    .populate("author", "name email image")
    .lean();

  if (!updated) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const comments = await loadCommentsForPost(post._id as mongoose.Types.ObjectId);

  return NextResponse.json({
    post: {
      ...updated,
      likes: updated.likes ?? [],
      comments,
    },
  });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const slug = normalizeSlugParam(context.params.slug);
  if (!slug) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  await connectMongoDB();

  const post = await Post.findOne({ slug });
  if (!post) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  if (post.author.toString() !== session.user.id) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  await Comment.deleteMany({ post: post._id });
  await post.deleteOne();

  return new NextResponse(null, { status: 204 });
}
