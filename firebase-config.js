
  // Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyBSmpn5W6KEDOmF6N1nkat7X32VUjpipFE",
    authDomain: "cafeportal-2408a.firebaseapp.com",
    projectId: "cafeportal-2408a",
    storageBucket: "cafeportal-2408a.firebasestorage.app",
    messagingSenderId: "84046345934",
    appId: "1:84046345934:web:5db1b44fbfbd624697429f",
    measurementId: "G-P4XFNR4EMM"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
