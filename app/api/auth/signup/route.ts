import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectMongoDB } from "@/lib/mongodb";
import { validateSignupPayload } from "@/lib/auth-validation";
import { User } from "@/models/User";

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const body = json as { name?: string; email?: string; password?: string };

  const fieldErrors = validateSignupPayload(body);
  if (fieldErrors) {
    return NextResponse.json({ errors: fieldErrors }, { status: 400 });
  }

  const email = body.email!.trim().toLowerCase();
  const name = body.name!.trim();
  const password = body.password!;

  await connectMongoDB();

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    await User.create({
      email,
      name,
      passwordHash,
    });
  } catch (err: unknown) {
    const code = err && typeof err === "object" && "code" in err ? (err as { code?: number }).code : undefined;
    if (code === 11000) {
      return NextResponse.json(
        { errors: { email: "An account with this email already exists." } },
        { status: 409 },
      );
    }
    console.error(err);
    return NextResponse.json({ error: "Could not create account." }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
