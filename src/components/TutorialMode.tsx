import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Globe, Leaf, Compass, ArrowRight, ArrowLeft, Trophy, Sparkles } from "lucide-react";

interface TutorialModeProps {
  onComplete: () => void;
}

export default function TutorialMode({ onComplete }: TutorialModeProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "ยินดีต้อนรับสู่ PEB Journey Simulator 🌿",
      description: "เครื่องมือฝึกฝนและประเมินพฤติกรรมเพื่อสิ่งแวดล้อม (Pro-Environmental Behavior หรือ PEB) ร่วมผสานความสนุกในรูปแบบเกมจำลองชีวิตจริง 1 วันของนักศึกษา ม.DPU",
      icon: <Leaf className="w-16 h-16 text-emerald-400" />,
      color: "bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_15px_rgba(52,211,153,0.15)]"
    },
    {
      title: "3 ดัชนีหลักที่ต้องรักษาสมดุล ⚖️",
      description: "ทุกการตอบคำถามมีผลแลกเปลี่ยน (Trade-off) ซ่อนอยู่เสมอ: คะแนนความรักษ์โลก (PEB Score), ค่าปล่อยคาร์บอนสุทธิ (Carbon footprint) และค่าความสะดวกสบายส่วนตัว (Convenience)",
      icon: <Globe className="w-16 h-16 text-cyan-400" />,
      color: "bg-cyan-500/10 border border-cyan-500/20"
    },
    {
      title: "ดัชนีวิทยเขตสีเขียวภาพรวม (Green Campus Index) 🏫",
      description: "เมื่อคุณเล่นจบ สถิติของคุณจะถูกส่งเข้าไปคำนวณ 'ดัชนีวิทยเขตสีเขียว' ของมหาวิทยาลัย ซึ่งหากคะแนนตกวิกฤต (<40) จะเกิดวิกฤตรวมสะเทือนถึงกติกาการจำลองในคาบถัดไป!",
      icon: <Compass className="w-16 h-16 text-amber-400" />,
      color: "bg-amber-500/10 border border-amber-500/20"
    },
    {
      title: "ของรางวัลเกียรติยศ และคำมั่นสัญญา 🏅",
      description: "สะสมเหรียญตราเกียรติยศ 10 ชาร์ต ยึดโจทย์ความเพียรพยายาม และเลือกตั้งปณิธานความยั่งยืนประจำตัว (Commitment Goal) เพื่อบันทึกติดตามผลพฤติกรรมของจริงรอบวัน",
      icon: <Trophy className="w-16 h-16 text-emerald-300" />,
      color: "bg-emerald-500/15 border border-emerald-400/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
    }
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 max-w-lg mx-auto bg-[#0a120f]/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/10 overflow-hidden min-h-[500px]">
      {/* Slide indicator dots */}
      <div className="flex space-x-2 mt-4">
        {slides.map((_, idx) => (
          <div
            key={idx}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === currentSlide ? "w-8 bg-emerald-400" : "w-2 bg-white/10"
            }`}
          />
        ))}
      </div>

      {/* Main Slide Panel */}
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center"
          >
            <div className={`p-6 rounded-3xl mb-6 shadow-sm ${slides[currentSlide].color}`}>
              {slides[currentSlide].icon}
            </div>
            
            <h2 className="text-xl md:text-2xl font-bold text-white mb-4 tracking-tight">
              {slides[currentSlide].title}
            </h2>
            
            <p className="text-white/70 leading-relaxed text-sm md:text-base">
              {slides[currentSlide].description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls Footer */}
      <div className="w-full flex justify-between items-center p-6 bg-white/5 border-t border-white/10">
        <button
          onClick={handlePrev}
          disabled={currentSlide === 0}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
            currentSlide === 0 
              ? "text-white/20 cursor-not-allowed" 
              : "text-white/70 hover:bg-white/10"
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ย้อนกลับ</span>
        </button>

        <button
          onClick={handleNext}
          className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-5 py-2.5 rounded-xl text-sm transition shadow-[0_0_15px_rgba(52,211,153,0.3)] duration-300"
        >
          <span>{currentSlide === slides.length - 1 ? "เข้าสู่เกม" : "ถัดไป"}</span>
          {currentSlide === slides.length - 1 ? (
            <Sparkles className="w-4 h-4" />
          ) : (
            <ArrowRight className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}
