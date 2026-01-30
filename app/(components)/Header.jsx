"use client";

export default function Header({ onLogoClick }) {
  return (
    <header className="bg-parking-secondary px-35 py-6 flex items-center justify-between font-inter">
      {/* Sección Izquierda: Logo y Nombre */}
      <div className="flex items-center gap-6">
        {/* Envolvemos tu logo original en un botón con tu clase h-30 */}
        <button 
          onClick={onLogoClick}
          className="hover:opacity-80 transition-opacity focus:outline-none"
        >
          <img src="./logo.png" alt="logo" className="h-30 w-auto" />
        </button>

        <h1 className="text-6xl text-parking-text-primary">
          Welcome, <span className="font-bold text-parking-primary-light">Luis Achig</span>
        </h1>
      </div>

      {/* Sección Derecha: Fecha, Hora y Perfil */}
      <div className="flex items-center gap-8">
        <div className="text-3xl text-parking-text-muted font-medium border-r border-parking-text-muted pr-8">
          Monday, 24 April | <span className="ml-2">11:45 AM</span>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Icono de campana (Notificación) */}
          <button className="p-3 rounded-[30px] bg-white shadow-sm border border-gray-100 text-parking-text-muted">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-15 w-15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          
          {/* Imagen de Usuario */}
          <div className="h-30 w-30 rounded-full overflow-hidden border-2 border-white shadow-md">
            <img 
              src="./userLogo.JPG" 
              alt="User profile" 
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
}