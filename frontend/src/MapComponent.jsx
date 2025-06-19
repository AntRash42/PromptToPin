import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useLoadScript } from '@react-google-maps/api';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Box from '@mui/material/Box';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

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

  // Only keep the main prompt submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    const mainPrompt = prompt.trim();
    if (!mainPrompt) return;
    try {
      const res = await fetch("http://localhost:5000/api/coords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: mainPrompt }),
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
                val[4] || "#4285F4",
                [lat, lng] // Save coordinates as a separate entry
              ]);
              if (val[1] && val[4]) legendMap.set(val[1], val[4]);
            }
          }
        }
        setMarkers(markerData.map(m => ({ lat: m[5][0], lng: m[5][1] })));
        setMarkerInfo(markerData);
        setLegend(Array.from(legendMap.entries()));
      }
    } catch (err) {
      console.error("API error:", err);
    }
  };

  function encodeMapState(prompt, markerInfo) {
    try {
      const state = JSON.stringify({ prompt, markerInfo });
      return btoa(encodeURIComponent(state));
    } catch {
      return '';
    }
  }
  function decodeMapState(encoded) {
    try {
      const state = decodeURIComponent(atob(encoded));
      return JSON.parse(state);
    } catch {
      return null;
    }
  }

  // Store decoded state from URL if present already
  const [pendingMapState, setPendingMapState] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get('map');
    if (encoded) {
      const state = decodeMapState(encoded);
      if (state && state.prompt && Array.isArray(state.markerInfo)) {
        setPendingMapState(state);
      }
    }
  }, []);

  useEffect(() => {
    if (isLoaded && pendingMapState) {
      setPrompt(pendingMapState.prompt);
      setMarkerInfo(pendingMapState.markerInfo);
      setMarkers(pendingMapState.markerInfo.map(m => ({ lat: m[5][0], lng: m[5][1] })));
      setPendingMapState(null); // Clear after applying
    }
  }, [isLoaded, pendingMapState]);

  // Share button handler with TinyURL shortening
  const handleShare = async () => {
    const encoded = encodeMapState(prompt, markerInfo);
    const longUrl = `${window.location.origin}${window.location.pathname}?map=${encoded}`;
    try {
      const resp = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`);
      const shortUrl = await resp.text();
      await navigator.clipboard.writeText(shortUrl);
      alert('Shortened map URL copied to clipboard!');
    } catch (err) {
      // fallback to long url if shortener fails
      await navigator.clipboard.writeText(longUrl);
      alert('Shareable map URL copied to clipboard! (Shortener failed)');
    }
  };

  const shouldShowLegend = legend.length > 0 && /category|tag|colour|color|group|type/i.test(prompt);

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Maps...</div>;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'linear-gradient(135deg, #e3f2fd 0%, #e0f7fa 100%)', py: 6, px: 2 }}>
      <Paper elevation={6} sx={{ maxWidth: 700, mx: 'auto', p: 4, mb: 5, borderRadius: 4 }}>
        <Typography variant="h3" align="center" color="primary" fontWeight={800} gutterBottom>
          Prompt to Pin 🌍
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
          <TextField
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Type your world query here..."
            multiline
            minRows={3}
            maxRows={6}
            fullWidth
            variant="outlined"
            sx={{ mb: 2, bgcolor: '#f0f7fa', borderRadius: 2 }}
            InputProps={{ style: { fontSize: 18 } }}
          />
          <Button
            type="submit"
            variant="contained"
            size="large"
            sx={{ px: 6, py: 1.5, fontWeight: 700, fontSize: 18, borderRadius: 2, background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)', color: '#fff', boxShadow: 3, '&:hover': { background: 'linear-gradient(90deg, #38f9d7 0%, #43e97b 100%)' } }}
          >
            🌐 Generate Map
          </Button>
        </Box>
      </Paper>
      <Paper elevation={4} sx={{ maxWidth: 1200, mx: 'auto', p: 2, borderRadius: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box sx={{ width: '100%', height: 500, borderRadius: 4, overflow: 'hidden', mb: 3 }}>
          <GoogleMap
            onLoad={onLoad}
            zoom={zoom}
            center={center}
            mapContainerStyle={{ width: '100%', height: '100%' }}
            options={{
              mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || undefined
            }}
          >
          </GoogleMap>
        </Box>
        {shouldShowLegend && (
          <TableContainer component={Paper} sx={{ maxWidth: 500, mx: 'auto', mt: 2, borderRadius: 2, boxShadow: 2 }}>
            <Typography variant="h5" align="center" color="primary" fontWeight={700} sx={{ mt: 2 }}>
              Legend
            </Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align="center" sx={{ fontWeight: 700, color: '#1976d2', fontSize: 18 }}>Category</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: '#1976d2', fontSize: 18 }}>Colour</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {legend.map(([cat, colour], idx) => (
                  <TableRow key={idx}>
                    <TableCell align="center" sx={{ fontWeight: 600, color: '#1976d2', fontSize: 16 }}>{cat}</TableCell>
                    <TableCell align="center">
                      <Box component="span" sx={{ display: 'inline-block', width: 28, height: 28, background: colour, borderRadius: 2, border: '2px solid #1976d2', verticalAlign: 'middle', mr: 2 }} />
                      <Typography component="span" sx={{ color: '#1976d2', fontFamily: 'monospace', fontSize: 16 }}>{colour}</Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Tooltip title="Copy shareable map URL">
            <IconButton color="primary" onClick={handleShare} size="large">
              <ContentCopyIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>
    </Box>
  );
}