export const OccupationChart = ({ data }: { data: number[] }) => (
    <div className="h-full w-full flex items-end justify-between gap-4 px-4 py-2 " >
      {data.map((val, i) => (
        <div 
          key={i} 
          style={{ height: `${val}%` }} 
          className="w-full bg-[#FEDCB7] rounded-t-3xl transition-all hover:bg-[#ffcf99] min-w-[15px]"
        />
      ))}
    </div>
  );