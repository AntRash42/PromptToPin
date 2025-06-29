import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import SidebarDrawer from './SidebarDrawer';
import PromptInput from './PromptInput';
import MapView from './MapView';
import LegendTable from './LegendTable';
import SaveMapDialog from './SaveMapDialog';
import MyMapsDialog from './MyMapsDialog';
import { useLoadScript } from '@react-google-maps/api';

const GOOGLE_MAPS_API_LIBS_NEEDED = ['marker'];

// Encode map state (for sharing)
function encodeMapState(prompt, markerInfo) {
  return encodeURIComponent(btoa(JSON.stringify({ prompt, markerInfo })));
}

// Decode map state
function decodeMapState(encoded) {
  try {
    const base64 = atob(decodeURIComponent(encoded));
    try {      
      return JSON.parse(base64);
    } catch {
      // if parsing directly fails, try decoding URI component again (for double-encoded)
      const jsonStr = decodeURIComponent(base64);
      return JSON.parse(jsonStr);
    }
  } catch (e) {
    console.error('decodeMapState: failed', e);
    return null;
  }
}

export default function MapComponent() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  // State for all components
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showMyMaps, setShowMyMaps] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [myMaps, setMyMaps] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [mapName, setMapName] = useState('');
  const [markers, setMarkers] = useState([]);
  const [markerInfo, setMarkerInfo] = useState([]);
  const [legend, setLegend] = useState([]);
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    mapIds: [import.meta.env.VITE_GOOGLE_MAPS_MAP_ID],
    libraries: GOOGLE_MAPS_API_LIBS_NEEDED
  });

  const fetchMyMaps = async () => {
    if (!user) return;
    const token = await user.getIdToken();
    const res = await fetch("http://localhost:5000/api/maps", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({}),
    });
    const data = await res.json();
    setMyMaps(data.maps || []);
  };

  const handleDeleteMap = async (mapId) => {
    if (!user || !mapId) return;
    const token = await user.getIdToken();
    await fetch(`http://localhost:5000/api/maps/${mapId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });    
    fetchMyMaps(); // Refresh maps list
  };
  const handleSaveMap = async () => {
    if (!user) return;
    // Generate shareable TinyURL
    const encoded = encodeMapState(prompt, markerInfo);
    const longUrl = `${window.location.origin}${window.location.pathname}?map=${encoded}`;
    let shareUrl = longUrl;
    try {
      const resp = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`);
      shareUrl = await resp.text();
    } catch {
      window.alert("Failed to generate TinyURL, please try again.")
    }
    const token = await user.getIdToken();
    await fetch("http://localhost:5000/api/maps", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        save: true,
        name: mapName,
        prompt,
        markerInfo,
        shareUrl,
      }),
    });
    setSaveDialogOpen(false);
    alert("Map saved!");
  };

  const handlePromptSubmit = async (mainPrompt) => {
    setPrompt(mainPrompt);
    if (!mainPrompt.trim()) return;
    try {
      const res = await fetch("http://localhost:5000/api/coords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: mainPrompt }),
      });
      const parsed = await res.json();
      const response = parsed.json;
      const data = response.places;
      if (data && typeof data === 'object') {
        const markerData = [];
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
                val[4] || "#4285F4",
                [lat, lng]
              ]);
            }
          }
        }
        setMarkers(markerData.map(m => ({ lat: m[5][0], lng: m[5][1] })));
        setMarkerInfo(markerData);
        setLegend(Object.entries(response.legend));
      }
    } catch (err) {
      console.error("API error:", err);
      window.alert("An error occured, please try again.");
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get('map');
    if (encoded) {      
      let decodedBase64 = null;
      try {
        decodedBase64 = atob(decodeURIComponent(encoded));
        console.log('Decoded base64 string:', decodedBase64);
      } catch (e) {
        console.error('Base64 decode error:', e);
      }
      const state = decodeMapState(encoded);
      console.log('Decoded map state:', state); // Debug log
      if (state) {
        setPrompt(state.prompt || '');
        setMapName(state.prompt || '');
        console.log('Raw markerInfo from decoded state:', state.markerInfo);
        // Relaxed: show all markerInfo entries and log why any are filtered out
        let validMarkerInfo = [];
        if (Array.isArray(state.markerInfo)) {
          validMarkerInfo = state.markerInfo.filter((m, i) => {
            const valid = Array.isArray(m) && m.length >= 6 && Array.isArray(m[5]) && m[5].length === 2 && !isNaN(m[5][0]) && !isNaN(m[5][1]);
            if (!valid) console.warn('Filtered out markerInfo at', i, m);
            return valid;
          });
        }
        console.log('Filtered validMarkerInfo:', validMarkerInfo);
        const markersArr = validMarkerInfo.map(m => ({ lat: m[5][0], lng: m[5][1] }));
        console.log('Markers array to set:', markersArr);
        setMarkerInfo(validMarkerInfo);
        setMarkers(markersArr);
      }
    }
  }, []);
  
  // Set default map name to prompt when opening save dialog
  useEffect(() => {
    if (saveDialogOpen && prompt && !mapName) {
      setMapName(prompt);
    }
  }, [saveDialogOpen, prompt, mapName]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'linear-gradient(135deg, #e3f2fd 0%, #e0f7fa 100%)', py: 6, px: 2 }}>
      <SidebarDrawer
        user={user}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
        setShowMyMaps={setShowMyMaps}
        fetchMyMaps={fetchMyMaps}
        navigate={navigate}
      />
      {user && (
        <Box sx={{ position: 'absolute', top: 24, right: 32, zIndex: 10 }}>
          <Button variant="outlined" color="error" onClick={signOut} sx={{ fontWeight: 700 }}>
            Sign Out
          </Button>
        </Box>
      )}
      <Paper elevation={6} sx={{ maxWidth: 700, mx: 'auto', p: 4, mb: 5, borderRadius: 4 }}>
        <Typography variant="h3" align="center" color="primary" fontWeight={800} gutterBottom>
          Prompt to Pin 🌍
        </Typography>
        <PromptInput
          prompt={prompt}
          setPrompt={setPrompt}
          onSubmit={handlePromptSubmit}
        />
      </Paper>
      <Paper elevation={4} sx={{ maxWidth: 1200, mx: 'auto', p: 2, borderRadius: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <MapView
          markers={markers}
          markerInfo={markerInfo}
          setMarkers={setMarkers}
          setMarkerInfo={setMarkerInfo}
          isLoaded={isLoaded}
        />
        {legend.length > 0 && (
          <LegendTable legend={legend} />
        )}
        {user ? (
          <Button onClick={() => setSaveDialogOpen(true)} variant="contained" color="secondary" sx={{ mt: 2 }}>
            Save Map
          </Button>
        ) : (
          <Typography color="text.secondary" sx={{ mt: 2, fontWeight: 500 }}>
            <span> <a href="/login" style={{ color: '#1976d2', textDecoration: 'underline', fontWeight: 600 }}>Log in</a> to save and share your maps.</span>
          </Typography>
        )}
      </Paper>
      <SaveMapDialog
        open={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
        mapName={mapName}
        setMapName={setMapName}
        onSave={handleSaveMap}
      />
      <MyMapsDialog
        open={showMyMaps}
        onClose={() => setShowMyMaps(false)}
        myMaps={myMaps}
        handleDeleteMap={handleDeleteMap}
      />
    </Box>
  );
}