// src/firebase.js
import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getDatabase } from "firebase/database"

const firebaseConfig = {
  apiKey: "AIzaSyAhSxnq1g-Njqsp81SUfsgitEYSG_YH0CU",
  authDomain: "e-conference-5dbec.firebaseapp.com",
  databaseURL: "https://e-conference-5dbec-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "e-conference-5dbec",
  storageBucket: "e-conference-5dbec.appspot.com",
  messagingSenderId: "202916124909",
  appId: "1:202916124909:web:1137b21091574ed66554e4"
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getDatabase(app)

export { auth, db }
