
import React, { useEffect, useRef, useState } from 'react';

interface MapProps {
  location: string;
}

const Map: React.FC<MapProps> = ({ location }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Coordinates for major Saudi cities
  const cityCoordinates: { [key: string]: [number, number] } = {
    'riyadh': [46.6753, 24.7136],
    'jeddah': [39.1612, 21.5433],
    'khobar': [50.2089, 26.2172],
    'dammam': [50.1063, 26.4207],
    'mecca': [39.8579, 21.4225],
    'medina': [39.6140, 24.4539],
    'taif': [40.4158, 21.2854],
    'abha': [42.5058, 18.2164],
    'tabuk': [36.5551, 28.3998],
    'saudi arabia': [45.0792, 23.8859], // Default center of Saudi Arabia
  };

  const getCoordinatesForLocation = (location: string): [number, number] => {
    const normalizedLocation = location.toLowerCase().trim();
    return cityCoordinates[normalizedLocation] || cityCoordinates['saudi arabia'];
  };

  const initializeMap = async () => {
    if (!mapContainer.current || map.current) return;

    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Initializing map for location:', location);
      
      // Use the provided Mapbox token
      const mapboxToken = 'pk.eyJ1IjoiY2hlcmlmOTkiLCJhIjoiY20yZ2FjZGl4MDBoYjJxczdjcWk1dnoxZiJ9.DKm8dDh0kEAyzxjZ3rn1PQ';
      
      // Dynamically import mapbox-gl
      const mapboxgl = await import('mapbox-gl');
      
      // Import CSS
      await import('mapbox-gl/dist/mapbox-gl.css');
      
      mapboxgl.default.accessToken = mapboxToken;
      
      const coordinates = getCoordinatesForLocation(location);
      console.log('Using coordinates:', coordinates);
      
      map.current = new mapboxgl.default.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: coordinates,
        zoom: 13,
        attributionControl: true,
      });

      // Handle successful load
      map.current.on('load', () => {
        console.log('Map loaded successfully');
        
        // Add marker for car location
        new mapboxgl.default.Marker({ 
          color: '#ef4444',
          scale: 1.2 
        })
          .setLngLat(coordinates)
          .setPopup(
            new mapboxgl.default.Popup({ offset: 25 })
              .setHTML(`<div style="padding: 8px;"><strong>Car Location</strong><br/>${location}</div>`)
          )
          .addTo(map.current);

        // Add navigation controls
        map.current.addControl(new mapboxgl.default.NavigationControl(), 'top-right');
        
        setIsLoading(false);
      });

      // Handle map errors
      map.current.on('error', (e: any) => {
        console.error('Map error:', e);
        setError('Failed to load map');
        setIsLoading(false);
      });

      // Handle style load errors specifically
      map.current.on('styleimagemissing', (e: any) => {
        console.log('Style image missing:', e);
      });

      // Set a timeout for loading
      const loadTimeout = setTimeout(() => {
        if (isLoading) {
          console.log('Map load timeout - switching to fallback');
          setError('Map is taking too long to load');
          setIsLoading(false);
        }
      }, 15000);

      // Clear timeout when map loads
      map.current.on('load', () => {
        clearTimeout(loadTimeout);
      });
      
    } catch (err) {
      console.error('Failed to initialize map:', err);
      setError('Unable to load map');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Clean up existing map first
    if (map.current) {
      map.current.remove();
      map.current = null;
    }
    
    initializeMap();

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [location]);

  if (error) {
    return (
      <div className="w-full h-64 rounded-lg shadow-lg bg-gray-100 flex items-center justify-center border border-gray-200">
        <div className="text-center p-6">
          <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Location: {location}</h3>
          <p className="text-sm text-gray-600 mb-4">Interactive map temporarily unavailable</p>
          <button 
            onClick={() => {
              setError(null);
              initializeMap();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div ref={mapContainer} className="w-full h-64 rounded-lg shadow-lg bg-gray-100" />
      {isLoading && (
        <div className="absolute inset-0 bg-white/90 flex items-center justify-center rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-700">Loading interactive map...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Map;
