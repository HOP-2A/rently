"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

type ListingFromApi = {
  id: string;
  lat: number | null;
  lng: number | null;
  title?: string | null;
  address?: string | null;
};

type Info = { status?: string; distance?: string; duration?: string };

export default function SimpleGoogleMap({ listingId }: { listingId: string }) {
  const mapDivRef = useRef<HTMLDivElement | null>(null);

  const mapRef = useRef<google.maps.Map | null>(null);
  const directionsServiceRef = useRef<google.maps.DirectionsService | null>(
    null,
  );
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(
    null,
  );

  const youMarkerRef = useRef<google.maps.Marker | null>(null);
  const listingMarkerRef = useRef<google.maps.Marker | null>(null);

  const currentLocationRef = useRef<google.maps.LatLngLiteral | null>(null);

  const [info, setInfo] = useState<Info>({});
  const [listing, setListing] = useState<ListingFromApi | null>(null);
  const [loadingListing, setLoadingListing] = useState(true);

  const listingPos = useMemo(() => {
    if (listing?.lat == null || listing?.lng == null) return null;
    return { lat: listing.lat, lng: listing.lng };
  }, [listing?.lat, listing?.lng]);

  useEffect(() => {
    if (!listingId) return;

    let cancelled = false;

    (async () => {
      try {
        setLoadingListing(true);
        const res = await fetch(`/api/getListning/${listingId}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`Listing fetch failed: ${res.status}`);

        const data = (await res.json()) as ListingFromApi | null;
        if (!cancelled) setListing(data);
      } catch (e) {
        console.error(e);
        if (!cancelled) setListing(null);
      } finally {
        if (!cancelled) setLoadingListing(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [listingId]);

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

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            if (cancelled || !mapRef.current) return;

            currentLocationRef.current = {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            };

            youMarkerRef.current?.setMap(null);
            youMarkerRef.current = new google.maps.Marker({
              map: mapRef.current,
              position: currentLocationRef.current,
              title: "You are here",
            });

            if (listingPos) {
              fitToBoth(mapRef.current, currentLocationRef.current, listingPos);
              drawRoute(listingPos);
            } else {
              mapRef.current.setCenter(currentLocationRef.current);
              mapRef.current.setZoom(14);
            }
          },
          () => setInfo({ status: "Location permission denied" }),
        );
      }
    }

    init();

    return () => {
      cancelled = true;
      directionsRendererRef.current?.setMap(null);
      youMarkerRef.current?.setMap(null);
      listingMarkerRef.current?.setMap(null);
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    listingMarkerRef.current?.setMap(null);

    if (!listingPos) {
      if (!loadingListing) setInfo({ status: "Listing has no coordinates" });
      return;
    }

    listingMarkerRef.current = new google.maps.Marker({
      map,
      position: listingPos,
      title: listing?.title ?? listing?.address ?? "Listing",
    });

    if (currentLocationRef.current) {
      fitToBoth(map, currentLocationRef.current, listingPos);
      drawRoute(listingPos);
    } else {
      map.setCenter(listingPos);
      map.setZoom(15);
    }
  }, [listingPos?.lat, listingPos?.lng, loadingListing]);

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

  return (
    <div className="grid gap-3">
      <div className="text-sm">
        {info.status && <div>Status: {info.status}</div>}
        {info.distance && <div>Distance: {info.distance}</div>}
        {info.duration && <div>Duration: {info.duration}</div>}
        {!listingPos && !loadingListing && (
          <div className="opacity-70">
            Энэ зар дээр координат алга байна (lat/lng null).
          </div>
        )}
      </div>

      <div
        ref={mapDivRef}
        className="w-full overflow-hidden rounded-2xl border"
        style={{ height: 520 }}
      />
    </div>
  );
}
