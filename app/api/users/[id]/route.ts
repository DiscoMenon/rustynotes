import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import mongoose from "mongoose";
import { authOptions } from "@/lib/auth";
import { connectMongoDB } from "@/lib/mongodb";
import { User } from "@/models/User";

type RouteContext = { params: { id: string } };

export async function GET(_request: Request, context: RouteContext) {
  const id = context.params.id?.trim() ?? "";
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid user id." }, { status: 400 });
  }

  await connectMongoDB();

  const session = await getServerSession(authOptions);
  const isSelf = session?.user?.id === id;

  const user = await User.findById(id)
    .select("name email image createdAt followers following")
    .lean();

  if (!user) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const followers = user.followers ?? [];
  const following = user.following ?? [];

  const viewerId = session?.user?.id;
  const isFollowing =
    viewerId && viewerId !== id
      ? followers.some((fid) => fid.toString() === viewerId)
      : undefined;

  return NextResponse.json({
    user: {
      id: String(user._id),
      name: user.name,
      image: user.image ?? null,
      createdAt: user.createdAt,
      followerCount: followers.length,
      followingCount: following.length,
      ...(isSelf ? { email: user.email } : {}),
      ...(isFollowing !== undefined ? { isFollowing } : {}),
    },
  });
}

export async function PUT(request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const id = context.params.id?.trim() ?? "";
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid user id." }, { status: 400 });
  }

  if (session.user.id !== id) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const body = json as { name?: string; image?: string | null };

  await connectMongoDB();

  const user = await User.findById(id);
  if (!user) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  if (body.name !== undefined) {
    const nextName = String(body.name).trim();
    if (!nextName) {
      return NextResponse.json({ error: "Name cannot be empty." }, { status: 400 });
    }
    user.name = nextName;
  }

  if (body.image !== undefined) {
    if (body.image === null || body.image === "") {
      user.image = undefined;
    } else if (typeof body.image === "string") {
      user.image = body.image.trim() || undefined;
    } else {
      return NextResponse.json({ error: "Invalid image value." }, { status: 400 });
    }
  }

  try {
    await user.save();
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not update profile." }, { status: 500 });
  }

  const followers = user.followers ?? [];
  const following = user.following ?? [];

  return NextResponse.json({
    user: {
      id: String(user._id),
      name: user.name,
      email: user.email,
      image: user.image ?? null,
      createdAt: user.createdAt,
      followerCount: followers.length,
      followingCount: following.length,
    },
  });
}
