"use client";
import { LogOut, User, Menu, X, Home, ListMusic } from "lucide-react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";

interface SpotifyProfile {
  name?: string;
  image?: string | null;
  email?: string;
  id?: string;
}

export default function TopBar() {
  const { data: session } = useSession();
  const [spotifyProfile, setSpotifyProfile] = useState<SpotifyProfile>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);



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
          <h1 className="text-xl font-bold text-foreground">Songifyhub</h1>
        </div>

        {/* hamburger for mobile */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-foreground"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* desktop */}
        <div className="hidden md:flex items-center gap-16">
          <nav className="flex items-center gap-10">
            <Link
              href="/"
              className="flex items-center gap-2 text-foreground hover:text-primary"
            >
              <Home size={16} />
              Home
            </Link>
            {session && (
              <Link
                href="/playlists"
                className="flex items-center gap-2 text-foreground hover:text-primary"
              >
                <ListMusic size={16} />
                Playlists
              </Link>
            )}
          </nav>

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
                className="flex items-center gap-2 text-destructive border border-red-500 px-4 py-2 rounded-lg text-red-500 hover:border-red-300 hover:text-red-300 transition-colors cursor-pointer"
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
              Login
            </button>
          )}
        </div>

        {/* mobile */}
        <div
          className={`fixed inset-y-0 left-0 w-full bg-secondary transform transition-transform duration-300 ease-in-out z-[9999] md:hidden 
            ${isMenuOpen ? "translate-x-0" : "translate-x-[-200%]"}`}
        >
          <div className="flex flex-col h-full p-6">
            <button
              onClick={() => setIsMenuOpen(false)}
              className="self-end mb-6 text-foreground"
            >
              <X size={24} />
            </button>

            {session && (
              <div className="flex items-center gap-4 mb-6">
                {isLoading ? (
                  <div className="animate-pulse">
                    <div className="w-12 h-12 bg-muted-foreground rounded-full"></div>
                  </div>
                ) : spotifyProfile.image ? (
                  <img
                    src={spotifyProfile.image}
                    alt="Profile"
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  <User size={32} className="text-muted-foreground" />
                )}
                <div>
                  <span className="text-foreground text-lg font-semibold block">
                    {spotifyProfile.name || "User"}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    {spotifyProfile.email}
                  </span>
                </div>
              </div>
            )}

            <nav className="flex flex-col gap-6">
              <Link
                href="/"
                className="flex items-center gap-4 text-foreground hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                <Home size={24} />
                Home
              </Link>

              {session && (
                <Link
                  href="/playlists"
                  className="flex items-center gap-4 text-foreground hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <ListMusic size={24} />
                  Playlists
                </Link>
              )}

              {session ? (
                <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex items-center space-x-2 text-destructive border border-red-500 px-4 py-2 rounded-lg text-red-500 hover:border-red-300 hover:text-red-300 transition-colors cursor-pointer"
                >
                  <LogOut size={16} />
                  <span className="text-sm">Logout</span>
                </button>
              ) : (
                <button
                  onClick={() => signIn("spotify")}
                  className="bg-green-700 px-4 py-2 rounded-md text-sm hover:bg-green-500  transition-colors cursor-pointer"
                >
                  Login
                </button>
              )}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
