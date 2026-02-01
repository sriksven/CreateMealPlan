import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB84sOBrp769Su2FCQ10BpCpbY3hfK3EXI",
  authDomain: "createmeal-952f2.firebaseapp.com",
  projectId: "createmeal-952f2",
  storageBucket: "createmeal-952f2.firebasestorage.app",
  messagingSenderId: "206008815595",
  appId: "1:206008815595:web:358b97fa52840e67b253ae",
  measurementId: "G-DXS6G5ZFJ8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ THESE MUST BE EXPORTED
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);