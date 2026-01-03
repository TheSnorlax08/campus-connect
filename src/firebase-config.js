import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCcrqBWoOMU694zuGroCSgjoLIdcZMwH2g",
  authDomain: "campus-connect-ai-eaaf6.firebaseapp.com",
  projectId: "campus-connect-ai-eaaf6",
  storageBucket: "campus-connect-ai-eaaf6.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);