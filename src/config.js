// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCy_ZaXhd8c4EMbqh2h-sA0nThELizaAN0",
  authDomain: "eventmanagement-fc972.firebaseapp.com",
  projectId: "eventmanagement-fc972",
  storageBucket: "eventmanagement-fc972.firebasestorage.app",
  messagingSenderId: "213118178898",
  appId: "1:213118178898:web:145869613b6179256af18b",
  measurementId: "G-7C25EKGN8M"
};
// Add this debug log
console.log('Checking Firebase config:', {
  hasApiKey: !!firebaseConfig.apiKey,
  hasAuthDomain: !!firebaseConfig.authDomain,
  hasProjectId: !!firebaseConfig.projectId,
  hasStorageBucket: !!firebaseConfig.storageBucket,
  hasMessagingSenderId: !!firebaseConfig.messagingSenderId,
  hasAppId: !!firebaseConfig.appId
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Add this to verify initialization
console.log('Firebase initialized:', app.name);
console.log('Auth initialized:', auth.currentUser);
console.log('Firestore initialized:', db);

export { auth, db };
export default app;