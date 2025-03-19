"use client";
import { LogOut, User } from "lucide-react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import axios from "axios";

interface SpotifyProfile {
  name?: string;
  image?: string | null;
  email?: string;
}

export default function TopBar() {
  const { data: session } = useSession();
  const [spotifyProfile, setSpotifyProfile] = useState<SpotifyProfile>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchSpotifyProfile() {
      if (session) {
        setIsLoading(true);
        try {
          const response = await axios.get("/api/spotify/profile");
          setSpotifyProfile(response.data);
        } catch (error) {
          console.error("Error fetching Spotify profile:", error);
        } finally {
          setIsLoading(false);
        }
      }
    }

    fetchSpotifyProfile();
  }, [session]);

  return (
    <div className="sticky top-0 z-50 w-full bg-secondary">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between w-full">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-foreground">
            Playlist Creator
          </h1>
        </div>

        <div className="flex items-center gap-8">
          {session ? (
            <div className="flex items-center gap-4">
              <div className="mr-8 flex flex-row gap-2 items-center">
                {isLoading ? (
                  <div className="animate-pulse">
                    <div className="w-8 h-8 bg-muted-foreground rounded-full"></div>
                  </div>
                ) : spotifyProfile.image ? (
                  <img
                    src={spotifyProfile.image}
                    alt={spotifyProfile.name || "User profile"}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <User size={24} className="text-muted-foreground" />
                )}
                <span className="text-sm font-medium">
                  {spotifyProfile.name || "User"}
                </span>
              </div>
              <button
                onClick={() => signOut()}
                className="flex items-center space-x-2 text-destructive border border-red-500 px-4 py-2 rounded-lg text-red-500 hover:border-red-300 hover:text-red-300 transition-colors cursor-pointer"
              >
                <LogOut size={16} />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => signIn("spotify")}
              className="bg-green-700 px-4 py-2 rounded-md text-sm hover:bg-green-500  transition-colors cursor-pointer"
            >
              Login with Spotify
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
