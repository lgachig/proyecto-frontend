import Link from 'next/link';

export default function Sidebar({ role }) {
  const menuItems = {
    admin: [
      { name: 'Dashboard', href: '/admin', icon: '📊' },
      { name: 'Reportes Stripe', href: '/admin/reports', icon: '💰' },
      { name: 'Gestión Slots', href: '/admin/slots', icon: '🅿️' },
    ],
    student: [
      { name: 'Mapa Parqueadero', href: '/user/map', icon: '📍' },
      { name: 'Mis Reservas', href: '/user/reservations', icon: '📅' },
      { name: 'Mi Vehículo', href: '/user/vehicle', icon: '🚗' },
    ],
    teacher: [
      { name: 'Mapa Priority', href: '/user/map', icon: '🌟' },
      { name: 'Mi Perfil', href: '/user/profile', icon: '👤' },
    ]
  };

  const currentMenu = menuItems[role] || menuItems.student;

  return (
    <aside className="w-64 h-screen bg-gray-900 text-white p-6 hidden md:block fixed">
      <div className="mb-10 text-xl font-black italic border-b border-gray-700 pb-4">
        UCE SMART PARKING
      </div>
      <nav className="space-y-4">
        {currentMenu.map((item) => (
          <Link key={item.name} href={item.href} 
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-600 transition-colors">
            <span>{item.icon}</span>
            <span className="font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}