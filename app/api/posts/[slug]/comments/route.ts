import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import mongoose from "mongoose";
import type { Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectMongoDB } from "@/lib/mongodb";
import { Comment } from "@/models/Comment";
import type { IPost } from "@/models/Post";
import { Post } from "@/models/Post";

type RouteContext = { params: { slug: string } };

function normalizeSlugParam(slug: string | undefined): string {
  return (slug ?? "").trim().toLowerCase();
}

function authorIdFromPostAuthor(author: IPost["author"] | { _id?: unknown }): string {
  if (author instanceof mongoose.Types.ObjectId) return author.toString();
  if (author && typeof author === "object" && "_id" in author) {
    return String((author as { _id: unknown })._id);
  }
  return String(author);
}

async function findPostVisibleForSession(
  slug: string,
  session: Session | null,
): Promise<{ _id: mongoose.Types.ObjectId; author: mongoose.Types.ObjectId; published: boolean } | null> {
  const post = await Post.findOne({ slug }).select("_id author published").lean();
  if (!post) return null;

  const postAuthorId = authorIdFromPostAuthor(post.author as IPost["author"]);

  if (!post.published) {
    if (!session?.user?.id || session.user.id !== postAuthorId) {
      return null;
    }
  }

  return {
    _id: post._id as mongoose.Types.ObjectId,
    author: post.author as mongoose.Types.ObjectId,
    published: post.published,
  };
}

type CommentNode = Record<string, unknown> & {
  _id: mongoose.Types.ObjectId;
  replies: CommentNode[];
  createdAt?: Date;
};

function parentIdFromLeanDoc(parentComment: unknown): string | null {
  if (parentComment == null) return null;
  if (parentComment instanceof mongoose.Types.ObjectId) return parentComment.toString();
  if (typeof parentComment === "object" && "_id" in parentComment) {
    return String((parentComment as { _id: unknown })._id);
  }
  return String(parentComment);
}

function nestCommentTree(flat: Record<string, unknown>[]): CommentNode[] {
  const nodes = new Map<string, CommentNode>();
  for (const raw of flat) {
    const id = String(raw["_id"]);
    nodes.set(id, { ...raw, replies: [] } as unknown as CommentNode);
  }

  const roots: CommentNode[] = [];
  for (const raw of flat) {
    const id = String(raw._id);
    const node = nodes.get(id)!;
    const parentId = parentIdFromLeanDoc(raw["parentComment"]);

    if (!parentId) {
      roots.push(node);
      continue;
    }

    const parentNode = nodes.get(parentId);
    if (parentNode) parentNode.replies.push(node);
    else roots.push(node);
  }

  const sortByCreated = (a: CommentNode, b: CommentNode) =>
    new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime();

  function sortDeep(list: CommentNode[]) {
    list.sort(sortByCreated);
    for (const n of list) sortDeep(n.replies);
  }

  sortDeep(roots);
  return roots;
}

export async function GET(_request: Request, context: RouteContext) {
  const slug = normalizeSlugParam(context.params.slug);
  if (!slug) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  await connectMongoDB();
  const session = await getServerSession(authOptions);
  const post = await findPostVisibleForSession(slug, session);
  if (!post) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const flat = await Comment.find({ post: post._id })
    .sort({ createdAt: 1 })
    .populate("author", "name email image")
    .populate({
      path: "parentComment",
      select: "body author createdAt post parentComment",
      populate: { path: "author", select: "name email image" },
    })
    .lean();

  const comments = nestCommentTree(flat as unknown as Record<string, unknown>[]);

  return NextResponse.json({ comments });
}

export async function POST(request: Request, context: RouteContext) {
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

  const body = json as { body?: string; parentCommentId?: string | null };

  const text = typeof body.body === "string" ? body.body.trim() : "";
  if (!text) {
    return NextResponse.json({ error: "Comment body is required." }, { status: 400 });
  }

  await connectMongoDB();

  const post = await findPostVisibleForSession(slug, session);
  if (!post) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  let parentComment: mongoose.Types.ObjectId | null = null;

  if (body.parentCommentId != null && body.parentCommentId !== "") {
    if (!mongoose.isValidObjectId(body.parentCommentId)) {
      return NextResponse.json({ error: "Invalid parentCommentId." }, { status: 400 });
    }
    const parent = await Comment.findById(body.parentCommentId).select("post").lean();
    if (!parent || parent.post.toString() !== post._id.toString()) {
      return NextResponse.json({ error: "Invalid parent comment." }, { status: 400 });
    }
    parentComment = new mongoose.Types.ObjectId(body.parentCommentId);
  }

  let createdId: mongoose.Types.ObjectId;
  try {
    const created = await Comment.create({
      body: text,
      post: post._id,
      author: new mongoose.Types.ObjectId(session.user.id),
      parentComment,
    });
    createdId = created._id as mongoose.Types.ObjectId;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not create comment." }, { status: 500 });
  }

  const comment = await Comment.findById(createdId)
    .populate("author", "name email image")
    .populate({
      path: "parentComment",
      select: "body author createdAt post parentComment",
      populate: { path: "author", select: "name email image" },
    })
    .lean();

  return NextResponse.json({ comment }, { status: 201 });
}
