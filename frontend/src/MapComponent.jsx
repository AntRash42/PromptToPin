import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useLoadScript } from '@react-google-maps/api';

// Static constant for libraries (to avoid re-renders and warning)
const libraries = ['marker'];

// Default centre
const center = {
  lat: 20,
  lng: 0,
};

const zoom = 2.2; // Default zoom level

const containerStyle = {
  width: '100%',
  height: '500px',
};

export default function MapComponent() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const [markers, setMarkers] = useState([]);
  const mapRef = useRef(null);
  const markerRefs = useRef([]);

  const onLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  // Example: List of coordinates to place pins
  const coordsList = [
    { lat: 28.6139, lng: 77.2090 }, // New Delhi
    { lat: 19.076, lng: 72.8777 }, // Mumbai
    { lat: 13.0827, lng: 80.2707 }, // Chennai
    { lat: 22.5726, lng: 88.3639 }, // Kolkata
  ];

  const addMarkers = () => {
    setMarkers((prev) => [...prev, ...coordsList]);
    if (mapRef.current) {
      const currentZoom = mapRef.current.getZoom();
      const targetZoom = Math.max(currentZoom - 2, 2);
      mapRef.current.setZoom(targetZoom);
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
        zoom={zoom}
        onLoad={onLoad}
        options={{
          mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID,
        }}
        // If user wants to place pin by clicking on the map
        onClick={(e) => {
          setMarkers((prev) => [
            ...prev,
            {
              lat: e.latLng.lat(),
              lng: e.latLng.lng(),
            },
          ]);
        }}
      />
      <div className="mt-4 text-center">
        <button
          onClick={addMarkers}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Drop Markers
        </button>
      </div>
    </>
  );
}