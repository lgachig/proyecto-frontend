"use client";

import { useState } from "react";
import Header from "./Header";
import '../globals.css';
import Sidebar from "./layout/Sidebar";

export default function ComponentsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="relative flex h-screen overflow-hidden bg-[#FEF7F1]">
            {/* Sidebar: Ahora sí le pasamos la función para cerrar */}
            <div className={`
                fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
            `}>
                <Sidebar onClose={toggleSidebar} />
            </div>

            {/* Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/20 z-40 transition-opacity"
                    onClick={toggleSidebar}
                />
            )}

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header onLogoClick={toggleSidebar} />
                <main className="flex-1 overflow-y-auto p-4">
                    {children}
                </main>
            </div>
        </div>
    );
}