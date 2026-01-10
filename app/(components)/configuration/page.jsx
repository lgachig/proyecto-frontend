"use client";
import { useState, useEffect } from "react";
import { Camera, Car, Bell, ShieldCheck, QrCode, Save } from "lucide-react";
import { useCurrentUser } from "../../../hooks/useAuth";
import { apiService } from "../../../lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function UserSettings() {
  const currentUser = useCurrentUser();
  const queryClient = useQueryClient();
  const [user, setUser] = useState({
    name: "",
    role: "",
    id: "",
    plate: "",
    carModel: "",
    email: "",
    phone: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  // Load user data
  useEffect(() => {
    if (currentUser) {
      setUser({
        name: currentUser.full_name || "",
        role: currentUser.role?.display_name || currentUser.role?.name || "",
        id: currentUser.institutional_id || "",
        plate: "",
        carModel: "",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
      });

      // Load vehicle data
      if (currentUser.id) {
        // Try to get from currentUser first (from login response)
        if (currentUser.vehicles && currentUser.vehicles.length > 0) {
          const vehicle = currentUser.vehicles[0];
          setUser(prev => ({
            ...prev,
            plate: vehicle.license_plate || "",
            carModel: `${vehicle.make || ""} ${vehicle.model || ""} - ${vehicle.color || ""}`.trim(),
          }));
        } else {
          // Fallback to API call
          apiService.getUser(currentUser.id).then((userData) => {
            if (userData.vehicles && userData.vehicles.length > 0) {
              const vehicle = userData.vehicles[0];
              setUser(prev => ({
                ...prev,
                plate: vehicle.license_plate || "",
                carModel: `${vehicle.make || ""} ${vehicle.model || ""} - ${vehicle.color || ""}`.trim(),
              }));
            }
          }).catch((err) => {
            console.log('Could not load vehicle data:', err);
          });
        }
      }
    }
  }, [currentUser]);

  const handleSave = async () => {
    if (!currentUser?.id) {
      alert('User not found. Please login again.');
      return;
    }
    
    setIsSaving(true);
    try {
      // Split carModel into make, model, color
      const carParts = user.carModel.split(" - ");
      const makeModel = carParts[0]?.trim().split(" ") || [];
      const make = makeModel[0] || "";
      const model = makeModel.slice(1).join(" ") || "";
      const color = carParts[1]?.trim() || "";

      const updateData = {
        full_name: user.name,
        phone: user.phone,
        email: user.email,
      };

      // Only include vehicle if we have plate data
      if (user.plate) {
        updateData.vehicle = {
          license_plate: user.plate.toUpperCase(),
          make: make,
          model: model,
          color: color,
        };
      }

      const updatedUser = await apiService.updateUser(currentUser.id, updateData);

      // Update local storage
      if (typeof window !== 'undefined') {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        storedUser.full_name = user.name;
        storedUser.phone = user.phone;
        storedUser.email = user.email;
        if (updatedUser.vehicles && updatedUser.vehicles.length > 0) {
          storedUser.vehicles = updatedUser.vehicles;
        }
        localStorage.setItem('user', JSON.stringify(storedUser));
      }

      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert(`Error saving settings: ${error.message || 'Please try again.'}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="w-full px-[150px] space-y-12 bg-parking-tertiary min-h-screen font-inter">
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
              <div className="w-48 h-48 bg-gray-200 rounded-full border-[8px] border-parking-primary overflow-hidden">
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
          <div className="bg-parking-primary-action p-10 rounded-[50px] shadow-2xl text-white flex flex-col items-center">
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
              <ShieldCheck size={45} className="text-parking-primary" />
              <h3 className="text-4xl font-black uppercase">Personal Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-lg font-black text-gray-400 uppercase italic ml-4">Full Name</label>
                <input 
                  type="text" 
                  value={user.name}
                  onChange={(e) => setUser(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-8 bg-gray-50 rounded-[30px] text-2xl font-black border-2 border-transparent focus:border-parking-primary outline-none"
                />
              </div>
              <div className="space-y-3">
                <label className="text-lg font-black text-gray-400 uppercase italic ml-4">Email</label>
                <input 
                  type="email" 
                  value={user.email}
                  onChange={(e) => setUser(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full p-8 bg-gray-50 rounded-[30px] text-2xl font-black border-2 border-transparent focus:border-parking-primary outline-none"
                />
              </div>
              <div className="space-y-3">
                <label className="text-lg font-black text-gray-400 uppercase italic ml-4">Phone</label>
                <input 
                  type="tel" 
                  value={user.phone}
                  onChange={(e) => setUser(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full p-8 bg-gray-50 rounded-[30px] text-2xl font-black border-2 border-transparent focus:border-parking-primary outline-none"
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
              <Car size={45} className="text-parking-primary" />
              <h3 className="text-4xl font-black uppercase">Vehicle Details</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-lg font-black text-gray-400 uppercase italic ml-4">License Plate</label>
                <input 
                  type="text" 
                  value={user.plate}
                  onChange={(e) => setUser(prev => ({ ...prev, plate: e.target.value.toUpperCase() }))}
                  className="w-full p-8 bg-gray-50 rounded-[30px] text-4xl font-black border-2 border-transparent focus:border-parking-primary outline-none uppercase"
                />
              </div>
              <div className="space-y-3">
                <label className="text-lg font-black text-gray-400 uppercase italic ml-4">Car Model & Color</label>
                <input 
                  type="text" 
                  value={user.carModel}
                  onChange={(e) => setUser(prev => ({ ...prev, carModel: e.target.value }))}
                  className="w-full p-8 bg-gray-50 rounded-[30px] text-2xl font-black border-2 border-transparent focus:border-parking-primary outline-none"
                  placeholder="e.g., Toyota Corolla - White"
                />
              </div>
            </div>
          </div>

          {/* BOTÓN GUARDAR */}
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="w-full py-10 bg-black text-white rounded-[40px] text-3xl font-black uppercase flex items-center justify-center gap-6 hover:bg-parking-primary-action transition-all transform hover:scale-[1.02] active:scale-95 shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={40} />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>

        </div>
      </div>
    </main>
  );
}