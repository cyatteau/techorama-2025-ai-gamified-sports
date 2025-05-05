// src/components/StadiumMap.jsx
import { useEffect, useRef, useState } from "react";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import { vectorBasemapLayer } from "esri-leaflet-vector";
import { fetchStadiumsForLeague } from "../utils/fetchStadiums";

export default function StadiumMap({ selectedLeague, onSelectTeam }) {
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const markerLayerRef = useRef(null);
  const infoControlRef = useRef(null);
  const cbRef = useRef(onSelectTeam);
  const [error, setError] = useState(null);

  /* ---------- static camera presets per league ---------- */
  const leagueViews = {
    "Premier League": { center: [53.5, -1.5], zoom: 5 },
    Bundesliga: { center: [51.3, 9.9], zoom: 5 },
    "La Liga": { center: [40.4, -3.7], zoom: 5 },
    "Serie A": { center: [42.5, 12.5], zoom: 5 },
    "Belgian Pro League": { center: [50.8, 4.4], zoom: 6 },
  };

  /* --------------------------- 1. init map --------------------------- */
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    // hot-reload guard
    if (container._leaflet_id) delete container._leaflet_id;
    if (mapRef.current) return;

    const { center, zoom } = leagueViews[selectedLeague] || {
      center: [50, 10],
      zoom: 4,
    };

    const map = L.map(container).setView(center, zoom);

    // Esri vector basemap (any style you like)
    vectorBasemapLayer("arcgis/community", {
      apiKey: import.meta.env.VITE_ARCGIS_API_KEY,
    }).addTo(map);

    // normal bottom-right attribution
    map.attributionControl.setPosition("bottomright");

    mapRef.current = map;
  }, []);

  /* -------- 2. when league changes: recenter & legend update -------- */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const { center, zoom } = leagueViews[selectedLeague] || {
      center: [50, 10],
      zoom: 4,
    };
    map.setView(center, zoom, { animate: false });

    if (infoControlRef.current) map.removeControl(infoControlRef.current);
    const legend = L.control({ position: "topright" });
    legend.onAdd = () => {
      const div = L.DomUtil.create("div", "info legend");
      div.innerHTML = `<strong>League:</strong><br/>${selectedLeague}`;
      return div;
    };
    legend.addTo(map);
    infoControlRef.current = legend;
  }, [selectedLeague]);

  /* ------------- 3. load / reload stadium markers per league --------- */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    async function load() {
      setError(null);
      try {
        const data = await fetchStadiumsForLeague(
          selectedLeague,
          import.meta.env.VITE_GEMINI_API_KEY
        );
        if (!data.length) throw new Error("No stadiums found");

        // clear previous layer
        if (markerLayerRef.current) {
          markerLayerRef.current.remove();
        }
        const layer = L.layerGroup();
        const bounds = [];

        data.forEach(
          ({
            team_name,
            stadium_name,
            latitude,
            longitude,
            logo_url,
            league,
          }) => {
            const lat = +latitude,
              lon = +longitude;
            if (isNaN(lat) || isNaN(lon)) return;
            bounds.push([lat, lon]);

            const marker = L.marker([lat, lon]);
            const img = logo_url
              ? `<img src="${logo_url}" alt="${team_name}" width="50" height="50"
                     style="margin-bottom:0.5rem" onerror="this.style.display='none'"/>`
              : "";

            marker.bindPopup(
              `<div style="text-align:center">
                 ${img}<br/>
                 <strong>${team_name}</strong><br/>
                 ${stadium_name}<br/>
                 League: ${league}<br/>
                 <em>Click to start trivia!</em>
               </div>`,
              {
                autoClose: false,
                closeOnClick: false,
                autoPan: false,
                closeOnEscapeKey: false,
                closeButton: true,
              }
            );

            marker.on("click", () => {
              marker.openPopup();
              onSelectTeam(team_name);
            });

            layer.addLayer(marker);
          }
        );

        layer.addTo(map);
        markerLayerRef.current = layer;

        if (bounds.length)
          map.fitBounds(bounds, { padding: [40, 40], maxZoom: 6 });
      } catch (err) {
        console.error(err);
        setError("⚠️ Couldn’t load stadiums. Try again later.");
      }
    }

    map.whenReady(load);
  }, [selectedLeague]);

  /* ------------------------------- UI ------------------------------- */
  return (
    <>
      {error && (
        <div style={{ color: "#dc3545", marginBottom: 6 }}>{error}</div>
      )}
      <div
        ref={mapContainerRef}
        style={{
          height: "450px",
          width: "450px",
          border: "2px solid #ccc",
          borderRadius: 8,
        }}
      />
      <style>{`
        .leaflet-popup-content-wrapper { text-align: center; }
        .info.legend {
          background:#fff; padding:8px; border-radius:4px;
          font-size:0.9rem; box-shadow:0 0 8px rgba(0,0,0,.1);
        }
      `}</style>
    </>
  );
}
