"use client";
import { useEffect } from "react";
import { X } from "lucide-react";

export function Toast({ message, type = "error", onClose, duration = 5000 }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const bgColor = type === "error" 
    ? "bg-red-500" 
    : type === "success" 
    ? "bg-green-500" 
    : "bg-blue-500";

  return (
    <div className={`${bgColor} text-white px-8 py-6 rounded-2xl shadow-2xl flex items-center gap-6 min-w-[400px] max-w-[600px] z-[9999] font-inter animate-in slide-in-from-top-5`}>
      <div className="flex-1">
        <p className="text-xl font-black uppercase tracking-tight">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="text-white hover:text-gray-200 transition-colors"
      >
        <X size={24} />
      </button>
    </div>
  );
}

export function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-4 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
            duration={toast.duration}
          />
        </div>
      ))}
    </div>
  );
}

