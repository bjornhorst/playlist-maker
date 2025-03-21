import type { NextApiRequest, NextApiResponse } from "next";
import {searchArtists} from "@/lib/spotify";
import {getServerSession} from "next-auth/next";
import {authOptions} from "@/pages/api/auth/[...nextauth]";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user.accessToken) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const { q } = req.query;
    if (!q || typeof q !== "string") {
        return res.status(400).json({ error: "Invalid query" });
    }

    const artists = await searchArtists(q, session.user.accessToken);
    res.status(200).json(artists);
}
