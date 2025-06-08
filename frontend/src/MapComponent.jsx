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
  const [prompt, setPrompt] = useState("");
  const mapRef = useRef(null);
  const markerRefs = useRef([]);

  const onLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const addMarkers = () => {
    setMarkers((prev) => [...prev, ...coordsList]);
    if (mapRef.current) {
      const currentZoom = mapRef.current.getZoom();
      const targetZoom = Math.max(currentZoom - 2, 2);
      mapRef.current.setZoom(targetZoom);
    }
  };

  const handlePromptChange = (e) => setPrompt(e.target.value);

  const handlePromptSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    try {
      const res = await fetch("http://localhost:5000/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      console.log("API response:", data);
      // Extract coords and set markers
      if (data.json && typeof data.json === 'object') {
        const coords = Object.values(data.json)
          .map(val => Array.isArray(val) && val[0] && typeof val[0] === 'object' ? val[0] : null)
          .filter(Boolean);
        setMarkers(coords);
      }
    } catch (err) {
      console.error("API error:", err);
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
        <form onSubmit={handlePromptSubmit} className="mb-4">
          <textarea
            value={prompt}
            onChange={handlePromptChange}
            placeholder="Enter your prompt here..."
            rows={3}
            className="w-full max-w-xl p-2 border rounded mb-2"
          />
          <br />
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 mr-2"
          >
            Send Prompt
          </button>
        </form>
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