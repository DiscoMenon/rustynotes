import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import mongoose from "mongoose";
import { authOptions } from "@/lib/auth";
import { connectMongoDB } from "@/lib/mongodb";
import { User } from "@/models/User";

type RouteContext = { params: { id: string } };

export async function POST(_request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const targetId = context.params.id?.trim() ?? "";
  if (!mongoose.isValidObjectId(targetId)) {
    return NextResponse.json({ error: "Invalid user id." }, { status: 400 });
  }

  if (!mongoose.isValidObjectId(session.user.id)) {
    return NextResponse.json({ error: "Invalid session." }, { status: 400 });
  }

  if (targetId === session.user.id) {
    return NextResponse.json({ error: "You cannot follow yourself." }, { status: 400 });
  }

  await connectMongoDB();

  const targetExists = await User.exists({ _id: targetId });
  if (!targetExists) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const meId = new mongoose.Types.ObjectId(session.user.id);
  const themId = new mongoose.Types.ObjectId(targetId);

  const me =
    (await User.findById(session.user.id).select("following").lean()) ?? null;
  const already =
    me?.following?.some((oid) => oid.toString() === targetId) ?? false;

  if (already) {
    await User.updateOne({ _id: meId }, { $pull: { following: themId } });
    await User.updateOne({ _id: themId }, { $pull: { followers: meId } });
  } else {
    await User.updateOne({ _id: meId }, { $addToSet: { following: themId } });
    await User.updateOne({ _id: themId }, { $addToSet: { followers: meId } });
  }

  const updated = await User.findById(targetId).select("followers").lean();
  const followerCount = updated?.followers?.length ?? 0;

  return NextResponse.json({
    following: !already,
    followerCount,
  });
}
