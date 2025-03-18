import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import LoginButton from "@/components/LoginButton";
import ArtistSearch from "@/components/ArtistSearch";
import PlaylistGenerator from "@/components/PlaylistGenerator";
import { Artist } from "@/types";

export default function Home() {
    const { data: session } = useSession();
    const [selectedArtists, setSelectedArtists] = useState<Artist[]>([]);

    useEffect(() => {
        const savedArtists = localStorage.getItem("selectedArtists");
        if (savedArtists) {
            setSelectedArtists(JSON.parse(savedArtists));
        }
    }, []);

    return (
        <div className="flex flex-col items-center justify-center space-y-6 py-10">
            <h1 className="text-3xl font-bold">Spotify Playlist Generator</h1>
            <LoginButton />

            {session && (
                <>
                    <ArtistSearch />
                    <PlaylistGenerator selectedArtists={selectedArtists} />
                </>
            )}
        </div>
    );
}
