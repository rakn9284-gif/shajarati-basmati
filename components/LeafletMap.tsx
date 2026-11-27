"use client";

import { useMemo } from "react";
import {
  CircleMarker,
  GeoJSON,
  MapContainer,
  Polygon,
  TileLayer,
  Tooltip,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import communes from "@/lib/skikda-communes.json";
import type { Campaign, Municipality, Tree, TreeStatus } from "@/lib/types";
import { STATUS_COLORS } from "@/lib/municipalities";

const SKIKDA_CENTER: [number, number] = [36.876, 6.906];

const UNPLANTED_STYLE: L.PathOptions = {
  color: "#8CB8A2",
  weight: 1.2,
  fillColor: "#FFFFFF",
  fillOpacity: 0.55,
  dashArray: "4 3",
};

const PLANTED_STYLE: L.PathOptions = {
  color: "#16865B",
  weight: 1.6,
  fillColor: "#B8E6CE",
  fillOpacity: 0.45,
};

const ACTIVE_STYLE: L.PathOptions = {
  color: "#123B2A",
  weight: 2.6,
  fillColor: "#16865B",
  fillOpacity: 0.6,
};

const statusColor = (status: TreeStatus) => STATUS_COLORS[status];

export interface LeafletMapProps {
  municipalities?: Municipality[];
  trees: Tree[];
  campaigns?: Campaign[];
  activeMunicipality: string | null;
  onSelectMunicipality: (id: string | null) => void;
  onSelectTree: (treeId: string) => void;
  onSelectCampaign?: (campaignId: string) => void;
}

/**
 * Real interactive map of Skikda Wilaya built on Leaflet + OpenStreetMap.
 * Commune polygons come from geoBoundaries DZA-ADM3 (simplified);
 * tree pins are plotted live from their admin-entered geo-coordinates.
 */
export default function LeafletMap({
  trees,
  campaigns = [],
  activeMunicipality,
  onSelectMunicipality,
  onSelectTree,
  onSelectCampaign,
}: LeafletMapProps) {
  const plantedIds = useMemo(
    () => new Set(trees.map((tr) => tr.municipalityId)),
    [trees],
  );

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

      {(communes as never as GeoJSON.FeatureCollection).features.map(
        (feature) => {
          const id = (feature.properties as { id?: string }).id;
          if (!id) return null;
          const isActive = id === activeMunicipality;
          const planted = plantedIds.has(id);
          const style = isActive
            ? ACTIVE_STYLE
            : planted
              ? PLANTED_STYLE
              : UNPLANTED_STYLE;
          return (
            <GeoJSON
              key={`${id}-${planted ? 1 : 0}-${isActive ? 1 : 0}`}
              data={feature as never}
              pathOptions={style}
              eventHandlers={{
                click: () => onSelectMunicipality(id),
              }}
            />
          );
        },
      )}

      {/* Campaign site boundaries — translucent green; click opens the site card. */}
      {campaigns.map((campaign) => {
        const label = `${campaign.nameAr} / ${campaign.nameEn}`;
        const open = () => onSelectCampaign?.(campaign.id);
        if (campaign.polygon && campaign.polygon.length >= 3) {
          return (
            <Polygon
              key={`site-${campaign.id}`}
              positions={campaign.polygon}
              pathOptions={{
                color: "#123B2A",
                weight: 2,
                fillColor: "#16865B",
                fillOpacity: 0.28,
              }}
              eventHandlers={{
                click: (event) => {
                  event.originalEvent.stopPropagation();
                  open();
                },
              }}
            >
              <Tooltip direction="top" opacity={0.95}>
                <span className="text-[10px] font-bold">{label}</span>
              </Tooltip>
            </Polygon>
          );
        }
        return (
          <CircleMarker
            key={`site-${campaign.id}`}
            center={[campaign.lat, campaign.lng]}
            radius={9}
            pathOptions={{
              color: "#FFFFFF",
              weight: 2,
              fillColor: "#123B2A",
              fillOpacity: 0.9,
            }}
            eventHandlers={{
              click: (event) => {
                event.originalEvent.stopPropagation();
                open();
              },
            }}
          >
            <Tooltip direction="top" opacity={0.95}>
              <span className="text-[10px] font-bold">{label}</span>
            </Tooltip>
          </CircleMarker>
        );
      })}

      {trees.map((tree) => (
        <CircleMarker
          key={tree.id}
          center={[tree.lat, tree.lng]}
          radius={tree.status === "critical" ? 8 : 6}
          pathOptions={{
            color: "#FFFFFF",
            weight: 2,
            fillColor: statusColor(tree.status),
            fillOpacity: 0.95,
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
