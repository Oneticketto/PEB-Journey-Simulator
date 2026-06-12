import { useEffect, useState } from "react";
import { LeaderboardEntry, fetchLeaderboard } from "../firebase";
import { Trophy, RefreshCw, Star, Trophy as GoldenCup } from "lucide-react";

export default function LeaderboardView() {
  const [list, setList] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchLeaderboard();
      setList(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatDate = (isoStr: string) => {
    if (!isoStr) return "";
    const date = new Date(isoStr);
    return date.toLocaleDateString("th-TH", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }) + " น.";
  };

  const getRankBadgeAndColor = (rank: number) => {
    switch (rank) {
      case 1:
        return {
          icon: <GoldenCup className="w-4 h-4 text-amber-400" />,
          bg: "bg-amber-500/10 border-amber-500/30",
          text: "text-amber-300 font-extrabold"
        };
      case 2:
        return {
          icon: <Trophy className="w-4 h-4 text-slate-300" />,
          bg: "bg-slate-500/10 border-slate-500/30",
          text: "text-slate-300 font-semibold"
        };
      case 3:
        return {
          icon: <Trophy className="w-4 h-4 text-amber-500" />,
          bg: "bg-amber-700/10 border-amber-600/30",
          text: "text-amber-400 font-semibold"
        };
      default:
        return {
          icon: <span className="text-xs font-semibold text-white/55">{rank}</span>,
          bg: "bg-white/5 border-white/5",
          text: "text-white/70"
        };
    }
  };

  return (
    <div className="w-full bg-white/5 border border-white/10 p-6 rounded-3xl shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Trophy className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-bold text-white">
            ตารางขุนพลผู้นำรักษ์โลก (DPU Leaderboard)
          </h3>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="p-2 text-white/50 hover:text-emerald-400 hover:bg-white/10 rounded-xl transition"
          title="โหลดข้อมูลใหม่"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <p className="text-white/60 text-xs mb-4 leading-relaxed">
        * อันดับคำนวณจากคะแนน PEB เฉลี่ยสูงสุด (1-10) จากการตอบคำถามในเซสชันล่าสุดของสมาชิก @dpu.ac.th ที่ล็อกอินบันทึกสถิติ
      </p>

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-2">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-400 border-r-transparent animate-spin" />
          <span className="text-xs text-white/60">กำลังดาวน์โหลดตารางผู้นำ...</span>
        </div>
      ) : list.length === 0 ? (
        <div className="py-10 text-center border-2 border-dashed border-white/10 rounded-2xl">
          <Star className="w-8 h-8 text-white/20 mx-auto mb-2 animate-pulse" />
          <p className="text-xs text-white/60 font-medium">ยังไม่มีอันดับนักศึกษาในระบบคลาวด์ขณะนี้</p>
          <p className="text-[10px] text-white/40 mt-1">ล็อกอินด้วยเมล DPU และเริ่มเกมคนแรกเพื่อบุกเบิกตาราง!</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-left text-xs text-white/70">
            <thead className="bg-[#050c09] text-emerald-300 font-bold uppercase text-[10px] border-b border-white/10">
              <tr>
                <th className="px-4 py-3 text-center w-16">อันดับ</th>
                <th className="px-4 py-3">ผู้เล่นนศ.</th>
                <th className="px-4 py-3 text-right">คะแนนรักโลกสูงสุด</th>
                <th className="px-4 py-3 text-right">วันเวลาบันทึก</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {list.map((row) => {
                const styles = getRankBadgeAndColor(row.rank);
                return (
                  <tr key={row.uid} className="hover:bg-white/5 transition">
                    <td className="px-4 py-3 text-center">
                      <div className={`mx-auto flex items-center justify-center w-6 h-6 rounded-lg border shadow-xs ${styles.bg}`}>
                        {styles.icon}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-white/90">
                      {row.displayName}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-emerald-400 font-bold text-sm">
                      {row.score.toFixed(2)}/10.-
                    </td>
                    <td className="px-4 py-3 text-right text-[10px] text-white/40 font-mono">
                      {formatDate(row.lastUpdated)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
