import React from "react";

function Header() {
  return (
    <header className="w-full py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-start">
          <h1 className="text-3xl font-bold">Artist Selector</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create playlists with your favorite artists
          </p>
        </div>
      </div>
    </header>
  );
}

export default Header;
