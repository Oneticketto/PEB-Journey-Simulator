import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously as firebaseSignInAnonymously,
  signInWithEmailAndPassword as firebaseSignInWithEmailAndPassword,
  createUserWithEmailAndPassword as firebaseCreateUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc,
  collection, 
  query, 
  orderBy, 
  limit, 
  updateDoc,
  getDocFromServer
} from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
  }
}

// Check if Firebase is fully provisioned
export const isFirebaseReady = !!(firebaseConfig && firebaseConfig.apiKey);

let appInstance: any = null;
export let auth: any = null;
export let db: any = null;

if (isFirebaseReady) {
  try {
    appInstance = initializeApp(firebaseConfig);
    db = getFirestore(appInstance, firebaseConfig.firestoreDatabaseId);
    auth = getAuth(appInstance);
    console.log("Firebase initialized successfully in cloud sync mode.");
    
    // Validate connection to Firestore as required by the Firebase Integration Skill
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. Client is offline.");
        }
      }
    };
    testConnection();
  } catch (err) {
    console.error("Failed to initialize Firebase app: ", err);
  }
} else {
  console.log("Firebase Config is empty. PEB Simulator running in offline-local mode.");
}

// Standard helper from Firebase Integration Skill to capture permission failures
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || 'anonymous-local',
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || false,
      isAnonymous: auth?.currentUser?.isAnonymous || true,
    },
    operationType,
    path
  };
  console.error('Firestore Security/Quota Failure: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ----------------------------------------------------
// Unified APIs supporting BOTH Firebase and LocalStorage Fallback
// ----------------------------------------------------

export interface UserProfile {
  email: string | null;
  displayName: string;
  role: 'student' | 'guest' | 'admin';
  badges: string[];
  totalGames: number;
  createdAt: string;
}

export interface GameplaySession {
  uid: string;
  answers: Array<{
    categoryId: string;
    category: string;
    question: string;
    choiceText: string;
    pebScore: number;
    carbonImpact: number;
    convenienceScore: number;
  }>;
  pebScore: number;
  carbonScore: number;
  ecoProfile: string;
  commitment: string;
  timestamp: string;
}

export interface LeaderboardEntry {
  uid: string;
  displayName: string;
  score: number;
  rank: number;
  lastUpdated: string;
}

export interface LocalCommitment {
  uid: string;
  goal: string;
  completed: boolean;
  createdAt: string;
}

export interface GlobalCampusState {
  greenCampusIndex: number;
  weeklyEvent: string;
  monthlyEvent: string;
  updatedAt: string;
}

// 1. Auth Listeners & Wrappers
export function subscribeToAuth(callback: (user: any) => void) {
  if (isFirebaseReady && auth) {
    return onAuthStateChanged(auth, callback);
  } else {
    // Local mock auth detection
    const mockUser = JSON.parse(localStorage.getItem("peb_mock_auth_user") || "null");
    callback(mockUser);
    return () => {};
  }
}

// 2. Sign In Anonymously (Guest)
export async function signInAsGuest() {
  if (isFirebaseReady && auth) {
    try {
      const cred = await firebaseSignInAnonymously(auth);
      return cred.user;
    } catch (err) {
      console.error("Anonymous signin failed:", err);
      throw err;
    }
  } else {
    const mockId = localStorage.getItem("peb_mock_uid") || "guest_" + Math.random().toString(36).substr(2, 9);
    localStorage.setItem("peb_mock_uid", mockId);
    const mockUser = {
      uid: mockId,
      isAnonymous: true,
      email: null,
      displayName: "นักศึกษาทั่วไป"
    };
    localStorage.setItem("peb_mock_auth_user", JSON.stringify(mockUser));
    return mockUser;
  }
}

// 3. Email & Password Signin/Registration for DPU (@dpu.ac.th)
export async function registerDPUUser(emailInput: string, passwordInput: string, nameInput: string) {
  if (!emailInput.toLowerCase().endsWith("@dpu.ac.th")) {
    throw new Error("ต้องใช้ที่อยู่อีเมลสถาบันลงท้ายด้วย @dpu.ac.th เท่านั้น");
  }

  if (isFirebaseReady && auth && db) {
    try {
      const cred = await firebaseCreateUserWithEmailAndPassword(auth, emailInput, passwordInput);
      const profile: UserProfile = {
        email: emailInput,
        displayName: nameInput,
        role: 'student',
        badges: ['badge_sustainability_explorer'],
        totalGames: 0,
        createdAt: new Date().toISOString()
      };
      
      const userRefPath = `users/${cred.user.uid}`;
      try {
        await setDoc(doc(db, 'users', cred.user.uid), profile);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, userRefPath);
      }
      
      return cred.user;
    } catch (err) {
      console.error("Firebase registration failed:", err);
      throw err;
    }
  } else {
    const mockId = "dpu_" + Math.random().toString(36).substr(2, 9);
    const mockUser = {
      uid: mockId,
      isAnonymous: false,
      email: emailInput,
      displayName: nameInput
    };
    const profile: UserProfile = {
      email: emailInput,
      displayName: nameInput,
      role: 'student',
      badges: ['badge_sustainability_explorer'],
      totalGames: 0,
      createdAt: new Date().toISOString()
    };
    
    localStorage.setItem("peb_mock_auth_user", JSON.stringify(mockUser));
    localStorage.setItem(`peb_profile_${mockId}`, JSON.stringify(profile));
    
    // Add default entry to Mock Leaderboard
    const leaderboard = JSON.parse(localStorage.getItem("peb_mock_leaderboard") || "[]");
    leaderboard.push({
      uid: mockId,
      displayName: nameInput,
      score: 0,
      rank: leaderboard.length + 1,
      lastUpdated: new Date().toISOString()
    });
    localStorage.setItem("peb_mock_leaderboard", JSON.stringify(leaderboard));
    
    return mockUser;
  }
}

export async function loginDPUUser(emailInput: string, passwordInput: string) {
  if (isFirebaseReady && auth) {
    try {
      const cred = await firebaseSignInWithEmailAndPassword(auth, emailInput, passwordInput);
      return cred.user;
    } catch (err) {
      console.error("Firebase Auth login failed:", err);
      throw err;
    }
  } else {
    // In local mock, search existing profiles
    const mockId = localStorage.getItem("peb_mock_uid") || "dpu_" + Math.random().toString(36).substr(2, 9);
    const mockUser = {
      uid: mockId,
      isAnonymous: false,
      email: emailInput,
      displayName: emailInput.split('@')[0]
    };
    localStorage.setItem("peb_mock_auth_user", JSON.stringify(mockUser));
    return mockUser;
  }
}

export async function logOutUser() {
  if (isFirebaseReady && auth) {
    await firebaseSignOut(auth);
  } else {
    localStorage.removeItem("peb_mock_auth_user");
  }
  // Fast window reload or state reset
  window.dispatchEvent(new Event("auth_change"));
}

// 4. Fetch User Profile
export async function fetchProfile(uid: string): Promise<UserProfile | null> {
  if (isFirebaseReady && db) {
    const p = `users/${uid}`;
    try {
      const d = await getDoc(doc(db, 'users', uid));
      if (d.exists()) {
        return d.data() as UserProfile;
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, p);
    }
    return null;
  } else {
    const raw = localStorage.getItem(`peb_profile_${uid}`);
    if (raw) return JSON.parse(raw);
    
    // Fallback profile if none exists
    const mockUser = JSON.parse(localStorage.getItem("peb_mock_auth_user") || "{}");
    const newProfile: UserProfile = {
      email: mockUser.email || null,
      displayName: mockUser.displayName || "นักศึกษาทั่วไป",
      role: mockUser.email ? 'student' : 'guest',
      badges: ['badge_sustainability_explorer'],
      totalGames: 0,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem(`peb_profile_${uid}`, JSON.stringify(newProfile));
    return newProfile;
  }
}

// 5. Save/Update User Profile
export async function saveProfile(uid: string, profile: UserProfile) {
  if (isFirebaseReady && db) {
    const p = `users/${uid}`;
    try {
      await setDoc(doc(db, 'users', uid), profile);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, p);
    }
  } else {
    localStorage.setItem(`peb_profile_${uid}`, JSON.stringify(profile));
  }
}

// 6. Save Gameplay Session
export async function saveSession(session: GameplaySession) {
  if (isFirebaseReady && db) {
    const pathSession = "sessions";
    try {
      await addDoc(collection(db, pathSession), {
        ...session,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, pathSession);
    }
  } else {
    const sessions = JSON.parse(localStorage.getItem("peb_mock_sessions") || "[]");
    sessions.push(session);
    localStorage.setItem("peb_mock_sessions", JSON.stringify(sessions));
  }

  // Also update totalGames in User profile
  const profile = await fetchProfile(session.uid);
  if (profile) {
    profile.totalGames += 1;
    // Append any newly earned badges
    const earned = evaluateBadgesEarned(session);
    earned.forEach(bId => {
      if (!profile.badges.includes(bId)) {
        profile.badges.push(bId);
      }
    });
    await saveProfile(session.uid, profile);

    // Update leaderboard if user is authenticated (not guest)
    if (profile.role === 'student' && profile.email) {
      await updateLeaderboardScore(session.uid, profile.displayName, session.pebScore);
    }
  }

  // Update Campus State Index community score
  // Excellent gameplay pulls the Campus Index higher. Destructive pulls it down.
  const diffIndex = Math.round((session.pebScore - 5.0) * 1.5); // ranges from -6 to +7.5
  await scoreCampusIndexCommunity(diffIndex);
}

// Helper badge logic based on user session decision parameters
export function evaluateBadgesEarned(session: GameplaySession): string[] {
  const list: string[] = ['badge_sustainability_explorer'];
  if (session.pebScore >= 8.5) {
    list.push('badge_earth_guardian');
  }
  
  // Checking specific decisions for category metrics
  const hasElectricRide = session.answers.some(ans => 
    ans.category === "Transportation" && (ans.choiceText.includes("ไฟฟ้า") || ans.choiceText.includes("รถรางไฟฟ้า"))
  );
  if (hasElectricRide) {
    list.push('badge_green_rider');
    list.push('badge_public_transport_hero');
  }

  const hasHighWaterScore = session.answers.some(ans => 
    ans.category === "Water" && ans.pebScore >= 9
  );
  if (hasHighWaterScore) {
    list.push('badge_water_saver');
  }

  const hasPowerSaved = session.answers.some(ans => 
    ans.category === "Energy" && ans.pebScore >= 9
  );
  if (hasPowerSaved) {
    list.push('badge_energy_hero');
  }

  const cleanWasteLimit = session.answers.some(ans => 
    ans.category === "Waste" && ans.pebScore >= 9
  );
  if (cleanWasteLimit) {
    list.push('badge_zero_waste');
  }

  const recyclers = session.answers.some(ans => 
    ans.category === "Recycling" && ans.pebScore >= 9
  );
  if (recyclers) {
    list.push('badge_recycling_master');
  }

  const volunteer = session.answers.some(ans => 
    ans.category === "After School Activities" && ans.pebScore >= 9
  );
  if (volunteer) {
    list.push('badge_eco_champion');
  }

  if (session.carbonScore <= 3.0) {
    list.push('badge_carbon_cutter');
  }

  return list;
}

// 7. Update Leaderboard Entry
export async function updateLeaderboardScore(uid: string, name: string, pebScore: number) {
  if (isFirebaseReady && db) {
    const leadPath = `leaderboard/${uid}`;
    try {
      const docRef = doc(db, 'leaderboard', uid);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        const existingData = snapshot.data();
        if (pebScore > existingData.score) {
          await updateDoc(docRef, {
            score: pebScore,
            lastUpdated: new Date().toISOString()
          });
        }
      } else {
        await setDoc(docRef, {
          uid,
          displayName: name,
          score: pebScore,
          rank: 100, // calculated visually on the web
          lastUpdated: new Date().toISOString()
        } as LeaderboardEntry);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, leadPath);
    }
  } else {
    const leaderboard = JSON.parse(localStorage.getItem("peb_mock_leaderboard") || "[]");
    const existing = leaderboard.find((row: any) => row.uid === uid);
    if (existing) {
      if (pebScore > existing.score) {
        existing.score = pebScore;
        existing.lastUpdated = new Date().toISOString();
      }
    } else {
      leaderboard.push({
        uid,
        displayName: name,
        score: pebScore,
        rank: 1,
        lastUpdated: new Date().toISOString()
      });
    }
    localStorage.setItem("peb_mock_leaderboard", JSON.stringify(leaderboard));
  }
}

// 8. Fetch Leaderboard Entries
export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  if (isFirebaseReady && db) {
    const pathLead = 'leaderboard';
    try {
      const q = query(collection(db, 'leaderboard'), orderBy('score', 'desc'), limit(15));
      const res = await getDocs(q);
      const entries: LeaderboardEntry[] = [];
      res.forEach(d => {
        entries.push(d.data() as LeaderboardEntry);
      });
      // Sort and assign rank visually
      return entries.sort((a,b) => b.score - a.score).map((entry, index) => ({
        ...entry,
        rank: index + 1
      }));
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, pathLead);
    }
    return [];
  } else {
    const leaderboard = JSON.parse(localStorage.getItem("peb_mock_leaderboard") || "[]");
    // Sort and attach ranks dynamically
    return leaderboard
      .sort((a: any, b: any) => b.score - a.score)
      .map((entry: any, index: number) => ({
        ...entry,
        rank: index + 1
      }))
      .slice(0, 15);
  }
}

// 9. Fetch Commitment goal for tracking
export async function getActiveCommitment(uid: string): Promise<LocalCommitment | null> {
  if (isFirebaseReady && db) {
    const path = "commitments";
    try {
      const q = query(collection(db, path), orderBy("createdAt", "desc"), limit(1));
      const snapshot = await getDocs(q);
      let found: LocalCommitment | null = null;
      snapshot.forEach(docSnap => {
        const item = docSnap.data();
        if (item.uid === uid) {
          found = item as LocalCommitment;
        }
      });
      return found;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
    }
  }
  
  // Local Fallback
  const commitments = JSON.parse(localStorage.getItem("peb_mock_commitments") || "[]");
  const filtered = commitments.filter((c: any) => c.uid === uid);
  if (filtered.length > 0) {
    return filtered[filtered.length - 1]; // return the latest
  }
  return null;
}

// 10. Select commitments
export async function selectCommitment(uid: string, goal: string) {
  const newItem: LocalCommitment = {
    uid,
    goal,
    completed: false,
    createdAt: new Date().toISOString()
  };

  if (isFirebaseReady && db) {
    const pathCommit = "commitments";
    try {
      await addDoc(collection(db, pathCommit), newItem);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, pathCommit);
    }
  } else {
    const commitments = JSON.parse(localStorage.getItem("peb_mock_commitments") || "[]");
    commitments.push(newItem);
    localStorage.setItem("peb_mock_commitments", JSON.stringify(commitments));
  }
}

// 11. Complete commitments
export async function updateCommitmentStatus(uid: string, completed: boolean) {
  if (isFirebaseReady && db) {
    const pathCommit = "commitments";
    try {
      const q = query(collection(db, pathCommit), orderBy("createdAt", "desc"), limit(1));
      const s = await getDocs(q);
      s.forEach(async (docSnap) => {
        const data = docSnap.data();
        if (data.uid === uid) {
          await updateDoc(doc(db, pathCommit, docSnap.id), { completed });
        }
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, pathCommit);
    }
  } else {
    const commitments = JSON.parse(localStorage.getItem("peb_mock_commitments") || "[]");
    const index = commitments.map((c: any) => c.uid).lastIndexOf(uid);
    if (index !== -1) {
      commitments[index].completed = completed;
      localStorage.setItem("peb_mock_commitments", JSON.stringify(commitments));
    }
  }
}

// 12. Fetch community Green Campus Index & Weekly/Monthly Challenge
export async function fetchGlobalCampusState(): Promise<GlobalCampusState> {
  const defaultState: GlobalCampusState = {
    greenCampusIndex: 78, // Initial Healthy campus
    weeklyEvent: "event_recycling_week",
    monthlyEvent: "event_green_month",
    updatedAt: new Date().toISOString()
  };

  if (isFirebaseReady && db) {
    const pathGlobal = "campus_state/global";
    try {
      const d = await getDoc(doc(db, 'campus_state', 'global'));
      if (d.exists()) {
        return d.data() as GlobalCampusState;
      } else {
        // Bootstrap global index if empty
        return defaultState;
      }
    } catch (err) {
      console.warn("Could not read remote campus state (Admin update settings). Using fallback.");
    }
  }

  // Local persistence for campus state
  const localVal = localStorage.getItem("peb_campus_state_global");
  if (localVal) {
    return JSON.parse(localVal);
  } else {
    localStorage.setItem("peb_campus_state_global", JSON.stringify(defaultState));
    return defaultState;
  }
}

// Helper to push index up/down based on player decision session outputs
// Helper to push index up/down based on player decision session outputs
export async function updateGlobalCampusState(state: GlobalCampusState) {
  if (isFirebaseReady && db) {
    try {
      await setDoc(doc(db, 'campus_state', 'global'), state);
    } catch (err) {
      // ignore
    }
  }
  localStorage.setItem("peb_campus_state_global", JSON.stringify(state));
}

export async function scoreCampusIndexCommunity(diff: number) {
  const state = await fetchGlobalCampusState();
  let nextVal = state.greenCampusIndex + diff;
  if (nextVal > 100) nextVal = 100;
  if (nextVal < 0) nextVal = 0;
  
  state.greenCampusIndex = nextVal;
  state.updatedAt = new Date().toISOString();
  
  // Decide active level 2 & 3 rotation events dynamically based on community score!
  // Negative campus state triggers crisis events as requested: "Negative campus state: Environmental challenges, Crisis events, Recovery objectives"
  if (nextVal <= 39) {
    state.weeklyEvent = "event_pm25"; // PM2.5 Crisis
    state.monthlyEvent = "event_pollution_crisis"; // Total air pollution crisis
  } else if (nextVal <= 59) {
    state.weeklyEvent = "event_water_failed"; // Water station failure
    state.monthlyEvent = "event_dpu_festival"; // Crowded waste alert
  } else {
    state.weeklyEvent = "event_recycling_week"; // positive university incentives!
    state.monthlyEvent = "event_green_month"; // Tree green month
  }

  if (isFirebaseReady && db) {
    try {
      // Best-effort push (will work if collection allows write or we run client-accumulated update helper)
      await setDoc(doc(db, 'campus_state', 'global'), state);
    } catch (err) {
      // Expected to fail if write is locked by rules_v2 "allow write: if false;". 
      // This is perfectly fine; the client will maintain the accumulated value locally!
    }
  }

  localStorage.setItem("peb_campus_state_global", JSON.stringify(state));
}
