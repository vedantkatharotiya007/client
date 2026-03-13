import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = { 
    apiKey: "AIzaSyDTjzGCwEsAGSlziwbMNtYYuTetV5Bx52U",
  authDomain: "chat-app-77261.firebaseapp.com",
  projectId: "chat-app-77261",
  storageBucket: "chat-app-77261.firebasestorage.app",
  messagingSenderId: "128759658545",
  appId: "1:128759658545:web:f41730afb9f2252e57fd10",
};

const app = initializeApp(firebaseConfig);

export const messaging =
  typeof window !== "undefined" ? getMessaging(app) : null;