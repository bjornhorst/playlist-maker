"use client";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Search } from "lucide-react";
import { Artist } from "@/types";
import { useSession } from "next-auth/react";

export default function ArtistSearch({onArtistsUpdate,}: {
    onArtistsUpdate: (updatedArtists: Artist[]) => void;
}) {
    const { data: session } = useSession();
    const [query, setQuery] = useState<string>("");
    const [artists, setArtists] = useState<Artist[]>([]);
    const [selectedArtists, setSelectedArtists] = useState<Artist[]>([]);
    const [suggestedArtists, setSuggestedArtists] = useState<Artist[]>([]);
    const [isSearching, setIsSearching] = useState<boolean>(false);

    const searchContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                searchContainerRef.current &&
                !searchContainerRef.current.contains(event.target as Node)
            ) {
                setIsSearching(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [searchContainerRef]);

    const fetchTopArtists = async () => {  
        
        // if no session return
        if (!session || !session.user.accessToken) {
            return;
        }

        try {
            const response = await axios.post("/api/artists/top-artists", {}, {
                headers: {
                    Authorization: `Bearer ${session.user.accessToken}`
                }
            });
            setSuggestedArtists(response.data.topArtists || []);
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                console.error("Error fetching top artists:", error.response ? error.response.data : error.message);
            } else {
                console.error("Unexpected error fetching top artists:", error);
            }
        }
    };

    useEffect(() => {
        const savedArtists = localStorage.getItem("selectedArtists");

        if (savedArtists !== null) {
            const parsedArtists = JSON.parse(savedArtists) as Artist[];
            setSelectedArtists(parsedArtists);
            onArtistsUpdate(parsedArtists);

            // Only fetch top artists if parsed artists array is empty
            if (parsedArtists.length === 0 && session) {
                fetchTopArtists();
            }
        } else if (session) {
            fetchTopArtists();
        }
    }, [session, onArtistsUpdate]);

    useEffect(() => {
        localStorage.setItem("selectedArtists", JSON.stringify(selectedArtists));
        onArtistsUpdate(selectedArtists);
    }, [selectedArtists]);

    const handleSearch = async () => {
        if (!query) {
            setArtists([]);
            setIsSearching(false);
            return;
        }

        try {
            const response = await axios.get(`/api/search?q=${query}`);
            setArtists(response.data.artists.items);
            setIsSearching(true);
        } catch (error) {
            console.log(error)
            setIsSearching(false);
        }
    };

    const handleSelectArtist = (artist: Artist) => {
        if (!selectedArtists.some((a) => a.id === artist.id)) {
            setSelectedArtists([...selectedArtists, artist]);
        }
        setQuery("");
        setSuggestedArtists([]);
    };

    const handleDeselectArtist = (artistId: string) => {
        const updatedArtists = selectedArtists.filter((artist) => artist.id !== artistId);
        setSelectedArtists(updatedArtists);

        // if no artists are selected, fetch top artists
        if(updatedArtists.length === 0) {
            fetchTopArtists();
        }
    };

    return (
        <div className="container mx-auto md:px-4 pl-0 relative">
            <div className="relative" ref={searchContainerRef}>
                <div className="flex flex-col mb-4">
                    <h2 className="text-xl font-bold mb-1.5">Search Artists </h2>
                    <p className="text-sm text-muted-foreground">
                        Find artists to add to your playlist
                    </p>
                </div>
                <div className="flex flex-row items-center space-x-2 mb-4">
                    <div className="relative w-full">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            <Search size={16} />
                        </span>
                        <input
                            type="text"
                            placeholder="Search for an artist..."
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                handleSearch();
                            }}
                            onFocus={handleSearch}
                            className="w-full bg-secondary rounded-md py-2.5 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
                        />
                        {isSearching && artists.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-secondary shadow-lg rounded-md max-h-94 overflow-y-auto ">
                                {artists.map((artist) => (
                                    <div
                                        key={artist.id}
                                        onClick={() => handleSelectArtist(artist)}
                                        className="dropdown-class flex items-center space-x-4 p-4 hover:backdrop-opacity-30 cursor-pointer transition-colors duration-200 ease-in-out"
                                    >
                                        <img
                                            src={artist.images[0]?.url || "/default.jpg"}
                                            alt={artist.name}
                                            className="w-16 h-16 rounded-lg object-cover"
                                        />
                                        <div className="flex-grow">
                                            <p className="text-xl font-semibold">{artist.name}</p>
                                            <p className="text-sm text-gray-500">
                                                {artist.genres.slice(0, 2).join(", ") || "No genres"}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {!isSearching && selectedArtists.length === 0 && suggestedArtists.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-background mt-4 md:mt-8">
                                <div className="py-1">
                                    <div className="flex flex-col">
                                        <h2 className="text-xl font-bold mb-1.5">Suggested Artists</h2>
                                        <p className="text-sm text-muted-foreground">
                                            Use your favorite artists to create a playlist
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4 pl-0">
                                        {suggestedArtists.map((artist) => (
                                            <div
                                                key={artist.id}
                                                onClick={() => handleSelectArtist(artist)}
                                                className="relative group overflow-hidden bg-secondary/30 border-secondary/30 rounded-lg border transition-all duration-300 hover:border-secondary/50 border-border/50 bg-card/70 hover:bg-card/90 p-4 cursor-pointer"
                                            >
                                                <div className="flex flex-col items-center gap-4">
                                                    <div className="relative">
                                                        <img
                                                            src={artist.images[0]?.url || "/default.jpg"}
                                                            alt={artist.name}
                                                            className="w-full h-full max-h-32 max-w-32 rounded-md object-cover transition-transform duration-700 hover:scale-105"
                                                            loading="lazy"
                                                        />
                                                        <div
                                                            className="absolute inset-0 rounded-md ring-1 ring-inset ring-black/10"></div>
                                                    </div>

                                                    <div className="text-center w-full">
                                                        <h3 className="font-medium text-base leading-6 break-words">
                                                            {artist.name}
                                                        </h3>
                                                        <p className="text-sm text-muted-foreground truncate">
                                                            {artist.genres.slice(0, 3).join(", ")}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50 text-white text-sm">
                                                    Click to Select
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 🔥 Selected Artists Section */}
            <div className="flex flex-col md:p-4 md:pl-0 pl-0 gap-4">
                <div className="flex flex-col">
                    <h2 className="text-xl font-bold mb-1.5">Selected Artists</h2>
                    <p className="text-sm text-muted-foreground">
                        ({selectedArtists.length} artists selected)
                    </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pl-0">
                    {selectedArtists.length === 0 ? (
                        <p className="text-gray-500 col-span-full">No artists selected</p>
                    ) : (
                        selectedArtists.map((artist) => (
                            <div
                                key={artist.id}
                                className="relative group overflow-hidden bg-primary/10 border-primary/30 rounded-lg border transition-all duration-300 hover:border-primary/50 border-border/50 bg-card/70 hover:bg-card/90 p-4"
                            >
                                <div className="flex flex-col items-center gap-4">
                                    <div className="relative">
                                        <img
                                            src={artist.images[0]?.url || "/default.jpg"}
                                            alt={artist.name}
                                            className="w-full h-full max-h-32 max-w-32 rounded-md object-cover transition-transform duration-700 hover:scale-105"
                                            loading="lazy"
                                        />
                                        <div
                                            className="absolute inset-0 rounded-md ring-1 ring-inset ring-black/10"></div>
                                    </div>

                                    <div className="text-center w-full">
                                        <h3 className="font-medium text-base leading-6 break-words">
                                            {artist.name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground truncate">
                                            {artist.genres.slice(0, 3).join(", ")}
                                        </p>
                                    </div>
                                </div>

                                {/* 🔥 Add button to trigger `handleDeselectArtist` */}
                                <button
                                    onClick={() => handleDeselectArtist(artist.id)}
                                    className="absolute top-2 right-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 text-destructive hover:text-destructive/80"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
