import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useLoadScript } from '@react-google-maps/api';

const libraries = ['marker'];

const center = {
  lat: 20,
  lng: 0,
};

const zoom = 2.2;

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
  const [markerInfo, setMarkerInfo] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [followup, setFollowup] = useState("");
  const [loading, setLoading] = useState(false);
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
  const handleFollowupChange = (e) => setFollowup(e.target.value);

  const handlePromptSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/coords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (data && typeof data === 'object') {
        const coords = [];
        const info = [];
        for(const rank of Object.keys(data)){
          // val = [place-name, description, [lat, long]]
          let val = data[rank];
          if (Array.isArray(val) && Array.isArray(val[2])) {
            const lat = parseFloat(val[2][0]);
            const lng = parseFloat(val[2][1]);
            let temp = []
            if (!isNaN(lat) && !isNaN(lng)) {
              coords.push({ lat, lng });
              temp.push(rank); // rank
              temp.push(val[0] || ""); // place-name
              temp.push(val[1] || ""); // description
              info.push(temp)
            }
          }
        };
        setMarkers(coords);
        setMarkerInfo(info);
      }
    } catch (err) {
      console.error("API error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowupSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim() && !followup.trim()) return;
    setLoading(true);
    try {
      // Combine main prompt and followup for a refined query
      const combinedPrompt = prompt + (followup.trim() ? `\nFollow-up/Correction: ${followup}` : "");
      const res = await fetch("http://localhost:5000/api/coords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: combinedPrompt }),
      });
      const data = await res.json();
      if (data && typeof data === 'object') {
        const coords = [];
        const info = [];
        for(const rank of Object.keys(data)){
          // val = [place-name, description, [lat, long]]
          let val = data[rank];
          if (Array.isArray(val) && Array.isArray(val[2])) {
            const lat = parseFloat(val[2][0]);
            const lng = parseFloat(val[2][1]);
            let temp = []
            if (!isNaN(lat) && !isNaN(lng)) {
              coords.push({ lat, lng });
              temp.push(rank); // rank
              temp.push(val[0] || ""); // place-name
              temp.push(val[1] || ""); // description
              info.push(temp)
            }
          }
        };
        setMarkers(coords);
        setMarkerInfo(info);
      }
    } catch (err) {
      console.error("API error:", err);
    } finally {
      setLoading(false);
    }
  };

function translate(char) {
  let diff;
  if (/[A-Z]/.test(char)) {
    diff = "𝗔".codePointAt(0) - "A".codePointAt(0);
  }
  else if (/[a-z]/.test(char)) {
    diff = "𝗮".codePointAt(0) - "a".codePointAt(0);
  }
  else if (/[0-9]/.test(char)) {
    diff = "𝟬".codePointAt(0) - "0".codePointAt(0);
  }
  else {
    return char;
  }
  return String.fromCodePoint(char.codePointAt(0) + diff);
}


  useEffect(() => {
    if (!isLoaded || !mapRef.current || !window.google?.maps?.marker) return;
    markerRefs.current.forEach((marker) => marker.setMap(null));
    markerRefs.current = [];
    const { AdvancedMarkerElement, PinElement, InfoWindow } = window.google.maps.marker || {};
    if (markers.length > 0) {
      markers.forEach((pos, idx) => {
        if (pos && typeof pos.lat === 'number' && typeof pos.lng === 'number' && !isNaN(pos.lat) && !isNaN(pos.lng)) {
          const pinElement = new PinElement({
            glyph: markerInfo[idx][0] || '',
            glyphColor: 'white'
          });
          const marker = new AdvancedMarkerElement({
            map: mapRef.current,
            position: pos,
            title: markerInfo[idx][1].replace (/[A-Za-z0-9]/g, translate) + ': ' + markerInfo[idx][2] || '',
            content: pinElement.element
          });
          console.log(markerInfo)
          if (markerInfo[idx]) {
            const infoWindow = new window.google.maps.InfoWindow({
              content: `<div style='max-width:220px;white-space:pre-line;'><br/>${markerInfo[idx][1] + ' ' + markerInfo[idx][2] || ''}</div>`
            });
            marker.addListener('mouseover', () => infoWindow.open({ anchor: marker, map: mapRef.current }));
            marker.addListener('mouseout', () => infoWindow.close());
          }
          markerRefs.current.push(marker);
        }
      });
    }
  }, [markers, markerInfo, isLoaded]);

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
        <form onSubmit={handleFollowupSubmit} className="mb-4">
          <textarea
            value={followup}
            onChange={handleFollowupChange}
            placeholder="Enter a correction, query, or follow-up here..."
            rows={2}
            className="w-full max-w-xl p-2 border rounded mb-2"
          />
          <br />
          <button
            type="submit"
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 mr-2"
          >
            Send Follow-up
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