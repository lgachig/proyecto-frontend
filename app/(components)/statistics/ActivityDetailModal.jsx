"use client";
import { X, User, Clock, MapPin, CreditCard, ShieldCheck } from "lucide-react";

export default function ActivityDetailModal({ user, onClose }) {
  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[999] flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-5xl rounded-[60px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
        
        {/* HEADER */}
        <div className="bg-[#E77D55] p-10 text-white flex justify-between items-center">
          <div>
            <p className="text-xl font-black opacity-80 uppercase italic tracking-widest">Security Report</p>
            <h4 className="text-6xl font-black uppercase tracking-tighter">{user.userId}</h4>
          </div>
          <button 
            onClick={onClose}
            className="bg-white/20 hover:bg-white/40 p-5 rounded-full transition-all hover:rotate-90"
          >
            <X size={45} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-12 grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* LEFT: VISUAL DATA */}
          <div className="space-y-8">
            <div className="aspect-video bg-neutral-900 rounded-[45px] flex flex-col items-center justify-center border-[6px] border-gray-100 relative overflow-hidden group">
              <div className="absolute top-4 left-6 flex items-center gap-2">
                <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                <span className="text-white/50 font-black text-xs uppercase tracking-widest">Live REC</span>
              </div>
              <MapPin size={80} className="text-white/10 mb-4 group-hover:text-[#E77D55] transition-colors" />
              <p className="text-white/30 font-black uppercase tracking-[0.3em] text-sm">Zone Scan {user.zone}</p>
            </div>

            <div className="flex gap-4">
              <div className="flex-1 p-6 bg-green-50 rounded-[30px] border border-green-100 flex items-center gap-4">
                <ShieldCheck className="text-green-600" size={40} />
                <div>
                  <p className="text-green-800 font-black uppercase text-xs">Status</p>
                  <p className="text-xl font-black text-green-600 uppercase italic">Verified</p>
                </div>
              </div>
              <div className="flex-1 p-6 bg-gray-50 rounded-[30px] border border-gray-100 flex items-center gap-4">
                <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-black text-xs">UCE</div>
                <p className="text-gray-600 font-black uppercase text-sm italic underline">Official Record</p>
              </div>
            </div>
          </div>

          {/* RIGHT: TEXT DATA */}
          <div className="flex flex-col justify-center space-y-10">
            <div className="flex items-center gap-8">
              <div className="bg-[#FDEEE7] p-6 rounded-[30px] text-[#E77D55]"><User size={40} /></div>
              <div>
                <p className="text-gray-400 font-black uppercase text-sm tracking-widest mb-1">Full Identity</p>
                <p className="text-4xl font-black text-black uppercase leading-none">{user.name}</p>
                <span className="inline-block mt-2 px-4 py-1 bg-black text-white text-sm font-black uppercase rounded-lg italic">{user.role}</span>
              </div>
            </div>

            <div className="flex items-center gap-8">
              <div className="bg-[#FDEEE7] p-6 rounded-[30px] text-[#E77D55]"><Clock size={40} /></div>
              <div>
                <p className="text-gray-400 font-black uppercase text-sm tracking-widest mb-1">Event Log</p>
                <p className="text-4xl font-black text-black uppercase leading-none">{user.time}</p>
                <p className="text-xl font-bold text-gray-500 mt-1">{user.date}</p>
              </div>
            </div>

            <div className="flex items-center gap-8">
              <div className="bg-[#FDEEE7] p-6 rounded-[30px] text-[#E77D55]"><CreditCard size={40} /></div>
              <div>
                <p className="text-gray-400 font-black uppercase text-sm tracking-widest mb-1">Assigned Location</p>
                <p className="text-4xl font-black text-[#E77D55] uppercase leading-none">{user.zone}</p>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-10 bg-gray-50 border-t border-gray-100 flex justify-between items-center px-16">
          <p className="text-gray-400 font-bold italic">UCE Parking Management System v1.0</p>
          <button 
            onClick={onClose}
            className="px-16 py-6 bg-black text-white rounded-full text-2xl font-black uppercase hover:bg-[#E77D55] transition-all transform hover:scale-105 active:scale-95 shadow-xl"
          >
            Close Report
          </button>
        </div>

      </div>
    </div>
  );
}