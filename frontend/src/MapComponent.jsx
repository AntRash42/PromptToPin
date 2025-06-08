import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useLoadScript } from '@react-google-maps/api';

// 🟢 Static constant for libraries (to avoid re-renders and warning)
const libraries = ['marker'];

const center = {
  lat: 41.32373,
  lng: 63.9528098,
};

const newDelhiCoords = {
  lat: 28.6139,
  lng: 77.2090,
};

const containerStyle = {
  width: '100%',
  height: '500px',
};

export default function MapComponent() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries, // ✅ use the static constant
  });

  const [markers, setMarkers] = useState([]);
  const mapRef = useRef(null);
  const markerRefs = useRef([]);

  const onLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const addMarker = () => {
    setMarkers((prev) => [...prev, newDelhiCoords]);

    if (mapRef.current) {
      mapRef.current.panTo(newDelhiCoords); // 👈 Pan to marker
      mapRef.current.setZoom(8); // Optional: zoom in
    }
  };


  useEffect(() => {
    if (!isLoaded || !mapRef.current || !window.google?.maps?.marker) return;

    // Clean up previous markers
    markerRefs.current.forEach((marker) => marker.setMap(null));
    markerRefs.current = [];

    const { AdvancedMarkerElement } = window.google.maps.marker;

    markers.forEach((pos) => {
      const marker = new AdvancedMarkerElement({
        map: mapRef.current,
        position: pos,
        title: 'Advanced Marker',
      });
      markerRefs.current.push(marker);
    });
  }, [markers, isLoaded]);

  if (loadError) return <div>Error loading map</div>;
  if (!isLoaded) return <div>Loading...</div>;

  return (
    <>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={5}
        onLoad={onLoad}
        options={{
          mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID,
        }}
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