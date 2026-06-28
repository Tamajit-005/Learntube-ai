import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const { identifier, password } = await req.json();

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Email/Username and password are required" },
        { status: 400 }
      );
    }

    const domain = process.env.AUTH0_DOMAIN;
    const clientId = process.env.AUTH0_CLIENT_ID;
    const clientSecret = process.env.AUTH0_CLIENT_SECRET;

    // Authenticate with Auth0 using password-realm grant
    const tokenResponse = await fetch(
      `https://${domain}/oauth/token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grant_type: "http://auth0.com/oauth/grant-type/password-realm",
          username: identifier,
          password,
          client_id: clientId,
          client_secret: clientSecret,
          realm: "Username-Password-Authentication",
          scope: "openid profile email",
        }),
      }
    );

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      let errorMessage = "Invalid email/username or password";
      if (tokenData.error === "invalid_grant" || tokenData.error === "invalid_user_password") {
        errorMessage = "Invalid email/username or password";
      } else if (tokenData.error === "access_denied") {
        errorMessage = "Account locked or disabled";
      } else if (tokenData.error_description) {
        errorMessage = tokenData.error_description;
      }
      return NextResponse.json({ error: errorMessage }, { status: 401 });
    }

    // Get user profile
    const userInfoResponse = await fetch(
      `https://${domain}/userinfo`,
      {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      }
    );
    const userInfo = await userInfoResponse.json();

    // Determine display username
    const authUsername =
      userInfo["https://learntube.app/username"] ||
      userInfo.nickname ||
      userInfo.email?.split("@")[0];

    // Create session
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
    session.user = {
      sub: userInfo.sub,
      email: userInfo.email,
      name: userInfo.name,
      nickname: userInfo.nickname,
      picture: userInfo.picture,
      username: authUsername,
    };
    session.accessToken = tokenData.access_token;
    session.idToken = tokenData.id_token;
    session.isLoggedIn = true;
    await session.save();

    return NextResponse.json({
      success: true,
      user: session.user,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Login failed. Please try again." },
      { status: 500 }
    );
  }
}
