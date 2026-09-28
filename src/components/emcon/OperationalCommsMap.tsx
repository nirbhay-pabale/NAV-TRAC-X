import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Polygon,
  Circle,
  Marker,
  Tooltip,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Maximize2,
  Minimize2,
  ChevronDown,
  Layers,
  X,
  Play,
  Pause,
  FastForward,
  Lock,
  Unlock,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface PortLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: "Command HQ" | "Naval Base" | "Commercial / Military";
}

interface GeoVessel {
  id: string;
  name: string;
  callsign: string;
  type: "Aircraft Carrier" | "Destroyer" | "Frigate" | "Submarine" | "UAV Squad" | "Patrol Craft";
  lat: number;
  lng: number;
  heading: number;
  speedKnots: number;
  commsStatus: "ACTIVE" | "RESTRICTED" | "BLOCKED";
  emconZone: string;
  frequencyBand: string;
  waypoints: [number, number][];
  waypointIndex: number;
  isAlertTarget?: boolean;
}

// ── Static Data ───────────────────────────────────────────────────────────────
const PORTS: PortLocation[] = [
  { id: "mumbai",   name: "Western Fleet HQ (Mumbai)",                    lat: 18.935, lng: 72.845, type: "Command HQ" },
  { id: "uran",     name: "JNPT / Uran Tactical Comms Hub",               lat: 18.950, lng: 72.960, type: "Commercial / Military" },
  { id: "karwar",   name: "INS Kadamba (Project Seabird Karwar)",          lat: 14.810, lng: 74.130, type: "Naval Base" },
  { id: "goa",      name: "Mormugao Naval Enclave (INS Hansa)",            lat: 15.415, lng: 73.805, type: "Naval Base" },
  { id: "ratnagiri",name: "Ratnagiri Forward Coastal Station",             lat: 16.990, lng: 73.280, type: "Naval Base" },
];

const INITIAL_VESSELS: GeoVessel[] = [
  {
    id: "VESSEL-01", name: "INS Vikramaditya", callsign: "R33-BRAVO", type: "Aircraft Carrier",
    lat: 19.120, lng: 72.380, heading: 195, speedKnots: 22.4, commsStatus: "ACTIVE",
    emconZone: "Sector Alpha Outer Approach", frequencyBand: "EHF MilSat + Link-II (PQC Active)",
    waypointIndex: 0, waypoints: [[19.120,72.380],[18.850,72.250],[18.400,72.350],[18.900,72.480]],
  },
  {
    id: "VESSEL-02", name: "INS Visakhapatnam", callsign: "D66-SENTINEL", type: "Destroyer",
    lat: 18.880, lng: 72.620, heading: 340, speedKnots: 16.5, commsStatus: "BLOCKED",
    emconZone: "EMCON Alpha (Radio Silence)", frequencyBand: "Silent / EMCON Enforced",
    isAlertTarget: true, waypointIndex: 0, waypoints: [[18.880,72.620],[19.080,72.610],[19.200,72.660],[18.820,72.640]],
  },
  {
    id: "VESSEL-03", name: "INS Mormugao", callsign: "D67-PATROL", type: "Destroyer",
    lat: 18.450, lng: 72.640, heading: 15, speedKnots: 14.0, commsStatus: "RESTRICTED",
    emconZone: "Sector Charlie Transit Channel", frequencyBand: "SHF Receive Only",
    waypointIndex: 0, waypoints: [[18.450,72.640],[18.720,72.680],[18.550,72.580],[18.350,72.600]],
  },
  {
    id: "VESSEL-04", name: "UAV-Alpha-03 Surveillance", callsign: "DRONE-03", type: "UAV Squad",
    lat: 19.350, lng: 72.500, heading: 260, speedKnots: 140.0, commsStatus: "RESTRICTED",
    emconZone: "Tactical Air Corridor Beta", frequencyBand: "Tactical C-Band DDL",
    waypointIndex: 0, waypoints: [[19.350,72.500],[19.450,72.200],[19.150,72.150],[19.280,72.600]],
  },
  {
    id: "VESSEL-05", name: "Fast Interceptor FIC-04", callsign: "PATROL-04", type: "Patrol Craft",
    lat: 18.990, lng: 72.750, heading: 220, speedKnots: 28.0, commsStatus: "ACTIVE",
    emconZone: "Coastal Defense Sector", frequencyBand: "VHF Tactical Marine",
    waypointIndex: 0, waypoints: [[18.990,72.750],[18.840,72.760],[18.920,72.820],[19.040,72.780]],
  },
  {
    id: "VESSEL-06", name: "INS Khanderi", callsign: "S22-HUNTER", type: "Submarine",
    lat: 17.850, lng: 72.420, heading: 180, speedKnots: 11.2, commsStatus: "BLOCKED",
    emconZone: "Subsurface Patrol Box Zulu", frequencyBand: "VLF Acoustic Buoy Link Only",
    waypointIndex: 0, waypoints: [[17.850,72.420],[17.400,72.450],[17.550,72.300],[17.900,72.380]],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function vesselColor(v: GeoVessel): string {
  if (v.commsStatus === "BLOCKED" || v.isAlertTarget) return "#EF4444";
  if (v.commsStatus === "RESTRICTED") return "#F59E0B";
  return "#10B981";
}

function makeVesselIcon(v: GeoVessel, selected: boolean): L.DivIcon {
  const color = vesselColor(v);
  const r = selected ? 13 : 10;
  const hx = 26 + 18 * Math.sin((v.heading * Math.PI) / 180);
  const hy = 26 - 18 * Math.cos((v.heading * Math.PI) / 180);
  const pulse = (v.commsStatus === "BLOCKED" || v.isAlertTarget)
    ? `<circle cx="26" cy="26" r="18" fill="none" stroke="${color}" stroke-width="2" opacity="0.6"><animate attributeName="r" values="14;26;14" dur="2s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite"/></circle>`
    : "";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 52 52">
    ${pulse}
    <line x1="26" y1="26" x2="${hx}" y2="${hy}" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="26" cy="26" r="${r}" fill="${color}" stroke="white" stroke-width="2.5"/>
    <circle cx="26" cy="26" r="4" fill="white"/>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [52, 52],
    iconAnchor: [26, 26],
  });
}

function makePortIcon(port: PortLocation): L.DivIcon {
  const bg = port.type === "Command HQ" ? "#2563EB" : port.type === "Naval Base" ? "#0891B2" : "#64748B";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
    <circle cx="8" cy="8" r="7" fill="${bg}" stroke="white" stroke-width="2"/>
    <circle cx="8" cy="8" r="3" fill="white"/>
  </svg>`;
  return L.divIcon({ html: svg, className: "", iconSize: [16, 16], iconAnchor: [8, 8] });
}


// ── Inner helper: sync map sizing on resize/expand ───────────────────────────
const MapResizeSync: React.FC<{ isExpanded: boolean }> = ({ isExpanded }) => {
  const map = useMap();
  useEffect(() => {
    const handleResize = () => {
      map.invalidateSize();
    };
    handleResize();
    const timers = [
      setTimeout(handleResize, 50),
      setTimeout(handleResize, 150),
      setTimeout(handleResize, 350),
      setTimeout(handleResize, 600),
      setTimeout(handleResize, 1000),
    ];
    window.addEventListener("resize", handleResize);
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("resize", handleResize);
    };
  }, [map, isExpanded]);
  return null;
};

// ── Inner helper: zoom controls via useMap ────────────────────────────────────
const MapZoomControls: React.FC<{ onReset: () => void }> = ({ onReset }) => {
  const map = useMap();
  return (
    <div className="absolute top-4 right-4 z-[999] flex flex-col gap-1.5 bg-white/90 backdrop-blur-sm rounded-xl p-1 shadow-lg border border-slate-200">
      <button type="button" onClick={() => map.zoomIn()} className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-700 font-bold cursor-pointer transition-colors" title="Zoom in"><ZoomIn className="w-4 h-4"/></button>
      <button type="button" onClick={() => map.zoomOut()} className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-700 font-bold cursor-pointer transition-colors" title="Zoom out"><ZoomOut className="w-4 h-4"/></button>
      <div className="w-full h-px bg-slate-200"/>
      <button type="button" onClick={() => { map.setView([18.2, 72.8], 9); onReset(); }} className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer transition-colors" title="Reset view"><RotateCcw className="w-3.5 h-3.5"/></button>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
export const OperationalCommsMap: React.FC = () => {
  const [mapType, setMapType] = useState<"map" | "satellite">("map");
  const [isExpanded, setIsExpanded] = useState(false);
  const [showRestrictedZones, setShowRestrictedZones] = useState(true);
  const [showLayersMenu, setShowLayersMenu] = useState(false);
  const [layers, setLayers] = useState({
    vessels: true, zones: true, ports: true, radarRings: true,
    corridors: true, trajectories: true, eezLimits: true, gridCoords: true,
  });

  const [vessels, setVessels] = useState<GeoVessel[]>(INITIAL_VESSELS);
  const [selectedVesselId, setSelectedVesselId] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1.0);
  const mapRef = useRef<L.Map | null>(null);

  // ── Real-time kinematics ──
  useEffect(() => {
    if (isPaused) return;
    let lastTime = performance.now();
    const id = setInterval(() => {
      const now = performance.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;
      setVessels((prev) =>
        prev.map((v) => {
          const nextIdx = (v.waypointIndex + 1) % v.waypoints.length;
          const target = v.waypoints[nextIdx];
          const dLat = target[0] - v.lat;
          const dLng = target[1] - v.lng;
          const dist = Math.sqrt(dLat * dLat + dLng * dLng);
          const heading = Math.round(((Math.atan2(dLng, dLat) * 180) / Math.PI + 360) % 360);
          const step = (v.speedKnots / 3600) * 0.05 * delta * speedMultiplier;
          if (dist < 0.015) return { ...v, waypointIndex: nextIdx, heading };
          const ratio = Math.min(1, step / dist);
          return { ...v, lat: v.lat + dLat * ratio, lng: v.lng + dLng * ratio, heading };
        })
      );
    }, 200);
    return () => clearInterval(id);
  }, [isPaused, speedMultiplier]);

  // ── ESC to exit fullscreen ──
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isExpanded) {
        setIsExpanded(false);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [isExpanded]);

  // ── Invalidate map size when expanded changes ──
  useEffect(() => {
    const fire = () => mapRef.current?.invalidateSize();
    fire();
    const t1 = setTimeout(fire, 50);
    const t2 = setTimeout(fire, 150);
    const t3 = setTimeout(fire, 350);
    const t4 = setTimeout(fire, 600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [isExpanded]);

  const toggleComms = useCallback((id: string) => {
    setVessels((prev) => prev.map((v) => {
      if (v.id !== id) return v;
      const next = v.commsStatus === "ACTIVE" ? "RESTRICTED" : v.commsStatus === "RESTRICTED" ? "BLOCKED" : "ACTIVE";
      return { ...v, commsStatus: next };
    }));
  }, []);

  // Tile URLs
  const tacMapTile = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
  const satTile    = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

  // Zone paths
  const eezPath       = [[20.4,71.3],[18.5,71.4],[16.0,71.8],[14.2,72.2]] as [number,number][];
  const emconZone     = [[19.2,72.45],[19.25,72.78],[18.7,72.72],[18.75,72.40]] as [number,number][];
  const uavCorridor   = [[19.5,72.1],[19.55,72.55],[19.25,72.55],[19.2,72.1]] as [number,number][];
  const corridorA     = [[19.6,72.45],[18.8,72.5],[17.5,72.6],[15.0,73.1]] as [number,number][];
  const corridorB     = [[18.9,72.0],[18.92,72.5],[18.94,72.82]] as [number,number][];

  const layerItems: [keyof typeof layers, string][] = [
    ["vessels",    "Active Vessels"],
    ["ports",      "Ports & Naval Bases"],
    ["zones",      "EMCON Restricted Zones"],
    ["radarRings", "Coastal Radar Rings"],
    ["corridors",  "Transit Corridors"],
    ["trajectories","Vessel Trajectories"],
    ["eezLimits",  "EEZ Boundary"],
  ];

  return (
    <div className={`border rounded-xl shadow-sm flex flex-col relative overflow-hidden transition-all duration-300 ${
      isExpanded
        ? "fixed inset-0 z-[9999] rounded-none bg-[#0d1829] flex flex-col"
        : "bg-white border-[#E6EAF2] p-4 h-[580px] flex-1"
    }`}>

      {/* ── TOP CONTROL BAR ── */}
      <div className={`flex flex-wrap items-center justify-between gap-3 relative z-[400] ${
        isExpanded
          ? "bg-[#0d1829]/95 backdrop-blur-sm px-4 py-3 border-b border-slate-700/50"
          : "pb-3 border-b border-slate-100"
      }`}>
        {/* Left: Map/Satellite & Layers */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Map / Satellite Toggle */}
          <div className={`inline-flex rounded-full p-1 border text-xs font-bold shadow-xs ${isExpanded ? "bg-slate-800 border-slate-700" : "bg-slate-100 border-slate-200"}`}>
            <button type="button" onClick={() => setMapType("map")}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${mapType === "map" ? "bg-[#2563EB] text-white shadow-xs" : isExpanded ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-slate-900"}`}>
              Map
            </button>
            <button type="button" onClick={() => setMapType("satellite")}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${mapType === "satellite" ? "bg-[#2563EB] text-white shadow-xs" : isExpanded ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-slate-900"}`}>
              Satellite
            </button>
          </div>

          {/* Layers Dropdown */}
          <div className="relative">
            <button type="button" onClick={() => setShowLayersMenu(!showLayersMenu)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-xs border cursor-pointer transition-colors ${isExpanded ? "bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"}`}>
              <Layers className="w-3.5 h-3.5 text-blue-400"/>
              <span>Layers (8)</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showLayersMenu ? "rotate-180" : ""} ${isExpanded ? "text-slate-400" : "text-slate-400"}`}/>
            </button>

            {showLayersMenu && (
              <div className="absolute left-0 mt-2 w-56 rounded-xl bg-white border border-slate-200 p-3 shadow-2xl z-[9999] space-y-1.5 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block pb-1 border-b border-slate-100">Tactical Layers</span>
                {layerItems.map(([key, label]) => (
                  <label key={key} className="flex items-center justify-between cursor-pointer text-slate-700 hover:text-slate-900 py-0.5">
                    <span>{label}</span>
                    <input type="checkbox" checked={layers[key]} onChange={(e) => setLayers({...layers, [key]: e.target.checked})} className="rounded accent-blue-600"/>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: No-fly toggle + Fullscreen/Close */}
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 text-xs font-semibold ${isExpanded ? "text-slate-300" : "text-slate-700"}`}>
            <span>No-Fly / Restricted Zones</span>
            <button type="button" onClick={() => setShowRestrictedZones(!showRestrictedZones)}
              className={`relative w-10 h-5 rounded-full transition-colors shadow-inner cursor-pointer flex items-center ${showRestrictedZones ? "bg-[#2563EB]" : "bg-slate-400"}`}>
              <div className={`absolute w-4 h-4 rounded-full bg-white shadow transition-transform mx-0.5 ${showRestrictedZones ? "translate-x-5" : "translate-x-0"}`}/>
            </button>
          </div>

          {/* Fullscreen / Close button */}
          <button type="button" onClick={() => setIsExpanded(!isExpanded)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-xs border cursor-pointer transition-all ${
              isExpanded
                ? "bg-red-600 hover:bg-red-700 text-white border-red-700 gap-2 shadow-md"
                : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
            }`}>
            {isExpanded ? (
              <><Minimize2 className="w-3.5 h-3.5"/><span>Exit Fullscreen</span></>
            ) : (
              <><Maximize2 className="w-3.5 h-3.5 text-blue-600"/><span>Fullscreen</span></>
            )}
          </button>
        </div>
      </div>

      {/* ── MAP CONTAINER ── */}
      <div
        className={`relative flex-1 w-full min-h-0 overflow-hidden ${
          isExpanded ? "" : "mt-2 rounded-xl border border-slate-200"
        }`}
        style={{ minHeight: isExpanded ? "calc(100vh - 120px)" : "480px" }}
        onClick={() => setShowLayersMenu(false)}
      >
        {/* Floating Quick Close Button in Fullscreen */}
        {isExpanded && (
          <button
            type="button"
            onClick={() => setIsExpanded(false)}
            className="absolute top-4 right-16 z-[1000] flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-red-600 text-white text-xs font-bold shadow-xl border border-slate-700 hover:border-red-500 transition-all cursor-pointer backdrop-blur-md"
            title="Close Fullscreen (Esc)"
          >
            <X className="w-4 h-4" />
            <span>Close (Esc)</span>
          </button>
        )}

        <MapContainer
          center={[18.2, 72.8]}
          zoom={9}
          zoomControl={false}
          scrollWheelZoom={true}
          style={{ width: "100%", height: "100%", minHeight: isExpanded ? "100%" : "480px" }}
          ref={mapRef as any}
          className="w-full h-full"
        >
          <MapResizeSync isExpanded={isExpanded} />
          {/* Tile Layer */}
          {mapType === "map" ? (
            <TileLayer
              url={tacMapTile}
              attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
              maxZoom={18}
            />
          ) : (
            <TileLayer
              url={satTile}
              attribution='Tiles &copy; Esri'
              maxZoom={18}
            />
          )}

          {/* Zoom Controls */}
          <MapZoomControls onReset={() => {}}/>

          {/* EEZ Boundary */}
          {layers.eezLimits && (
            <Polyline positions={eezPath} pathOptions={{ color: "#3B82F6", weight: 2, opacity: 0.8, dashArray: "8,5" }}>
              <Tooltip sticky className="!bg-blue-900 !text-blue-100 !border-blue-700 !text-[10px] !font-mono">INDIAN EEZ (200 NM Boundary)</Tooltip>
            </Polyline>
          )}

          {/* Transit Corridors */}
          {layers.corridors && <>
            <Polyline positions={corridorA} pathOptions={{ color: "#D97706", weight: 2.5, opacity: 0.85, dashArray: "5,4" }}>
              <Tooltip sticky className="!bg-amber-900 !text-amber-100 !text-[10px] !font-mono">Transit Corridor Alpha</Tooltip>
            </Polyline>
            <Polyline positions={corridorB} pathOptions={{ color: "#7C3AED", weight: 2.5, opacity: 0.8 }}>
              <Tooltip sticky className="!bg-purple-900 !text-purple-100 !text-[10px] !font-mono">Mumbai Approach Channel</Tooltip>
            </Polyline>
          </>}

          {/* EMCON Zones */}
          {showRestrictedZones && layers.zones && <>
            <Polygon positions={emconZone} pathOptions={{ color: "#EF4444", weight: 2, opacity: 0.9, fillColor: "#EF4444", fillOpacity: 0.12, dashArray: "4,4" }}>
              <Tooltip permanent className="!bg-red-950/80 !text-red-300 !border-red-700 !text-[10px] !font-mono !font-black">EMCON ALPHA — RADIO SILENCE</Tooltip>
            </Polygon>
            <Polygon positions={uavCorridor} pathOptions={{ color: "#0891B2", weight: 1.5, opacity: 0.8, fillColor: "#0891B2", fillOpacity: 0.1, dashArray: "5,3" }}>
              <Tooltip permanent className="!bg-cyan-950/80 !text-cyan-300 !border-cyan-700 !text-[10px] !font-mono !font-black">UAV AIR CORRIDOR BETA</Tooltip>
            </Polygon>
          </>}

          {/* Coastal Radar Rings — Mumbai */}
          {layers.radarRings && <>
            <Circle center={[18.935, 72.845]} radius={40000} pathOptions={{ color: "#10B981", weight: 1.5, opacity: 0.45, fillOpacity: 0, dashArray: "3,3" }}/>
            <Circle center={[18.935, 72.845]} radius={80000} pathOptions={{ color: "#10B981", weight: 1, opacity: 0.25, fillOpacity: 0 }}/>
            <Circle center={[18.935, 72.845]} radius={130000} pathOptions={{ color: "#10B981", weight: 1, opacity: 0.15, fillColor: "#10B981", fillOpacity: 0.03 }}/>
            {/* Karwar */}
            <Circle center={[14.810, 74.130]} radius={35000} pathOptions={{ color: "#0284C7", weight: 1.5, opacity: 0.4, fillOpacity: 0 }}/>
            <Circle center={[14.810, 74.130]} radius={70000} pathOptions={{ color: "#0284C7", weight: 1, opacity: 0.2, fillOpacity: 0 }}/>
          </>}

          {/* Port Markers */}
          {layers.ports && PORTS.map((port) => (
            <Marker key={port.id} position={[port.lat, port.lng]} icon={makePortIcon(port)}>
              <Tooltip permanent direction="right" offset={[10, 0]}
                className={`!bg-slate-900/90 !text-[10px] !font-bold !font-sans !border-0 !shadow-xl ${port.type === "Command HQ" ? "!text-blue-300" : "!text-cyan-300"}`}>
                {port.name}
              </Tooltip>
            </Marker>
          ))}

          {/* Vessel Markers */}
          {layers.vessels && vessels.map((v) => {
            const color = vesselColor(v);
            const isSelected = selectedVesselId === v.id;
            return (
              <React.Fragment key={v.id}>
                {/* Trajectory */}
                {layers.trajectories && (
                  <Polyline positions={v.waypoints} pathOptions={{ color, weight: 1.5, opacity: 0.35, dashArray: "4,4" }}/>
                )}

                {/* Vessel Marker */}
                <Marker
                  position={[v.lat, v.lng]}
                  icon={makeVesselIcon(v, isSelected)}
                  eventHandlers={{
                    click: () => setSelectedVesselId(isSelected ? null : v.id),
                  }}
                  zIndexOffset={isSelected ? 1000 : 0}
                >
                  <Tooltip direction="right" offset={[14, 0]} permanent
                    className="!bg-white/95 !border !border-slate-200 !text-[10px] !font-bold !font-sans !text-slate-900 !shadow !py-0.5 !px-1.5 !rounded">
                    {v.name.replace(/\s*\(.*\)/,"")}
                  </Tooltip>

                  {isSelected && (
                    <Popup
                      offset={[0, -26]}
                      closeButton={true}
                      eventHandlers={{
                        remove: () => setSelectedVesselId(null),
                      }}
                      className="!w-72"
                      autoPan={true}
                    >
                      <div className="text-xs font-mono text-slate-800 space-y-2 p-1">
                        {/* Header */}
                        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                          <div>
                            <div className="font-sans font-bold text-[13px] text-slate-900">{v.name}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{v.callsign} · {v.type}</div>
                          </div>
                          <span className="text-[9.5px] font-black px-2 py-0.5 rounded-full border" style={{ color, borderColor: color, backgroundColor: color + "18" }}>
                            {v.commsStatus}
                          </span>
                        </div>

                        {/* Data grid */}
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
                          <div><span className="text-slate-400">Speed</span><br/><strong>{v.speedKnots} kn</strong></div>
                          <div><span className="text-slate-400">Heading</span><br/><strong>{v.heading}°</strong></div>
                          <div className="col-span-2"><span className="text-slate-400">Position</span><br/><strong className="text-blue-600">{v.lat.toFixed(4)}°N · {v.lng.toFixed(4)}°E</strong></div>
                          <div className="col-span-2"><span className="text-slate-400">Sector</span><br/><span className="text-slate-700">{v.emconZone}</span></div>
                          <div className="col-span-2"><span className="text-slate-400">Frequency</span><br/><span className="text-slate-600 text-[10px]">{v.frequencyBand}</span></div>
                        </div>

                        {/* EMCON Toggle */}
                        <button type="button" onClick={() => toggleComms(v.id)}
                          className={`w-full py-1.5 mt-1 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                            v.commsStatus === "BLOCKED"
                              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                              : "bg-red-50 hover:bg-red-100 text-red-700 border border-red-200"
                          }`}>
                          {v.commsStatus === "BLOCKED"
                            ? <><Unlock className="w-3 h-3"/><span>Lift EMCON Radio Silence</span></>
                            : <><Lock className="w-3 h-3"/><span>Enforce EMCON Radio Silence</span></>}
                        </button>
                      </div>
                    </Popup>
                  )}
                </Marker>
              </React.Fragment>
            );
          })}
        </MapContainer>

        {/* Live Telemetry Ticker */}
        <div className="absolute bottom-4 left-4 z-[998] bg-[#0a1628]/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700 shadow-md text-xs font-mono flex items-center gap-3 pointer-events-none">
          <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"/>
            LIVE TELEMETRY FEED
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-blue-400 font-semibold">Western Fleet HQ (Mumbai) · 18°55''N, 72°50''E</span>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 right-16 z-[998] bg-[#0a1628]/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-700 shadow-md text-[10.5px] font-mono flex items-center gap-3 pointer-events-none">
          <span className="flex items-center gap-1 text-slate-300"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"/> Active</span>
          <span className="flex items-center gap-1 text-slate-300"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block"/> Restricted</span>
          <span className="flex items-center gap-1 text-slate-300"><span className="w-2 h-2 rounded-full bg-red-500 inline-block"/> Silent</span>
          <span className="flex items-center gap-1 text-slate-300"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block"/> Base</span>
        </div>
      </div>

      {/* ── FULLSCREEN BOTTOM CONTROLS ── */}
      {isExpanded && (
        <div className="bg-[#0d1829]/95 backdrop-blur-sm border-t border-slate-700/50 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs z-[400]">
          <div className="flex items-center gap-3">
            <span className="text-slate-400 font-mono text-[11px] uppercase tracking-wider">Simulation Speed:</span>
            <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
              <button type="button" onClick={() => setIsPaused(!isPaused)}
                className={`p-1.5 rounded-lg font-bold flex items-center gap-1 cursor-pointer ${isPaused ? "bg-amber-500 text-black" : "bg-slate-700 text-white"}`}>
                {isPaused ? <Play className="w-3.5 h-3.5"/> : <Pause className="w-3.5 h-3.5"/>}
                <span>{isPaused ? "Resume" : "Pause"}</span>
              </button>
              {([1.0, 2.5, 5.0] as number[]).map((spd) => (
                <button key={spd} type="button" onClick={() => setSpeedMultiplier(spd)}
                  className={`px-2.5 py-1 rounded-lg font-mono font-bold cursor-pointer transition-colors ${speedMultiplier === spd ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}>
                  {spd === 5.0 ? <span className="flex items-center gap-0.5"><FastForward className="w-3 h-3"/> 5x</span> : `${spd}x`}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px]">
            <span>{vessels.length} Active Naval Units Tracked</span>
            <span className="text-slate-700">•</span>
            <span className="text-emerald-500 font-semibold">PQC Post-Quantum Cryptographic CA Active</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default OperationalCommsMap;
