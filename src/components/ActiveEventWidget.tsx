import { EVENTS, GameEvent } from "../data/scenarios";
import { AlertCircle, CalendarRange, CloudRain, Flame, HelpCircle, Leaf, Zap, RefreshCw } from "lucide-react";

interface ActiveEventWidgetProps {
  weeklyEventId: string;
  monthlyEventId: string;
  onWeeklyChange?: (id: string) => void;
  onMonthlyChange?: (id: string) => void;
  onRandomize?: () => void;
}

export default function ActiveEventWidget({ 
  weeklyEventId, 
  monthlyEventId,
  onWeeklyChange,
  onMonthlyChange,
  onRandomize
}: ActiveEventWidgetProps) {
  const weekly = EVENTS.find(e => e.id === weeklyEventId);
  const monthly = EVENTS.find(e => e.id === monthlyEventId);

  const weeklyPool = EVENTS.filter(e => e.type === "weekly");
  const monthlyPool = EVENTS.filter(e => e.type === "monthly");

  const getEventIcon = (id: string, colorClass: string) => {
    switch (id) {
      case "event_heavy_rain":
        return <CloudRain className={`w-5 h-5 ${colorClass}`} />;
      case "event_heat_wave":
        return <Flame className={`w-5 h-5 ${colorClass}`} />;
      case "event_pm25":
      case "event_pollution_crisis":
        return <AlertCircle className={`w-5 h-5 ${colorClass}`} />;
      case "event_recycling_week":
        return <Zap className={`w-5 h-5 ${colorClass}`} />;
      case "event_car_free":
      case "event_green_month":
        return <Leaf className={`w-5 h-5 ${colorClass}`} />;
      default:
        return <CalendarRange className={`w-5 h-5 ${colorClass}`} />;
    }
  };

  return (
    <div className="space-y-4 w-full">
      {/* Event Selection & Randomizer Control Center */}
      <div className="bg-[#0a120f]/60 border border-white/10 p-3 sm:p-4 rounded-3xl backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <span className="p-1 px-2.5 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[10px] font-bold rounded-lg uppercase tracking-wider">
            EVENT CONTROL
          </span>
          <span className="text-xs font-semibold text-white/90">
            แผงตั้งค่าจำลองเหตุการณ์สิ่งแวดล้อม (หมุนเวียนจำลองสถานการณ์)
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          {/* Weekly Selector */}
          {onWeeklyChange && (
            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] text-white/40 font-mono">WEEKLY:</span>
              <select 
                value={weeklyEventId}
                onChange={(e) => onWeeklyChange(e.target.value)}
                className="bg-black/80 text-white border border-white/10 rounded-xl text-[11px] font-bold p-1 px-2.5 focus:outline-none focus:border-emerald-400 select-none cursor-pointer"
              >
                {weeklyPool.map(ev => (
                  <option key={ev.id} value={ev.id}>
                    {ev.name.split(" (")[0]}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Monthly Selector */}
          {onMonthlyChange && (
            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] text-white/40 font-mono">MONTHLY:</span>
              <select 
                value={monthlyEventId}
                onChange={(e) => onMonthlyChange(e.target.value)}
                className="bg-black/80 text-white border border-white/10 rounded-xl text-[11px] font-bold p-1 px-2.5 focus:outline-none focus:border-cyan-400 select-none cursor-pointer"
              >
                {monthlyPool.map(ev => (
                  <option key={ev.id} value={ev.id}>
                    {ev.name.split(" (")[0]}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Random Rotation Button */}
          {onRandomize && (
            <button
              onClick={onRandomize}
              className="flex items-center space-x-1 p-1 px-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-extrabold rounded-xl uppercase transition duration-200 cursor-pointer shadow-sm active:scale-95"
              title="สุ่มสลับความกดดันสัจธรรม"
            >
              <RefreshCw className="w-3" />
              <span>สุ่มสลับเหตุการณ์ 🔄</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {/* Level 2: Weekly Event */}
        {weekly && (
          <div className="flex items-start p-4 bg-white/5 border border-white/10 rounded-2xl shadow-sm transition-all hover:bg-white/10/80">
            <div className="p-2.5 bg-[#0a120f] border border-white/10 rounded-xl shadow-inner mr-3 mt-0.5">
              {getEventIcon(weekly.id, "text-emerald-400")}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-md">
                  เหตุการณ์รายสัปดาห์
                </span>
              </div>
              <h4 className="text-sm font-semibold text-white mt-1.5">
                {weekly.name}
              </h4>
              <p className="text-white/60 text-xs mt-1 leading-relaxed">
                {weekly.description}
              </p>
              <div className="mt-2 text-[11px] font-medium text-emerald-300 bg-emerald-950/40 border border-emerald-500/10 px-2 py-1 rounded-lg">
                🎯 ผลกระทบ: {weekly.impactText}
              </div>
            </div>
          </div>
        )}

        {/* Level 3: Monthly Event */}
        {monthly && (
          <div className="flex items-start p-4 bg-white/5 border border-white/10 rounded-2xl shadow-sm transition-all hover:bg-white/10/80">
            <div className="p-2.5 bg-[#0a120f] border border-white/10 rounded-xl shadow-inner mr-3 mt-0.5">
              {getEventIcon(monthly.id, "text-cyan-400")}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-md">
                  แผนความท้าทายรายเดือน
                </span>
              </div>
              <h4 className="text-sm font-semibold text-white mt-1.5">
                {monthly.name}
              </h4>
              <p className="text-white/60 text-xs mt-1 leading-relaxed">
                {monthly.description}
              </p>
              <div className="mt-2 text-[11px] font-medium text-cyan-300 bg-cyan-950/40 border border-cyan-500/10 px-2 py-1 rounded-lg">
                🎯 ผลกระทบ: {monthly.impactText}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

