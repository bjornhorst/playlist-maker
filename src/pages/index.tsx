import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
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
    <div className="min-h-screen flex flex-col text-foreground pb-20">
      <main className="container mx-auto px-4 mt-12 md:mb-auto">
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="lg:w-2/3">
            {session && (
              <>
                <ArtistSearch onArtistsUpdate={setSelectedArtists} />
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
  );
}
