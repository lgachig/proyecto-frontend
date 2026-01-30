import { Link, useLocation } from 'react-router-dom';
import { Map, Calendar, Car, BarChart3, Receipt, Settings, X } from 'lucide-react';
import { useSidebar } from '../../contexts/SidebarContext';

/**
 * Sidebar navigation component. Shows different menu items based on user role.
 * On mobile: hidden by default, slides in as overlay when toggle is pressed.
 * On desktop (md+): always visible, fixed on the left.
 */
export default function Sidebar({ role }) {
  const location = useLocation();
  const { isOpen, close } = useSidebar();
  const pathname = location.pathname;

  const menuItems = {
    admin: [
      { name: 'Dashboard', href: '/admin', icon: <BarChart3 size={24} /> },
      { name: 'Reportes', href: '/admin/reports', icon: <Receipt size={24} /> },
      { name: 'Gestión Slots', href: '/admin/slots', icon: <Settings size={24} /> },
    ],
    student: [
      { name: 'Mapa Parqueadero', href: '/user', icon: <Map size={24} /> },
      { name: 'Mis Reservas', href: '/user/reservations', icon: <Calendar size={24} /> },
      { name: 'Mi Vehículo', href: '/user/vehicle', icon: <Car size={24} /> },
    ],
  };

  const currentMenu = role === 'admin' ? menuItems.admin : menuItems.student;
  const displayRole = role === 'admin' ? 'Administrador' : role === 'teacher' ? 'Docente' : 'Estudiante';

  return (
    <>
      {/* Backdrop for mobile - closes sidebar when clicked */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          w-72 md:w-[15%] min-w-[240px] h-screen bg-[#001529] text-white p-6
          fixed left-0 top-0 shadow-2xl z-50
          transition-transform duration-300 ease-in-out
          md:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex items-center justify-between mb-10 px-2">
          <div>
            <div className="text-4xl font-black tracking-tighter italic text-white">
              UCE <span className="text-blue-500">SMART</span>
            </div>
            <div className="text-[20px] font-bold text-blue-300/50 uppercase tracking-[0.3em] mt-2">
              Parking System
            </div>
          </div>
          <button
            onClick={close}
            className="md:hidden p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="space-y-3">
          {currentMenu.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={close}
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-200 group ${
                  isActive ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <span className={`${isActive ? 'text-white' : 'text-gray-500 group-hover:text-blue-400'}`}>
                  {item.icon}
                </span>
                <span className="font-black text-xl tracking-tight uppercase">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-10 left-6 right-6">
          <div className="p-4 bg-gray-800/50 rounded-2xl border border-gray-700">
            <p className="text-2xl font-black text-gray-500 uppercase leading-none">Rol</p>
            <p className="text-xl font-bold text-blue-400 uppercase italic leading-tight">{displayRole}</p>
          </div>
        </div>
      </aside>
    </>
  );
}
