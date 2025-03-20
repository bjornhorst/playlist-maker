import React, { useRef, useState, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Artist } from '@/types';

interface SelectedArtistsSliderProps {
  selectedArtists: Artist[];
  onDeselectArtist: (artistId: string) => void;
}

export default function SelectedArtistsSlider({ 
  selectedArtists, 
  onDeselectArtist 
}: SelectedArtistsSliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [showLeftNav, setShowLeftNav] = useState(false);
  const [showRightNav, setShowRightNav] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!sliderRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - sliderRef.current.offsetLeft);
    setScrollLeft(sliderRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  const scroll = useCallback((direction: 'left' | 'right') => {
    if (!sliderRef.current) return;
    const slider = sliderRef.current;
    const scrollAmount = slider.clientWidth * 0.8;
    
    slider.scrollTo({
      left: slider.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount),
      behavior: 'smooth'
    });
  }, []);

  useEffect(() => {
    const checkNavButtons = () => {
      if (!sliderRef.current) return;
      
      const slider = sliderRef.current;

      // show navigation if more than 6 items
      if (selectedArtists.length <= 5) {
        setShowLeftNav(false);
        setShowRightNav(false);
        return;
      }

      // hide left navigation if at start
      setShowLeftNav(slider.scrollLeft > 0);

      // hide right navigation if at end
      const isAtEnd = 
        slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - 1;
      setShowRightNav(!isAtEnd);
    };

    const slider = sliderRef.current;
    if (slider) {
      slider.addEventListener('scroll', checkNavButtons);
      checkNavButtons(); // Initial check

      return () => {
        slider.removeEventListener('scroll', checkNavButtons);
      };
    }
  }, [selectedArtists]);

  return (
    <div className="relative w-full flex items-center">
      {showLeftNav && (
        <button 
          onClick={() => scroll('left')}
          className="absolute -left-14 z-10 bg-secondary hover:bg-background hover:opacity-90 cursor-pointer rounded-full p-2 ml-2 hidden md:block"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      <div
        ref={sliderRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className="overflow-x-auto scrollbar-hide mt-6 cursor-grab active:cursor-grabbing flex-grow"
      >
        <div className="flex space-x-4 pb-4 px-2 pl-0 select-none drag-none">
          {selectedArtists.map((artist) => (
            <div
              key={artist.id}
              className="flex-shrink-0 w-40 relative group overflow-hidden bg-primary/10 border-primary/30 rounded-lg border transition-all duration-300 hover:border-primary/50 border-border/50 bg-card/70 hover:bg-card/90 p-4"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <img
                    src={artist.images[0]?.url || "/default.jpg"}
                    alt={artist.name}
                    className="w-full h-32 rounded-md object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 rounded-md ring-1 ring-inset ring-black/10"></div>
                </div>

                <div className="text-center w-full">
                  <h3 className="font-medium text-base leading-6 break-words">
                    {artist.name}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {artist.genres.slice(0, 3).join(", ") || "No genres"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => onDeselectArtist(artist.id)}
                className="absolute top-2 right-2 cursor-pointer opacity-100 md:group-hover:opacity-100 transition-opacity duration-300 text-destructive hover:text-destructive/80"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 opacity-100"
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
          ))}
        </div>
      </div>

      {showRightNav && (
        <button 
          onClick={() => scroll('right')}
          className="absolute -right-14 z-10 bg-secondary hover:bg-background hover:opacity-90 cursor-pointer rounded-full p-2 mr-2 hidden md:block"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}
