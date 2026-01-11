"use client";
import { useState, useEffect } from "react";
import { Camera, Car, ShieldCheck, QrCode, Save } from "lucide-react";
import { useCurrentUser } from "../../../hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { updateFullUserProfile } from "../../../lib/supabaseClient";

export default function UserSettings() {
  const { user: currentUser } = useCurrentUser();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "", 
    role: "",
    id: "",
    plate: "", 
    make: "", 
    model: "", 
    color: "", 
    email: "", 
    phone: ""
  });

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.full_name || "",
        role: currentUser.role_id === 'r001' ? 'Estudiante' : 'Personal',
        id: currentUser.institutional_id || "",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
        plate: currentUser.vehicles?.license_plate || "",
        make: currentUser.vehicles?.make || "",
        model: currentUser.vehicles?.model || "",
        color: currentUser.vehicles?.color || "",
      });
    }
  }, [currentUser]);

  const handleSave = async () => {
    if (!currentUser?.id) return;
    setIsSaving(true);
    try {
      await updateFullUserProfile(currentUser.id, formData);
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      alert("¡Guardado correctamente!");
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="w-full px-[150px] space-y-12 bg-parking-tertiary min-h-screen font-inter pt-10">
      
      <div>
        <h1 className="text-[80px] font-black text-black uppercase tracking-tighter leading-none mb-2">Settings</h1>
        <p className="text-2xl text-gray-500 font-bold uppercase italic">Manage your profile and vehicle data</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        <div className="space-y-12">
          <div className="bg-white p-10 rounded-[50px] shadow-xl border border-gray-100 flex flex-col items-center text-center">
            <div className="relative group cursor-pointer">
              <div className="w-48 h-48 bg-gray-200 rounded-full border-[8px] border-parking-primary overflow-hidden">
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}`} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="text-white" size={40} />
              </div>
            </div>
            
            <h2 className="mt-6 text-4xl font-black uppercase">{formData.name || "Cargando..."}</h2>
            <span className="px-6 py-2 bg-black text-white rounded-full text-sm font-black uppercase mt-2">
              {formData.role}
            </span>
          </div>

          <div className="bg-parking-primary-action p-10 rounded-[50px] shadow-2xl text-white flex flex-col items-center">
            <QrCode size={180} strokeWidth={1.5} />
            <p className="mt-6 text-xl font-black uppercase tracking-widest italic">Your Access Pass</p>
            <p className="text-white/60 text-sm mt-2 font-bold">{formData.id}</p>
          </div>
        </div>

       
        <div className="lg:col-span-2 space-y-12">
          
          <div className="bg-white p-12 rounded-[60px] shadow-xl border border-gray-100">
            <div className="flex items-center gap-6 mb-10 text-black">
              <ShieldCheck size={45} className="text-parking-primary" />
              <h3 className="text-4xl font-black uppercase">Personal Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-lg font-black text-gray-400 uppercase italic ml-4">Full Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-8 bg-gray-50 rounded-[30px] text-2xl font-black border-2 border-transparent focus:border-parking-primary outline-none"
                />
              </div>
              <div className="space-y-3">
                <label className="text-lg font-black text-gray-400 uppercase italic ml-4">Email</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full p-8 bg-gray-50 rounded-[30px] text-2xl font-black border-2 border-transparent focus:border-parking-primary outline-none"
                />
              </div>
              <div className="space-y-3">
                <label className="text-lg font-black text-gray-400 uppercase italic ml-4">Phone</label>
                <input 
                  type="tel" 
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full p-8 bg-gray-50 rounded-[30px] text-2xl font-black border-2 border-transparent focus:border-parking-primary outline-none"
                />
              </div>
              <div className="space-y-3">
                <label className="text-lg font-black text-gray-400 uppercase italic ml-4">Institutional ID</label>
                <input type="text" readOnly value={formData.id} className="w-full p-8 bg-gray-100 rounded-[30px] text-2xl font-black text-gray-400 cursor-not-allowed"/>
              </div>
            </div>
          </div>

          <div className="bg-white p-12 rounded-[60px] shadow-xl border border-gray-100">
            <div className="flex items-center gap-6 mb-10 text-black">
              <Car size={45} className="text-parking-primary" />
              <h3 className="text-4xl font-black uppercase">Vehicle Details</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-3">
                <label className="text-lg font-black text-gray-400 uppercase italic ml-4">License Plate</label>
                <input 
                  type="text" 
                  value={formData.plate}
                  onChange={(e) => setFormData(prev => ({ ...prev, plate: e.target.value.toUpperCase() }))}
                  className="w-full p-8 bg-gray-50 rounded-[30px] text-4xl font-black border-2 border-transparent focus:border-parking-primary outline-none uppercase"
                />
              </div>
              <div className="space-y-3">
                <label className="text-lg font-black text-gray-400 uppercase italic ml-4">Make</label>
                <input 
                  type="text" 
                  value={formData.make}
                  onChange={(e) => setFormData(prev => ({ ...prev, make: e.target.value }))}
                  className="w-full p-8 bg-gray-50 rounded-[30px] text-2xl font-black border-2 border-transparent focus:border-parking-primary outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-lg font-black text-gray-400 uppercase italic ml-4">Model</label>
                <input 
                  type="text" 
                  value={formData.model}
                  onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                  className="w-full p-8 bg-gray-50 rounded-[30px] text-2xl font-black border-2 border-transparent focus:border-parking-primary outline-none"
                />
              </div>
              <div className="space-y-3">
                <label className="text-lg font-black text-gray-400 uppercase italic ml-4">Color</label>
                <input 
                  type="text" 
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="w-full p-8 bg-gray-50 rounded-[30px] text-2xl font-black border-2 border-transparent focus:border-parking-primary outline-none"
                />
              </div>
            </div>
          </div>

          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="w-full py-10 bg-black text-white rounded-[40px] text-3xl font-black uppercase flex items-center justify-center gap-6 hover:bg-parking-primary-action transition-all shadow-2xl disabled:opacity-50"
          >
            <Save size={40} />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </main>
  );
}