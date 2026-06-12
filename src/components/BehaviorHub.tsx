import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Compass, CheckCircle, HelpCircle, 
  ArrowRight, ShieldAlert, Sparkles, 
  ThumbsUp, BookOpen, Heart, Award, 
  RotateCcw, ThumbsDown, AlertCircle, Info 
} from "lucide-react";
import { LocalCommitment } from "../firebase";

interface BehaviorHubProps {
  activeCommitment: LocalCommitment | null;
  onSelectCommitment: (goal: string) => Promise<void>;
  onCompleteCommitment: (success: boolean, followUpReason: string) => Promise<void>;
  latestEcoProfile: string | null;
  latestPebScore: number | null;
}

const COMMITMENT_POOL = [
  {
    id: "bottle",
    goal: "พกกระบอกน้ำส่วนตัวและแก้วน้ำสแตนเลสเก็บอุณหภูมิมาคาเฟ่ ม. เสนอ",
    tip: "พกกระบอกน้ำลดน้ำหนักคาร์บอนสถิติขวดได้ดีที่สุด คาเฟ่ ม. หลายจุดมีส่วนลด 5 บาทให้คุณด้วย!",
    category: "ลดขยะพลาสติก",
    metric: "ลดคาร์บอนขวดพลาสติก 2.5 kg CO₂ ต่อสัปดาห์"
  },
  {
    id: "stairs",
    goal: "เลือกเดินออกกำลังกายขึ้นบันไดตึกแทนลิฟต์ในระยะไม่เกิน 3 ชั้นเรียน",
    tip: "ประหยัดไฟฟ้าเพื่อตึกเรียน สถิติชี้ชวนประหยัดได้ 0.15 kWh ต่อการเลิกใช้ลิฟต์ 1 รอบ และดีต่อใจและปอด!",
    category: "ประหยัดพลังงาน",
    metric: "ประหยัดไฟอาคารเรียน 3.0 kWh ต่อสัปดาห์"
  },
  {
    id: "recycle",
    goal: "แยกประเภทขวดแก้ว พลาสติก และกล่องกระดาษแบนลู่ก่อนโยนลงถังขยะ ม.",
    tip: "จุดแยกขยะใกล้โรงอาหาร DPU พร้อมรับขวดของคุณ การคัดแยกช่วยลดปริมาณขยะบูดเน่ากึ่งอันตรายในวิทยเขต!",
    category: "ฟื้นฟูทรัพยากร",
    metric: "เพิ่มอัตราขยะหมุนเวียนรีไซเคิลของ ม. +10%"
  },
  {
    id: "tram",
    goal: "เลือกนั่งรถรางไฟฟ้า (EV Campus Tram) หรือใช้จักรยานไฟฟ้าแบ่งปัน",
    tip: "ลดควันท่อไอเสีย PM2.5 ที่วนรอบ ม. เติมเต็มการสูดปอดบริสุทธิ์รอบวิทยเขตสีเขียว!",
    category: "ความคล่องตัวสะอาด",
    metric: "ลดค่าฝุ่นละออง PM2.5 ในพื้นที่วิทยาเขตโดยรวม"
  },
  {
    id: "noplastic",
    goal: "ปฏิเสธการรับหลอดพลาสติก ถุงหิ้ว และทิชชูดึงกระดาษในสโมสรอาคาร",
    tip: "ลดพลาสติกแบบใช้ครั้งเดียวทิ้ง (Single-use plastics) เพียงพกถุงผ้าและผ้าเช็ดหน้าใบเก่งติดตัว!",
    category: "วิถีชีวิตขยะศูนย์",
    metric: "ลดของเสียสะสมที่ทิ้งค้างคืนตึกสโมสร 20 ชิ้น"
  }
];

export default function BehaviorHub({
  activeCommitment,
  onSelectCommitment,
  onCompleteCommitment,
  latestEcoProfile,
  latestPebScore
}: BehaviorHubProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState("");
  
  // Follow-up flow steps: "evaluate" | "reason" | "feedback"
  const [followUpStep, setFollowUpStep] = useState<"none" | "evaluate" | "reason" | "feedback">("none");
  const [reportedSuccess, setReportedSuccess] = useState<boolean | null>(null);
  const [selectedReason, setSelectedReason] = useState("");
  const [adviceText, setAdviceText] = useState("");

  const handleSelectGoal = async (goal: string) => {
    setIsSubmitting(true);
    try {
      await onSelectCommitment(goal);
      setSelectedGoal("");
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCommitmentEvaluated = (success: boolean) => {
    setReportedSuccess(success);
    setSelectedReason("");
    setFollowUpStep("reason");
  };

  const handleReasonSubmitted = async (reason: string) => {
    setSelectedReason(reason);
    
    // Choose behavior science personalized recommendations based on choice
    let advice = "";
    if (reportedSuccess) {
      if (reason.includes("สะดวก")) {
        advice = "ยอดเยี่ยมมาก! การเข้าถึงสิ่งอำนวยความสะดวกที่ง่าย (Good Choice Architecture) ช่วยให้คุณรักษาพฤติกรรมรักษ์โลกได้อย่างเสถียร ลองแนะนำหรือพาเพื่อนๆ ในวิทยเขตมาลองใช้ตู้บริการเติมน้ำสะอาดบ่อยขึ้นนะ!";
      } else if (reason.includes("ตั้งใจ")) {
        advice = "นี่คือความตระหนักรู้และพลังความตั้งใจเชิงบวก (High Environmental Awareness) ที่สุดยอด! พลังแห่งความระลึกรู้ของคุณคือเครื่องยนต์หลักของการลดคาร์บอนรอยเท้าในรั้วมหาวิทยาลัย!";
      } else if (reason.includes("เพื่อน")) {
        advice = "พลังกลุ่มของเพื่อนพ้อง (Social Peer Effect) มีประโยชน์อย่างมาก! การขยายวินัยสิ่งแวดล้อมเป็นกลุ่มช่วยสร้างบรรทัดฐานสังคมสีเขียวที่ดีในสโมสรร่วมใจ!";
      } else {
        advice = "วิเศษมาก! ทุกคนทำพฤติกรรมนี้ร่วมกันเพื่อเป้าหมายดัชนีกองรวม Green Campus Index ถาวร มาร่วมต่อยอดสิ่งนี้กับด่านอื่นต่อได้เลย!";
      }
    } else {
      if (reason.includes("สะดวก")) {
        advice = "เราเข้าใจปัญหานี้เป็นอย่างดี โครงสร้างพื้นฐานมีความสลักสำคัญมาก เพื่อกู้จุดบกพร่องนี้ ลองวางแผนพกกระบอกบ่อยขึ้น หรือเลือกเส้นทางเดินสัญจรที่มีโรงอาหารเพื่อรับตู้จ่ายน้ำที่เหมาะสม สู้ต่อไปนะ!";
      } else if (reason.includes("ลืม")) {
        advice = "การฝึกลดละพลาสติกเริ่มยากหากรีบร้อน ลองสร้างนิสัยเรียบง่ายด้วยการวางสิ่งของรักษ์โลก (เช่น ถุงผ้า แก้วน้ำ) ไว้รวมกับเป้สะพายหรือใส่รวบไว้ที่ตู้เก็บรองเท้าเพื่อหลีกเลี่ยงการลืมออกจากห้องเรียน!";
      } else if (reason.includes("แรงจูงใจ")) {
        advice = "เริ่มทีละก้าวไม่ต้องรีบ! จำไว้ว่าการเลิกใช้หลอดพลาสติก 1 วัน หรือพกแก้วรักษ์โลกเพียงอาทิตย์ละครั้ง ก็สามารถลดฝุ่นคาร์บอนระดับชุมชนได้อย่างชัดเจน ทุกสิ่งเริ่มต้นจากความพยายามเล็กๆ นะ!";
      } else {
        advice = "แรงกดดันทางสังคมบางช่วงขัดขวางเรา ลองแชร์ข้อมูลตารางกิจกรรมภาพรวม Green Campus Index ให้กลุ่มเพื่อนฟัง เพื่อรวมแก๊งพอกระบอกน้ำและสะสมแต้มรักษ์โลกไปด้วยกันสร้างความตื่นเต้น!";
      }
    }

    setAdviceText(advice);
    setFollowUpStep("feedback");
  };

  const handleFinishFollowUp = async () => {
    setIsSubmitting(true);
    try {
      if (reportedSuccess !== null) {
        await onCompleteCommitment(reportedSuccess, selectedReason);
      }
      setFollowUpStep("none");
      setReportedSuccess(null);
      setSelectedReason("");
      setAdviceText("");
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Recommendations generator based on current profile or scores
  const getPersonalizedRecommendations = () => {
    if (latestEcoProfile === "Earth Guardian" || (latestPebScore && latestPebScore >= 8.5)) {
      return {
        title: "คำแนะนำสำหรับผู้มีหัวใจพิทักษ์โลกสูงสุด (Green Advocate Guide)",
        actions: [
          "🌟 นำหน้าเพื่อนในการจัดตั้งกลุ่มรักษ์โลก DPU Green Club ในตึกเรียนคุณ",
          "🪴 ชวนสภานักศึกษาเสนอจุดติดตั้งแผงโซลาร์เซลล์สถิติหรือปรับเปลี่ยนแอร์ระบบอัตโนมัติ",
          "💧 ชักชวนคาเฟ่ ม. ขยายส่วนลดและลดแก้วพลาสติกแบบรวดเดียวจบ"
        ]
      };
    } else if (latestEcoProfile === "Energy Saver") {
      return {
        title: "แนวทางการประหยัดทรัพยากร ม. เพิ่มเติม (Energy Conservation Blueprint)",
        actions: [
          "💻 ตั้งปิดพักหน้าจอคอมพิวเตอร์ระหว่างพักกลางวัน หรือเปิด Eco Mode เสมอ",
          "📢 ช่่วยเป็นหูเป็นตาตรวจสอบหลอดไฟทางเชื่อมตึกเรียนที่มีแสงสว่างล้นเกินจำเป็น",
          "🚲 ใช้ตารางนั่งรถราง EV เคลื่อนย้ายคณะเพื่อลดความร้อนส่วนกลางสะสม"
        ]
      };
    } else if (latestEcoProfile === "Waste Warrior") {
      return {
        title: "ข้อแนะกำจัดและรีไซเคิลระดับเซียน (Circular Waste Action Plan)",
        actions: [
          "📦 ปฏิเสธกล่องโฟมและหันมาสนับสนุนกล่องชานอ้อยรักษ์โลกในซุ้มน้ำ DPU",
          "🧹 คัดแยกฝาพลาสติก ขวดใส และขวดชงให้ชัดเจนก่อนทิ้ง เพื่ออำนวยความสะดวกพนักงานโรงงานจัดเก็บรวดเร็ว",
          "🌱 ทดลองศึกษาการทำปุ๋ยมูลฝอยหมักชีวภาพจากสมาคมคณะวิชาสิ่งแวดล้อม"
        ]
      };
    } else {
      return {
        title: "ก้าวแรกแสนวิเศษเพื่อเพิ่มดัชนีภาพรวม (First Step Green Recommendation)",
        actions: [
          "🥤 พกแก้วน้ำเปล่าของตนเองไปทานข้าวนอกจุดพัก เพื่อเติมปั๊มน้ำดื่มฟรีที่สะดวกรองรับตามชั้น",
          "🚶‍♂️ ทดลองเดินเรียนผ่านสวนหรือใช้สะพานลอยต้นไม้ หลีกเลี่ยงวินมอเตอร์ไซค์ที่ควันหนาในระยะสั้น",
          "🔌 ถอดปลั๊กชาร์จแบตเตอรี่ในห้องพรีเซนต์คอมพิวเตอร์ทุกครั้งหลังพรีเซนต์รายงานเสร็จ"
        ]
      };
    }
  };

  const currentRecommend = getPersonalizedRecommendations();

  return (
    <div id="behavior-change-hub" className="w-full bg-[#0a120f]/80 backdrop-blur-md p-6 rounded-3xl border border-emerald-500/10 shadow-lg space-y-6 relative overflow-hidden transition-all duration-300">
      <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 w-full" />
      
      {/* HUB HEADER */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">ศูนย์ปรับพฤติกรรมรักษ์โลก (Behavior Change Hub)</h3>
            <p className="text-[10px] text-white/50">กระตุ้นความจำเริญและให้ปณิธานเชิงรุกในวิทยเขตสีเขียว</p>
          </div>
        </div>
        <span className="text-[9px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 tracking-wider">
          nudge intervention
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: ACTIVE COMMITMENT & FOLLOW-UP (7 COLS) */}
        <div className="lg:col-span-7 flex flex-col justify-start space-y-4">
          
          <div className="bg-black/30 border border-white/5 p-4 rounded-2xl relative overflow-hidden flex flex-col justify-between min-h-[170px]">
            <span className="text-[9.5px] uppercase font-bold text-emerald-400/75 tracking-wider block mb-2 font-mono">
              ⛳️ ปณิธานประจำสัปดาห์ของคุณ (Your Weekly Commitment)
            </span>

            {activeCommitment && !activeCommitment.completed ? (
              <div className="space-y-4 my-auto">
                <div className="text-sm font-extrabold text-white flex items-start gap-2 bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/15">
                  <span className="text-base animate-bounce mt-0.5">🌱</span>
                  <p className="leading-relaxed text-emerald-300 italic">
                    &ldquo;{activeCommitment.goal}&rdquo;
                  </p>
                </div>

                {followUpStep === "none" && (
                  <div className="flex justify-between items-center gap-2 pt-2 border-t border-white/5">
                    <span className="text-[10px] text-white/40 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>ทำปณิธานครบหรือยัง? แวะสะท้อนพฤติกรรม</span>
                    </span>
                    <button
                      onClick={() => setFollowUpStep("evaluate")}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-[11px] font-black rounded-xl uppercase transition hover:scale-105"
                    >
                      ประเมินความคืบหน้า 📝
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="my-auto py-4 text-center space-y-3">
                <p className="text-xs text-white/50">คุณยังไม่ได้เลือกปณิธานรักษาโลกในคลัง หรือได้บรรลุคำสัญญาเดิมสมบูรณ์แล้ว</p>
                <p className="text-[10px] text-emerald-400/60 leading-normal">
                  💡 เลือก 1 หัวข้อด้านล่างนี้เพื่อตั้งเป้าเด็ดขาด และรับสิทธิตรวจวัดดัชนีโบนัสเพิ่ม!
                </p>
              </div>
            )}

            {/* INTERACTIVE FOLLOW-UP QUESTION OVERLAY SCREEN */}
            <AnimatePresence>
              {followUpStep !== "none" && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-[#060c0a] p-4 flex flex-col justify-between z-10 select-none animate-fadeIn"
                >
                  
                  {/* Step 1: EVALUATE YES/NO */}
                  {followUpStep === "evaluate" && (
                    <div className="space-y-3 my-auto flex flex-col justify-center items-center text-center">
                      <HelpCircle className="w-10 h-10 text-emerald-400 animate-bounce" />
                      <div className="space-y-1">
                        <h4 className="text-xs font-black text-white uppercase tracking-wider">FOLLOW-UP EVALUATION</h4>
                        <p className="text-xs text-emerald-300 font-extrabold max-w-sm">
                          &ldquo;{activeCommitment?.goal}&rdquo;
                        </p>
                        <p className="text-[11px] text-white/60">
                          ในสัปดาห์ที่ผ่านมา คุณสามารถทำตามคำสัญญาจำลองนี้สำเร็จตามจริงในการใช้ชีวิตใช่หรือไม่?
                        </p>
                      </div>

                      <div className="flex gap-3 w-full max-w-xs pt-1">
                        <button
                          onClick={() => handleCommitmentEvaluated(false)}
                          className="flex-1 py-2 px-3 bg-white/5 hover:bg-white/10 text-white/80 border border-white/5 text-xs font-bold rounded-xl transition"
                        >
                          ❌ ยังพลาดไปรอบนี้
                        </button>
                        <button
                          onClick={() => handleCommitmentEvaluated(true)}
                          className="flex-1 py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-extrabold rounded-xl transition shadow-[0_0_12px_rgba(52,211,153,0.3)]"
                        >
                          🎉 สำเร็จจริงจัง!
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 2: DETAILED FOLLOW-UP QUESTION */}
                  {followUpStep === "reason" && (
                    <div className="space-y-3.5 my-auto flex flex-col justify-center">
                      <div className="text-center space-y-1">
                        <span className="text-[9px] uppercase font-black text-amber-400 font-mono">
                          {reportedSuccess ? "SUCCESS TRACER 🔎" : "DIAGNOSTIC TRACER 🔎"}
                        </span>
                        <h4 className="text-xs font-bold text-white">
                          {reportedSuccess 
                            ? "อะไรคือหัวใจหลักที่ช่วยผลักดันให้คุณทำสำเร็จจริงในชีวิตประจำวัน?" 
                            : "อะไรคืออุปสรรคสำคัญอันดับหนึ่งที่ขัดขวางไม่ให้ปณิธานของคุณบรรลุผล?"}
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 gap-2.5 max-h-[170px] overflow-y-auto pr-1">
                        {reportedSuccess ? (
                          [
                            "ความสะดวกสบายรอบ ม. (Good Choice Architecture): ระบบตู้กดน้ำสะอาดและจุดทิ้งขยะออกแบบมาได้ดีและชัดเจน",
                            "พลังความตั้งใจในสิ่งแวดล้อม (Personal Mindful Intent): ตั้งสติและคอยระลึกพกสัมภาระกล่องน้ำรักษ์โลกมาจากบ้าน",
                            "ผลกระทบกลุ่มเพื่อน (Social Peer Influence): ชวนกันทำกับแก๊งเพื่อนเรียน ช่วยเตือนใจและรู้สึกสนุกไม่น่าเบื่อ",
                            "การช่วยเหลือดัชนีส่วนรวม (Community Index Motivation): อยากสะสมแต้มความรักษ์โลกสนับสนุนกลุ่มนักประเมิน DPU"
                          ].map((res, i) => (
                            <button
                              key={i}
                              onClick={() => handleReasonSubmitted(res)}
                              className="w-full text-left p-2.5 bg-white/5 hover:bg-white/10 text-[10.5px] font-semibold text-white/85 rounded-xl border border-white/5 transition"
                            >
                              🔹 {res}
                            </button>
                          ))
                        ) : (
                          [
                            "โครงสร้าง ม. ยังไม่เอื้ออำนวย (Campus Facility Gaps): หาตู้เติมน้ำดื่มสะอาดยากตามชั้นเรียน หรือขาดถังขยะคัดแยก",
                            "ความเร่งรีบในการสัญจร (Time Pressure/Forgetfulness): ยุ่งรีบกับการเดินเรียนตึกห้องพรีเซนต์จนหอบลืมขวดกล่องน้ำ",
                            "ขาดแรงกระตุ้นและนิสัยพฤติกรรม (Lack of Personal Habit): รู้สึกว่าพกพากล่องแก้วมีน้ำหนักและเกะกะไม่คุ้นชิน",
                            "อิทธิพลของสิ่งอำนวยความสะดวกใช้ครั้งเดียวทิ้ง (Plastic Convenience): คาเฟ่ ม. ให้แก้วพลาสติกฟรีโดยง่ายดายสะดวกรวดเร็วกว่า"
                          ].map((res, i) => (
                            <button
                              key={i}
                              onClick={() => handleReasonSubmitted(res)}
                              className="w-full text-left p-2.5 bg-[#1b080d] hover:bg-[#250d13] text-[10.5px] font-semibold text-rose-300 rounded-xl border border-rose-500/10 transition"
                            >
                              🔸 {res}
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* Step 3: PERSONALIZED APPRECIATION & EDUCATIONAL ADVICE */}
                  {followUpStep === "feedback" && (
                    <div className="space-y-4 my-auto flex flex-col justify-between h-full py-1">
                      <div className="space-y-2 text-center">
                        <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 text-[9px] font-black">
                          <CheckCircle className="w-3 h-3 text-emerald-400" />
                          <span>บันทึกผลการตรวจสอบพฤติกรรมเรียบร้อย</span>
                        </div>
                        
                        <h4 className="text-xs font-extrabold text-white">ข้อแนะนำเชิงสะท้อนคิดส่วนบุคคล (Nudge Reflection Advice)</h4>
                        
                        <p className="text-[11px] text-white/80 leading-relaxed bg-black/40 p-3 rounded-xl border border-white/5 text-left italic">
                          &ldquo; {adviceText} &rdquo;
                        </p>
                      </div>

                      <div className="text-center space-y-2">
                        <p className="text-[9px] text-[#e0f2f1]/50 leading-relaxed font-semibold">
                          {reportedSuccess 
                            ? "🎉 ดัชนีภาพรวมชุมชนวิทยเขตสีเขียวได้รับโบนัสแต้ม +3 แต้มรักโลก!" 
                            : "🌱 ขอชื่นชมความซื่อสัตย์ในการสะท้อนคิด รับแต้มส่งเสริมการพยายาม +1 แต้มรักโลก!"}
                        </p>
                        
                        <button
                          onClick={handleFinishFollowUp}
                          disabled={isSubmitting}
                          className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black uppercase rounded-xl transition"
                        >
                          {isSubmitting ? "กำลังเก็บสถิติลงฐานข้อมูล..." : "รับแรงบันดาลใจและดำเนินต่อ 👍"}
                        </button>
                      </div>

                    </div>
                  )}

                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* CHOOSE A NEW COMMITMENT LIST */}
          <div className="space-y-2">
            <span className="text-[10px] font-black tracking-wider text-white/40 uppercase block">
              คลังเป้าหมายปรับพฤติกรรม (Select Target Goals)
            </span>
            <div className="grid grid-cols-1 gap-2">
              {COMMITMENT_POOL.map((item) => {
                const isActive = activeCommitment?.goal === item.goal && !activeCommitment?.completed;
                return (
                  <button
                    key={item.id}
                    disabled={isActive || isSubmitting}
                    onClick={() => handleSelectGoal(item.goal)}
                    className={`text-left p-3 rounded-2xl border transition-all text-xs flex flex-col justify-between gap-1.5 ${
                      isActive 
                        ? "bg-emerald-500/10 border-emerald-450 text-emerald-300 contrast-125 cursor-not-allowed" 
                        : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20 text-white/80"
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="font-bold text-white flex items-center gap-1">
                        <span>🌱</span>
                        <span>{item.goal}</span>
                      </span>
                      <span className={`text-[8.5px] font-black px-1.5 py-0.5 rounded shrink-0 ${isActive ? "bg-emerald-500/20 text-emerald-300" : "bg-white/10 text-white/50"}`}>
                        {isActive ? "ACTIVE" : item.category}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center w-full text-[9px] text-white/40 pt-1 border-t border-white/5 leading-snug">
                      <span>💡 เคล็ดลับ: {item.tip}</span>
                      <span className="text-emerald-400 font-extrabold shrink-0 pl-2">🎯 {item.metric}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: REASSESSMENT & RECOMMENDATIONS (5 COLS) */}
        <div className="lg:col-span-5 flex flex-col justify-start space-y-4">
          
          <div className="bg-[#050a08]/80 border border-white/5 p-4 rounded-2xl space-y-3">
            <div className="flex items-center space-x-1.5 pb-2 border-b border-white/5">
              <BookOpen className="w-4 h-4 text-emerald-455 text-emerald-400" />
              <h4 className="text-xs font-bold text-white">ข้อมูลจำลองความรักโลกส่วนคุณ</h4>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-white/55">โปรไฟล์ล่าสุด:</span>
                <span className="font-bold text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-mono text-[10.5px]">
                  {latestEcoProfile || "Eco Explorer"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/55">อัตราพฤติกรรม PEB Score:</span>
                <span className="font-extrabold text-white font-mono">
                  {latestPebScore ? `${latestPebScore.toFixed(2)} / 10` : "ไม่มีประวัติการประเมิน"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-b from-[#082218]/40 to-transparent border border-[#0d2e20]/40 p-4 rounded-2xl space-y-3.5">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-black text-white uppercase tracking-tight">{currentRecommend.title}</h4>
            </div>

            <div className="space-y-2.5">
              {currentRecommend.actions.map((act, index) => (
                <div key={index} className="flex items-start space-x-2 text-xs bg-white/5 p-2.5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                  <span className="text-emerald-400 shrink-0 mt-0.5">✔</span>
                  <p className="text-white/85 font-medium leading-relaxed">{act}</p>
                </div>
              ))}
            </div>

            <div className="text-[10px] text-white/40 leading-relaxed font-semibold p-2 bg-black/20 rounded border border-white/5">
              💡 ข้อเสนอแนะแนวทางพฤติกรรมจำลองเหล่านี้ ได้รับการประเมินมาเพื่อให้เหมาะสมกับความรักษ์โลกที่พัฒนาขีดความสามารถต่อไปของนักศึกษามหาวิทยาลัย DPU
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
