import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

interface PlaylistRequestBody {
    playlistId?: string;
    title?: string;
    trackUris: string[];
    isPlaylistPublic: boolean;
    clearExisting: boolean;
}

interface PlaylistResponse {
    success?: boolean;
    playlistId?: string;
    error?: string;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<PlaylistResponse>
) {
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user.accessToken) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const { playlistId, title, trackUris, isPlaylistPublic, clearExisting } = req.body as PlaylistRequestBody;

    const headers = { Authorization: `Bearer ${session.user.accessToken}` };

    try {
        let finalPlaylistId = playlistId;

        if (!playlistId) {
            const userRes = await axios.get("https://api.spotify.com/v1/me", { headers });
            const userId = userRes.data.id;

            const createRes = await axios.post(
                `https://api.spotify.com/v1/users/${userId}/playlists`,
        {
          name: title,
          public: isPlaylistPublic,
          description: isPlaylistPublic
            ? "Public playlist created by Songifyhub"
            : "Private playlist created by Songifyhub",
        },
                { headers }
            );

            finalPlaylistId = createRes.data.id;
        } else if (clearExisting) {
            await axios.put(
                `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
                { uris: [] },
                { headers }
            );
        }

        await axios.post(
            `https://api.spotify.com/v1/playlists/${finalPlaylistId}/tracks`,
            { uris: trackUris },
            { headers }
        );

        return res.status(200).json({ success: true, playlistId: finalPlaylistId });
    } catch (error) {
        console.error("Playlist operation failed:", error);
        return res.status(500).json({ error: "Playlist creation or update failed" });
    }
}
