import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
        const session = await getServerSession(req, res, authOptions);

        if (!session || !session.user.accessToken) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const { userId } = req.query;
        if (!userId || typeof userId !== "string") {
            return res.status(400).json({ error: "Invalid user ID" });
        }

        const response = await axios.get<SpotifyApi.ListOfCurrentUsersPlaylistsResponse>(
            `https://api.spotify.com/v1/me/playlists`,
            {
                headers: { Authorization: `Bearer ${session.user.accessToken}` },
            }
        );

        return res.status(200).json(response.data);
    } catch (error) {
        console.error("Error fetching user playlists:", error);
        return res.status(500).json({ error: "Failed to fetch playlists" });
    }
}
