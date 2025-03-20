import axios from "axios";
export const searchArtists = async (
    query: string,
    accessToken: string
): Promise<SpotifyApi.SearchResponse | null> => { // ✅ No need to import
    if (!query) return null;

    try {
        const response = await axios.get<SpotifyApi.SearchResponse>(
            "https://api.spotify.com/v1/search",
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                params: {
                    q: query,
                    type: "artist",
                    limit: 5,
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error("Error searching artists:", error);
        return null;
    }
};

export const getUserPlaylists= async (
    userId: string,
    accessToken: string
): Promise<SpotifyApi.SearchResponse | null> => { // ✅ No need to import
    if (!userId) return null;

    try {
        const response = await axios.get<SpotifyApi.SearchResponse>(
            `https://api.spotify.com/v1/users/${userId}/playlists`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error("Error searching artists:", error);
        return null;
    }
};