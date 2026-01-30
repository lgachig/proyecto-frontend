"use client";
import { useState } from "react";
import { History, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import ActivityDetailModal from "./ActivityDetailModal"; // IMPORTACIÓN

export default function RecentActivityTable() {
  const [selectedUser, setSelectedUser] = useState(null);

  const activities = [
    { id: 1, userId: "USR-8821", zone: "Zone A", type: "Entry", time: "10:15 AM", date: "Oct 24, 2023", name: "Juan Pérez", role: "Student" },
    { id: 2, userId: "USR-4432", zone: "Zone C", type: "Exit", time: "09:42 AM", date: "Oct 24, 2023", name: "Dra. María Luz", role: "Faculty" },
    { id: 3, userId: "USR-1099", zone: "Zone B", type: "Entry", time: "08:20 AM", date: "Oct 24, 2023", name: "Carlos Ruiz", role: "Staff" },
    { id: 4, userId: "USR-7720", zone: "Zone A", type: "Exit", time: "07:55 AM", date: "Oct 24, 2023", name: "Ana Bernal", role: "Student" },
  ];

  return (
    <div className="bg-white rounded-[50px] shadow-xl p-12 border border-gray-100 w-full mt-16 font-inter">
      <div className="flex items-center gap-6 mb-12">
        <History size={50} className="text-parking-primary" strokeWidth={3} />
        <h3 className="text-4xl font-black uppercase text-black">Recent Activity Log</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-y-4">
          <thead>
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
      </div>

      {/* COMPONENTE MODAL APARTE */}
      <ActivityDetailModal 
        user={selectedUser} 
        onClose={() => setSelectedUser(null)} 
      />
    </div>
  );
}