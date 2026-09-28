import { useState, useEffect, useRef, useCallback } from 'react';
import type { TacticalUnit, EmconZone } from '../types/emcon';

export interface LiveNavalUnit extends TacticalUnit {
  targetHeading: number;
  waypointIndex: number;
  waypoints: { x: number; y: number }[];
  trail: { x: number; y: number; time: number }[];
  rangeNmToFleetHq: number;
  bearingDegFromFleetHq: number;
  emissionsKw: number;
  radarRangeNm: number;
}

const INITIAL_UNITS: LiveNavalUnit[] = [
  {
    id: 'UNIT-01',
    name: 'INS Vikramaditya (R33)',
    callsign: 'R33-BRAVO',
    type: 'Aircraft Carrier',
    x: 29.5,
    y: 48.0,
    lat: "15°32'N",
    long: "69°45'E",
    commsStatus: 'ACTIVE',
    emconZone: 'Sector Bravo Outer Shelf',
    heading: 125,
    targetHeading: 125,
    speedKnots: 22.4,
    frequencyBand: 'EHF MilSat + Link-II',
    pqcActive: true,
    waypointIndex: 0,
    waypoints: [
      { x: 29.5, y: 48.0 },
      { x: 34.0, y: 52.0 },
      { x: 38.0, y: 46.0 },
      { x: 32.0, y: 42.0 },
    ],
    trail: [],
    rangeNmToFleetHq: 142,
    bearingDegFromFleetHq: 245,
    emissionsKw: 4.8,
    radarRangeNm: 120,
  },
  {
    id: 'UNIT-02',
    name: 'INS Visakhapatnam (D66)',
    callsign: 'D66-SENTINEL',
    type: 'Destroyer',
    x: 44.5,
    y: 54.0,
    lat: "15°10'N",
    long: "71°12'E",
    commsStatus: 'BLOCKED',
    emconZone: 'EMCON Alpha Sector 17A (Radio Silence)',
    heading: 310,
    targetHeading: 310,
    speedKnots: 16.8,
    frequencyBand: 'Silent (EMCON Active)',
    pqcActive: true,
    waypointIndex: 0,
    waypoints: [
      { x: 44.5, y: 54.0 },
      { x: 48.0, y: 49.0 },
      { x: 51.0, y: 56.0 },
      { x: 43.0, y: 58.0 },
    ],
    trail: [],
    rangeNmToFleetHq: 88,
    bearingDegFromFleetHq: 215,
    emissionsKw: 0.0,
    radarRangeNm: 75,
  },
  {
    id: 'UNIT-03',
    name: 'INS Mormugao (D67)',
    callsign: 'D67-PATROL',
    type: 'Destroyer',
    x: 46.8,
    y: 76.5,
    lat: "13°44'N",
    long: "71°30'E",
    commsStatus: 'RESTRICTED',
    emconZone: 'Sector Charlie (SATCOM Only)',
    heading: 45,
    targetHeading: 45,
    speedKnots: 14.2,
    frequencyBand: 'SHF Receive Only',
    pqcActive: true,
    waypointIndex: 0,
    waypoints: [
      { x: 46.8, y: 76.5 },
      { x: 52.0, y: 72.0 },
      { x: 49.0, y: 80.0 },
      { x: 42.0, y: 78.0 },
    ],
    trail: [],
    rangeNmToFleetHq: 110,
    bearingDegFromFleetHq: 175,
    emissionsKw: 0.4,
    radarRangeNm: 60,
  },
  {
    id: 'UNIT-04',
    name: 'UAV-Alpha-03 Surveillance',
    callsign: 'DRONE-03',
    type: 'UAV Squad',
    x: 49.2,
    y: 69.5,
    lat: "14°20'N",
    long: "71°55'E",
    commsStatus: 'RESTRICTED',
    emconZone: 'Sector Charlie (Line-of-Sight)',
    heading: 270,
    targetHeading: 270,
    speedKnots: 145.0,
    frequencyBand: 'Tactical C-Band DDL',
    pqcActive: true,
    waypointIndex: 0,
    waypoints: [
      { x: 49.2, y: 69.5 },
      { x: 54.0, y: 66.0 },
      { x: 48.0, y: 62.0 },
      { x: 44.0, y: 68.0 },
    ],
    trail: [],
    rangeNmToFleetHq: 64,
    bearingDegFromFleetHq: 190,
    emissionsKw: 0.15,
    radarRangeNm: 40,
  },
  {
    id: 'UNIT-05',
    name: 'Western Fleet HQ (Mumbai)',
    callsign: 'HQ-WNC-01',
    type: 'Command HQ',
    x: 65.5,
    y: 43.5,
    lat: "18°55'N",
    long: "72°50'E",
    commsStatus: 'ACTIVE',
    emconZone: 'Command Base Alpha',
    heading: 0,
    targetHeading: 0,
    speedKnots: 0,
    frequencyBand: 'Multi-Band / Fiber WAN / PQC CA',
    pqcActive: true,
    waypointIndex: 0,
    waypoints: [{ x: 65.5, y: 43.5 }],
    trail: [],
    rangeNmToFleetHq: 0,
    bearingDegFromFleetHq: 0,
    emissionsKw: 12.0,
    radarRangeNm: 150,
  },
  {
    id: 'UNIT-06',
    name: 'Coastal Radar Unit (Karwar)',
    callsign: 'RADAR-KARWAR',
    type: 'Coastal Radar',
    x: 69.2,
    y: 69.5,
    lat: "14°48'N",
    long: "74°07'E",
    commsStatus: 'ACTIVE',
    emconZone: 'Coastal Sentinel (Seabird Base)',
    heading: 270,
    targetHeading: 270,
    speedKnots: 0,
    frequencyBand: 'S-Band Air/Surface Search',
    pqcActive: true,
    waypointIndex: 0,
    waypoints: [{ x: 69.2, y: 69.5 }],
    trail: [],
    rangeNmToFleetHq: 235,
    bearingDegFromFleetHq: 155,
    emissionsKw: 35.0,
    radarRangeNm: 90,
  },
  {
    id: 'UNIT-07',
    name: 'INS Kalvari (S21 Submarine)',
    callsign: 'S21-GHOST',
    type: 'Submarine',
    x: 38.0,
    y: 62.0,
    lat: "14°50'N",
    long: "70°30'E",
    commsStatus: 'BLOCKED',
    emconZone: 'Deep Sea Patrol Box (Full Radio Silence)',
    heading: 190,
    targetHeading: 190,
    speedKnots: 9.5,
    frequencyBand: 'VLF Acoustic Beacon Only',
    pqcActive: true,
    waypointIndex: 0,
    waypoints: [
      { x: 38.0, y: 62.0 },
      { x: 36.0, y: 68.0 },
      { x: 41.0, y: 65.0 },
    ],
    trail: [],
    rangeNmToFleetHq: 165,
    bearingDegFromFleetHq: 220,
    emissionsKw: 0.0,
    radarRangeNm: 25,
  },
];

export const TACTICAL_ZONES: EmconZone[] = [
  {
    id: 'ZONE-01',
    name: 'Sector 17A EMCON Alpha Zone',
    code: 'SEC-17A-RESTRICTED',
    type: 'Restricted',
    points: [
      { x: 40.8, y: 40.0 },
      { x: 57.0, y: 48.0 },
      { x: 58.2, y: 70.0 },
      { x: 44.0, y: 68.5 },
      { x: 40.8, y: 50.0 },
    ],
    center: { x: 48.5, y: 58.0 },
    status: 'ACTIVE',
  },
];

export const useRealtimeNavalMap = (speedMultiplier: number = 1.0, isPaused: boolean = false) => {
  const [units, setUnits] = useState<LiveNavalUnit[]>(INITIAL_UNITS);
  const [radarSweepAngle, setRadarSweepAngle] = useState<number>(0);
  const [sonarPulseRadius, setSonarPulseRadius] = useState<number>(0);
  const [telemetryTick, setTelemetryTick] = useState<number>(0);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  const toggleUnitComms = useCallback((unitId: string) => {
    setUnits((prev) =>
      prev.map((u) => {
        if (u.id === unitId) {
          const nextStatus =
            u.commsStatus === 'ACTIVE'
              ? 'RESTRICTED'
              : u.commsStatus === 'RESTRICTED'
              ? 'BLOCKED'
              : 'ACTIVE';
          return { ...u, commsStatus: nextStatus };
        }
        return u;
      })
    );
  }, []);

  useEffect(() => {
    const updateLoop = (now: number) => {
      const delta = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      if (!isPaused) {
        // Update radar sweep angle (approx 24 RPM = 144 deg/sec)
        setRadarSweepAngle((prev) => (prev + 144 * delta * speedMultiplier) % 360);

        // Update sonar ping ripple (0 to 100)
        setSonarPulseRadius((prev) => (prev + 30 * delta * speedMultiplier) % 100);

        setTelemetryTick((t) => t + 1);

        // Update vessel positions along waypoints smoothly
        setUnits((prevUnits) =>
          prevUnits.map((unit) => {
            if (unit.speedKnots === 0 || unit.waypoints.length <= 1) {
              return unit;
            }

            const nextWaypointIndex = (unit.waypointIndex + 1) % unit.waypoints.length;
            const targetWaypoint = unit.waypoints[nextWaypointIndex];

            const dx = targetWaypoint.x - unit.x;
            const dy = targetWaypoint.y - unit.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Compute angle to target
            const angleRad = Math.atan2(dy, dx);
            const angleDeg = ((angleRad * 180) / Math.PI + 90 + 360) % 360;

            // Speed in map coordinate units per second
            // 20 knots approx 0.35 coordinate units/sec
            const stepRate = (unit.speedKnots / 30) * 0.25 * delta * speedMultiplier;

            let newX = unit.x;
            let newY = unit.y;
            let newIndex = unit.waypointIndex;

            if (dist < 0.8) {
              newIndex = nextWaypointIndex;
            } else {
              newX += Math.cos(angleRad) * stepRate;
              newY += Math.sin(angleRad) * stepRate;
            }

            // Append trail point periodically (keep last 20 points)
            const nowTime = Date.now();
            let newTrail = unit.trail;
            const lastTrail = newTrail[newTrail.length - 1];
            if (!lastTrail || Math.hypot(newX - lastTrail.x, newY - lastTrail.y) > 0.6) {
              newTrail = [...newTrail.slice(-18), { x: newX, y: newY, time: nowTime }];
            }

            // Compute live realistic formatted latitude/longitude based on map bounds:
            // Top: 20°N, Bottom: 12°N; Left: 66°E, Right: 76°E
            const latDeg = 20 - (newY / 100) * 8;
            const longDeg = 66 + (newX / 100) * 10;
            const latMin = Math.floor((latDeg % 1) * 60);
            const longMin = Math.floor((longDeg % 1) * 60);
            const liveLat = `${Math.floor(latDeg)}°${String(latMin).padStart(2, '0')}'N`;
            const liveLong = `${Math.floor(longDeg)}°${String(longMin).padStart(2, '0')}'E`;

            return {
              ...unit,
              x: newX,
              y: newY,
              heading: Math.round(angleDeg),
              lat: liveLat,
              long: liveLong,
              waypointIndex: newIndex,
              trail: newTrail,
            };
          })
        );
      }

      animFrameRef.current = requestAnimationFrame(updateLoop);
    };

    animFrameRef.current = requestAnimationFrame(updateLoop);
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [speedMultiplier, isPaused]);

  return {
    units,
    zones: TACTICAL_ZONES,
    radarSweepAngle,
    sonarPulseRadius,
    telemetryTick,
    toggleUnitComms,
  };
};
