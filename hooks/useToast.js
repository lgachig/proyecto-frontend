import { useState, useCallback } from 'react';

let toastId = 0;

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'error', duration = 5000) => {
    const id = toastId++;
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showError = useCallback((message) => {
    return addToast(message, 'error', 5000);
  }, [addToast]);

  const showSuccess = useCallback((message) => {
    return addToast(message, 'success', 3000);
  }, [addToast]);

  const showInfo = useCallback((message) => {
    return addToast(message, 'info', 4000);
  }, [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    showError,
    showSuccess,
    showInfo,
  };
}

