import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import axios from "axios";

// Define the response shape
type SpotifyUserProfile = {
  name: string | undefined;
  image: string | null;
  email: string;
  id: string;
};

type ErrorResponse = {
  error: string;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<SpotifyUserProfile | ErrorResponse>
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user.accessToken) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const response = await axios.get<SpotifyApi.CurrentUsersProfileResponse>(
        "https://api.spotify.com/v1/me",
        {
          headers: {
            Authorization: `Bearer ${session.user.accessToken}`,
          },
        }
    );

    return res.status(200).json({
      name: response.data.display_name,
      image: response.data.images?.[0]?.url || null,
      email: response.data.email,
      id: response.data.id,
    });
  } catch (error) {
    console.error("Error fetching Spotify profile:", error);
    return res
        .status(500)
        .json({ error: "Failed to fetch Spotify profile" });
  }
}
