import { getSession } from "next-auth/react";
import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getSession({ req });
    if (!session || !session.user.accessToken) return res.status(401).json({ error: "Unauthorized" });

    const artistIds = req.body.artistIds as string[];

    const headers = { Authorization: `Bearer ${session.user.accessToken}` };

    try {
        const promises = artistIds.map((id) =>
            axios.get(`https://api.spotify.com/v1/artists/${id}/top-tracks?market=US`, { headers })
        );

        const responses = await Promise.all(promises);

        const artistTracks = responses.map((resp, index) => ({
            artistId: artistIds[index],
            tracks: resp.data.tracks, // Top tracks for each artist
        }));

        return res.status(200).json({ artistTracks });
    } catch (error) {
        console.error("Error fetching tracks:", error);
        return res.status(500).json({ error: "Failed to fetch tracks" });
    }
}
