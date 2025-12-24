export const StatCard = ({ title, value, label, bgColor, icon }: any) => (
    <div 
      style={{ backgroundColor: bgColor }}
      className="w-full h-[300px] p-16 rounded-[4rem] flex flex-col justify-center shadow-md border border-black/5"
    >
      <div className="flex items-center gap-6 mb-6">
        <span className="text-7xl shrink-0">{icon}</span> 
        <h3 className="text-[40px] font-black text-gray-700 leading-tight uppercase tracking-tighter max-w-[240px]">
          {title}
        </h3>
      </div>
  
      <div className="flex items-center gap-6">
        <span className="text-[100px] font-black text-gray-900 leading-none tracking-tighter">
          {value}
        </span>
        <span className="text-[50px] text-gray-600 font-normal italic leading-none tracking-tighter opacity-80 pt-4">
          {label}
        </span>
      </div>
    </div>
  );