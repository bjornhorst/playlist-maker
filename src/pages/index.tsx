import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import LoginButton from "@/components/LoginButton";
import ArtistSearch from "@/components/ArtistSearch";
import PlaylistGenerator from "@/components/PlaylistGenerator";
import { Artist } from "@/types";
import Header from "@/components/Header";

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
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <LoginButton />

      <Header />

      <main className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="lg:w-2/3">
            {session && (
              <>
                <ArtistSearch />
              </>
            )}
          </div>

          <div className="lg:w-1/3">
            {session && (
              <>
                <PlaylistGenerator selectedArtists={selectedArtists} />
              </>
            )}
          </div>
        </div>
      </main>
    </div>

    // <div className="flex flex-col items-center justify-center space-y-6 py-10">
    //     <h1 className="text-3xl font-bold">Spotify Playlist Generator</h1>
    //     <LoginButton />

    //     {session && (
    //         <>
    //             <ArtistSearch />
    //             <PlaylistGenerator selectedArtists={selectedArtists} />
    //         </>
    //     )}
    // </div>
  );
}
