
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// My web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBl93bxb08HphWjOsqJPwORRwkmC7v4zd8",
    authDomain: "todolist-a32c2.firebaseapp.com",
    projectId: "todolist-a32c2",
    storageBucket: "todolist-a32c2.appspot.com",
    messagingSenderId: "450623495029",
    appId: "1:450623495029:web:c3094192114a3844afd13c",
    measurementId: "G-D8DDE2PC2T"
  };
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
export { app, auth, db };
export default app;