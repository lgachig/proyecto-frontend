"use client";
import { useState } from "react";
import { History, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import ActivityDetailModal from "./ActivityDetailModal";
import { useRecentActivity } from "../../../hooks/useParking";
import { useZones } from "../../../hooks/useParking";

export default function RecentActivityTable({ zoneId }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const { data: activitiesData, isLoading } = useRecentActivity({ 
    limit: "20",
    zoneId: zoneId || undefined 
  });
  const { data: zones } = useZones();

  // Transform session data to activity format
  const activities = activitiesData?.map((session, index) => {
    const entryTime = new Date(session.entry_time);
    const zone = zones?.find(z => z.id === session.zone_id);
    const isActive = session.status === 'active';
    
    return {
      id: session.id,
      userId: session.user_id,
      zone: zone?.name || session.zone_id,
      type: isActive ? "Entry" : "Exit",
      time: entryTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      date: entryTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      name: session.user_id, // Will be replaced with actual user name if available
      role: "User",
      session: session,
    };
  }) || [];

  return (
    <div className="bg-white rounded-[50px] shadow-xl p-12 border border-gray-100 w-full mt-16 font-inter">
      <div className="flex items-center gap-6 mb-12">
        <History size={50} className="text-parking-primary" strokeWidth={3} />
        <h3 className="text-4xl font-black uppercase text-black">Recent Activity Log</h3>
      </div>

      <div className="overflow-x-auto max-h-[600px] overflow-y-auto pr-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-2xl font-black text-gray-400">Loading activities...</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-2xl font-black text-gray-400">No recent activities</p>
          </div>
        ) : (
          <table className="w-full border-separate border-spacing-y-4">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="text-2xl font-black text-gray-400 uppercase italic">
                <th className="px-10 py-6 text-left">User ID</th>
                <th className="px-10 py-6 text-left">Target Zone</th>
                <th className="px-10 py-6 text-left">Event</th>
                <th className="px-10 py-6 text-left">Timestamp</th>
                <th className="px-10 py-6 text-right">Details</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((item) => (
              <tr key={item.id} className="bg-gray-50/70 hover:bg-gray-100 transition-all rounded-[35px]">
                <td className="px-10 py-9 text-4xl font-black text-black rounded-l-[35px]">{item.userId}</td>
                <td className="px-10 py-9 text-2xl font-bold text-gray-600 uppercase">{item.zone}</td>
                <td className="px-10 py-9">
                  <div className={`flex items-center gap-4 text-2xl font-black uppercase ${item.type === 'Entry' ? 'text-green-600' : 'text-orange-600'}`}>
                    {item.type === 'Entry' ? <ArrowDownLeft size={32} /> : <ArrowUpRight size={32} />}
                    {item.type}
                  </div>
                </td>
                <td className="px-10 py-9 text-2xl font-bold text-gray-500">{item.time}</td>
                <td className="px-10 py-9 text-right rounded-r-[35px]">
                  <button 
                    onClick={() => setSelectedUser(item)}
                    className="bg-black text-white px-10 py-4 rounded-full text-xl font-black uppercase hover:bg-parking-primary-action transition-all transform active:scale-95"
                  >
                    View
                  </button>
                </td>
              </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* COMPONENTE MODAL APARTE */}
      <ActivityDetailModal 
        user={selectedUser} 
        onClose={() => setSelectedUser(null)} 
      />
    </div>
  );
}