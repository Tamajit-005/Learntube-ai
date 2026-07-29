import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

import { sessionOptions, SessionData } from "@/lib/session";
import { connectDB } from "@/lib/mongodb";
import VideoContent from "@/lib/videoContent";

async function getVideoTitle(url: string) {
  try {
    const response = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
    );

    if (!response.ok) return null;

    const data = await response.json();
    return typeof data?.title === "string" ? data.title : null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();

    const session = await getIronSession<SessionData>(
      cookieStore,
      sessionOptions
    );

    if (!session.isLoggedIn || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { url, analyzed_at, result } = await req.json();
    const title = await getVideoTitle(url);

    await connectDB();

    await VideoContent.findOneAndUpdate(
      {
        userId: session.user.sub,
        url,
      },
      {
        userId: session.user.sub,
        email: session.user.email,
        username: session.user.username,

        url,
        title: title || undefined,
        analyzed_at,

        result,

        lastViewedAt: new Date(),
        updatedAt: new Date(),
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Content Save Error:", error);

    return NextResponse.json(
      {
        error: "Failed to save content",
      },
      {
        status: 500,
      }
    );
  }
}