"use client";

import { CircleMarker, MapContainer, Marker, TileLayer, Tooltip } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Campaign, Municipality, Tree, TreeStatus } from "@/lib/types";
import { STATUS_COLORS } from "@/lib/municipalities";

const SKIKDA_CENTER: [number, number] = [36.876, 6.906];

const campaignPin = L.divIcon({
  className: "hamalati-pin",
  html: `<div class="hamalati-pin__marker"><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21v-6"/><path d="M12 15c-4 0-7-3-7-7 4 0 7 3 7 7Z"/><path d="M12 15c4 0 7-3 7-7-4 0-7 3-7 7Z"/></svg></div>`,
  iconSize: [36, 42],
  iconAnchor: [18, 42],
  tooltipAnchor: [0, -36],
});

const statusColor = (status: TreeStatus) => STATUS_COLORS[status];

export interface LeafletMapProps {
  /** Kept for API compatibility; boundaries are no longer drawn. */
  municipalities?: Municipality[];
  trees: Tree[];
  campaigns?: Campaign[];
  activeMunicipality?: string | null;
  onSelectMunicipality?: (id: string | null) => void;
  onSelectTree: (treeId: string) => void;
  onSelectCampaign?: (campaignId: string) => void;
}

/** Clean marker-only map of Skikda Wilaya — no polygons or boundary editing. */
export default function LeafletMap({
  trees,
  campaigns = [],
  onSelectTree,
  onSelectCampaign,
}: LeafletMapProps) {
  return (
    <MapContainer
      center={SKIKDA_CENTER}
      zoom={9}
      scrollWheelZoom
      className="size-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />

      {/* Campaign sites as emerald location pins only. */}
      {campaigns.map((campaign) => (
        <Marker
          key={`site-${campaign.id}`}
          position={[campaign.lat, campaign.lng]}
          icon={campaignPin}
          eventHandlers={{
            click: (event) => {
              event.originalEvent.stopPropagation();
              onSelectCampaign?.(campaign.id);
            },
          }}
        >
          <Tooltip direction="top" opacity={0.95}>
            <span className="text-[10px] font-bold">
              {campaign.nameAr} / {campaign.nameEn}
            </span>
          </Tooltip>
        </Marker>
      ))}

      {trees.map((tree) => (
        <CircleMarker
          key={tree.id}
          center={[tree.lat, tree.lng]}
          radius={tree.status === "critical" ? 7 : 5}
          pathOptions={{
            color: "#FFFFFF",
            weight: 1.5,
            fillColor: statusColor(tree.status),
            fillOpacity: 0.9,
          }}
          eventHandlers={{
            click: () => onSelectTree(tree.id),
          }}
        >
          <Tooltip direction="top" opacity={0.95}>
            <span className="font-mono text-[10px]" dir="ltr">
              {tree.id}
            </span>
          </Tooltip>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
