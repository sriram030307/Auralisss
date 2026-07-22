import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import { motion } from "framer-motion";
import { Navigation, Shield, Users, Loader2, ArrowLeft, WifiOff } from "lucide-react";
import GlassCard from "@/components/auralis/GlassCard";
import { useNavigate } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const policeIcon = L.divIcon({
  html: `<div style="background:#3b82f6;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;border:2.5px solid white;font-size:16px;box-shadow:0 2px 8px rgba(59,130,246,0.5);">🚔</div>`,
  className: "", iconAnchor: [16, 16],
});
const hospitalIcon = L.divIcon({
  html: `<div style="background:#ef4444;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;border:2.5px solid white;font-size:16px;box-shadow:0 2px 8px rgba(239,68,68,0.5);">🏥</div>`,
  className: "", iconAnchor: [16, 16],
});
const myIcon = L.divIcon({
  html: `<div style="background:#6366f1;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 0 14px rgba(99,102,241,0.9);">📍</div>`,
  className: "", iconAnchor: [16, 16],
});

// Inline popup styles (Leaflet renders these outside React tree)
const popupStyle = `
  .leaflet-popup-content-wrapper { background: rgba(20,22,40,0.97); border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; box-shadow: 0 8px 32px rgba(0,0,0,0.5); color: #e2e8f0; padding: 0; }
  .leaflet-popup-tip { background: rgba(20,22,40,0.97); }
  .leaflet-popup-content { margin: 0; }
  .auralis-popup { padding: 12px 14px; min-width: 180px; }
  .auralis-popup h4 { font-size: 13px; font-weight: 700; margin-bottom: 4px; }
  .auralis-popup p { font-size: 11px; color: #94a3b8; margin-bottom: 10px; }
  .auralis-popup .popup-btns { display: flex; gap: 6px; }
  .auralis-popup .popup-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 4px; padding: 7px 6px; border-radius: 10px; font-size: 11px; font-weight: 600; text-decoration: none; border: none; cursor: pointer; }
  .auralis-popup .btn-dir { background: rgba(99,102,241,0.2); color: #818cf8; border: 1px solid rgba(99,102,241,0.3); }
  .auralis-popup .btn-call { background: rgba(34,197,94,0.2); color: #4ade80; border: 1px solid rgba(34,197,94,0.3); }
`;

function buildPopupHtml({ emoji, name, address, phone, lat, lon }) {
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
  const callHtml = phone
    ? `<a href="tel:${phone}" class="popup-btn btn-call">📞 Call</a>`
    : `<a href="tel:100" class="popup-btn btn-call">📞 Emergency</a>`;
  return `
    <div class="auralis-popup">
      <h4>${emoji} ${name}</h4>
      <p>${address}</p>
      <div class="popup-btns">
        <a href="${mapsUrl}" target="_blank" class="popup-btn btn-dir">🗺️ Directions</a>
        ${callHtml}
      </div>
    </div>
  `;
}

function RecenterMap({ position }) {
  const map = useMap();
  useEffect(() => { if (position) map.setView(position, 15); }, [position, map]);
  return null;
}

const CACHE_KEY = "auralis_nearby_cache";
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours

function getCache(lat, lng) {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cache = JSON.parse(raw);
    const key = `${lat.toFixed(3)}_${lng.toFixed(3)}`;
    const entry = cache[key];
    if (!entry || Date.now() - entry.ts > CACHE_TTL) return null;
    return entry.data;
  } catch { return null; }
}

function setCache(lat, lng, data) {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    const cache = raw ? JSON.parse(raw) : {};
    const key = `${lat.toFixed(3)}_${lng.toFixed(3)}`;
    cache[key] = { ts: Date.now(), data };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {}
}

function isOnline() {
  return typeof navigator !== "undefined" && navigator.onLine !== false;
}

async function fetchNearby(lat, lng, type) {
  const queries = {
    police: `node["amenity"="police"](around:3000,${lat},${lng});`,
    hospital: `node["amenity"~"hospital|clinic"](around:3000,${lat},${lng});`,
  };
  const body = `[out:json];(${queries[type]});out body 10;`;
  const res = await fetch("https://overpass-api.de/api/interpreter", { method: "POST", body });
  const data = await res.json();
  return data.elements || [];
}

export default function MapTracking() {
  const navigate = useNavigate();
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [sharing, setSharing] = useState(false);
  const [police, setPolice] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loadingNearby, setLoadingNearby] = useState(false);
  const [showPolice, setShowPolice] = useState(true);
  const [showHospitals, setShowHospitals] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [usingCached, setUsingCached] = useState(false);
  const fetchedRef = useRef(false);

  // Inject popup styles once
  useEffect(() => {
    const id = "auralis-popup-style";
    if (!document.getElementById(id)) {
      const s = document.createElement("style");
      s.id = id;
      s.textContent = popupStyle;
      document.head.appendChild(s);
    }
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) { setLocationError("Geolocation not supported"); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation([pos.coords.latitude, pos.coords.longitude]),
      () => setLocationError("Location access denied"),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  useEffect(() => {
    if (!location || fetchedRef.current) return;
    fetchedRef.current = true;
    setLoadingNearby(true);
    const [lat, lng] = location;

    if (!isOnline()) {
      // Offline — load from cache
      const cached = getCache(lat, lng);
      if (cached) {
        setPolice(cached.police || []);
        setHospitals(cached.hospitals || []);
        setUsingCached(true);
      }
      setIsOffline(true);
      setLoadingNearby(false);
      return;
    }

    setIsOffline(false);
    Promise.all([fetchNearby(lat, lng, "police"), fetchNearby(lat, lng, "hospital")])
      .then(([p, h]) => {
        setPolice(p);
        setHospitals(h);
        setCache(lat, lng, { police: p, hospitals: h });
        setUsingCached(false);
      })
      .catch(() => {
        // Network error — try cache
        const cached = getCache(lat, lng);
        if (cached) {
          setPolice(cached.police || []);
          setHospitals(cached.hospitals || []);
          setUsingCached(true);
        }
        setIsOffline(true);
      })
      .finally(() => setLoadingNearby(false));
  }, [location]);

  const defaultCenter = [20.5937, 78.9629];

  return (
    <div className="relative h-screen">
      <div className="absolute inset-0">
        <MapContainer center={location || defaultCenter} zoom={location ? 15 : 5} style={{ height: "100%", width: "100%" }} zoomControl={false}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution="" />
          {location && <RecenterMap position={location} />}
          {location && (
            <Marker position={location} icon={myIcon}>
              <Popup>
                <div className="auralis-popup">
                  <h4>📍 Your Location</h4>
                  <p>You are here</p>
                  <div className="popup-btns">
                    <a href={`https://www.google.com/maps?q=${location[0]},${location[1]}`} target="_blank" rel="noreferrer" className="popup-btn btn-dir">🗺️ Open Maps</a>
                  </div>
                </div>
              </Popup>
            </Marker>
          )}
          {location && <Circle center={location} radius={100} pathOptions={{ color: "#6366f1", fillOpacity: 0.08, weight: 1 }} />}

          {showPolice && police.map((p) => (
            <Marker key={p.id} position={[p.lat, p.lon]} icon={policeIcon}>
              <Popup>
                <div dangerouslySetInnerHTML={{ __html: buildPopupHtml({
                  emoji: "🚔",
                  name: p.tags?.name || "Police Station",
                  address: p.tags?.["addr:full"] || p.tags?.["addr:street"] || "Nearby Police Station",
                  phone: p.tags?.phone || p.tags?.["contact:phone"] || null,
                  lat: p.lat, lon: p.lon,
                }) }} />
              </Popup>
            </Marker>
          ))}

          {showHospitals && hospitals.map((h) => (
            <Marker key={h.id} position={[h.lat, h.lon]} icon={hospitalIcon}>
              <Popup>
                <div dangerouslySetInnerHTML={{ __html: buildPopupHtml({
                  emoji: "🏥",
                  name: h.tags?.name || "Hospital",
                  address: h.tags?.["addr:full"] || h.tags?.["addr:street"] || "Nearby Hospital / Clinic",
                  phone: h.tags?.phone || h.tags?.["contact:phone"] || null,
                  lat: h.lat, lon: h.lon,
                }) }} />
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Back Button */}
      <div className="absolute top-12 left-4 z-[1000]">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => navigate("/")}
          className="w-10 h-10 glass rounded-xl flex items-center justify-center border border-white/10"
        >
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </motion.button>
      </div>

      {/* Top Status */}
      <div className="absolute top-12 left-16 right-4 z-[1000]">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard className="!p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">Live Tracking</span>
            </div>
            <div className="flex items-center gap-2">
              {loadingNearby && <Loader2 className="w-3 h-3 text-muted-foreground animate-spin" />}
              {isOffline && (
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                  <WifiOff className="w-2.5 h-2.5 text-amber-400" />
                  <span className="text-[10px] text-amber-400 font-semibold">Offline</span>
                </div>
              )}
              {locationError ? (
                <span className="text-xs text-destructive">{locationError}</span>
              ) : location ? (
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${isOffline ? "bg-amber-400" : "bg-green-400"}`} />
                  <span className={`text-xs ${isOffline ? "text-amber-400" : "text-green-400"}`}>
                    {isOffline ? "Cached" : "Active"}
                  </span>
                </div>
              ) : (
                <span className="text-xs text-amber-400">Locating...</span>
              )}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Filter Toggles */}
      <div className="absolute left-4 z-[1000] flex flex-col gap-2" style={{ top: usingCached ? "11rem" : "7rem" }}>
        <button
          onClick={() => setShowPolice(!showPolice)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold glass transition-all ${showPolice ? "text-blue-400 border border-blue-400/30" : "text-muted-foreground"}`}
        >
          🚔 Police ({police.length})
        </button>
        <button
          onClick={() => setShowHospitals(!showHospitals)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold glass transition-all ${showHospitals ? "text-red-400 border border-red-400/30" : "text-muted-foreground"}`}
        >
          🏥 Hospitals ({hospitals.length})
        </button>
      </div>

      {/* Bottom Panel */}
      <div className="absolute bottom-24 left-4 right-4 z-[1000] space-y-3">
        {(police.length > 0 || hospitals.length > 0) && (
          <GlassCard className="!p-3">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nearby Help</span>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 bg-blue-500/10 rounded-xl px-3 py-2 text-center border border-blue-500/20">
                <p className="text-lg">🚔</p>
                <p className="text-xs font-semibold">{police.length} Police</p>
                <p className="text-[10px] text-muted-foreground">Within 3km</p>
              </div>
              <div className="flex-1 bg-red-500/10 rounded-xl px-3 py-2 text-center border border-red-500/20">
                <p className="text-lg">🏥</p>
                <p className="text-xs font-semibold">{hospitals.length} Hospitals</p>
                <p className="text-[10px] text-muted-foreground">Within 3km</p>
              </div>
              <a href="tel:101" className="flex-1 bg-amber-500/10 rounded-xl px-3 py-2 text-center border border-amber-500/20 no-underline">
                <p className="text-lg">🚒</p>
                <p className="text-xs font-semibold text-amber-400">Fire</p>
                <p className="text-[10px] text-muted-foreground">Call 101</p>
              </a>
            </div>
          </GlassCard>
        )}

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setSharing(!sharing)}
          className={`w-full py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
            sharing
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : "bg-gradient-to-r from-primary to-accent text-white"
          }`}
        >
          <Users className="w-4 h-4" />
          {sharing ? "Sharing with 3 Contacts" : "Share My Location"}
        </motion.button>
      </div>
    </div>
  );
}