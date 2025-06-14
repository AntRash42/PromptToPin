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
  const [legend, setLegend] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [followup, setFollowup] = useState('');
  const mapRef = useRef(null);
  const markerRefs = useRef([]);

  const onLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  useEffect(() => {
    if (!isLoaded || !mapRef.current || !window.google?.maps?.marker) return;
    markerRefs.current.forEach((marker) => marker.setMap(null));
    markerRefs.current = [];
    const { AdvancedMarkerElement, PinElement, InfoWindow } = window.google.maps.marker || {};
    if (markers.length > 0) {
      markers.forEach((pos, idx) => {
        if (pos && typeof pos.lat === 'number' && typeof pos.lng === 'number' && !isNaN(pos.lat) && !isNaN(pos.lng)) {
          // markerInfo[idx] = [rank, place-name, description, tag, colour]
          const bgColour = markerInfo[idx][4] || '#4285F4';
          const pinElement = new PinElement({
            glyph: markerInfo[idx][0] || '', // Use rank as glyph
            glyphColor: 'white',
            background: bgColour
          });
          const marker = new AdvancedMarkerElement({
            map: mapRef.current,
            position: pos,
            title: markerInfo[idx][1] + ': ' + (markerInfo[idx][3] || ''), // Use description from GPT
            content: pinElement.element
          });
          if (markerInfo[idx]) {
            const infoWindow = new window.google.maps.InfoWindow({
              content: `<div style='max-width:220px;white-space:pre-line;'><b>${markerInfo[idx][1]}</b><br/>${markerInfo[idx][2] || ''}</div>`
            });
            marker.addListener('mouseover', () => infoWindow.open({ anchor: marker, map: mapRef.current }));
            marker.addListener('mouseout', () => infoWindow.close());
          }
          markerRefs.current.push(marker);
        }
      });
    }
  }, [isLoaded, markers, markerInfo]);

  const handlePromptSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
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
        const legendMap = new Map();
        for(const rank of Object.keys(data)){
          let val = data[rank];
          if (Array.isArray(val) && Array.isArray(val[3])) {
            const lat = parseFloat(val[3][0]);
            const lng = parseFloat(val[3][1]);
            let temp = [];
            if (!isNaN(lat) && !isNaN(lng)) {
              coords.push({ lat, lng });
              temp.push(rank); // rank
              temp.push(val[0] || ""); // place-name
              temp.push(val[1] || ""); // tag/category
              temp.push(val[2] || ""); // description
              temp.push(val[4] || "#4285F4"); // colour hex
              info.push(temp);
              if (val[1] && val[4]) legendMap.set(val[1], val[4]); // tag/category and colour
            }
          }
        }
        setMarkers(coords);
        setMarkerInfo(info);
        setLegend(Array.from(legendMap.entries()));
      }
    } catch (err) {
      console.error("API error:", err);
    }
  };

  const handleFollowupSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim() && !followup.trim()) return;
    try {
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
        const legendMap = new Map();
        for(const rank of Object.keys(data)){
          let val = data[rank];
          if (Array.isArray(val) && Array.isArray(val[3])) {
            const lat = parseFloat(val[3][0]);
            const lng = parseFloat(val[3][1]);
            let temp = [];
            if (!isNaN(lat) && !isNaN(lng)) {
              coords.push({ lat, lng });
              temp.push(rank); // rank
              temp.push(val[0] || ""); // place-name
              temp.push(val[1] || ""); // tag/category
              temp.push(val[2] || ""); // description
              temp.push(val[4] || "#4285F4"); // colour hex
              info.push(temp);
              if (val[1] && val[4]) legendMap.set(val[1], val[4]); // tag/category and colour
            }
          }
        }
        setMarkers(coords);
        setMarkerInfo(info);
        setLegend(Array.from(legendMap.entries()));
      }
    } catch (err) {
      console.error("API error:", err);
    }
  };

  // Helper to determine if legend should be shown
  const shouldShowLegend = legend.length > 0 && /category|tag|colour|color|group|type/i.test(prompt);

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Maps...</div>;

  return (
    <div>
      <div className="mt-4 text-center">
        <form onSubmit={handlePromptSubmit} className="mb-4">
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
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
            onChange={e => setFollowup(e.target.value)}
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
      </div>
      <GoogleMap
        onLoad={onLoad}
        zoom={zoom}
        center={center}
        mapContainerStyle={containerStyle}
        options={{
          mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || undefined
        }}
      >
        {/* Child components, like markers, will be rendered here */}
      </GoogleMap>
      {/* Legend Table */}
      {shouldShowLegend && (
        <div className="mt-6 flex justify-center">
          <div>
            <div className="font-bold text-lg mb-2">Legend</div>
            <table className="table-auto border-collapse border border-gray-400 bg-white">
              <thead>
                <tr>
                  <th className="border border-gray-400 px-4 py-2">Category</th>
                  <th className="border border-gray-400 px-4 py-2">Colour</th>
                </tr>
              </thead>
              <tbody>
                {legend.map(([cat, colour], idx) => (
                  <tr key={idx}>
                    <td className="border border-gray-400 px-4 py-2 font-semibold">{cat}</td>
                    <td className="border border-gray-400 px-4 py-2">
                      <span style={{ display: 'inline-block', width: 24, height: 24, background: colour, borderRadius: 4, border: '1px solid #888' }}></span>
                      <span className="ml-2">{colour}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}