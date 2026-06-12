import { BADGES, Badge } from "../data/scenarios";
import { 
  Globe, 
  Award, 
  Zap, 
  Droplets, 
  Trash2, 
  RefreshCw, 
  Bike, 
  Bus, 
  Compass, 
  Scissors, 
  Lock 
} from "lucide-react";

interface BadgeCollectorProps {
  unlockedList: string[];
}

export default function BadgeCollector({ unlockedList }: BadgeCollectorProps) {
  
  const getBadgeIcon = (id: string, isUnlocked: boolean) => {
    const cls = `w-8 h-8 transition-transform duration-300 ${isUnlocked ? "scale-110" : "opacity-30"}`;
    switch (id) {
      case "badge_earth_guardian":
        return <Globe className={`${cls} text-indigo-400`} />;
      case "badge_green_rider":
        return <Bike className={`${cls} text-emerald-400`} />;
      case "badge_water_saver":
        return <Droplets className={`${cls} text-blue-400`} />;
      case "badge_energy_hero":
        return <Zap className={`${cls} text-amber-400`} />;
      case "badge_zero_waste":
        return <Trash2 className={`${cls} text-stone-300`} />;
      case "badge_recycling_master":
        return <RefreshCw className={`${cls} text-teal-400`} />;
      case "badge_eco_champion":
        return <Award className={`${cls} text-rose-400`} />;
      case "badge_carbon_cutter":
        return <Scissors className={`${cls} text-rose-300`} />;
      case "badge_public_transport_hero":
        return <Bus className={`${cls} text-cyan-400`} />;
      case "badge_sustainability_explorer":
        return <Compass className={`${cls} text-orange-400`} />;
      default:
        return <Award className={`${cls} text-slate-500`} />;
    }
  };

  return (
    <div className="w-full bg-white/5 border border-white/10 p-6 rounded-3xl shadow-sm mt-6 backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h3 className="text-base font-bold text-white flex items-center space-x-2">
          <span>🏅 สมุดสติกเกอร์เหรียญเกียรติยศ ({unlockedList.length}/{BADGES.length})</span>
        </h3>
        <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full self-start sm:self-auto">
          สะสมเพื่อบันทึกประวัติการพัฒนา
        </span>
      </div>

      <p className="text-white/60 text-xs mb-6 leading-relaxed">
        เหรียญเกียรติยศจะถูกปลดล็อกโดยอัตโนมัติเมื่อพฤติกรรมการตัดสินใจประจำวันในเซสชันเป็นไปตามเงื่อนไขทางคาร์บอนและพลังงานที่กำหนด
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {BADGES.map((badge) => {
          const isUnlocked = unlockedList.includes(badge.id);
          return (
            <div
              key={badge.id}
              className={`relative flex flex-col items-center text-center p-4 rounded-2xl border transition-all duration-300 ${
                isUnlocked
                  ? "bg-white/5 border-white/10 shadow-xs hover:border-emerald-500/40 hover:bg-white/10"
                  : "bg-black/20 border-white/5 opacity-40"
              }`}
            >
              {!isUnlocked && (
                <div className="absolute top-2 right-2 p-1 bg-white/5 rounded-lg text-white/30 border border-white/5">
                  <Lock className="w-3 h-3" />
                </div>
              )}
              
              <div className={`p-4 rounded-full mb-3 ${isUnlocked ? 'bg-[#0c1612] border border-white/10 shadow-inner' : 'bg-white/5'}`}>
                {getBadgeIcon(badge.id, isUnlocked)}
              </div>
              
              <h5 className="text-[11px] font-bold text-white/90 tracking-tight leading-tight line-clamp-1">
                {badge.name.split(" ")[0]}
              </h5>
              
              <p className="text-[9px] text-white/50 mt-1.5 leading-normal line-clamp-2">
                {isUnlocked ? badge.description : `เงื่อนไข: ${badge.condition}`}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
