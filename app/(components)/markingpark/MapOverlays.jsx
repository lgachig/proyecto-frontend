export default function MapOverlays({ isUserInside, selectedSlot, onActivateGPS, onClearSelection }) {
    return (
      <>
        {!isUserInside && (
          <div className="absolute inset-0 z-[500] bg-white/60 backdrop-blur-md flex items-center justify-center">
            <div className="bg-white p-8 rounded-[2rem] shadow-2xl text-center border-b-4 border-orange-400">
               <h4 className="text-xl font-black uppercase italic text-gray-800 tracking-tighter">MAPA BLOQUEADO</h4>
               <p className="text-gray-500 font-bold text-sm mt-2">ESCANEÉ EL CÓDIGO QR</p>
            </div>
          </div>
        )}
  
        {selectedSlot && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[450] bg-white px-6 py-3 rounded-2xl shadow-2xl border-2 border-blue-500 flex items-center gap-3">
             <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-black">P</div>
             <span className="text-lg font-black text-gray-800 uppercase italic leading-none">{selectedSlot.id}</span>
             <button onClick={onClearSelection} className="ml-2 text-gray-400 hover:text-red-500">✕</button>
          </div>
        )}
  
        {isUserInside && !onActivateGPS.status && (
          <div className="absolute inset-0 z-[400] bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <button onClick={onActivateGPS.fn} className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg uppercase italic transition-transform active:scale-95">
              Activar Navegación GPS
            </button>
          </div>
        )}
      </>
    );
  }