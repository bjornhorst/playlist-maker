import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import axios from "axios";

declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      accessToken?: string;
      refreshToken?: string;
      expiresAt?: number;
      error?: unknown;
    };
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user.accessToken) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const response = await axios.get("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
      },
    });

    return res.status(200).json({
      name: response.data.display_name,
      image: response.data.images?.[0]?.url || null,
      email: response.data.email,
    });
  } catch (error) {
    console.error("Error fetching Spotify profile:", error);
    return res.status(500).json({ error: "Failed to fetch Spotify profile" });
  }
}
