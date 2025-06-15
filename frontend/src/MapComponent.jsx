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
          // markerInfo[idx] = [rank, place-name, description, tag, colour]
          const bgColour = markerInfo[idx][4] || '#4285F4';
          const pinElement = new PinElement({
            glyph: markerInfo[idx][0] || '', // Use rank as glyph
            glyphColor: 'white',
            background: bgColour
          });
          const markerObj = new AdvancedMarkerElement({
            map: mapRef.current,
            position: pos,
            // title: markerInfo[idx][1] + ': ' + (markerInfo[idx][3] || ''),
            title: markerInfo[idx][1].replace (/[A-Za-z0-9]/g, translate) + ': ' + markerInfo[idx][3] || '',
            content: pinElement.element
          });
          if (markerInfo[idx]) {
            const infoWindow = new window.google.maps.InfoWindow({
              content: `<div style='max-width:220px;white-space:pre-line;'><b>${markerInfo[idx][1]}</b><br/>${markerInfo[idx][3] || ''}</div>`
            });
            markerObj.addListener('mouseover', () => infoWindow.open({ anchor: markerObj, map: mapRef.current }));
            markerObj.addListener('mouseout', () => infoWindow.close());
          }
          markerRefs.current.push(markerObj);
        }
      });
    }
  }, [isLoaded, markers, markerInfo]);

  // Unified submit handler for both prompt and followup
  const handleSubmit = async (e, isFollowup = false) => {
    e.preventDefault();
    const mainPrompt = prompt.trim();
    const followupPrompt = followup.trim();
    if (!mainPrompt && (!isFollowup || !followupPrompt)) return;
    try {
      const combinedPrompt = isFollowup && followupPrompt
        ? mainPrompt + `\nFollow-up/Correction: ${followupPrompt}`
        : mainPrompt;
      const res = await fetch("http://localhost:5000/api/coords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: combinedPrompt }),
      });
      const data = await res.json();
      if (data && typeof data === 'object') {
        const markerData = [];
        const legendMap = new Map();
        for(const rank of Object.keys(data)){
          let val = data[rank];
          if (Array.isArray(val) && Array.isArray(val[3])) {
            const lat = parseFloat(val[3][0]);
            const lng = parseFloat(val[3][1]);
            if (!isNaN(lat) && !isNaN(lng)) {
              markerData.push([
                rank,
                val[0] || "",
                val[1] || "",
                val[2] || "",
                val[4] || "#4285F4"
              ]);
              if (val[1] && val[4]) legendMap.set(val[1], val[4]);
            }
          }
        }
        setMarkers(markerData.map(m => ({ lat: parseFloat(data[m[0]][3][0]), lng: parseFloat(data[m[0]][3][1]) })));
        setMarkerInfo(markerData);
        setLegend(Array.from(legendMap.entries()));
      }
    } catch (err) {
      console.error("API error:", err);
    }
  };

  const shouldShowLegend = legend.length > 0 && /category|tag|colour|color|group|type/i.test(prompt);

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Maps...</div>;

  return (
    <div>
      <div className="mt-4 text-center">
        <form onSubmit={handleSubmit} className="mb-4">
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
        <form onSubmit={e => handleSubmit(e, true)} className="mb-4">
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