import { NextRequest, NextResponse } from "next/server";
import { ManagementClient } from "auth0";

const management = new ManagementClient({
  domain: process.env.AUTH0_DOMAIN!,
  clientId: process.env.AUTH0_CLIENT_ID!,
  clientSecret: process.env.AUTH0_CLIENT_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const { email, password, username } = await req.json();

    if (!email || !password || !username) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }
    if (username.length < 3 || username.length > 30) {
      return NextResponse.json(
        { error: "Username must be 3-30 characters" },
        { status: 400 }
      );
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json(
        { error: "Username: letters, numbers, underscore only" },
        { status: 400 }
      );
    }

    // Create user in Auth0
    const auth0User = await management.users.create({
      email,
      password,
      username: username.toLowerCase(),
      connection: "Username-Password-Authentication",
      email_verified: false,
    });

    const userId = (auth0User.data?.user_id || auth0User.user_id) as string;
    console.log("Auth0 user created:", userId);

    return NextResponse.json({
      success: true,
      message: "Account created successfully",
    });
  } catch (err: unknown) {
    console.error("Signup error:", err);
    const apiError = err as { statusCode?: number; message?: string };
    let errorMessage = "Failed to create account";
    if (apiError.statusCode === 409 || apiError.message?.includes("user already exists")) {
      errorMessage = "This email or username is already taken";
    } else if (apiError.message?.includes("password")) {
      errorMessage = "Password too weak. Use 8+ characters with letters & numbers";
    } else if (apiError.message?.includes("email")) {
      errorMessage = "Invalid email address";
    }
    return NextResponse.json(
      { error: errorMessage },
      { status: apiError.statusCode || 500 }
    );
  }
}
