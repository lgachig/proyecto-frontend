export const OccupationChart = ({ data }: { data: number[] }) => (
    <div className="h-[80%] w-full flex items-end justify-between gap-4 px-4 py-2 font-inter" >
      {data.map((val, i) => (
        <div 
          key={i} 
          style={{ height: `${val}%` }} 
          className="w-full bg-parking-accent-warm rounded-t-3xl transition-all hover:opacity-80 min-w-[15px]"
        />
      ))}
    </div>
  );