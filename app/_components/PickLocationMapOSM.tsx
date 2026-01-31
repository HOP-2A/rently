"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useEffect, useMemo, useState } from "react";

const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

type Props = {
  lat: number | null;
  lng: number | null;
  onPick: (p: { lat: number; lng: number }) => void;
};

function ClickToPick({ onPick }: { onPick: Props["onPick"] }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export default function PickLocationMapOSM({ lat, lng, onPick }: Props) {
  const [me, setMe] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setMe({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {},
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, []);

  const center = useMemo(() => {
    if (lat != null && lng != null) return [lat, lng] as [number, number];

    if (me) return [me.lat, me.lng] as [number, number];

    return [47.9186, 106.9176] as [number, number];
  }, [lat, lng, me]);

  return (
    <div className="w-full overflow-hidden rounded-xl border">
      <MapContainer
        center={center}
        zoom={lat != null && lng != null ? 16 : 13}
        style={{ height: 360, width: "100%" }}
        scrollWheelZoom
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ClickToPick onPick={onPick} />

        {lat != null && lng != null && <Marker position={[lat, lng]} />}
      </MapContainer>
    </div>
  );
}
