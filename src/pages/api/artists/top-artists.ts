// src/pages/api/artists/top-artists.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import axios from "axios";
import { authOptions } from "../auth/[...nextauth]";

interface Artist {
  id: string;
  name: string;
  genres: string[];
  images: { url: string }[];
  popularity: number;
  followers: { total: number };
  external_urls: { spotify: string };
}

interface SpotifyArtist {
  id: string;
  name: string;
  genres: string[];
  images: { url: string }[];
  popularity: number;
  followers: { total: number };
  external_urls: { spotify: string };
}

interface ResponseData {
  topArtists?: Artist[];
  error?: string;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user?.accessToken) {
    return res
        .status(401)
        .json({ error: "Unauthorized: No active session or access token" });
  }

  const headers = {
    Authorization: `Bearer ${session.user.accessToken}`,
  };

  try {
    const response = await axios.get(
        "https://api.spotify.com/v1/me/top/artists",
        {
          headers,
          params: { limit: 12, time_range: "long_term" },
        }
    );

    const topArtists: Artist[] = response.data.items.map(
        (artist: SpotifyArtist) => ({
          id: artist.id,
          name: artist.name,
          genres: artist.genres,
          images: artist.images,
          popularity: artist.popularity,
          followers: artist.followers,
          external_urls: artist.external_urls,
        })
    );

    return res.status(200).json({ topArtists });
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error(
          "❌ Axios Error - Top Artists:",
          error.response ? error.response.data : error.message
      );
      return res.status(500).json({ error: "Failed to fetch top artists" });
    } else {
      console.error("❌ Unknown Error - Top Artists:", error);
      return res.status(500).json({ error: "Unexpected error occurred" });
    }
  }
}
