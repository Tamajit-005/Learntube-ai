import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { Types } from "mongoose";

import { sessionOptions, SessionData } from "@/lib/session";
import { connectDB } from "@/lib/mongodb";
import VideoContent from "@/lib/videoContent";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();

    const session = await getIronSession<SessionData>(
      cookieStore,
      sessionOptions
    );

    if (!session.isLoggedIn || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await connectDB();

    const document = await VideoContent.findOne({
      _id: id,
      userId: session.user.sub,
    });

    if (!document) {
      const ownedDocument = await VideoContent.findOne({ _id: id });

      if (ownedDocument) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error("Content History Item Error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch content history item",
      },
      {
        status: 500,
      }
    );
  }
}
