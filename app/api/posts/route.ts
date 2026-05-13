import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import mongoose from "mongoose";
import { authOptions } from "@/lib/auth";
import { connectMongoDB } from "@/lib/mongodb";
import { Post } from "@/models/Post";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

function parseLimit(raw: string | null): number {
  const n = Number.parseInt(raw ?? "", 10);
  if (Number.isNaN(n)) return DEFAULT_LIMIT;
  return Math.min(Math.max(n, 1), MAX_LIMIT);
}

function parseTagFilters(searchParams: URLSearchParams): string[] {
  const fromRepeated = searchParams.getAll("tag");
  const fromCsv = searchParams.get("tags")?.split(",") ?? [];
  const merged = [...fromRepeated, ...fromCsv];
  const out = new Set<string>();
  for (const t of merged) {
    const s = t.trim().toLowerCase();
    if (s) out.add(s);
  }
  return Array.from(out);
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

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = parseLimit(url.searchParams.get("limit"));
  const cursor = url.searchParams.get("cursor");
  const tagFilter = parseTagFilters(url.searchParams);

  if (cursor !== null && cursor !== "" && !mongoose.isValidObjectId(cursor)) {
    return NextResponse.json({ error: "Invalid cursor." }, { status: 400 });
  }

  await connectMongoDB();

  const filter: {
    published: boolean;
    tags?: { $in: string[] };
    _id?: { $lt: mongoose.Types.ObjectId };
  } = { published: true };

  if (tagFilter.length > 0) {
    filter.tags = { $in: tagFilter };
  }

  if (cursor) {
    filter._id = { $lt: new mongoose.Types.ObjectId(cursor) };
  }

  const rows = await Post.find(filter)
    .sort({ _id: -1 })
    .limit(limit + 1)
    .populate("author", "name email image")
    .lean();

  const hasMore = rows.length > limit;
  const posts = hasMore ? rows.slice(0, limit) : rows;
  const nextCursor =
    hasMore && posts.length > 0 ? String(posts[posts.length - 1]!._id) : null;

  return NextResponse.json({
    posts,
    nextCursor,
    hasMore,
  });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
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

  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }

  const content = typeof body.content === "string" ? body.content : "";
  const published = Boolean(body.published);
  const tags = normalizeBodyTags(body.tags);

  await connectMongoDB();

  let postId: mongoose.Types.ObjectId;
  try {
    const created = await Post.create({
      title,
      content,
      author: new mongoose.Types.ObjectId(session.user.id),
      published,
      tags,
    });
    postId = created._id as mongoose.Types.ObjectId;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not create post." }, { status: 500 });
  }

  const post = await Post.findById(postId)
    .populate("author", "name email image")
    .lean();

  return NextResponse.json({ post }, { status: 201 });
}
