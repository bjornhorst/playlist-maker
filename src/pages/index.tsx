import { useSession, signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import ArtistSearch from "@/components/ArtistSearch";
import PlaylistGenerator from "@/components/PlaylistGenerator";
import { Artist } from "@/types";
import { Music } from "lucide-react";
import MusicVisualizer from "../components/MusicVisualizer";
import "react-toastify/dist/ReactToastify.css";

export default function Home() {
  const { data: session, status } = useSession();
  const [selectedArtists, setSelectedArtists] = useState<Artist[]>([]);

  const handleSignIn = () => {
    localStorage.setItem("newLogin", "true"); // Set flag before sign-in
    toast.info("Signing in...", {
      position: "bottom-right",
      autoClose: 2000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "dark",
    });
    signIn("spotify");
  };

  useEffect(() => {
    const savedArtists = localStorage.getItem("selectedArtists");
    if (savedArtists) {
      setSelectedArtists(JSON.parse(savedArtists));
    }
  }, []);

  useEffect(() => {
    // Check if the login was just completed in this session
    const isNewLogin = localStorage.getItem("newLogin") === "true";

    if (status === "authenticated" && isNewLogin) {
      toast.success("Successfully logged in!", {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });

      // Remove the new login flag
      localStorage.removeItem("newLogin");
    }
  }, [status]);

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center h-full text-foreground pb-20 ${
        !session ? "overflow-hidden" : ""
      }`}
    >
      <ToastContainer theme="dark" />
      {!session && (
        <div className="fixed inset-0 z-50 flex items-center justify-center md:-mt-32">
          <div className="w-full max-w-lg p-4 text-center">
            <MusicVisualizer />

            <span className="py-1.5 text-xs text-center px-3 bg-secondary max-w-fit rounded-full mx-auto">
              Songifyhub
            </span>
            <h1 className="text-4xl font-bold mt-3 text-center">
              Create the perfect playlist
            </h1>
            <p className="text-sm text-muted mt-4 text-center w-4/5 mx-auto">
              Connect with spotify to generate custom playlists based on your
              favorite artists.
            </p>

            <div className="flex flex-col items-center justify-center bg-dark rounded-lg mt-8 py-10 px-6 md:px-8 custom-border mx-auto">
              <div className="bg-contrast p-2.5 rounded-full mb-2 animate-bounce duration-700 custom-border">
                <Music size={32} color="hsl(143, 70%, 50%)" />
              </div>

              <h2 className="text-xl font-bold text-center">
                Ready to discover new music?
              </h2>
              <p className="text-sm text-muted mt-2 text-center">
                Click the button below to connect your Spotify account and start
                creating personalized playlists.
              </p>
              <button
                onClick={handleSignIn}
                className="bg-primary px-4 py-2.5 rounded-full font-base hover:bg-green-500 transition-colors cursor-pointer flex flex-row gap-2 text-black mt-5"
              >
                <Music size={20} color="#000" /> Connect with Spotify
              </button>
            </div>
          </div>
        </div>
      )}
      <main className="container mx-auto px-4 mt-8 md:mt-12 md:mb-auto">
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
