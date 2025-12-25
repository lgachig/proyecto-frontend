export const AlertLog = ({ alerts }: { alerts: any[] }) => (
    <div className="bg-[#FEF8F3] p-12 rounded-[5rem] shadow-sm h-full flex flex-col border border-gray-100">
      <h3 className="text-5xl font-black mb-12 text-gray-800 tracking-tighter italic">Alert log</h3>
      <div className="flex flex-col gap-8">
        {alerts.map((alert, i) => (
          <div key={i} className={`${alert.bgColor} p-10 rounded-[3rem] flex items-center justify-between border border-black/5 shadow-sm`}>
            <div className="flex items-center gap-8">
              <span className="text-5xl">🔔</span>
              <div className="flex flex-col gap-1">
                {/* Texto de alerta aumentado */}
                <span className="font-black text-gray-800 text-[26px] leading-tight uppercase tracking-tight">
                  {alert.message}
                </span>
                <span className="text-[20px] text-gray-400 font-bold uppercase mt-1 tracking-widest">
                  10:30 AM - 11:30 AM
                </span>
              </div>
            </div>
            <span className="text-[25px] text-gray-400 font-black ml-6 uppercase">{alert.time}</span>
          </div>
        ))}
      </div>
    </div>
  );