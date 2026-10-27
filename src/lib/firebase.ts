import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { 
  getFirestore, 
  initializeFirestore, 
  Firestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBlOxvGvw3-KddRfK63EOKhrM4MjA1wpNY",
  authDomain: "total-beauty-crm.firebaseapp.com",
  databaseURL: "https://total-beauty-crm-default-rtdb.firebaseio.com",
  projectId: "total-beauty-crm",
  storageBucket: "total-beauty-crm.firebasestorage.app",
  messagingSenderId: "790991554884",
  appId: "1:790991554884:web:7d52bbc3e4fd1e442d6f11"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

let db: Firestore;
try {
  db = initializeFirestore(app, { experimentalForceLongPolling: true });
} catch (e) {
  db = getFirestore(app);
}

const auth = getAuth(app);

export { 
  app, 
  auth, 
  db,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp
};
