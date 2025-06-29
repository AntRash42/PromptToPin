import React, { useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import { GoogleMap } from '@react-google-maps/api';
import { isLight } from './utils/isLight';

const center = { lat: 20, lng: 0 };
const zoom = 2.2;

export default function MapView({ markers, markerInfo, isLoaded }){
    const mapRef = useRef(null);
    const markerRefs = useRef([]);
    const onLoad = (map) => {
        mapRef.current = map;
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

    // Place markers when map and data are ready
    useEffect(() => {
      if (
        !isLoaded ||
        !mapRef.current ||
        typeof window === 'undefined' ||
        !window.google ||
        !window.google.maps ||
        !window.google.maps.marker
      ) {
        return;
      }
      // Remove previous markers
      markerRefs.current.forEach((marker) => marker.setMap(null));
      markerRefs.current = [];
      const { AdvancedMarkerElement, PinElement, InfoWindow } = window.google.maps.marker || {};
      if (markers.length > 0) {
        markers.forEach((pos, idx) => {
          if (pos && typeof pos.lat === 'number' && typeof pos.lng === 'number' && !isNaN(pos.lat) && !isNaN(pos.lng)) {
            const bgColour = markerInfo[idx][4] || '#4285F4';
            const pinElement = new PinElement({
              glyph: markerInfo[idx][0] || '',
              glyphColor: isLight(bgColour) ? 'black' : 'white',
              background: bgColour
            });
            const titleText = ((markerInfo[idx][1] || '').replace(/[A-Za-z0-9]/g, translate) + ': ' + (markerInfo[idx][3] || ''));
            const markerObj = new AdvancedMarkerElement({
              map: mapRef.current,
              position: pos,
              title: titleText,
              content: pinElement.element
            });
            if (markerInfo[idx]) {
              const InfoWindowClass = InfoWindow || window.google.maps.InfoWindow;
              const infoWindow = new InfoWindowClass({
                content: `<div style='max-width:220px;white-space:pre-line;'><b>${markerInfo[idx][1]}</b><br/>${markerInfo[idx][3] || ''}</div>`
              });
              markerObj.addListener('mouseover', () => infoWindow.open({ anchor: markerObj, map: mapRef.current }));
              markerObj.addListener('mouseout', () => infoWindow.close());
            }
            markerRefs.current.push(markerObj);
          }
        });
      }
      // Cleanup on unmount
      return () => {
        markerRefs.current.forEach((marker) => marker.setMap(null));
        markerRefs.current = [];
      };
    }, [isLoaded, mapRef.current, markers, markerInfo]);
    return (
      <Box sx={{ width: '100%', height: 500, borderRadius: 4, overflow: 'hidden', mb: 3 }}>
        {isLoaded ? (
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
        ) : (
          <div>Loading map...</div>
        )}
      </Box>
    )
}