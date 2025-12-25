"use client";
import { useState } from "react";
import { Camera, Car, Bell, ShieldCheck, QrCode, Save } from "lucide-react";

export default function UserSettings() {
  const [user, setUser] = useState({
    name: "Juan Pérez",
    role: "Student",
    id: "UCE-2023-0045",
    plate: "PCH-1234",
    carModel: "Toyota Corolla - White"
  });

  return (
    <main className="w-full px-[150px] space-y-12 bg-[#FFF8F2] min-h-screen">
      {/* HEADER */}
      <div>
        <h1 className="text-[80px] font-black text-black uppercase tracking-tighter leading-none mb-2">Settings</h1>
        <p className="text-2xl text-gray-500 font-bold uppercase italic">Manage your profile and vehicle data</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* COLUMNA IZQUIERDA: FOTO Y QR */}
        <div className="space-y-12">
          {/* FOTO DE PERFIL */}
          <div className="bg-white p-10 rounded-[50px] shadow-xl border border-gray-100 flex flex-col items-center text-center">
            <div className="relative group cursor-pointer">
              <div className="w-48 h-48 bg-gray-200 rounded-full border-[8px] border-[#E77D55] overflow-hidden">
                <img 
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Juan" 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="text-white" size={40} />
              </div>
            </div>
            <h2 className="mt-6 text-4xl font-black uppercase">{user.name}</h2>
            <span className="px-6 py-2 bg-black text-white rounded-full text-sm font-black uppercase mt-2">
              {user.role}
            </span>
          </div>

          {/* QR CODE DE ACCESO */}
          <div className="bg-[#E77D55] p-10 rounded-[50px] shadow-2xl text-white flex flex-col items-center">
            <QrCode size={180} strokeWidth={1.5} />
            <p className="mt-6 text-xl font-black uppercase tracking-widest italic">Your Access Pass</p>
            <p className="text-white/60 text-sm mt-2 font-bold">{user.id}</p>
          </div>
        </div>

        {/* COLUMNA DERECHA: FORMULARIOS */}
        <div className="lg:col-span-2 space-y-12">
          
          {/* INFORMACIÓN PERSONAL */}
          <div className="bg-white p-12 rounded-[60px] shadow-xl border border-gray-100">
            <div className="flex items-center gap-6 mb-10 text-black">
              <ShieldCheck size={45} className="text-[#E77D55]" />
              <h3 className="text-4xl font-black uppercase">Personal Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-lg font-black text-gray-400 uppercase italic ml-4">Full Name</label>
                <input 
                  type="text" 
                  defaultValue={user.name}
                  className="w-full p-8 bg-gray-50 rounded-[30px] text-2xl font-black border-2 border-transparent focus:border-[#E77D55] outline-none"
                />
              </div>
              <div className="space-y-3">
                <label className="text-lg font-black text-gray-400 uppercase italic ml-4">Institutional ID</label>
                <input 
                  type="text" 
                  readOnly
                  value={user.id}
                  className="w-full p-8 bg-gray-100 rounded-[30px] text-2xl font-black text-gray-400 border-none outline-none cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* VEHICLE DETAILS */}
          <div className="bg-white p-12 rounded-[60px] shadow-xl border border-gray-100">
            <div className="flex items-center gap-6 mb-10 text-black">
              <Car size={45} className="text-[#E77D55]" />
              <h3 className="text-4xl font-black uppercase">Vehicle Details</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-lg font-black text-gray-400 uppercase italic ml-4">License Plate</label>
                <input 
                  type="text" 
                  defaultValue={user.plate}
                  className="w-full p-8 bg-gray-50 rounded-[30px] text-4xl font-black border-2 border-transparent focus:border-[#E77D55] outline-none uppercase"
                />
              </div>
              <div className="space-y-3">
                <label className="text-lg font-black text-gray-400 uppercase italic ml-4">Car Model & Color</label>
                <input 
                  type="text" 
                  defaultValue={user.carModel}
                  className="w-full p-8 bg-gray-50 rounded-[30px] text-2xl font-black border-2 border-transparent focus:border-[#E77D55] outline-none"
                />
              </div>
            </div>
          </div>

          {/* BOTÓN GUARDAR */}
          <button className="w-full py-10 bg-black text-white rounded-[40px] text-3xl font-black uppercase flex items-center justify-center gap-6 hover:bg-[#E77D55] transition-all transform hover:scale-[1.02] active:scale-95 shadow-2xl">
            <Save size={40} />
            Save Changes
          </button>

        </div>
      </div>
    </main>
  );
}