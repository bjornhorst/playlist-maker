import { Playlist } from "@/types/playlist";

export const fetchPlaylists = async (userId: unknown): Promise<Playlist[]> => {
    try {
        const response = await fetch(`/api/playlists/user-playlists?userId=${userId}`);

        if (!response.ok) {
            throw new Error(`Error fetching playlists: ${response.statusText}`);
        }

        const data = await response.json();

        return data.items.filter((playlist: Playlist) => {
            return playlist.collaborative || playlist.owner.id === userId;
        });
    } catch (error) {
        console.error("Failed to fetch playlists:", error);
        return [];
    }
};
