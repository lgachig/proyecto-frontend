"use client";

const zones = ["Zone A", "Zone B", "Zone C"];

export default function MapTabs({ activeZone, setActiveZone }) {
  return (
    <div className="flex gap-4 mb-0 font-inter">
      {zones.map((zone) => (
        <button
          key={zone}
          onClick={() => setActiveZone(zone)}
          className={`
            px-20 py-8 text-4xl font-black rounded-t-[30px] transition-all
            ${activeZone === zone 
              ? "bg-white text-black shadow-none border-b-0" 
              : "bg-[#E5E1DD] text-[#8A8581] hover:bg-gray-300"}
          `}
        >
          {zone}
        </button>
      ))}
    </div>
  );
}