import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const imageUrl = req.query.url as string;

    if (!imageUrl) {
        res.status(400).json({ error: "Missing URL" });
        return;
    }

    try {
        const response = await fetch(imageUrl);
        if (!response.ok) {
            res.status(response.status).json({ error: "Failed to fetch image" });
            return;
        }

        const contentType = response.headers.get("Content-Type") || "image/jpeg";
        const buffer = await response.arrayBuffer();

        res.setHeader("Content-Type", contentType);
        res.setHeader("Cache-Control", "public, max-age=86400");
        res.send(Buffer.from(buffer));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
