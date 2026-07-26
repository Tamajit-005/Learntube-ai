import { SessionOptions } from "iron-session";

export interface SessionData {
  user?: {
    sub: string;
    email: string;
    username: string;
    name?: string;
    nickname?: string;
    picture?: string;
  };
  accessToken?: string;
  idToken?: string;
  isLoggedIn: boolean;
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET as string,
  cookieName: "learntube_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 10, // 10 days
    path: "/",
  },
};
