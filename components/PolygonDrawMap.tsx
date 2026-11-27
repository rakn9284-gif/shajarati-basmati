"use client";

import { useEffect } from "react";
import {
  CircleMarker,
  MapContainer,
  Polygon,
  Polyline,
  TileLayer,
  Tooltip,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

export type SitePoint = [number, number];

function ClickCapture({
  value,
  onChange,
}: {
  value: SitePoint[];
  onChange: (points: SitePoint[]) => void;
}) {
  useMapEvents({
    click(event) {
      onChange([...value, [event.latlng.lat, event.latlng.lng]]);
    },
  });
  return null;
}

function Recenter({ center }: { center: SitePoint }) {
  const map = useMap();
  const [lat, lng] = center;
  useEffect(() => {
    map.flyTo([lat, lng], Math.max(map.getZoom(), 14), { duration: 0.5 });
  }, [map, lat, lng]);
  return null;
}

/** Leaflet editor that turns map clicks into a site boundary polygon. */
export default function PolygonDrawMap({
  center,
  value,
  onChange,
}: {
  center: SitePoint;
  value: SitePoint[];
  onChange: (points: SitePoint[]) => void;
}) {
  return (
    <MapContainer
      center={center}
      zoom={15}
      scrollWheelZoom
      className="size-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />
      <ClickCapture value={value} onChange={onChange} />
      <Recenter center={center} />

      {value.length >= 3 && (
        <Polygon
          positions={value}
          pathOptions={{
            color: "#123B2A",
            weight: 2,
            fillColor: "#16865B",
            fillOpacity: 0.25,
          }}
        />
      )}
      {value.length === 2 && (
        <Polyline
          positions={value}
          pathOptions={{ color: "#16865B", weight: 2, dashArray: "5 4" }}
        />
      )}
      {value.map((point, index) => (
        <CircleMarker
          key={`${point[0]}-${point[1]}-${index}`}
          center={point}
          radius={6}
          pathOptions={{
            color: "#FFFFFF",
            weight: 2,
            fillColor: "#16865B",
            fillOpacity: 1,
          }}
        >
          <Tooltip permanent direction="top" offset={[0, -6]}>
            <span className="font-mono text-[9px] font-bold">{index + 1}</span>
          </Tooltip>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
