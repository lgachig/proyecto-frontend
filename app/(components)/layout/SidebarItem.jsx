"use client";
import Link from 'next/link';

const SidebarItem = ({ icon: Icon, label, href, active }) => {
  return (
    <Link href={href} className="block w-[90%]">
      <div className={`
        flex items-center gap-6 px-10 py-8 rounded-2xl cursor-pointer transition-all w-full font-inter
        ${active 
          ? 'bg-parking-primary-lighter text-parking-primary font-bold shadow-sm' 
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'}
      `}>
        <span className={active ? 'text-parking-primary' : 'text-gray-400'}>
          {/* Icono restaurado a tamaño 40 */}
          <Icon size={40} />
        </span>
        {/* Letras del menú aumentadas a text-3xl */}
        <span className="text-3xl tracking-tight">{label}</span>
      </div>
    </Link>
  );
};

export default SidebarItem;