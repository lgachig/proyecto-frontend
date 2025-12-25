"use client";
import React from "react";

export const QRActionButton = ({ onClick, isInside }) => (
  <button 
    onClick={onClick}
    className={`${isInside ? 'bg-[#E1E9DE]' : 'bg-[#FEDCB7]'} p-8 rounded-[3rem] shadow-sm border border-black/5 flex items-center gap-6 hover:scale-105 transition-all group font-inter`}
  >
    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-4xl shadow-inner group-hover:rotate-12 transition-transform">
      {isInside ? '🏁' : '📱'}
    </div>
    <div className="flex flex-col text-left">
      <span className="font-black text-gray-800 text-[22px] uppercase leading-none tracking-tighter">
        {isInside ? 'Finalizar' : 'Acceso UCE'}
      </span>
      <span className="text-[14px] text-gray-500 font-bold uppercase tracking-widest mt-1">
        {isInside ? 'Ver total y salir' : 'Escanear entrada'}
      </span>
    </div>
  </button>
);

export const QRModal = ({ isOpen, onClose, isInside, onScan, userType, fee }) => {
  if (!isOpen) return null;

  const handleAction = () => {
    onScan();
    setTimeout(onClose, 500);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-[200] flex items-center justify-center p-10 font-inter text-gray-900">
      <div className="bg-white rounded-[5rem] p-16 shadow-2xl max-w-2xl w-full flex flex-col items-center border-[12px] border-[#FEDCB7] relative overflow-hidden">
        
        {/* Etiqueta de Tipo de Usuario */}
        <div className="absolute top-8 right-12 bg-gray-900 text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest">
          {userType}
        </div>

        <h3 className="text-6xl font-black mb-2 tracking-tighter italic uppercase text-center">
          {isInside ? 'Punto de Salida' : 'Punto de Entrada'}
        </h3>
        
        <div 
          onClick={handleAction}
          className="bg-[#FBF0EA] p-10 rounded-[4rem] my-10 border-4 border-dashed border-[#FEDCB7] cursor-pointer hover:bg-[#FEDCB7]/20 transition-all group"
        >
           <div className="w-[280px] h-[280px] bg-white rounded-[2.5rem] shadow-inner flex items-center justify-center">
              <span className="text-9xl group-hover:scale-110 transition-transform italic font-black">QR</span>
           </div>
           <p className="text-center mt-4 font-black text-gray-400 text-xs uppercase italic animate-pulse">Toca para simular escaneo</p>
        </div>

        {/* Lógica de Tarifas */}
        <div className={`w-full p-10 rounded-[3rem] mb-10 flex flex-col gap-2 ${isInside ? 'bg-[#E1E9DE]' : 'bg-[#FFD5C2]'}`}>
           <div className="flex justify-between items-center">
              <span className="font-black text-gray-600 uppercase text-xs tracking-widest">Tiempo: 02:14:55</span>
              <span className="font-black text-gray-600 uppercase text-xs tracking-widest">Tarifa: ${fee}/hora</span>
           </div>
           <div className="flex justify-between items-end mt-2">
              <span className="font-black text-3xl uppercase italic leading-none">Total a Pagar:</span>
              <span className="font-black text-5xl tracking-tighter leading-none">
                {isInside ? `$${(fee * 2.25).toFixed(2)}` : '$0.00'}
              </span>
           </div>
        </div>

        <button onClick={onClose} className="w-full py-8 bg-black text-white rounded-[3rem] font-black uppercase text-2xl hover:scale-95 transition-all">
          Cancelar
        </button>
      </div>
    </div>
  );
};