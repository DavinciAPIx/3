
import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CarPhotoCarouselProps {
  photos: string[];
  carName: string;
}

const CarPhotoCarousel = ({ photos, carName }: CarPhotoCarouselProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  if (!photos || photos.length === 0) {
    return (
      <div className="w-full h-80 bg-gray-200 rounded-xl flex items-center justify-center">
        <span className="text-gray-500">No photos available</span>
      </div>
    );
  }

  const goToNext = () => {
    setSelectedIndex((prev) => (prev + 1) % photos.length);
  };

  const goToPrevious = () => {
    setSelectedIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const goToSlide = (index: number) => {
    setSelectedIndex(index);
  };

  // Handle touch events for swipe functionality
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    
    const distance = touchStartX - touchEndX;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && photos.length > 1) {
      goToNext();
    }
    if (isRightSwipe && photos.length > 1) {
      goToPrevious();
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        goToPrevious();
      } else if (event.key === 'ArrowRight') {
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="space-y-4">
      {/* Main Photo with Swipe */}
      <div 
        ref={carouselRef}
        className="relative group cursor-grab active:cursor-grabbing"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative overflow-hidden rounded-xl">
          <img 
            src={photos[selectedIndex]} 
            alt={`${carName} - Photo ${selectedIndex + 1}`}
            className="w-full h-80 object-cover transition-transform duration-300"
            draggable={false}
          />
          
          {/* Photo counter */}
          <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm">
            {selectedIndex + 1} / {photos.length}
          </div>
          
          {/* Navigation arrows - only show if more than 1 photo */}
          {photos.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-sm"
                aria-label="Previous image"
              >
                <ChevronLeft size={20} />
              </button>
              
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-sm"
                aria-label="Next image"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Thumbnail Navigation - only show if more than 1 photo */}
      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 justify-center">
          {photos.map((photo, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                index === selectedIndex 
                  ? 'border-primary shadow-md scale-105' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <img
                src={photo}
                alt={`${carName} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                draggable={false}
              />
            </button>
          ))}
        </div>
      )}

      {/* Swipe indicator for mobile */}
      {photos.length > 1 && (
        <div className="text-center text-sm text-gray-500 md:hidden">
          Swipe left or right to view more photos
        </div>
      )}
    </div>
  );
};

export default CarPhotoCarousel;
