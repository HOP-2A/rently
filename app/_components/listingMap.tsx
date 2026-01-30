"use client";

import { useEffect, useRef, useState } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

type Props = {
  lat: number | null;
  lng: number | null;
  title?: string;
};

type Info = { status?: string; distance?: string; duration?: string };

export default function ListingMap({ lat, lng, title }: Props) {
  const mapDivRef = useRef<HTMLDivElement | null>(null);

  const mapRef = useRef<google.maps.Map | null>(null);
  const listingMarkerRef = useRef<google.maps.Marker | null>(null);
  const youMarkerRef = useRef<google.maps.Marker | null>(null);

  const directionsServiceRef = useRef<google.maps.DirectionsService | null>(
    null,
  );
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(
    null,
  );

  const currentLocationRef = useRef<google.maps.LatLngLiteral | null>(null);
  const [info, setInfo] = useState<Info>({});

  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
        setInfo({ status: "Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY" });
        return;
      }

      setOptions({
        key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
        v: "weekly",
      });

      const { Map } = (await importLibrary("maps")) as google.maps.MapsLibrary;

      if (cancelled || !mapDivRef.current) return;

      const defaultCenter = { lat: 47.9186, lng: 106.9176 };

      const map = new Map(mapDivRef.current, {
        center: defaultCenter,
        zoom: 13,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      mapRef.current = map;

      directionsServiceRef.current = new google.maps.DirectionsService();
      directionsRendererRef.current = new google.maps.DirectionsRenderer({
        map,
        suppressMarkers: true,
      });


      if (lat != null && lng != null) {
        const pos = { lat, lng };
        listingMarkerRef.current = new google.maps.Marker({
          map,
          position: pos,
          title: title ?? "Listing",
        });

        map.setCenter(pos);
        map.setZoom(15);
      } else {
        setInfo({
          status: "Энэ зар дээр координат алга байна (lat/lng null).",
        });
      }


      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (p) => {
            if (cancelled || !mapRef.current) return;

            currentLocationRef.current = {
              lat: p.coords.latitude,
              lng: p.coords.longitude,
            };

            youMarkerRef.current?.setMap(null);
            youMarkerRef.current = new google.maps.Marker({
              map: mapRef.current,
              position: currentLocationRef.current,
              title: "You",
            });

            if (lat != null && lng != null) {
              const dest = { lat, lng };
              fitToBoth(mapRef.current, currentLocationRef.current, dest);
              drawRoute(dest);
            }
          },
          () => {
            setInfo({ status: "Location permission denied" });
          },
        );
      }
    }

    function fitToBoth(
      map: google.maps.Map,
      a: google.maps.LatLngLiteral,
      b: google.maps.LatLngLiteral,
    ) {
      const bounds = new google.maps.LatLngBounds();
      bounds.extend(a);
      bounds.extend(b);
      map.fitBounds(bounds, 80);
    }

    function drawRoute(destination: google.maps.LatLngLiteral) {
      if (
        !currentLocationRef.current ||
        !directionsServiceRef.current ||
        !directionsRendererRef.current
      ) {
        setInfo({ status: "Waiting for current location..." });
        return;
      }

      setInfo({ status: "Routing..." });

      directionsServiceRef.current.route(
        {
          origin: currentLocationRef.current,
          destination,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status !== "OK" || !result) {
            setInfo({ status: `Route failed: ${status}` });
            return;
          }

          directionsRendererRef.current!.setDirections(result);

          const leg = result.routes?.[0]?.legs?.[0];
          setInfo({
            status: "OK",
            distance: leg?.distance?.text,
            duration: leg?.duration?.text,
          });
        },
      );
    }

    init();

    return () => {
      cancelled = true;
      directionsRendererRef.current?.setMap(null);
      listingMarkerRef.current?.setMap(null);
      youMarkerRef.current?.setMap(null);
    };
  }, [lat, lng, title]);

  return (
    <div className="grid gap-3">
      <div className="text-sm text-gray-700">
        {info.status && <div>Status: {info.status}</div>}
        {info.distance && <div>Distance: {info.distance}</div>}
        {info.duration && <div>Duration: {info.duration}</div>}
        <div className="opacity-70">
          Байршлын зөвшөөрөл өгвөл маршрутыг харуулна
        </div>
      </div>

      <div
        ref={mapDivRef}
        className="w-full overflow-hidden rounded-2xl border"
        style={{ height: 520 }}
      />
    </div>
  );
}
