// src/pages/api/playlists/manage.ts

import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

interface PlaylistRequestBody {
    playlistId?: string;
    title?: string;
    trackUris: string[];
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
    const session = await getSession({ req });
    if (!session || !session.user.accessToken) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const { playlistId, title, trackUris, clearExisting } = req.body as PlaylistRequestBody;

    const headers = { Authorization: `Bearer ${session.user.accessToken}` };

    try {
        let finalPlaylistId = playlistId;

        if (!playlistId) {
            // Create a new playlist
            const userRes = await axios.get("https://api.spotify.com/v1/me", { headers });
            const userId = userRes.data.id;

            const createRes = await axios.post(
                `https://api.spotify.com/v1/users/${userId}/playlists`,
                { name: title, public: false },
                { headers }
            );

            finalPlaylistId = createRes.data.id;
        } else if (clearExisting) {
            // Clear existing playlist
            await axios.put(
                `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
                { uris: [] },
                { headers }
            );
        }

        // Add tracks to playlist
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
