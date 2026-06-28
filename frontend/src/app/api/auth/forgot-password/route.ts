import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
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
          email,
          connection: "Username-Password-Authentication",
        }),
      }
    );

    if (!resetResponse.ok) {
      const errorData = await resetResponse.text();
      console.error("Auth0 forgot password error:", errorData);
      return NextResponse.json(
        { error: "Failed to send reset email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Password reset email sent",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Failed to send reset email" },
      { status: 500 }
    );
  }
}
