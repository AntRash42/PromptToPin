import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useLoadScript } from '@react-google-maps/api';

// Set initial map center
const center = {
  lat: 28.6139, // Delhi
  lng: 77.2090,
};

// Provide container styles
const containerStyle = {
  width: '100%',
  height: '500px',
};

export default function MapComponent() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['marker'], // Needed for AdvancedMarkerElement
  });

  const [markers, setMarkers] = useState([]);
  const mapRef = useRef(null);
  const markerRefs = useRef([]);

  const onLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const addMarker = () => {
    const newMarker = { lat: 41.32373, lng: 63.9528098 }; // Example coords
    setMarkers((prev) => [...prev, newMarker]);
  };

  useEffect(() => {
    if (!isLoaded || !mapRef.current || !window.google?.maps?.marker) return;
    // Remove old markers
    markerRefs.current.forEach(marker => marker && marker.map && marker.map(null));
    markerRefs.current = [];
    markers.forEach((pos) => {
      const { AdvancedMarkerElement } = window.google.maps.marker;
      const marker = new AdvancedMarkerElement({
        map: mapRef.current,
        position: pos,
        title: 'Advanced Marker',
      });
      markerRefs.current.push(marker);
    });
  }, [markers, isLoaded]);

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={13}
        onLoad={onLoad}
        mapId={import.meta.env.VITE_GOOGLE_MAPS_MAP_ID}
      />
      <div className="mt-4 text-center">
        <button
          onClick={addMarker}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Drop Marker
        </button>
      </div>
    </>
  );
}