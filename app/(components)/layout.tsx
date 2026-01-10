"use client";

import { useState } from "react";
import Header from "./Header";
import '../globals.css';
import Sidebar from "./layout/Sidebar";
import { ToastContainer } from "./ui/Toast";
import { useToast } from "../../hooks/useToast";

export default function ComponentsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { toasts, removeToast } = useToast();

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="relative flex h-screen overflow-hidden bg-parking-secondary font-inter">
            {/* Sidebar: Ahora sí le pasamos la función para cerrar */}
            <div className={`
                fixed inset-y-0 left-0 z-[100] transform transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
            `}>
                <Sidebar onClose={toggleSidebar} />
            </div>

            {/* Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/20 z-[90] transition-opacity"
                    onClick={toggleSidebar}
                />
            )}

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header onLogoClick={toggleSidebar} />
                <main className="flex-1 overflow-y-auto p-4">
                    {children}
                </main>
            </div>
            
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </div>
    );
}