import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const ISS_ICON = L.divIcon({
  className: '',
  html: `<div style="font-size:28px;filter:drop-shadow(0 0 8px #63b3ed);animation:none;">🛸</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

export default function ISSMap({ position, trajectory }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const polylineRef = useRef(null);
  const dotRefs = useRef([]);

  useEffect(() => {
    if (mapInstanceRef.current) return;
    mapInstanceRef.current = L.map(mapRef.current, {
      center: [0, 0], zoom: 3,
      zoomControl: true,
      attributionControl: true,
    });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd', maxZoom: 19,
    }).addTo(mapInstanceRef.current);
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !position) return;
    const { lat, lon } = position;

    if (!markerRef.current) {
      markerRef.current = L.marker([lat, lon], { icon: ISS_ICON })
        .addTo(map)
        .bindPopup(`<b>ISS</b><br>Lat: ${lat.toFixed(4)}<br>Lon: ${lon.toFixed(4)}`);
    } else {
      markerRef.current.setLatLng([lat, lon]);
      markerRef.current.setPopupContent(`<b>ISS</b><br>Lat: ${lat.toFixed(4)}<br>Lon: ${lon.toFixed(4)}`);
    }
    map.panTo([lat, lon], { animate: true, duration: 1 });

    if (polylineRef.current) map.removeLayer(polylineRef.current);
    dotRefs.current.forEach(d => map.removeLayer(d));
    dotRefs.current = [];

    if (trajectory.length > 1) {
      const latlngs = trajectory.map(p => [p.lat, p.lon]);
      polylineRef.current = L.polyline(latlngs, {
        color: '#7c3aed', weight: 2, opacity: 0.7, dashArray: '6,4',
      }).addTo(map);
      trajectory.slice(0, -1).forEach((p, i) => {
        const opacity = (i + 1) / trajectory.length * 0.7;
        const dot = L.circleMarker([p.lat, p.lon], {
          radius: 4, fillColor: '#63b3ed', color: 'transparent',
          fillOpacity: opacity,
        }).addTo(map).bindTooltip(
          `#${i + 1}: ${p.lat.toFixed(3)}, ${p.lon.toFixed(3)}`,
          { direction: 'top' }
        );
        dotRefs.current.push(dot);
      });
    }
  }, [position, trajectory]);

  return (
    <div>
      <div ref={mapRef} className="map-container" id="iss-map" />
      <div className="map-legend">
        <span><span className="legend-dot" style={{background:'#7c3aed'}} />Path</span>
        <span><span className="legend-dot" style={{background:'#63b3ed'}} />Waypoints</span>
        <span>🛸 Current Position</span>
      </div>
    </div>
  );
}
