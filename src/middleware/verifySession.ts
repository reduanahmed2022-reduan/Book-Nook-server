import type { RequestHandler } from "express";

const verifySession: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const cookie = req.headers.cookie;

    if (!cookie) {
      res.status(401).json({
        message: "Please login first.",
      });
      return;
    }

    const authUrl = process.env.BETTER_AUTH_URL;

    if (!authUrl) {
      res.status(500).json({
        message: "Authentication URL is missing.",
      });
      return;
    }

    const response = await fetch(
      `${authUrl}/api/auth/get-session`,
      {
        method: "GET",
        headers: { cookie },
      }
    );

    if (!response.ok) {
      res.status(401).json({
        message: "Invalid session. Please login again.",
      });
      return;
    }

    const data = (await response.json()) as {
      user?: {
        id?: string;
        email?: string;
        name?: string;
        image?: string;
      };
    };

    if (!data.user?.email) {
      res.status(401).json({
        message: "Unauthorized user.",
      });
      return;
    }

    req.user = {
      ...data.user,
      email: data.user.email,
    };

    next();
  } catch (error) {
    console.error("Session verification error:", error);

    res.status(500).json({
      message: "Session verification failed.",
    });
  }
};

export default verifySession;