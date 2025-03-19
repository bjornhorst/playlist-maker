"use client";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 w-full bg-secondary py-4">
      <div className="container mx-auto px-4 flex md:items-center justify-between flex-col md:flex-row">
        <div className="md:text-center flex-grow text-muted-foreground text-sm">
          Create your own playlist • Not affiliated with Spotify
        </div>

        <div className="md:text-right text-xs text-muted-foreground mt-2 md:mt-0">
          Made by{" "}
          <Link className="underline" href="https://github.com/Dion03">
            Dion
          </Link>{" "}
          &{" "}
          <Link className="underline" href="https://github.com/bjornhorst">
            Bjorn
          </Link>
        </div>
      </div>
    </footer>
  );
}
