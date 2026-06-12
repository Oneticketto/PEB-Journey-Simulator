import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  fetchProfile, 
  isFirebaseReady, 
  signInAsGuest, 
  registerDPUUser, 
  loginDPUUser, 
  logOutUser, 
  subscribeToAuth, 
  saveSession, 
  getActiveCommitment, 
  updateCommitmentStatus, 
  selectCommitment, 
  fetchGlobalCampusState, 
  scoreCampusIndexCommunity, 
  updateGlobalCampusState, 
  UserProfile, 
  LocalCommitment, 
  GlobalCampusState, 
  GameplaySession,
  evaluateBadgesEarned
} from "./firebase";
import { SCENARIOS, ECO_PROFILES, BADGES, EVENTS, Scenario, Choice } from "./data/scenarios";
import TutorialMode from "./components/TutorialMode";
import ActiveEventWidget from "./components/ActiveEventWidget";
import BadgeCollector from "./components/BadgeCollector";
import LeaderboardView from "./components/LeaderboardView";
import GreenCampusIndexWidget from "./components/GreenCampusIndexWidget";
import BehaviorHub from "./components/BehaviorHub";

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
  User, 
  Calendar, 
  TrendingUp, 
  Leaf, 
  AlertTriangle, 
  Heart, 
  Info, 
  X, 
  Check, 
  Loader2,
  Lock,
  ArrowRight,
  LogOut,
  Sparkles,
  HelpCircle,
  ThumbsUp,
  ChevronRight
} from "lucide-react";

export default function App() {
  // Navigation & Screen States
  const [gameState, setGameState] = useState<'welcome' | 'tutorial' | 'dashboard' | 'playing' | 'results' | 'commitment_select'>('welcome');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [campusState, setCampusState] = useState<GlobalCampusState | null>(null);
  const [activeCommitment, setActiveCommitment] = useState<LocalCommitment | null>(null);
  
  // Auth Form State
  const [emailForm, setEmailForm] = useState("");
  const [passwordForm, setPasswordForm] = useState("");
  const [nameForm, setNameForm] = useState("");
  const [signUpMode, setSignUpMode] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Gameplay Session States
  const [sessionScenarios, setSessionScenarios] = useState<Scenario[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<Choice | null>(null);
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [sessionAnswers, setSessionAnswers] = useState<any[]>([]);

  // Results State
  const [resultsPEB, setResultsPEB] = useState(0);
  const [resultsCarbon, setResultsCarbon] = useState(0);
  const [resultsConvenience, setResultsConvenience] = useState(0);
  const [resultsEcoProfile, setResultsEcoProfile] = useState<any>(null);
  const [resultsBadgesEarned, setResultsBadgesEarned] = useState<string[]>([]);
  
  // Custom AI / Gemini Feedback States
  const [geminiFeedback, setGeminiFeedback] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Commitment Select Choice
  const [selectedGoal, setSelectedGoal] = useState("");
  
  // Previous Commitment Follow Up State
  const [showCommitmentModal, setShowCommitmentModal] = useState(false);
  const [prevCommitment, setPrevCommitment] = useState<LocalCommitment | null>(null);

  // Load User, Campus State on mounting
  useEffect(() => {
    const unsub = subscribeToAuth(async (user) => {
      setCurrentUser(user);
      if (user) {
        const uProfile = await fetchProfile(user.uid);
        setProfile(uProfile);
        setGameState('dashboard');
        
        // Check for previous uncompleted commitment for follow-up popup!
        const prevGoal = await getActiveCommitment(user.uid);
        if (prevGoal) {
          setActiveCommitment(prevGoal);
          if (!prevGoal.completed) {
            setPrevCommitment(prevGoal);
            setShowCommitmentModal(true);
          }
        }
      } else {
        setProfile(null);
        setGameState('welcome');
      }
    });

    // Fetch Global Community Campus Index
    const loadCampus = async () => {
      const state = await fetchGlobalCampusState();
      setCampusState(state);
    };
    loadCampus();

    // Fast Auth Listener for Multi-tab triggers
    const handleAuthEvent = () => {
      window.location.reload();
    };
    window.addEventListener("auth_change", handleAuthEvent);
    return () => {
      unsub();
      window.removeEventListener("auth_change", handleAuthEvent);
    };
  }, []);

  // Handle DPU Auth actions
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    if (!emailForm || !passwordForm) {
      setAuthError("กรุณากรอกข้อมูลให้ครบถ้วน");
      setAuthLoading(false);
      return;
    }

    try {
      if (signUpMode) {
        if (!nameForm) {
          setAuthError("กรุณากรอกชื่อสถิติผู้คน");
          setAuthLoading(false);
          return;
        }
        await registerDPUUser(emailForm, passwordForm, nameForm);
      } else {
        await loginDPUUser(emailForm, passwordForm);
      }
    } catch (err: any) {
      setAuthError(err.message || "เกิดข้อผิดพลาดในการตรวจสอบบัญชี");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGuestPlay = async () => {
    setAuthLoading(true);
    try {
      const user = await signInAsGuest();
      setCurrentUser(user);
      const uProfile = await fetchProfile(user.uid);
      setProfile(uProfile);
      setGameState('tutorial'); // Trigger Onboarding Tutorial first prior to first play!
    } catch (err: any) {
      setAuthError("ไม่สามารถเข้าเล่นแบบบุคคลทั่วไปได้");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleOnboardingComplete = () => {
    setGameState('dashboard');
  };

  const handleWeeklyEventChange = async (eventId: string) => {
    if (!campusState) return;
    const newState = {
      ...campusState,
      weeklyEvent: eventId,
      updatedAt: new Date().toISOString()
    };
    setCampusState(newState);
    await updateGlobalCampusState(newState);
  };

  const handleMonthlyEventChange = async (eventId: string) => {
    if (!campusState) return;
    const newState = {
      ...campusState,
      monthlyEvent: eventId,
      updatedAt: new Date().toISOString()
    };
    setCampusState(newState);
    await updateGlobalCampusState(newState);
  };

  const handleRandomizeEvents = async () => {
    if (!campusState) return;
    const weeklyPool = EVENTS.filter(e => e.type === "weekly");
    const monthlyPool = EVENTS.filter(e => e.type === "monthly");
    
    // Select random elements
    const randomWeekly = weeklyPool[Math.floor(Math.random() * weeklyPool.length)];
    const randomMonthly = monthlyPool[Math.floor(Math.random() * monthlyPool.length)];
    
    const newState = {
      ...campusState,
      weeklyEvent: randomWeekly.id,
      monthlyEvent: randomMonthly.id,
      updatedAt: new Date().toISOString()
    };
    
    setCampusState(newState);
    await updateGlobalCampusState(newState);
  };

  const handleUpdateIndexGlobal = async (newVal: number) => {
    if (!campusState) return;
    const diff = newVal - campusState.greenCampusIndex;
    await scoreCampusIndexCommunity(diff);
    const updated = await fetchGlobalCampusState();
    setCampusState(updated);
  };

  // Begin daily decision simulation
  const startSimulation = () => {
    setHasConfirmed(false);
    setSelectedChoice(null);
    setCurrentIndex(0);
    setSessionAnswers([]);
    
    // Select 5-6 random non-repeating scenarios from pool of 38!
    // This perfectly delivers Level 1: Daily Scenario Randomization
    const shuffled = [...SCENARIOS].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 6); // exactly 6 scenarios for a robust daily loop
    setSessionScenarios(selected);
    
    setGameState('playing');
  };

  // Choice Selection during playing
  const selectOption = (opt: Choice) => {
    if (!hasConfirmed) {
      setSelectedChoice(opt);
    }
  };

  // Confirm and proceed scenario
  const confirmOption = () => {
    if (!selectedChoice) return;
    
    const activeScen = sessionScenarios[currentIndex];

    // Compute weekly/monthly modifiers on the fly dynamically from the active events
    let finalPeb = selectedChoice.pebScore;
    let finalCarbon = selectedChoice.carbonImpact;
    let finalConvenience = selectedChoice.convenienceScore;

    // Apply Weekly Modifiers dynamically
    if (campusState?.weeklyEvent) {
      const activeWeekly = EVENTS.find(e => e.id === campusState.weeklyEvent);
      if (activeWeekly && activeWeekly.modifier) {
        const mod = activeWeekly.modifier;
        if (mod.pebMultiplier !== undefined) finalPeb *= mod.pebMultiplier;
        if (mod.pebModifier !== undefined) finalPeb += mod.pebModifier;
        if (mod.carbonMultiplier !== undefined) finalCarbon *= mod.carbonMultiplier;
        if (mod.carbonModifier !== undefined) finalCarbon += mod.carbonModifier;
        if (mod.convenienceMultiplier !== undefined) finalConvenience *= mod.convenienceMultiplier;
        if (mod.convenienceModifier !== undefined) finalConvenience += mod.convenienceModifier;
      }
    }

    // Apply Monthly Modifiers dynamically
    if (campusState?.monthlyEvent) {
      const activeMonthly = EVENTS.find(e => e.id === campusState.monthlyEvent);
      if (activeMonthly && activeMonthly.modifier) {
        const mod = activeMonthly.modifier;
        if (mod.pebMultiplier !== undefined) finalPeb *= mod.pebMultiplier;
        if (mod.pebModifier !== undefined) finalPeb += mod.pebModifier;
        if (mod.carbonMultiplier !== undefined) finalCarbon *= mod.carbonMultiplier;
        if (mod.carbonModifier !== undefined) finalCarbon += mod.carbonModifier;
        if (mod.convenienceMultiplier !== undefined) finalConvenience *= mod.convenienceMultiplier;
        if (mod.convenienceModifier !== undefined) finalConvenience += mod.convenienceModifier;
      }
    }

    // Ensure final scores are beautifully rounded and bounded
    finalPeb = parseFloat(Math.max(1, Math.min(10, finalPeb)).toFixed(2));
    finalCarbon = parseFloat(Math.max(0, finalCarbon).toFixed(2));
    finalConvenience = parseFloat(Math.max(1, Math.min(10, finalConvenience)).toFixed(2));

    const currentAnswer = {
      categoryId: activeScen.category,
      category: activeScen.thaiCategory,
      question: activeScen.title,
      choiceText: selectedChoice.text,
      pebScore: finalPeb,
      carbonImpact: finalCarbon,
      convenienceScore: finalConvenience,
      feedback: selectedChoice.feedback
    };

    setSessionAnswers([...sessionAnswers, currentAnswer]);
    setHasConfirmed(true);
  };

  const advanceScenario = () => {
    if (currentIndex < sessionScenarios.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedChoice(null);
      setHasConfirmed(false);
    } else {
      // Game ended! Compute averages
      calculateSessionResults();
    }
  };

  // Calculate results metrics and trigger the Gemini insights engine!
  const calculateSessionResults = () => {
    const totalPeb = sessionAnswers.reduce((sum, ans) => sum + ans.pebScore, 0);
    const avgPeb = totalPeb / sessionAnswers.length;

    const totalCarbon = sessionAnswers.reduce((sum, ans) => sum + ans.carbonImpact, 0);
    const totalConvenience = sessionAnswers.reduce((sum, ans) => sum + ans.convenienceScore, 0);
    const avgConvenience = totalConvenience / sessionAnswers.length;

    // Determine leading Environmental profile
    let topProfile = ECO_PROFILES[4]; // default Eco Explorer
    
    // Categorize counts
    const categoryCounts: { [key: string]: number } = {};
    sessionAnswers.forEach(ans => {
      categoryCounts[ans.categoryId] = (categoryCounts[ans.categoryId] || 0) + 1;
    });

    if (avgPeb >= 8.5) {
      topProfile = ECO_PROFILES[0]; // Earth Guardian
    } else if (categoryCounts["Transportation"] && categoryCounts["Transportation"] >= 2) {
      topProfile = ECO_PROFILES[1]; // Smart Commuter
    } else if (categoryCounts["Energy"] && categoryCounts["Energy"] >= 2) {
      topProfile = ECO_PROFILES[2]; // Energy Saver
    } else if (categoryCounts["Recycling"] || categoryCounts["Waste"]) {
      topProfile = ECO_PROFILES[3]; // Waste Warrior
    }

    setResultsPEB(avgPeb);
    setResultsCarbon(totalCarbon);
    setResultsConvenience(avgConvenience);
    setResultsEcoProfile(topProfile);

    // Calculate badges earned in this daily simulation session
    const tmpSession: GameplaySession = {
      uid: currentUser?.uid || "guest",
      answers: sessionAnswers,
      pebScore: avgPeb,
      carbonScore: totalCarbon,
      ecoProfile: topProfile.name,
      commitment: "",
      timestamp: new Date().toISOString()
    };
    const earned = evaluateBadgesEarned(tmpSession);
    setResultsBadgesEarned(earned);

    setGameState('results');
    getAIFeedback(sessionAnswers, topProfile, avgPeb, totalCarbon);
  };

  // Submit decision to API and parse Gemini model payload in Thai
  const getAIFeedback = async (answers: any[], profile: any, avgPeb: number, carbon: number) => {
    setAiLoading(true);
    setGeminiFeedback(null);
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers,
          ecoProfile: profile.name,
          pebScore: avgPeb.toFixed(2),
          carbonScore: carbon.toFixed(2)
        })
      });
      const data = await response.json();
      setGeminiFeedback(data);
    } catch (err) {
      console.error("AI Generation error, falling back locally:", err);
      // Perfect graceful fallback
      setGeminiFeedback({
        strengths: [
          "คุณมีการแยกแยะองค์ประกอบและเลือกคัดวัสดุรีไซเคิลได้คล่องแคล่ว",
          "คุณพยายามใช้น้ำอย่างสมเหตุสมผลและรักษาระบบไฟส่วนกลางมหาวิทยาลัย"
        ],
        weaknesses: [
          "การพึ่งพากิจกรรมเดินทางบางอย่างยังคงทิ้งร่องรอยคาร์บอนสุทธิเด่นชัด",
          "ความสะดวกพกแก้วน้ำยังทดแทนพลาสติกใช้ครั้งเดียวได้ไม่สมบูรณ์"
        ],
        suggestions: [
          "พกพากล่องอาหารหรือปิ่นโตส่วนตัวเข้าสู่โรงอาหารอาทิตย์ละสามวันเพิ่มพาสกู้โลก",
          "หลีกเลี่ยงวินมอเตอร์ไซค์เร่งเครื่อง หันมาเดินพึ่งความงดงามของสวนมหาวิทยาลัยสีเขียว"
        ],
        summaryQuote: "ทุกทางเลือกของคุณจะร่วมต่อยอดมหาวิทยาลัยสีเขียวอันยั่งยืนในน่านน้ำการเรียนรู้!"
      });
    } finally {
      setAiLoading(false);
    }
  };

  // Set selected Obligation
  const submitCommitmentGoal = async (goal: string) => {
    if (!currentUser) return;
    await selectCommitment(currentUser.uid, goal);
    
    // Also save in state representing active commitment
    const latestCommit = await getActiveCommitment(currentUser.uid);
    setActiveCommitment(latestCommit);
    
    // Submit Session results to database
    const finalSession: GameplaySession = {
      uid: currentUser.uid,
      answers: sessionAnswers,
      pebScore: resultsPEB,
      carbonScore: resultsCarbon,
      ecoProfile: resultsEcoProfile.name,
      commitment: goal,
      timestamp: new Date().toISOString()
    };
    
    await saveSession(finalSession);

    // Refresh profile state
    const nextProf = await fetchProfile(currentUser.uid);
    setProfile(nextProf);

    // Refresh Global Campus Index indicator bar
    const nextCampus = await fetchGlobalCampusState();
    setCampusState(nextCampus);

    // Done! Return back to student dashboard
    setGameState('dashboard');
  };

  const handleSelectGoalHub = async (goal: string) => {
    if (!currentUser) return;
    await selectCommitment(currentUser.uid, goal);
    const latestCommit = await getActiveCommitment(currentUser.uid);
    setActiveCommitment(latestCommit);
  };

  const handleCompleteCommitmentAndReason = async (success: boolean, followUpReason: string) => {
    if (!currentUser) return;
    await updateCommitmentStatus(currentUser.uid, success);
    const latestCommit = await getActiveCommitment(currentUser.uid);
    setActiveCommitment(latestCommit);
    
    // Add points based on success or honesty report
    const bonus = success ? 3 : 1;
    await scoreCampusIndexCommunity(bonus);
    
    const uProfile = await fetchProfile(currentUser.uid);
    setProfile(uProfile);
    const nextCamp = await fetchGlobalCampusState();
    setCampusState(nextCamp);
  };

  // Reset and play on
  const checkPrevCommitment = async (isSuccess: boolean) => {
    if (currentUser && prevCommitment) {
      await updateCommitmentStatus(currentUser.uid, isSuccess);
      
      // Update active commitment state
      const latestCommit = await getActiveCommitment(currentUser.uid);
      setActiveCommitment(latestCommit);
      
      // If success, user community index receives extra eco points!
      if (isSuccess) {
        await scoreCampusIndexCommunity(3); // extra index bonus point for actual physical dedication!
        const nextCamp = await fetchGlobalCampusState();
        setCampusState(nextCamp);
      }
    }
    setShowCommitmentModal(false);
  };

  // Render Grade labels in colors
  const getGradeInfo = (score: number) => {
    if (score >= 8.5) return { label: "เกรด A", desc: "ผู้ท้าชิงโลกร้อนยอดเยี่ยม", color: "text-emerald-300 bg-emerald-500/20 border-emerald-500/30 shadow-[0_0_20px_rgba(52,211,153,0.2)]" };
    if (score >= 7.0) return { label: "เกรด B", desc: "นักอนุรักษ์แนวหน้าน่าชม", color: "text-cyan-300 bg-cyan-500/20 border-cyan-500/30" };
    if (score >= 5.0) return { label: "เกรด C", desc: "ผ่านสอยรักษ์พอประมาณ", color: "text-amber-300 bg-amber-500/20 border-amber-500/30" };
    return { label: "เกรด D", desc: "ขัดจังหวะนิเวศเสื่อมโทรม", color: "text-rose-300 bg-rose-500/20 border-rose-500/30" };
  };

  // Renders Green Index categories labels and indicator bar colors
  const getCampusIndexMeta = (index: number) => {
    if (index >= 80) return { label: "วิทยเขตสีเขียวสมบูรณ์ (Green Campus)", color: "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_15px_rgba(52,211,153,0.5)]", border: "border-emerald-500/20", bg: "text-emerald-300 bg-emerald-500/20 border border-emerald-500/30" };
    if (index >= 60) return { label: "วิทยเขตสุขภาวะดี (Healthy Campus)", color: "bg-gradient-to-r from-teal-500 to-cyan-400 shadow-[0_0_12px_rgba(45,212,191,0.5)]", border: "border-teal-500/20", bg: "text-teal-300 bg-teal-500/20 border border-teal-500/30" };
    if (index >= 40) return { label: "สัญญาณเตือนภัยสิ่งแวดล้อม (Environmental Warning)", color: "bg-gradient-to-r from-amber-500 to-orange-400 shadow-[0_0_12px_rgba(245,158,11,0.5)]", border: "border-amber-500/20", bg: "text-amber-300 bg-amber-500/20 border border-amber-500/30" };
    return { label: "วิกฤตขยะสิ่งแวดล้อมเสื่อมโทรม (Waste Crisis)", color: "bg-gradient-to-r from-rose-600 to-red-500 shadow-[0_0_15px_rgba(244,63,94,0.5)] animate-pulse", border: "border-rose-500/20", bg: "text-rose-300 bg-rose-500/20 border border-rose-500/30" };
  };

  const currentGrade = getGradeInfo(resultsPEB);

  return (
    <div className="min-h-screen bg-[#050a08] text-[#e0f2f1] flex flex-col antialiased">
      
      {/* HEADER SECTION */}
      <header className="sticky top-0 z-40 bg-[#050a08]/80 backdrop-blur-md border-b border-white/10 px-4 py-3.5 shadow-md">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => gameState !== 'playing' && setGameState('dashboard')}>
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center shadow-[0_0_15px_rgba(52,211,153,0.3)]">
              <Leaf className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight leading-tight">
                PEB Journey Simulator <span className="text-emerald-400 text-xs font-mono font-bold">V2.1</span>
              </h1>
              <p className="text-[10px] text-emerald-400/55 font-mono uppercase tracking-widest leading-none mt-0.5">ผู้พิทักษ์สิ่งแวดล้อมแห่งมหาวิทยาลัย</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {currentUser && (
              <div className="flex items-center space-x-3 bg-white/5 pl-3 pr-2 py-1.5 rounded-full border border-white/10">
                <span className="text-[11px] font-bold text-white/95">
                  {profile?.displayName || "นักศึกษาทั่วไป"}
                  {currentUser.isAnonymous ? " (บุคคลทั่วไป)" : " (นศ.)"}
                </span>
                <button
                  onClick={logOutUser}
                  className="p-1 px-2.5 bg-white/15 text-white/80 hover:text-rose-300 hover:bg-rose-500/20 rounded-full border border-white/10 transition shadow-xs flex items-center space-x-1"
                  title="ออกจากระบบ"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold">ออก</span>
                </button>
              </div>
            )}
            
            {!isFirebaseReady && (
              <span className="text-[9px] font-bold px-2.5 py-1 bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-full flex items-center space-x-1">
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-ping mr-0.5" />
                <span>โหมดท้องถิ่น (Local Mode)</span>
              </span>
            )}
          </div>
        </div>
      </header>

      {/* ACTION AREA CONTAINER */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 flex flex-col md:py-8 justify-start">
        
        <AnimatePresence mode="wait">
          
          {/* SCREEN 1: WELCOME / LOGIN */}
          {gameState === 'welcome' && (
            <motion.div
              key="welcome-screen"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center justify-center my-auto min-h-[500px]"
            >
              <div className="md:col-span-12 lg:col-span-7 space-y-4 text-center lg:text-left">
                <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-500/10 text-emerald-300 rounded-full text-xs font-semibold border border-emerald-500/20 shadow-inner">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span>Thai UI University Environmental Simulation</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  จำลองหนึ่งวันรักษ์โลกในรั้ววิทยเขตสีเขียว 🌳
                </h2>
                <p className="text-white/80 text-sm sm:text-base leading-relaxed">
                  ร่วมเป็นส่วนหนึ่งของสมาคมนักศึกษามหาวิทยาลัย ในการจำลองสิทธิพฤติกรรมสิ่งแวดล้อม 
                  ตัดสินใจในสถานการณ์ปัญหาจริง และเฝ้าดูประเมินรอยเท้าคาร์บอนสุทธิรายรอบวัน 
                  เพื่อกู้และส่งเสริมดัชนีชุมชนวิทยเขตสีเขียวให้คงอยู่ได้อย่างยั่งยืน
                </p>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                  <button
                    onClick={handleGuestPlay}
                    disabled={authLoading}
                    className="w-full sm:w-auto px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-xl text-sm transition shadow-[0_0_15px_rgba(52,211,153,0.3)] flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <span>เล่นทันทีในฐานะบุคคลทั่วไป</span>
                    <ArrowRight className="w-4 h-4 text-black" />
                  </button>
                  <p className="text-xs text-white/50 font-medium">ไม่ต้องใช้บัญชี, ไม่บันทึกตารางผู้นำระดับคณะ</p>
                </div>
              </div>

              {/* AUTH PANEL RIGHT */}
              <div className="md:col-span-12 lg:col-span-5 bg-white/5 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {signUpMode ? "สมัครสมาชิก DPU User" : "เข้าสู่ระบบ DPU User"}
                  </h3>
                  <p className="text-white/60 text-xs mt-1">
                    เฉพาะผู้ถืออีเมลสถาบัน <span className="font-semibold font-mono text-emerald-400 text-xs">@dpu.ac.th</span> เท่านั้นเพื่อเก็บความคืบหน้าถาวร
                  </p>
                </div>

                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  {signUpMode && (
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-white/70 block">ชื่อ-นามสกุล หรือชื่อย่อ</label>
                      <input
                        type="text"
                        placeholder="น้องส้ม รักษ์โลก"
                        value={nameForm}
                        onChange={(e) => setNameForm(e.target.value)}
                        className="w-full p-2.5 bg-black/35 border border-white/15 rounded-xl text-xs text-white placeholder-white/30 focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-white/70 block">อีเมลสถาบัน DPU (@dpu.ac.th)</label>
                    <input
                      type="email"
                      placeholder="student.name@dpu.ac.th"
                      value={emailForm}
                      onChange={(e) => setEmailForm(e.target.value)}
                      className="w-full p-2.5 bg-black/35 border border-white/15 rounded-xl text-xs text-white placeholder-white/30 focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-white/70 block">รหัสผ่านสำหรับเข้าเกม</label>
                    <input
                      type="password"
                      placeholder="รหัสผ่านขั้นต่ำ 6 หลัก"
                      value={passwordForm}
                      onChange={(e) => setPasswordForm(e.target.value)}
                      className="w-full p-2.5 bg-black/35 border border-white/15 rounded-xl text-xs text-white placeholder-white/30 focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                    />
                  </div>

                  {authError && (
                    <div className="p-3 bg-rose-5050/15 text-rose-300 text-[11px] font-semibold border-l-2 border-rose-500 rounded flex items-center space-x-1.5 animate-shake">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-450" />
                      <span>{authError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-xl text-xs transition duration-300 shadow-[0_0_15px_rgba(52,211,153,0.25)] flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    {authLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <span>{signUpMode ? "สร้างบัญชีใหม่" : "ลงชื่อเข้าใช้งาน"}</span>
                    )}
                  </button>
                </form>

                <div className="text-center pt-3 border-t border-white/10">
                  <button
                    onClick={() => {
                      setSignUpMode(!signUpMode);
                      setAuthError("");
                    }}
                    className="text-[11px] font-medium text-emerald-400 hover:text-emerald-300 hover:underline"
                  >
                    {signUpMode ? "มีบัญชี DPU อยู่แล้ว? เข้าสู่ระบบ" : "ยังไม่มีบัญชี? สมัครใช้งาน DPU (@dpu.ac.th)"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* SCREEN 2: TUTORIAL MODE */}
          {gameState === 'tutorial' && (
            <motion.div
              key="tutorial-screen"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="my-auto py-8"
            >
              <TutorialMode onComplete={handleOnboardingComplete} />
            </motion.div>
          )}

          {/* SCREEN 3: STUDENT DASHBOARD */}
          {gameState === 'dashboard' && (
            <motion.div
              key="dashboard-screen"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6 w-full"
            >
              
              {/* CURRENT GREEN CAMPUS COMMUNITY INDEX (GCI) */}
              {campusState && (
                <GreenCampusIndexWidget 
                  realIndex={campusState.greenCampusIndex} 
                  onUpdateIndex={handleUpdateIndexGlobal} 
                />
              )}

              {/* ROTATING WEEKLY / MONTHLY EVENTS */}
              {campusState && (
                <ActiveEventWidget 
                  weeklyEventId={campusState.weeklyEvent} 
                  monthlyEventId={campusState.monthlyEvent} 
                  onWeeklyChange={handleWeeklyEventChange}
                  onMonthlyChange={handleMonthlyEventChange}
                  onRandomize={handleRandomizeEvents}
                />
              )}

              {/* BEHAVIOR CHANGE & COMMITMENT HUB */}
              {currentUser && (
                <BehaviorHub
                  activeCommitment={activeCommitment}
                  onSelectCommitment={handleSelectGoalHub}
                  onCompleteCommitment={handleCompleteCommitmentAndReason}
                  latestEcoProfile={resultsEcoProfile ? resultsEcoProfile.name : (profile?.role === "guest" ? "Eco Explorer" : "Earth Guardian")}
                  latestPebScore={resultsPEB || 7.5}
                />
              )}

              {/* BEGIN GAMEPLAY CARD (Hero Banner) */}
              <div className="w-full bg-gradient-to-r from-emerald-950/70 to-teal-950/70 border border-emerald-500/20 text-white rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row items-center justify-between text-center md:text-left gap-6 relative overflow-hidden backdrop-blur-xl">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Leaf className="w-48 h-48 rotate-45" />
                </div>

                <div className="space-y-2 z-10">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 font-mono">
                    CHALLENGE OF THE DAY
                  </span>
                  <h3 className="text-xl md:text-2xl font-bold tracking-tight">
                    ได้เวลาจำลองหนึ่งวันรักษ์โลก ม.DPU 📅
                  </h3>
                  <p className="text-white/80 text-xs sm:text-sm max-w-lg leading-relaxed">
                    คุณจะได้เผชิญหน้ากับคำถามและสถานการณ์ปัญหา 6 ข้อแบบสุ่ม มีผลต่อคาร์บอนและพลังงานร่วมของมหาวิทยาลัย ใช้เวลาไม่เกิน 4-5 นาที
                  </p>
                </div>

                <button
                  onClick={startSimulation}
                  className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-2xl text-xs tracking-wide uppercase transition duration-300 shadow-[0_0_20px_rgba(52,211,153,0.3)] hover:brightness-110 flex items-center space-x-2 z-10 flex-shrink-0 cursor-pointer"
                >
                  <span>เริ่มการตัดสินใจรายรอบ</span>
                  <ChevronRight className="w-4 h-4 text-black" />
                </button>
              </div>

              {/* BADGE STICKERS SUMMARY */}
              {profile && (
                <BadgeCollector unlockedList={profile.badges || ['badge_sustainability_explorer']} />
              )}

              {/* INTERACTIVE LEADERBOARD */}
              {profile && (
                <div className="space-y-3">
                  <LeaderboardView />
                  {profile.role === 'guest' && (
                    <div className="p-3 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded-2xl text-xs text-center font-semibold tracking-tight animate-pulse">
                      💡 เข้าสู่ระบบด้วยบัญชี DPU (@dpu.ac.th) เพื่อนำชื่อคุณขึ้นบันทึกบนกระดานเกียรติยศถาวร!
                    </div>
                  )}
                </div>
              )}

            </motion.div>
          )}

          {/* SCREEN 5: GAMEPLAY SIMULATOR ACTIVE */}
          {gameState === 'playing' && sessionScenarios.length > 0 && (
            <motion.div
              key="playing-screen"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-2xl mx-auto w-full space-y-6"
            >
              
              {/* Gameplay Progression Indicator */}
              <div className="flex items-center justify-between bg-[#0a120f]/80 border border-white/10 p-4 rounded-2xl shadow-lg backdrop-blur-md">
                <div className="space-y-1">
                  <span className="text-[10px] text-white/50 uppercase font-bold tracking-wider block">
                    DAILY DECISION SIMULATOR
                  </span>
                  <span className="text-sm font-bold text-white">
                    ด่านที่ {currentIndex + 1} จาก {sessionScenarios.length} ด่าน
                  </span>
                </div>
                
                {/* Visual Bar progress indicator */}
                <div className="w-24 bg-white/10 rounded-full h-2 overflow-hidden flex p-[1px] border border-white/5">
                  <div 
                    className="h-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)] transition-all duration-300"
                    style={{ width: `${((currentIndex + 1) / sessionScenarios.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Main Scenario Block Card */}
              <div className="bg-white/5 border border-white/10 p-6 rounded-3xl shadow-sm space-y-4 backdrop-blur-md">
                
                {/* Category tag */}
                <div className="flex justify-between items-center sm:flex-row flex-col gap-2">
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-bold leading-none">
                    🎯 หมวด: {sessionScenarios[currentIndex].thaiCategory}
                  </span>
                  
                  {/* Inform matching Event impacts if applicable */}
                  {campusState && (
                    <span className="text-[10px] font-bold text-amber-300 flex items-center space-x-1 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-450 animate-pulse" />
                      <span>ตรวจพบกติกามลพิษจำลองสัปดาห์นี้</span>
                    </span>
                  )}
                </div>

                <h3 className="text-lg md:text-xl font-bold text-white tracking-tight leading-snug">
                  {sessionScenarios[currentIndex].title}
                </h3>

                <p className="text-white/80 text-sm leading-relaxed bg-[#0a120f]/80 p-4 rounded-2xl border border-white/5">
                  {sessionScenarios[currentIndex].description}
                </p>
              </div>

              {/* Choice options list stack */}
              <div className="space-y-3">
                {sessionScenarios[currentIndex].options.map((opt, idx) => {
                  const isSelected = selectedChoice?.text === opt.text;
                  return (
                    <button
                      key={idx}
                      onClick={() => selectOption(opt)}
                      disabled={hasConfirmed}
                      className={`w-full text-left p-4 rounded-2xl border transition-all duration-205 outline-none flex items-start space-x-4 ${
                        hasConfirmed && isSelected
                          ? "bg-emerald-500/15 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.15)] cursor-default"
                          : isSelected
                          ? "bg-emerald-500/20 border-emerald-400 text-white shadow-xs ring-2 ring-emerald-500/20"
                          : hasConfirmed
                          ? "bg-white/5 border-white/5 opacity-30 cursor-not-allowed"
                          : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-emerald-500/30 text-white cursor-pointer"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border ${
                        isSelected ? "bg-emerald-500 border-emerald-400 text-black" : "border-white/30"
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5 text-black font-bold" />}
                      </div>

                      <div className="flex-1">
                        <p className="text-xs sm:text-sm font-semibold tracking-tight">{opt.text}</p>
                        
                        {/* Choice metrics show after pick confirmation, showing immediate Educational feedback */}
                        {hasConfirmed && isSelected && (
                          <div className="mt-3 p-3 bg-black/40 rounded-xl text-xs space-y-2 border border-white/10 shadow-inner">
                            <p className="text-white/85 leading-relaxed text-[11px]">
                              {opt.feedback}
                            </p>
                            <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold text-white pt-2 border-t border-white/10 font-mono">
                              <div className="bg-emerald-500/15 text-emerald-300 py-1 rounded">PEB Score: +{opt.pebScore}</div>
                              <div className="bg-rose-500/15 text-rose-300 py-1 rounded font-normal">Carbon: +{opt.carbonImpact}kg</div>
                              <div className="bg-amber-500/15 text-amber-300 py-1 rounded">Convenience: +{opt.convenienceScore}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Action Controls */}
              <div className="flex justify-end pt-4">
                {!hasConfirmed ? (
                  <button
                    onClick={confirmOption}
                    disabled={!selectedChoice}
                    className={`px-8 py-3 rounded-2xl text-xs font-bold uppercase transition shadow-sm ${
                      selectedChoice 
                        ? "bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold shadow-[0_0_15px_rgba(52,211,153,0.3)] cursor-pointer" 
                        : "bg-white/10 text-white/30 border border-white/5 cursor-not-allowed"
                    }`}
                  >
                    ยืนยันคำตอบหลัก
                  </button>
                ) : (
                  <button
                    onClick={advanceScenario}
                    className="px-8 py-3 bg-emerald-400 hover:bg-emerald-355 bg-emerald-400 hover:brightness-110 text-black rounded-2xl text-xs font-bold uppercase transition shadow-md hover:shadow-lg flex items-center space-x-2 cursor-pointer"
                  >
                    <span>{currentIndex === sessionScenarios.length - 1 ? "สรุปผลการประเมิน" : "ด่านถัดไป"}</span>
                    <ArrowRight className="w-4 h-4 text-black" />
                  </button>
                )}
              </div>

            </motion.div>
          )}

          {/* SCREEN 6: PERSONALIZED RESULT & AI ADVICE */}
          {gameState === 'results' && resultsEcoProfile && (
            <motion.div
              key="results-screen"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-2xl mx-auto w-full space-y-6"
            >
              
              {/* Overall Profile Display Banner */}
              <div className="bg-white/5 border border-white/10 p-6 sm:p-8 rounded-3xl shadow-sm text-center space-y-4 backdrop-blur-md">
                <span className="text-[10px] uppercase font-bold tracking-widest text-white/40 block font-mono">
                  ONE DAY eco SIMULATION COMPLETED
                </span>
                
                {/* Eco Grade Shield */}
                <div className={`mx-auto inline-flex flex-col items-center p-3 px-6 rounded-2xl border text-center ${currentGrade.color}`}>
                  <span className="text-2xl font-black">{currentGrade.label}</span>
                  <span className="text-[10px] font-bold mt-0.5 tracking-tight">{currentGrade.desc}</span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl md:text-2xl font-black text-white">
                    โปรไฟล์: {resultsEcoProfile.name}
                  </h3>
                  <p className="text-xs text-white/70 max-w-md mx-auto leading-relaxed">
                    {resultsEcoProfile.description}
                  </p>
                </div>

                {/* Scorecards list */}
                <div className="grid grid-cols-3 gap-3 text-center pt-4 border-t border-white/10 font-mono">
                  <div className="bg-emerald-500/10 rounded-2xl p-3 border border-emerald-500/20">
                    <span className="text-[10px] uppercase font-bold text-emerald-300 block">PEB Score (1-10)</span>
                    <span className="text-lg font-black text-emerald-450">{resultsPEB.toFixed(2)}_</span>
                  </div>
                  
                  <div className="bg-rose-500/10 rounded-2xl p-3 border border-rose-500/20">
                    <span className="text-[10px] uppercase font-bold text-rose-300 block">Carbon (kg CO2)</span>
                    <span className="text-lg font-black text-rose-450">{resultsCarbon.toFixed(2)}_</span>
                  </div>

                  <div className="bg-cyan-500/10 rounded-2xl p-3 border border-cyan-500/20">
                    <span className="text-[10px] uppercase font-bold text-cyan-300 block">Convenience (1-10)</span>
                    <span className="text-lg font-black text-cyan-455 text-cyan-300">{resultsConvenience.toFixed(1)}_</span>
                  </div>
                </div>
              </div>

              {/* NEWLY UNLOCKED BADGES REWARDS PANEL */}
              <div id="session-rewards-panel" className="bg-gradient-to-r from-emerald-950/40 to-teal-950/40 border border-emerald-500/20 p-6 sm:p-8 rounded-3xl shadow-lg space-y-4 backdrop-blur-md text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <Award className="w-32 h-32 text-emerald-400" />
                </div>
                
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 block font-mono">
                    🏅 REWARDS UNLOCKED • ปลดล็อกรางวัลเกียรติยศ
                  </span>
                  <h4 className="text-sm font-extrabold text-white">
                    คุณบรรลุเงื่อนไขเหรียญรางวัลในเทอมจำลองนี้ทั้งหมด {resultsBadgesEarned.length} เหรียญ
                  </h4>
                </div>

                {resultsBadgesEarned.length > 0 ? (
                  <div className="flex flex-wrap justify-center gap-3 pt-2">
                    {resultsBadgesEarned.map((badgeId) => {
                      const badgeObj = BADGES.find(b => b.id === badgeId);
                      if (!badgeObj) return null;
                      
                      const getIcon = (id: string) => {
                        const styleCls = "w-7 h-7 text-emerald-400";
                        switch (id) {
                          case "badge_earth_guardian": return <Globe className={styleCls} />;
                          case "badge_green_rider": return <Bike className={styleCls} />;
                          case "badge_water_saver": return <Droplets className={styleCls} />;
                          case "badge_energy_hero": return <Zap className={styleCls} />;
                          case "badge_zero_waste": return <Trash2 className={styleCls} />;
                          case "badge_recycling_master": return <RefreshCw className={styleCls} />;
                          case "badge_eco_champion": return <Award className={styleCls} />;
                          case "badge_carbon_cutter": return <Scissors className={styleCls} />;
                          case "badge_public_transport_hero": return <Bus className={styleCls} />;
                          case "badge_sustainability_explorer": return <Compass className={styleCls} />;
                          default: return <Award className={styleCls} />;
                        }
                      };

                      return (
                        <div key={badgeId} className="flex flex-col items-center bg-[#06100c] border border-emerald-500/30 rounded-2xl p-3 px-4 w-36 shadow-md hover:scale-105 transition-all">
                          <div className="p-2.5 bg-emerald-500/10 rounded-full border border-emerald-500/20 mb-2">
                            {getIcon(badgeId)}
                          </div>
                          <span className="text-[10px] font-black text-white leading-tight line-clamp-1">{badgeObj.name.split(" ")[0]}</span>
                          <span className="text-[8px] text-white/50 mt-1 line-clamp-2 leading-tight">{badgeObj.description}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-white/50 italic">ยังไม่มีรางวัลเพิ่มเติมที่เด่นชัดในเซสชันรอบนี้ ลองเล่นรอบใหม่ด้วยตัวเลือกอื่นดูนะ!</p>
                )}
              </div>

              {/* DETAILED DECISION CHRONOLOGY & SCORES BREAKDOWN */}
              <div className="bg-white/5 border border-white/10 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6 backdrop-blur-md">
                <div className="flex items-center space-x-2 pb-4 border-b border-white/10">
                  <div className="p-1.5 bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 rounded-lg">
                    <Calendar className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      สรุปการตัดสินใจและมลพิษรายข้อ (Scenario Choices & Impact Breakdown)
                    </h4>
                    <p className="text-[10px] text-emerald-350 font-bold">สรุปคะแนนพฤติกรรมและการปล่อยก๊าซคาร์บอนจากการตัดสินใจทั้ง 6 ด่าน</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {sessionAnswers.map((ans, idx) => (
                    <div key={idx} className="bg-black/40 p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-200 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-emerald-400">
                          ด่านที่ {idx + 1} • {ans.category}
                        </span>
                        
                        {/* Interactive mini scoreboard for each choice */}
                        <div className="flex flex-wrap items-center gap-1.5 text-[9px] font-mono font-bold">
                          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded">
                            PEB: +{ans.pebScore}
                          </span>
                          <span className={`px-2 py-0.5 border rounded ${
                            ans.carbonImpact <= 0 
                              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' 
                              : ans.carbonImpact > 1.5 
                              ? 'bg-rose-500/10 text-rose-300 border-rose-500/20' 
                              : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                          }`}>
                            CO₂: {ans.carbonImpact > 0 ? '+' : ''}{ans.carbonImpact.toFixed(2)} kg
                          </span>
                          <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 rounded">
                            CONV: +{ans.convenienceScore}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <h5 className="text-xs font-bold text-white leading-snug">
                          {ans.question}
                        </h5>
                        <div className="bg-emerald-500/5 p-2 px-3 rounded-xl border border-emerald-500/10 text-xs text-emerald-300 font-semibold leading-relaxed flex items-start gap-2">
                          <span className="p-0.5 bg-emerald-500/20 text-emerald-300 text-[8px] font-black rounded uppercase tracking-wider mt-0.5">เลือก</span>
                          <span>{ans.choiceText}</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-white/70 leading-relaxed pl-1.5 border-l-2 border-dashed border-white/20">
                        💡 <span className="font-bold text-emerald-400">เรียนรู้ผลลัพธ์:</span> {ans.feedback}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* DYNAMIC GEMINI GENERATIVE INSIGHTS SECTION */}
              <div className="bg-white/5 border border-white/10 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6 backdrop-blur-md">
                <div className="flex items-center space-x-2 pb-4 border-b border-white/10">
                  <div className="p-1.5 bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 rounded-lg">
                    <Sparkles className="w-5 h-5 text-emerald-450 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      บทวิเคราะห์สิ่งแวดล้อมโดยปัญญาประดิษฐ์ (AI Personalized Feedback)
                    </h4>
                    <p className="text-[10px] text-emerald-400 font-bold">Powered by Gemini 3.5 Flash server-side API</p>
                  </div>
                </div>

                {aiLoading ? (
                  <div className="py-12 flex flex-col items-center justify-center space-y-3">
                    <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                    <div className="text-center space-y-1">
                      <span className="text-xs font-bold text-white animate-pulse block">กำลังวิเคราะห์พฤติกรรมการเดินทาง...</span>
                      <span className="text-[10px] text-white/55 block p-1.5 bg-black/20 rounded border border-white/5">เปรียบเทียบรอยเท้าสิ่งแวดล้อมกับดัชนีคาร์บอนสุทธิของ ม.</span>
                    </div>
                  </div>
                ) : geminiFeedback ? (
                  <div className="space-y-6 text-xs md:text-sm">
                    
                    {/* Strengths Grid */}
                    <div className="space-y-2">
                      <h5 className="font-bold text-emerald-400 flex items-center space-x-1">
                        <ThumbsUp className="w-4 h-4 text-emerald-400" />
                        <span>🌟 จุดแข็งของคุณในวันนี้ (Strengths)</span>
                      </h5>
                      <ul className="list-disc list-inside text-white/80 space-y-1 bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/15">
                        {geminiFeedback.strengths?.map((str: string, index: number) => (
                          <li key={index} className="leading-relaxed font-medium">{str}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Weaknesses Grid */}
                    <div className="space-y-2">
                      <h5 className="font-bold text-red-300 flex items-center space-x-1">
                        <AlertTriangle className="w-4 h-4 text-red-405 text-red-300" />
                        <span>⚠️ จุดอ่อนที่สามารถพัฒนาได้อีก (Weaknesses)</span>
                      </h5>
                      <ul className="list-disc list-inside text-white/80 space-y-1 bg-rose-500/5 p-4 rounded-2xl border border-rose-500/15">
                        {geminiFeedback.weaknesses?.map((weak: string, index: number) => (
                          <li key={index} className="leading-relaxed font-medium">{weak}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Actionable Suggestions */}
                    <div className="space-y-2">
                      <h5 className="font-bold text-cyan-300 flex items-center space-x-1">
                        <Leaf className="w-4 h-4 text-cyan-350 text-cyan-300" />
                        <span>🌱 ข้อเสนอแนะเชิงรุกสอดคล้องความสะดวกสบาย (Suggestions)</span>
                      </h5>
                      <ul className="list-disc list-inside text-white/80 space-y-1 bg-cyan-500/5 p-4 rounded-2xl border border-cyan-500/15">
                        {geminiFeedback.suggestions?.map((sug: string, index: number) => (
                          <li key={index} className="leading-relaxed font-medium">{sug}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Inspiring quote */}
                    {geminiFeedback.summaryQuote && (
                      <div className="bg-black/40 text-emerald-400 p-4 rounded-2xl text-center font-bold tracking-tight text-xs border-l-4 border-emerald-450 italic">
                        "{geminiFeedback.summaryQuote}"
                      </div>
                    )}

                  </div>
                ) : (
                  <p className="text-xs text-rose-455 text-rose-400 font-medium tracking-tight">ไม่ได้รับเอกสารส่งวิเคราะห์สิ่งแวดล้อม กรุณาลองใหม่อีกครั้ง</p>
                )}
              </div>

              {/* ACTION: COMPLETE AND GO TO COMMITMENT SELECT */}
              <div className="flex justify-end">
                <button
                  onClick={() => setGameState('commitment_select')}
                  className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-2xl text-xs uppercase transition shadow-md hover:shadow-lg flex items-center space-x-2 cursor-pointer"
                >
                  <span>ให้คำมั่นสัญญา & บันทึกประวัติเพื่อส่วนรวม</span>
                  <ArrowRight className="w-4 h-4 text-black" />
                </button>
              </div>

            </motion.div>
          )}

          {/* SCREEN 7: COMMITMENT SELECT TARGET GOAL */}
          {gameState === 'commitment_select' && (
            <motion.div
              key="commitment-screen"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-md mx-auto w-full bg-[#0a120f]/90 backdrop-blur-xl border border-white/10 p-6 sm:p-8 rounded-3xl shadow-xl space-y-6"
            >
              <div className="text-center space-y-2">
                <Compass className="w-10 h-10 text-emerald-400 mx-auto animate-pulse" />
                <h3 className="text-lg font-bold text-white">
                  เลือกเป้าหมายคำมั่นสัญญาของคุณ 🤝
                </h3>
                <p className="text-white/70 text-xs leading-relaxed max-w-sm mx-auto">
                  การให้คำสัญญาล่วงหน้าเป็นกุญแจสำคัญนำพาสู่พฤติกรรมรักษ์โลกที่ยั่งยืน เลือก 1 ข้อปณิธานที่คุณจะลงมือทำจริงในมหาวิทยาลัยสัปดาห์นี้
                </p>
              </div>

              <div className="space-y-2.5">
                {[
                  "พกกระบอกน้ำส่วนตัวและแก้วน้ำสแตนเลสเก็บอุณหภูมิมาคาเฟ่ ม. เสมอ",
                  "เลือกเดินออกกำลังกายขึ้นบันไดตึกแทนลิฟต์ในระยะไม่เกิน 3 ชั้นเรียน",
                  "แยกประเภทขวดแก้ว พลาสติก และกล่องกระดาษแบนลู่ก่อนโยนลงถังขยะ ม.",
                  "เลือกนั่งรถรางไฟฟ้า (EV Campus Tram) หรือใช้จักรยานไฟฟ้าแบ่งปัน",
                  "ปฏิเสธการรับหลอดพลาสติก ถุงหิ้ว และทิชชูดึงกระดาษในสโมสรอาคาร"
                ].map((goalItem, index) => {
                  const isCur = selectedGoal === goalItem;
                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedGoal(goalItem)}
                      className={`w-full text-left p-4 rounded-2xl border text-xs font-semibold leading-relaxed transition ${
                        isCur
                          ? "bg-emerald-500/20 border-emerald-450 text-emerald-300 font-bold ring-2 ring-emerald-500/10 shadow-[0_0_15px_rgba(52,211,153,0.15)]"
                          : "bg-white/5 border-white/5 text-white/80 hover:bg-white/10 hover:border-white/20"
                      }`}
                    >
                      🌱 {goalItem}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => selectedGoal && submitCommitmentGoal(selectedGoal)}
                disabled={!selectedGoal}
                className={`w-full py-3 rounded-2xl text-xs font-bold uppercase transition shadow-sm ${
                  selectedGoal 
                    ? "bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold cursor-pointer shadow-[0_0_15px_rgba(52,211,153,0.3)]" 
                    : "bg-white/10 text-white/30 border border-white/5 cursor-not-allowed"
                }`}
              >
                บันทึกปณิธานและเสร็จสิ้นการเล่น
              </button>
            </motion.div>
          )}

        </AnimatePresence>

      </main>

      {/* MODAL: PREVIOUS COMMITMENT OBLIGATION FOLLOW UP */}
      {showCommitmentModal && prevCommitment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-[#0a120f] p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl max-w-sm w-full text-center space-y-5"
          >
            <Compass className="w-12 h-12 text-emerald-400 mx-auto animate-spin-slow" />
            
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-white">
                คุณทำตามคำมั่นสัญญาสำเร็จหรือไม่? 🎉
              </h3>
              <p className="text-white/70 text-xs leading-normal">
                ปณิธานที่คุณตั้งไว้ในการเล่นเซสชันรอบก่อนหน้านี้ของคุณคือ:
              </p>
              <div className="bg-emerald-500/10 text-emerald-300 p-3 rounded-xl border border-emerald-500/20 font-bold text-xs italic mt-2 shadow-inner">
                " {prevCommitment.goal} "
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => checkPrevCommitment(false)}
                className="py-2.5 bg-white/5 hover:bg-white/10 text-white/70 border border-white/5 font-bold rounded-xl text-xs transition"
              >
                ❌ พลาดไปรอบนี้
              </button>
              <button
                onClick={() => checkPrevCommitment(true)}
                className="py-2.5 bg-emerald-550 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-xl text-xs transition shadow-[0_0_12px_rgba(52,211,153,0.3)] flex items-center justify-center space-x-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>สำเร็จจริงจัง!</span>
              </button>
            </div>
            
            <p className="text-[10px] text-white/40">
              * การรักษาคำมั่นสัญญาจะมอบแต้มโบนัสผลักดันดัชนีมหาวิทยาลัย +3 แต้มระดับชุมชน!
            </p>
          </motion.div>
        </div>
      )}

      {/* CAMPUS ECO FOOTER */}
      <footer className="border-t border-white/10 px-4 py-8 mt-12 text-center text-[11px] text-white/40 space-y-1">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 font-medium text-white/40">
          <p>© 2026 PEB Journey Simulator V2.1. สงวนลิขสิทธิ์ร่วมมือกันกู้สิ่งแวดล้อมวิทยเขต DPU</p>
          <div className="flex space-x-4">
            <span className="text-emerald-400 font-semibold cursor-default">Dhurakij Pundit University</span>
            <span>•</span>
            <span className="cursor-default">Pro-Environmental Behaviour</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
