import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

    if (!session.isLoggedIn || !session.user?.email) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const domain = process.env.AUTH0_DOMAIN;
    const clientId = process.env.AUTH0_CLIENT_ID;

    const resetResponse = await fetch(
      `https://${domain}/dbconnections/change_password`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          email: session.user.email,
          connection: "Username-Password-Authentication",
        }),
      }
    );

    if (!resetResponse.ok) {
      const errorData = await resetResponse.text();
      console.error("Auth0 change password error:", errorData);
      return NextResponse.json(
        { error: "Failed to send password reset email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Password reset email sent",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { error: "Failed to send password reset email" },
      { status: 500 }
    );
  }
}
