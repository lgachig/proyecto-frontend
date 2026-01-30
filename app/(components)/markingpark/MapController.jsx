"use client";
import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

export default function MapController({ routePoints }) {
  const map = useMap();
  useEffect(() => {
    map.setMinZoom(16);
    map.setMaxZoom(24);
    if (routePoints && routePoints.length > 0) {
      const bounds = L.latLngBounds(routePoints);
      map.flyToBounds(bounds, { padding: [40, 40], duration: 1.5 });
    }
  }, [routePoints, map]);
  return null;
}