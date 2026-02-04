import { useEffect, useState } from 'react';

/**
 * COMPONENTE TODO EN UNO
 * - Botón flotante
 * - Alerta flotante
 * - Manejo correcto de estados
 * - Sin recargar página
 */

export default function AdminReportsFloating() {
  /* =======================
     ESTADOS GLOBALES
  ======================= */
  const [reports, setReports] = useState([]);
  const [sessionActive, setSessionActive] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  /* =======================
     ALERTA FLOTANTE
  ======================= */
  const [alert, setAlert] = useState({
    open: false,
    type: 'info',
    title: '',
    message: '',
    onConfirm: null,
  });

  const openAlert = ({ type, title, message, onConfirm }) => {
    setAlert({
      open: true,
      type,
      title,
      message,
      onConfirm,
    });
  };

  const closeAlert = () => {
    setAlert((a) => ({ ...a, open: false }));
  };

  const confirmAlert = async () => {
    if (!alert.onConfirm) return closeAlert();
    try {
      setLoadingAction(true);
      await alert.onConfirm();
      closeAlert();
    } catch (e) {
      openAlert({
        type: 'error',
        title: 'Error',
        message: e.message || 'Error inesperado',
      });
    } finally {
      setLoadingAction(false);
    }
  };

  /* =======================
     SIMULACIÓN FETCH
     (aquí va tu API real)
  ======================= */
  const fetchReports = async () => {
    // 🔴 SIMULADO
    setReports([
      { id: 1, user: 'Juan', park: 'A-1' },
    ]);
    setSessionActive(true);
  };

  const liberarEspacio = async () => {
    // 🔥 AQUÍ ES DONDE FALLABA TU APP
    // Se libera backend pero frontend seguía igual

    // 1️⃣ liberar en backend
    await new Promise((r) => setTimeout(r, 800));

    // 2️⃣ ACTUALIZAR FRONTEND (CLAVE)
    setReports([]);              // limpia reports
    setSessionActive(false);     // limpia sesión
  };

  /* =======================
     EFECTO INICIAL
  ======================= */
  useEffect(() => {
    fetchReports();
  }, []);

  /* =======================
     UI ALERTA
  ======================= */
  const AlertUI = () => {
    if (!alert.open) return null;

    const colors = {
      success: 'border-green-500 bg-green-50',
      error: 'border-red-500 bg-red-50',
      warning: 'border-yellow-500 bg-yellow-50',
      info: 'border-blue-500 bg-blue-50',
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className={`w-[420px] rounded-xl border p-6 shadow-xl ${colors[alert.type]}`}>
          <h2 className="font-bold text-lg mb-2">{alert.title}</h2>
          <p className="text-sm mb-6">{alert.message}</p>

          <div className="flex justify-end gap-3">
            <button
              onClick={closeAlert}
              disabled={loadingAction}
              className="px-4 py-2 rounded-lg border"
            >
              Cancelar
            </button>

            {alert.onConfirm && (
              <button
                onClick={confirmAlert}
                disabled={loadingAction}
                className="px-4 py-2 rounded-lg bg-[#003366] text-white"
              >
                {loadingAction ? 'Procesando...' : 'Confirmar'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  /* =======================
     BOTÓN FLOTANTE
  ======================= */
  const FloatingButton = () => (
    <button
      onClick={() =>
        openAlert({
          type: 'warning',
          title: 'Liberar espacio',
          message:
            'Esto liberará el parqueadero y cerrará la sesión activa. ¿Deseas continuar?',
          onConfirm: liberarEspacio,
        })
      }
      className="fixed bottom-6 right-6 z-40 rounded-full bg-red-600 text-white px-6 py-4 shadow-xl hover:scale-105 transition"
    >
      Liberar espacio
    </button>
  );

  /* =======================
     UI PRINCIPAL
  ======================= */
  return (
    <>
      <AlertUI />
      <FloatingButton />

      <div className="p-6">
        <h1 className="text-xl font-bold mb-4">Admin / Reports</h1>

        {reports.length === 0 ? (
          <p className="text-green-600">No hay sesiones activas</p>
        ) : (
          reports.map((r) => (
            <div key={r.id} className="border p-3 rounded mb-2">
              Usuario: {r.user} — Parqueadero: {r.park}
            </div>
          ))
        )}

        {sessionActive && (
          <p className="mt-4 text-red-500 font-semibold">
            ⚠️ Sesión activa detectada
          </p>
        )}
      </div>
    </>
  );
}