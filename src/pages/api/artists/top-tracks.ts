import type { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import axios from "axios";

interface Track {
    id: string;
    uri: string;
    duration_ms: number;
    name: string;
    popularity: number;
}

interface ArtistTracks {
    artistId: string;
    tracks: Track[];
}

interface RequestBody {
    artistIds: string[];
}

interface ResponseData {
    artistTracks?: ArtistTracks[];
    error?: string;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) {
    const token = await getToken({ req });

    if (!token || !token.accessToken) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const { artistIds } = req.body as RequestBody;

    const headers = {
        Authorization: `Bearer ${token.accessToken}`,
    };

    try {
        const artistTracks: ArtistTracks[] = [];

        for (const artistId of artistIds) {
            const response = await axios.get(
                `https://api.spotify.com/v1/artists/${artistId}/top-tracks`,
                {
                    headers,
                    params: { market: "US" },
                }
            );

            artistTracks.push({
                artistId,
                tracks: response.data.tracks.map((track: Track) => ({
                    id: track.id,
                    uri: track.uri,
                    duration_ms: track.duration_ms,
                    name: track.name,
                    popularity: track.popularity,
                })),
            });
        }

        return res.status(200).json({ artistTracks });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "Failed to fetch artist tracks" });
    }
}
