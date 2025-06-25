// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyARzfWHIKzaeRPR34LHvjv-5Egcf-VD9PI",
  authDomain: "promp-to-pin.firebaseapp.com",
  projectId: "promp-to-pin",
  storageBucket: "promp-to-pin.firebasestorage.app",
  messagingSenderId: "490459937610",
  appId: "1:490459937610:web:7c10c56e611976308c5fb3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default app;