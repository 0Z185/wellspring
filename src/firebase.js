import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAnowMQZshTBK8hdypSJURwfZlGnQecgZA",
  authDomain: "wellspring-abd4c.firebaseapp.com",
  projectId: "wellspring-abd4c",
  storageBucket: "wellspring-abd4c.firebasestorage.app",
  messagingSenderId: "1002164179258",
  appId: "1:1002164179258:web:c6e828d825810ab4bf4003",
  measurementId: "G-87MC88H4FW"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
