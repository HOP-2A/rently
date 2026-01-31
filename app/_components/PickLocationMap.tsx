"use client";

import { useEffect, useRef } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

export default function PickLocationMap({
  lat,
  lng,
  onPick,
}: {
  lat: number | null;
  lng: number | null;
  onPick: (p: { lat: number; lng: number }) => void;
}) {
  const divRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (!key) return;

      setOptions({ key, v: "weekly" });
      const { Map } = (await importLibrary("maps")) as google.maps.MapsLibrary;

      if (cancelled || !divRef.current) return;

      const defaultCenter = { lat: 47.9186, lng: 106.9176 }; // UB төв
      const center = lat != null && lng != null ? { lat, lng } : defaultCenter;

      const map = new Map(divRef.current, {
        center,
        zoom: lat != null && lng != null ? 15 : 13,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      mapRef.current = map;

      if (lat != null && lng != null) {
        markerRef.current = new google.maps.Marker({
          map,
          position: { lat, lng },
        });
      }

      map.addListener("click", (e: google.maps.MapMouseEvent) => {
        if (!e.latLng) return;

        const picked = {
          lat: e.latLng.lat(),
          lng: e.latLng.lng(),
        };

        markerRef.current?.setMap(null);
        markerRef.current = new google.maps.Marker({
          map,
          position: picked,
        });

        onPick(picked);
      });

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            if (cancelled || !mapRef.current) return;
            const me = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            mapRef.current.setCenter(me);
            mapRef.current.setZoom(14);
          },
          () => {},
        );
      }
    }

    init();

    return () => {
      cancelled = true;
      markerRef.current?.setMap(null);
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (lat == null || lng == null) return;

    const pos = { lat, lng };
    markerRef.current?.setMap(null);
    markerRef.current = new google.maps.Marker({ map, position: pos });
    map.setCenter(pos);
  }, [lat, lng]);

  return (
    <div
      ref={divRef}
      className="w-full overflow-hidden rounded-xl border"
      style={{ height: 360 }}
    />
  );
}
