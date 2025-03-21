"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { Artist } from "@/types";
import { Music, Clock, Hash } from "lucide-react";
import { Track, ArtistTracks, Album, Playlist } from "@/types/playlist";
import { Helper } from "@/utils/toastHelper";
import DividerWithText from "@/components/DividerWithText";
import pLimit from "p-limit";

export default function PlaylistGenerator({
  selectedArtists,
}: {
  selectedArtists: Artist[];
}) {
  const { data: session } = useSession();
  const [amount, setAmount] = useState(25);
  const [duration, setDuration] = useState(0);
  const [useDuration, setUseDuration] = useState(false);
  const [randomSongs, setRandomSongs] = useState(false);
  const [playlistName, setPlaylistName] = useState("");
  const [existingPlaylistId, setExistingPlaylistId] = useState("");
  const [clearExisting, setClearExisting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isFormPopupOpen, setIsFormPopupOpen] = useState(false);
  const [userPlaylists, setUserPlaylists] = useState([]);

  const limit = pLimit(5); // Set your concurrency limit here

  useEffect(() => {
    if (session) {
      fetchPlaylists();
    }

    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const fetchPlaylists = async () => {
    try {
      const response = await fetch(
        `/api/playlists/user-playlists?userId=${session?.user?.id}`
      );
      const data = await response.json();

      if (response.ok && session) {
        const writablePlaylists = data.items.filter((playlist: Playlist) => {
          return (
            playlist.collaborative || playlist.owner.id === session.user.id
          );
        });
        setUserPlaylists(writablePlaylists);
      }
    } catch (error) {
      console.error("Failed to fetch playlists:", error);
    }
  };

  const generatePlaylist = async () => {
    if (!session || !session.user.accessToken) {
      Helper.toast.ShowError("You need to log in with Spotify first!");
      return;
    }
    if (selectedArtists.length === 0) {
      Helper.toast.ShowInfo("Select at least one artist.");
      return;
    }

    try {
      const artistIds = selectedArtists.map((a) => a.id);
      let artistTracks: ArtistTracks[] = [];

      if (randomSongs) {
        //todo move to a internal api call that handles the spotify call
        const albumResponses = await Promise.all(
          artistIds.map((artistId) =>
            limit(() =>
              axios.get<{ items: Album[] }>(
                `https://api.spotify.com/v1/artists/${artistId}/albums`,
                {
                  params: { include_groups: "album,single", market: "US" },
                  headers: {
                    Authorization: `Bearer ${session.user.accessToken}`,
                  },
                }
              )
            )
          )
        );

        const allAlbumIds = albumResponses.flatMap((res) =>
          res.data.items.map((album) => album.id)
        );

        //todo move to a internal api call that handles the spotify call
        const trackResponses = await Promise.all(
          allAlbumIds.map((albumId) =>
            axios.get<{ items: Track[] }>(
              `https://api.spotify.com/v1/albums/${albumId}/tracks`,
              {
                headers: {
                  Authorization: `Bearer ${session.user.accessToken}`,
                },
              }
            )
          )
        );

        artistTracks = artistIds.map((id) => ({
          artistId: id,
          tracks: trackResponses
            .flatMap((res) => res.data.items)
            .map((track) => ({
              id: track.id,
              uri: track.uri,
              duration_ms: track.duration_ms,
              name: track.name,
              popularity: Math.floor(Math.random() * 100),
            })),
        }));
      } else {
        const { data } = await axios.post<{ artistTracks: ArtistTracks[] }>(
          "/api/artists/top-tracks",
          { artistIds }
        );
        artistTracks = data.artistTracks;
      }

      const tracks = distributeTracks(
        artistTracks,
        useDuration ? undefined : amount,
        useDuration ? duration * 60 * 1000 : undefined,
        randomSongs
      );

      await axios.post("/api/playlists/manage", {
        playlistId: existingPlaylistId || undefined,
        title: playlistName,
        trackUris: tracks.map((t: Track) => t.uri),
        clearExisting,
      });

      Helper.toast.ShowSuccess(
        `Playlist generated successfully with ${tracks.length} songs!`
      );
      setIsFormPopupOpen(false);
    } catch (error) {
      console.log(error);
      Helper.toast.ShowError("Failed to generate playlist.");
    }
  };

  const distributeTracks = (
    artistTracks: ArtistTracks[],
    totalTracks?: number,
    totalDurationMs?: number,
    randomize = false
  ): Track[] => {
    const selectedTracks: Track[] = [];
    const numArtists = artistTracks.length;

    if (randomize) {
      artistTracks.forEach((artist) =>
        artist.tracks.sort(() => Math.random() - 0.5)
      );
    } else {
      artistTracks.forEach((artist) =>
        artist.tracks.sort((a, b) => b.popularity - a.popularity)
      );
    }

    const trackIndices = Array(numArtists).fill(0);
    let currentDuration = 0;

    while (true) {
      let addedInCycle = false;

      for (let i = 0; i < numArtists; i++) {
        const artist = artistTracks[i];
        const index = trackIndices[i];

        if (index >= artist.tracks.length) continue;

        const track = artist.tracks[index];

        if (totalTracks && selectedTracks.length >= totalTracks) {
          return selectedTracks;
        }

        selectedTracks.push(track);
        currentDuration += track.duration_ms;
        trackIndices[i] += 1;
        addedInCycle = true;

        if (totalDurationMs && currentDuration >= totalDurationMs) {
          return selectedTracks; // Nu stop je pas NADAT je over de duur heen bent.
        }
      }

      if (!addedInCycle) break; // Geen nummers meer beschikbaar
    }

    return selectedTracks;
  };
  // Render form
  const renderForm = () => (
    <div className="flex flex-col space-y-4 p-4 rounded-md bg-secondary">
      <h2 className="text-xl font-semibold">Generate Playlist</h2>
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-2">
          Playlist title
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Music size={16} />
          </span>
          <input
            id="title"
            name="title"
            type="text"
            value={playlistName}
            onChange={(e) => setPlaylistName(e.target.value)}
            required
            placeholder="My Awesome Playlist"
            className="w-full bg-background border-0 rounded-md py-2.5 pl-10 pr-3 text-sm focus:ring-1 focus:ring-primary/30 focus:outline-none"
          />
        </div>
      </div>

      <DividerWithText text="Of" />
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          <Hash size={16} />
        </span>
        <select
          value={existingPlaylistId}
          onChange={(e) => setExistingPlaylistId(e.target.value)}
          className="w-full bg-background rounded-md py-2.5 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
        >
          <option key="-1" value="">
            Selecteer playlist
          </option>
          {userPlaylists.map((playlist: Playlist) => (
            <option key={playlist.id} value={playlist.id}>
              {playlist.name}
            </option>
          ))}
        </select>
      </div>

      {existingPlaylistId && (
        <div className="flex flex-row mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm">Clear existing playlist first</span>
          </div>
          <label className="flex items-center space-x-2 ml-auto relative">
            <input
              className="sr-only peer"
              type="checkbox"
              checked={clearExisting}
              onChange={(e) => setClearExisting(e.target.checked)}
            />
            <div className="second-elm w-9 h-4 bg-background peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[3px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-al"></div>
          </label>
        </div>
      )}
      <div className="flex flex-col justify-between py-2">
        <div className="flex flex-row mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm">
              {useDuration
                ? "Amount of songs in playlist"
                : "Playlist duration"}
            </span>
          </div>
          <label className="flex items-center space-x-2 ml-auto relative">
            <input
              className="sr-only peer"
              type="checkbox"
              checked={useDuration}
              onChange={(e) => setUseDuration(e.target.checked)}
            />
            <div className="second-elm w-9 h-4 bg-background peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[3px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-al"></div>
          </label>
        </div>

        <div className="flex flex-col">
          {!useDuration ? (
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Music size={16} />
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-background rounded-md py-2.5 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
                placeholder="Amount of songs in playlist"
              />
            </div>
          ) : (
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Clock size={16} />
              </span>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full bg-background rounded-md py-2.5 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
                placeholder="Duration in minutes"
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-row relative">
        <span className="block text-sm font-medium mb-2">
          Randomize songs (instead of most popular)
        </span>
        <label className="flex items-center space-x-2 ml-auto relative">
          <input
            className="sr-only peer"
            type="checkbox"
            checked={randomSongs}
            onChange={(e) => setRandomSongs(e.target.checked)}
          />
          <div className="second-elm w-9 h-4 bg-background peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[6px] after:left-[3px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-al"></div>
        </label>
      </div>

      <button
        onClick={generatePlaylist}
        className="bg-green-700 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-green-500 transition-all"
      >
        Generate Playlist
      </button>
    </div>
  );

  // no artist selected so retunr
  if (selectedArtists.length === 0) return null;

  // mobile view with button to show form
  if (isMobile) {
    return (
      <div className="">
        <div className="fixed bottom-18 w-full left-0 right-0 flex justify-center z-10 ">
          <button
            onClick={() => setIsFormPopupOpen(true)}
            className="bg-green-500 text-white px-6 py-3 rounded-t-lg w-full"
          >
            Generate Playlist
          </button>
        </div>

        {isFormPopupOpen && (
          <div
            className="fixed inset-0 bg-background  flex items-center justify-center z-[100] p-4 "
            onClick={() => setIsFormPopupOpen(false)}
          >
            <div
              className="bg-secondary rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {renderForm()}
              <button
                onClick={() => setIsFormPopupOpen(false)}
                className="w-full bg-red-500 text-white py-2 rounded-b-lg"
              >
                Close popup
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return renderForm();
}
