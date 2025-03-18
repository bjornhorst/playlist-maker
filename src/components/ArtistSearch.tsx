"use client";
import { useState, useEffect } from "react";
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
    const [selectedArtists, setSelectedArtists] = useState<Artist[]>([]);

    // Load selected artists from localStorage
    useEffect(() => {
        const savedArtists = localStorage.getItem("selectedArtists");
        if (savedArtists) {
            setSelectedArtists(JSON.parse(savedArtists));
        }
    }, []);

    // Save selected artists to localStorage
    useEffect(() => {
        localStorage.setItem("selectedArtists", JSON.stringify(selectedArtists));
    }, [selectedArtists]);

    const handleSearch = async () => {
        if (!query) return;

        try {
            const response = await axios.get(`/api/search?q=${query}`);
            setArtists(response.data.artists.items);
        } catch (error) {
            console.error("Error searching artists:", error);
        }
    };

    const handleSelectArtist = (artist: Artist) => {
        if (!selectedArtists.some((a) => a.id === artist.id)) {
            setSelectedArtists([...selectedArtists, artist]);
        }
    };

    const handleDeselectArtist = (artistId: string) => {
        setSelectedArtists(selectedArtists.filter((artist) => artist.id !== artistId));
    };

    return (
        <div className="flex">
            {/* Main section (Search and Results) */}
            <div className="flex flex-col items-center flex-1 space-y-4 px-4">
                <div className="flex flex-col items-center space-y-2">
                    <input
                        type="text"
                        placeholder="Search for an artist..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="border border-gray-300 px-4 py-2 rounded-md w-80 text-white"
                    />
                    <button
                        onClick={handleSearch}
                        className="bg-blue-500 text-white px-4 py-2 rounded-md"
                    >
                        Search
                    </button>
                </div>

                <div className="w-full max-w-md">
                    {artists.map((artist) => (
                        <div key={artist.id} className="flex items-center space-x-4 p-2 border-b">
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
                            <button
                                onClick={() => handleSelectArtist(artist)}
                                className="bg-green-500 text-white px-2 py-1 rounded ml-auto"
                            >
                                Select
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Selected Artists panel on the right */}
            <div className="w-[300px] border-l border-gray-700 p-4">
                <h2 className="text-xl font-bold mb-2">Selected Artists</h2>
                {selectedArtists.length === 0 ? (
                    <p className="text-gray-500">No artists selected</p>
                ) : (
                    selectedArtists.map((artist) => (
                        <div
                            key={artist.id}
                            className="flex items-center space-x-4 p-2 border-b bg-gray-100 rounded"
                        >
                            <img
                                src={artist.images[0]?.url || "/default.jpg"}
                                alt={artist.name}
                                className="w-12 h-12 rounded-full"
                            />
                            <p className="text-lg text-black">{artist.name}</p>
                            <button
                                onClick={() => handleDeselectArtist(artist.id)}
                                className="bg-red-500 text-white px-2 py-1 rounded ml-auto"
                            >
                                Remove
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
