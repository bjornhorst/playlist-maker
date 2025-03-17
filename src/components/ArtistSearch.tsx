"use client";
import { useState } from "react";
import axios from "axios";

interface Artist {
    id: string;
    name: string;
    images: { url: string }[];
    genres: string[];
}

export default function ArtistSearch() {
    const [query, setQuery] = useState<string>("");
    const [artists, setArtists] = useState<Artist[]>([]);

    const handleSearch = async () => {
        if (!query) return;

        try {
            const response = await axios.get(`/api/search?q=${query}`);
            setArtists(response.data.artists.items);
        } catch (error) {
            console.error("Error searching artists:", error);
        }
    };

    return (
        <div className="flex flex-col items-center space-y-4">
            <input
                type="text"
                placeholder="Search for an artist..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="border border-gray-300 px-4 py-2 rounded-md w-80"
            />
            <button
                onClick={handleSearch}
                className="bg-blue-500 text-white px-4 py-2 rounded-md"
            >
                Search
            </button>

            <div className="mt-4 w-80">
                {artists.map((artist) => (
                    <div
                        key={artist.id}
                        className="flex items-center space-x-4 p-2 border-b"
                    >
                        <img
                            src={artist.images[0]?.url || "/default.jpg"}
                            alt={artist.name}
                            className="w-12 h-12 rounded-full"
                        />
                        <div>
                            <p className="text-lg font-semibold">{artist.name}</p>
                            <p className="text-sm text-gray-500">
                                {artist.genres.join(", ") || "No genres"}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
