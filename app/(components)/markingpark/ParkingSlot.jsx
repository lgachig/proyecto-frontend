"use client";
import { Marker } from "react-leaflet";
import L from "leaflet";

export default function ParkingSlot({ slot, isSelected, onClick, isUserInside }) {
  return (
    <Marker 
      position={[slot.lat, slot.lng]}
      interactive={true}
      bubblingMouseEvents={false}
      eventHandlers={{ 
        mousedown: (e) => { 
          L.DomEvent.stopPropagation(e);
          if (isUserInside) onClick(slot); 
        } 
      }}
      icon={L.divIcon({ 
        html: `<div style="background-color: ${isSelected ? '#FACC15' : '#4ADE80'}; width: 22px; height: 26px; border: 2px solid white; border-radius: 4px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); cursor: pointer;"></div>`, 
        className: "marker-pin",
        iconSize: [22, 26],
        iconAnchor: [11, 13]
      })}
    />
  );
}