import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Leaf, Info, AlertTriangle, CheckCircle, 
  Wind, ShieldAlert, Sparkles, Sun, 
  Trash2, Droplet, Zap, Award, Gauge,
  Sliders, ArrowUpRight, HelpCircle, Compass
} from "lucide-react";

interface GreenCampusIndexWidgetProps {
  realIndex: number;
  onUpdateIndex: (newVal: number) => Promise<void>;
}

export default function GreenCampusIndexWidget({ realIndex, onUpdateIndex }: GreenCampusIndexWidgetProps) {
  const [sandboxMode, setSandboxMode] = useState(false);
  const [simulatedIndex, setSimulatedIndex] = useState(realIndex);
  const [isCommitting, setIsCommitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"visual" | "levels" | "impacts">("visual");

  // Keep simulated value in sync with outside real value when sandbox is off
  useEffect(() => {
    if (!sandboxMode) {
      setSimulatedIndex(realIndex);
    }
  }, [realIndex, sandboxMode]);

  const activeIndex = sandboxMode ? simulatedIndex : realIndex;

  // Determine Campus Condition levels:
  const getLevelInfo = (score: number) => {
    if (score >= 80) {
      return {
        level: "Level 4",
        label: "วิทยเขตสีเขียวสมบูรณ์",
        subLabel: "Green Campus Oasis 🌿",
        colorClass: "text-emerald-400",
        borderClass: "border-emerald-500/30",
        bgClass: "bg-emerald-950/20",
        badgeClass: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
        desc: "สวรรค์แห่งความยั่งยืน! ร่มรื่นด้วยพื้นที่สีเขียว มลพิษเป็นศูนย์ และมีวินัยการประหยัดพลังงานระดับสูงสุด มีการติดตั้งโซลาร์เซลล์กว้างขวาง และนักศึกษาขับเคลื่อนแคมเปญสีเขียวอย่างกระตือรือร้น",
        ambiance: "Lush Oasis (อากาศบริสุทธิ์สูงสุด, อาคารประหยัดพลังงาน 100%, อัตราการแยกขยะพรีเมียม)",
        recoveryObjectives: [
          "🏆 จัดงานเปิดเวทีสรุปงานวิชาการสิ่งแวดล้อม DPU Green Excursion",
          "🌟 มอบสายสะพายและเหรียญตราเกียรติยศผู้คุ้มครองสัจธรรมสิ่งแวดล้อมถาวร",
          "🪴 สนับสนุนงบประมาณสร้างโรงเพาะเห็ดและสวนครัวออร์แกนิกวิชาการ"
        ]
      };
    } else if (score >= 60) {
      return {
        level: "Level 3",
        label: "วิทยเขตสุขภาวะดี",
        subLabel: "Healthy & Clean Campus  🏫",
        colorClass: "text-teal-400",
        borderClass: "border-teal-500/30",
        bgClass: "bg-teal-950/20",
        badgeClass: "bg-teal-500/20 text-teal-300 border border-teal-500/30",
        desc: "สถานะสิ่งแวดล้อมอยู่ในระดับน่าชื่นชม! การจัดการขยะดีเยี่ยม ระบบตู้กดน้ำดื่มสะอาดฟรีทำงานปกติ นักเรียนใช้บริการรถรางไฟฟ้าเป็นส่วนใหญ่ ฝุ่นละอองอยู่ในเกณฑ์ดี",
        ambiance: "Balanced Habit (อากาศหมุนเวียนดี, อัตราขยะล้นคุมได้, รถรับส่งไฟฟ้าบริการครอบคลุม)",
        recoveryObjectives: [
          "🚲 รณรงค์เพิ่มสัดส่วนการพกพับรถจักรยานและเดินเรียนเพื่อสะสมแต้มพฤติกรรม",
          "📦 ขยายตู้จุดรับคืนขวดน้ำและกล่องกระดาษรีไซเคิลรอบตึกคณะการท่องเที่ยว",
          "💧 ชวนนักศึกษาตรวจเช็คและรายงานก๊อกน้ำรั่วซึมผ่านระบบแอปพลิเคชัน"
        ]
      };
    } else if (score >= 40) {
      return {
        level: "Level 2",
        label: "สัญญาณเตือนภัยสิ่งแวดล้อม",
        subLabel: "Environmental Warning Threshold ⚠️",
        colorClass: "text-amber-400",
        borderClass: "border-amber-500/30",
        bgClass: "bg-amber-950/20",
        badgeClass: "bg-amber-500/20 text-amber-300 border border-amber-500/10",
        desc: "ระวัง! เริ่มพบคราบฝุ่นเขม่าควันรถ และกองขยะพลาสติกแอบทิ้งตามซอกตึกเรียน มีการเปิดเครื่องปรับอุณหภูมิทิ้งไว้ในห้องพรีเซนต์ที่ว่างเปล่า และจุดกรองน้ำดื่มเริ่มมีปัญหากลิ่นไม่พึงประสงค์",
        ambiance: "Hazy Warning (อากาศขมุกขมัวเบาบาง, อัตราขยะสะสมเพิ่ม, เริ่มเกิดการเผาผลาญพลังงานสูญเปล่า)",
        recoveryObjectives: [
          "🚨 ประกาศรณรงค์สัปดาห์ปิดจอคอมพิวเตอร์และไฟแอร์ห้องเรียนที่ไม่มีผู้ใช้งาน",
          "🧹 จัดบิ๊กคลีนนิ่งลานกิจกรรมลานจามจุรี เพื่อกวาดล้างแก้วพลาสติกที่กองค้าง",
          "📢 ตรวจสอบประสิทธิภาพจุดจ่ายน้ำสะอาดเพื่อหลีกเลี่ยงการสั่งซื้อขวดพลาสติกเกินจำเป็น"
        ]
      };
    } else {
      return {
        level: "Level 1",
        label: "วิกฤตสิ่งแวดล้อมเสื่อมโทรม",
        subLabel: "Severe Waste & PM2.5 Crisis 🚨",
        colorClass: "text-rose-400 animate-pulse",
        borderClass: "border-rose-500/40",
        bgClass: "bg-rose-950/20",
        badgeClass: "bg-rose-500/20 text-rose-300 border border-rose-500/30",
        desc: "ระดับสีแดงขั้นวิกฤต! วิทยเขตปกคลุมไปด้วยแก๊สคาร์บอนและควันฝุ่นพิษหนาทึบ ขยะเปียกล้นทะลักตู้คัดแยกจนส่งกลิ่นเหม็น เกิดภาวะขาดแคลนระบบน้ำฟรีจนนักเรียนต้องหันไปซบพลาสติกใช้ครั้งเดียวทิ้ง",
        ambiance: "Ecological Desolation (ฝุ่น PM2.5 วิกฤต, ขยะส่งกลิ่นเหม็นค้างคืน, ตู้กรองน้ำดื่มส่วนใหญ่ชำรุดส่งผลลบสูง)",
        recoveryObjectives: [
          "🔥 มิติด่วนเปิดระบบเครื่องฟอกอากาศระบายอากาศระบบปิดและแจกหน้ากากอนามัย",
          "🔧 ซ่อมบำรุงหัวใจปั๊มตู้กดน้ำฟรีของวิทยเขต เพื่อดึงปริมาณขวดพลาสติกกลับสู่ปกติ",
          "🧹 ระดมอาสาสมัครฉุกเฉิน กวาดคัดแยกมลพิษจากถาดอาหารพลาสติกเศษขยะเปียกร่วมใจ"
        ]
      };
    }
  };

  const currentLevel = getLevelInfo(activeIndex);

  const handleApplySimulated = async () => {
    setIsCommitting(true);
    try {
      await onUpdateIndex(simulatedIndex);
      setSandboxMode(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsCommitting(false);
    }
  };

  const handleResetSandbox = () => {
    setSimulatedIndex(realIndex);
  };

  return (
    <div id="green-campus-index-viewer" className="w-full bg-[#0a120f]/85 backdrop-blur-md p-5 sm:p-6 rounded-3xl border border-white/10 shadow-lg relative overflow-hidden transition-all duration-300">
      <div className="absolute top-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-rose-500 w-full" />
      
      {/* 1. Header Information */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 pb-4 border-b border-white/5">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              GREEN CAMPUS SIMULATION
            </span>
            {sandboxMode && (
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 animate-pulse">
                SANDBOX SIMULATOR ACTIVE
              </span>
            )}
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-1.5">
            <Gauge className="w-5 h-5 text-emerald-400" />
            <span>ตรวจวัดและเปรียบเทียบดัชนีวิทยเขตสีเขียว</span>
          </h3>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSandboxMode(!sandboxMode)}
            className={`flex items-center space-x-1 p-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
              sandboxMode 
                ? "bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]" 
                : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{sandboxMode ? "ปิดโหมดจำลอง 🛠️" : "จำลองหมุนดัชนี 🧪"}</span>
          </button>

          {sandboxMode && (
            <button
              onClick={handleResetSandbox}
              title="รีเซ็ตค่าจำลองกลับค่าดั้งเดิม"
              className="p-1.5 px-2 bg-white/5 hover:bg-white/10 rounded-xl text-white border border-white/10 text-xs font-bold transition-all"
            >
              รีเซ็ต
            </button>
          )}
        </div>
      </div>

      {/* 2. Slider Sandbox Input if sandbox mode is active */}
      {sandboxMode && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-5 space-y-3"
        >
          <div className="flex justify-between items-center text-xs font-bold text-amber-300">
            <span className="flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 shrink-0" />
              <span>ลากสไลเดอร์เพื่อทดสอบผลลัพธ์ของสิ่งแวดล้อมจำลอง (0 - 100):</span>
            </span>
            <span className="font-mono text-sm underline">{simulatedIndex} / 100</span>
          </div>

          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="100"
              value={simulatedIndex}
              onChange={(e) => setSimulatedIndex(parseInt(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-400 focus:outline-none"
            />
            
            <button
              onClick={handleApplySimulated}
              disabled={isCommitting}
              className="flex items-center space-x-1 text-black bg-amber-400 hover:bg-amber-300 px-4 py-2 rounded-xl text-xs font-extrabold transition-all shrink-0 active:scale-95 disabled:opacity-50"
            >
              {isCommitting ? "กำลังบันทึก..." : "ใช้ค่านี้แบบถาวร 💾"}
            </button>
          </div>
          <p className="text-[10px] text-amber-200/70 leading-normal font-medium">
            💡 ดัชนีภาพรวมจะเหนี่ยวนำให้เกิดภัยพิบัติหรือข่าวดีอย่างอัตโนมัติ! เกณฑ์วิกฤตต่ำกว่า 40 คะแนนจะกระตุ้นคลื่นความฝุ่นและมลพิษฉุกเฉินที่เป็นอุปสรรคต่อด่านอื่น ๆ
          </p>
        </motion.div>
      )}

      {/* 3. Main Dashboard Display Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-normal">
        
        {/* LEFT COLUMN (6 cols): Visual indicator scenery */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <div className="flex items-center justify-between pb-1">
            <span className="text-[11px] font-bold text-emerald-400 tracking-wider">
              DYNAMIC WORLD SCENERY VISUAL
            </span>
            <span className="text-xs font-mono font-black text-white/40">
              สถานะ: {activeIndex}% / 100
            </span>
          </div>

          {/* DYNAMIC SCENERY SIMULATOR VISUAL CONTAINER */}
          <div className={`relative w-full h-[190px] rounded-2xl overflow-hidden border border-white/10 flex flex-col items-center justify-center transition-all duration-700 ${
            activeIndex >= 80 
              ? "bg-gradient-to-b from-emerald-950/70 via-emerald-900/40 to-[#050a08]" 
              : activeIndex >= 60 
              ? "bg-gradient-to-b from-[#082f28]/70 via-[#0d1614] to-[#050a08]" 
              : activeIndex >= 40 
              ? "bg-gradient-to-b from-[#2e1d05]/70 via-[#14100d]/60 to-[#050a08]" 
              : "bg-gradient-to-b from-[#2e0915]/80 via-[#1c080d] to-[#050a08]"
          }`}>
            
            {/* Background Atmosphere Elements */}
            <div className="absolute inset-0 opacity-15 pointer-events-none">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.5"/>
                </pattern>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>

            {/* Dynamic visual overlay */}
            <AnimatePresence mode="wait">
              {activeIndex >= 80 ? (
                // LUSH OASIS WORLD STATE
                <motion.div 
                  key="lush-oasis"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 p-4 flex flex-col justify-between"
                >
                  <div className="flex justify-between items-start">
                    <Sun className="w-10 h-10 text-amber-350 animate-pulse" />
                    <Sparkles className="w-5 h-5 text-emerald-300 animate-bounce" />
                  </div>
                  
                  {/* Scenery assets: Flowers, clean wind turbines, smiling cloud */}
                  <div className="flex items-end justify-between px-2 h-20">
                    <div className="flex flex-col items-center">
                      {/* Rotating wind turbine SVG */}
                      <div className="w-12 h-12 border-l border-white/20 relative flex items-center justify-center">
                        <motion.div 
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                          className="absolute w-8 h-8 rounded-full border border-dashed border-emerald-400 flex items-center justify-center text-[10px]"
                        >
                          🌀
                        </motion.div>
                        <div className="absolute h-10 w-0.5 bg-emerald-700/50 bottom-[-20px] left-1/2 select-none" />
                      </div>
                      <span className="text-[9px] font-mono text-emerald-400 mt-2">Wind Tech</span>
                    </div>

                    <div className="flex flex-col items-center pb-2">
                      <div className="flex space-x-1.5 justify-center items-center">
                        <span className="text-xl animate-bounce">🌻</span>
                        <span className="text-base animate-pulse">🌱</span>
                        <span className="text-lg animate-bounce duration-700">🌷</span>
                      </div>
                      <span className="text-[9px] font-sans text-emerald-300">ความหลากหลายทางชีวภาพ</span>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="p-1 px-2 border border-emerald-500/30 bg-emerald-500/10 rounded-lg flex items-center gap-1">
                        <Zap className="w-3 h-3 text-yellow-400" />
                        <span className="text-[9px] font-black text-emerald-300 font-mono">SOLAR ON</span>
                      </div>
                      <div className="w-8 h-4 bg-emerald-800/40 border border-emerald-500/20 rounded mt-1 shadow-inner" />
                    </div>
                  </div>
                </motion.div>
              ) : activeIndex >= 60 ? (
                // HEALTHY BALANCE GREEN WORLD STATE
                <motion.div 
                  key="healthy-eco"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 p-4 flex flex-col justify-between"
                >
                  <div className="flex justify-between items-start">
                    <Wind className="w-7 h-7 text-teal-300" />
                    <span className="px-2 py-0.5 bg-teal-500/10 text-teal-300 border border-teal-500/25 rounded text-[8px] font-bold">LOHAS STYLE</span>
                  </div>

                  <div className="flex items-end justify-between px-2 h-20">
                    <div className="flex flex-col items-center">
                      <span className="text-xl">🌳</span>
                      <span className="text-[9px] font-mono text-teal-400">Green Canopy</span>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="flex space-x-2 text-sm justify-center">
                        <span>♻️</span>
                        <span>🥤</span>
                      </div>
                      <span className="text-[8px] font-sans text-white/50 text-center">คัดแยกขยะสะสมได้ใจ</span>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="p-1 px-1.5 border border-teal-500/20 bg-teal-500/5 rounded-lg flex items-center gap-1">
                        <Droplet className="w-3 h-3 text-cyan-400" />
                        <span className="text-[8px] font-bold text-teal-300 font-mono">WATER RUN</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : activeIndex >= 40 ? (
                // HAZY/WARNING ORANGE WORLD STATE
                <motion.div 
                  key="hazy-warning"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 p-4 flex flex-col justify-between"
                >
                  <div className="flex justify-between items-start">
                    <span className="p-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-bold rounded animate-pulse">
                      ⚠️ WARNING OUTDOOR
                    </span>
                    <AlertTriangle className="w-5 h-5 text-amber-450 animate-bounce" />
                  </div>

                  <div className="flex items-end justify-between px-2 h-20">
                    <div className="flex flex-col items-center">
                      <span className="text-lg grayscale text-amber-400">🍂</span>
                      <span className="text-[8px] font-mono text-amber-400">ใบไม้เริ่มเหลือง</span>
                    </div>

                    <div className="flex flex-col items-center pb-1">
                      <div className="text-xs text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded animate-pulse">
                        PM2.5: 39.5 µg
                      </div>
                      <span className="text-[8px] text-white/30 tracking-tight text-center">เริ่มพบเขม่าละออง</span>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="p-1 px-1.5 border border-amber-500/20 bg-amber-500/5 rounded-lg flex items-center gap-1 animate-pulse">
                        <Trash2 className="w-3 h-3 text-amber-400" />
                        <span className="text-[7px] font-black text-amber-300">TRASH ACCUM</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                // CRITICAL CRISIS WORLD STATE (Severe Dust, Red Alerts, Diesel stacks)
                <motion.div 
                  key="desolation-crisis"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 p-4 flex flex-col justify-between"
                >
                  <div className="flex justify-between items-start">
                    <span className="p-1 px-2.5 bg-rose-600/30 text-rose-350 border border-rose-500/40 text-[9px] font-extrabold rounded-md animate-pulse">
                      🛑 EMERGENCY CRITICAL
                    </span>
                    <ShieldAlert className="w-6 h-6 text-rose-500 animate-spin" />
                  </div>

                  <div className="flex items-end justify-between px-2 h-20">
                    <div className="flex flex-col items-center">
                      <span className="text-xl rotate-12 filter grayscale contrast-125">🪵</span>
                      <span className="text-[8px] font-mono text-rose-400">ไม้ใกล้ตาย</span>
                    </div>

                    <div className="flex flex-col items-center pb-2">
                      <div className="text-xs text-rose-400 font-extrabold bg-rose-500/25 p-1 px-2.5 rounded-lg border border-rose-500/30 animate-ping">
                        PM2.5: 85.0 (อันตรายมาก 😷)
                      </div>
                      <span className="text-[8px] text-rose-300 font-black tracking-tight mt-1 text-center">ควันจากท่อปล่อยพลังงานเต็มพิกัด</span>
                    </div>

                    <div className="flex flex-col items-center">
                      <span className="text-2xl animate-bounce">🗑️</span>
                      <span className="text-[8px] text-rose-400 font-mono">Waste Crisis</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Inner bottom overlay indicator banner */}
            <div className={`absolute bottom-0 inset-x-0 p-2.5 text-center text-xs font-black tracking-wider border-t border-white/5 transition-all duration-300 ${
              activeIndex >= 80 
                ? "bg-emerald-950/80 text-emerald-300" 
                : activeIndex >= 60 
                ? "bg-teal-950/80 text-teal-300" 
                : activeIndex >= 40 
                ? "bg-amber-950/80 text-amber-300" 
                : "bg-rose-950/80 text-rose-300"
            }`}>
              {activeIndex >= 80 
                ? "🟢 สภาพแวดล้อมวิทยเขตสีเขียวสมบูรณ์ดีเยี่ยม" 
                : activeIndex >= 60 
                ? "🔵 ภาพรวมสุขภาวะสะอาดเรียบร้อยดี" 
                : "🔴 ตรวจพบฝุ่นควันละออง/จุดขยะสะสมไม่พึงประสงค์"}
            </div>
          </div>

          {/* Quick Info bar */}
          <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-[10px] text-white/50 leading-relaxed font-medium">
            <span className="font-bold text-white block mb-1">กลไกสัจธรรมนิเวศวิทยา:</span>
            ทุกด่านการตัดสินใจที่ผู้ใช้ตอบคำถามจะเพิ่มขึ้น/ลดลงคะแนนชุมชน 3-8% แบบเรียลไทม์ ซึ่งส่งผลโดยตรงต่อระดับความท้าทายและการจำลอง!
          </div>
        </div>

        {/* RIGHT COLUMN (7 cols): Information, values & parameters block */}
        <div className="lg:col-span-7 flex flex-col justify-start space-y-4">
          
          {/* Tabs switch */}
          <div className="flex bg-black/40 border border-white/10 rounded-xl p-1 gap-1">
            <button
              onClick={() => setActiveTab("visual")}
              className={`flex-1 p-2 rounded-lg text-xs font-extrabold transition-all ${
                activeTab === "visual" 
                  ? "bg-white/10 text-white shadow-sm" 
                  : "text-white/40 hover:text-white"
              }`}
            >
              ระดับดัชนีภาพรวม
            </button>
            <button
              onClick={() => setActiveTab("levels")}
              className={`flex-1 p-2 rounded-lg text-xs font-extrabold transition-all ${
                activeTab === "levels" 
                  ? "bg-white/10 text-white shadow-sm" 
                  : "text-white/40 hover:text-white"
              }`}
            >
              ด่านเปรียบเทียบ (0-100)
            </button>
            <button
              onClick={() => setActiveTab("impacts")}
              className={`flex-1 p-2 rounded-lg text-xs font-extrabold transition-all ${
                activeTab === "impacts" 
                  ? "bg-white/10 text-white shadow-sm" 
                  : "text-white/40 hover:text-white"
              }`}
            >
              สิ่งที่เกิดขึ้นในโลกจำลอง
            </button>
          </div>

          <div className="flex-1 bg-black/40 border border-white/5 p-4 rounded-2xl min-h-[220px]">
            <AnimatePresence mode="wait">
              {activeTab === "visual" && (
                <motion.div
                  key="visual-tab"
                  initial={{ opacity: 0, x: 5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -5 }}
                  className="space-y-3.5"
                >
                  <div className="flex items-center space-x-2">
                    <span className={`p-1 px-2 text-[10px] uppercase font-mono font-black rounded-lg ${currentLevel.badgeClass}`}>
                      {currentLevel.level} • {currentLevel.subLabel}
                    </span>
                  </div>

                  <h4 className={`text-md sm:text-lg font-black tracking-tight ${currentLevel.colorClass}`}>
                    {currentLevel.label}
                  </h4>
                  
                  <p className="text-xs text-white/75 leading-relaxed">
                    {currentLevel.desc}
                  </p>

                  <div className="bg-white/5 border border-white/5 p-3 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-white/80 block uppercase tracking-wider font-mono">
                      🌍 โหมดสภาพอากาศปัจจุบัน (Current Atmosphere Class)
                    </span>
                    <p className="text-[11px] text-white/60 leading-relaxed italic">
                      &ldquo;{currentLevel.ambiance}&rdquo;
                    </p>
                  </div>
                </motion.div>
              )}

              {activeTab === "levels" && (
                <motion.div
                  key="levels-tab"
                  initial={{ opacity: 0, x: 5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -5 }}
                  className="space-y-2.5"
                >
                  <h4 className="text-xs font-bold text-white pb-1.5 border-b border-white/5">
                    ระดับความพิทักษ์ภัยธรรมชาติและสเกลคะแนนวิทยเขต DPU
                  </h4>

                  <div className="space-y-2">
                    {/* Level 4 */}
                    <div className={`p-2 rounded-xl flex items-center justify-between border ${activeIndex >= 80 ? 'bg-emerald-500/15 border-emerald-500/30' : 'bg-transparent border-white/5 opacity-55'}`}>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">🌿</span>
                        <div>
                          <p className="text-xs font-bold text-emerald-300">Level 4: Green Campus (80 - 100 คะแนน)</p>
                          <p className="text-[9px] text-[#e0f2f1]/60">สะสะความหลากหลายชีวภาพ มลพิษคาร์บอนต่ำสุด</p>
                        </div>
                      </div>
                      {activeIndex >= 80 && <span className="text-[9px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">CURRENT ACTIVE</span>}
                    </div>

                    {/* Level 3 */}
                    <div className={`p-2 rounded-xl flex items-center justify-between border ${activeIndex >= 60 && activeIndex < 80 ? 'bg-teal-500/15 border-teal-500/30' : 'bg-transparent border-white/5 opacity-55'}`}>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">🏫</span>
                        <div>
                          <p className="text-xs font-bold text-teal-300">Level 3: Healthy Campus (60 - 79 คะแนน)</p>
                          <p className="text-[9px] text-[#e0f2f1]/60">ตู้หยอดน้ำทำงานปกติ การเดินทางสะดวกไร้มลภาวะ</p>
                        </div>
                      </div>
                      {activeIndex >= 60 && activeIndex < 80 && <span className="text-[9px] font-bold text-teal-300 bg-teal-500/20 px-2 py-0.5 rounded border border-teal-500/30">CURRENT ACTIVE</span>}
                    </div>

                    {/* Level 2 */}
                    <div className={`p-2 rounded-xl flex items-center justify-between border ${activeIndex >= 40 && activeIndex < 60 ? 'bg-amber-500/15 border-amber-500/30' : 'bg-transparent border-white/5 opacity-55'}`}>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">⚠️</span>
                        <div>
                          <p className="text-xs font-bold text-amber-300">Level 2: Warning Threshold (40 - 59 คะแนน)</p>
                          <p className="text-[9px] text-[#e0f2f1]/60">ขยะสุมรุมเร้า และเครื่องปรับพลังงานไม่สถิตคาร์บอนรั่วไหล</p>
                        </div>
                      </div>
                      {activeIndex >= 40 && activeIndex < 60 && <span className="text-[9px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/10">CURRENT ACTIVE</span>}
                    </div>

                    {/* Level 1 */}
                    <div className={`p-2 rounded-xl flex items-center justify-between border ${activeIndex < 40 ? 'bg-rose-500/20 border-rose-500/30' : 'bg-transparent border-white/5 opacity-55'}`}>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">🚨</span>
                        <div>
                          <p className="text-xs font-bold text-rose-300">Level 1: Severe Crisis (0 - 39 คะแนน)</p>
                          <p className="text-[9px] text-[#e0f2f1]/60 font-medium">ดัชนีเสื่อมถอยวิกฤต PM2.5 และขยะบูดเน่ากึ่งอันตราย</p>
                        </div>
                      </div>
                      {activeIndex < 40 && <span className="text-[9px] font-bold text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/30">CURRENT ACTIVE</span>}
                    </div>

                  </div>
                </motion.div>
              )}

              {activeTab === "impacts" && (
                <motion.div
                  key="impacts-tab"
                  initial={{ opacity: 0, x: 5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -5 }}
                  className="space-y-3.5"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white flex items-center gap-1">
                      <Compass className="w-3.5 h-3.5 text-emerald-450" />
                      <span>ผลกระทบและเป้าหมายการฟื้นฟูวิทยาเขต</span>
                    </h4>
                  </div>

                  <div className="space-y-2.5">
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase font-bold text-white/50 block">เป้าหมายกอบกู้นิเวศและฟื้นฟูจำลอง (Weekly Recovery Target):</span>
                      <div className="space-y-1.5 mt-1">
                        {currentLevel.recoveryObjectives.map((obj, i) => (
                          <div key={i} className="flex items-start space-x-2 text-xs bg-white/5 p-2 rounded-xl border border-white/5">
                            <span className="text-xs leading-none shrink-0 mt-0.5">🔹</span>
                            <span className="text-white/85 font-medium leading-relaxed">{obj}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-2.5 bg-black/40 rounded-xl border border-dashed border-white/10 text-[9.5px] leading-relaxed text-emerald-400 font-medium">
                      🎯 ดัชนีจำลองนี้จะมีผลบวก/คูณสถิติคาร์บอนกับการตัดสินใจพฤติกรรม PEB ของผู้เล่นทุกคน เช่น หากระดับวิกฤตคาร์บอนจะสูงขึ้น 1.2-1.3 เท่าอย่างเห็นได้ชัดเจน!
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>

    </div>
  );
}
