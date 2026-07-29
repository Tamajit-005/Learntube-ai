import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

import { sessionOptions, SessionData } from "@/lib/session";
import { connectDB } from "@/lib/mongodb";
import VideoContent from "@/lib/videoContent";

export async function GET() {
  try {
    const cookieStore = await cookies();

    const session = await getIronSession<SessionData>(
      cookieStore,
      sessionOptions
    );

    if (!session.isLoggedIn || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const history = await VideoContent.find({ userId: session.user.sub })
      .sort({ analyzed_at: -1 })
      .select("_id url title analyzed_at")
      .limit(10);

    return NextResponse.json(history);
  } catch (error) {
    console.error("Content History Error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch content history",
      },
      {
        status: 500,
      }
    );
  }
}
