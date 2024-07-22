// firebaseConfig.js
import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCkDk2xD7q0wTXhBe0Q8h6ki2QksJMGY40",
  authDomain: "autentica-d77b1.firebaseapp.com",
  projectId: "autentica-d77b1",
  storageBucket: "autentica-d77b1.appspot.com",
  messagingSenderId: "967972264186",
  appId: "1:967972264186:web:17bce19fbb7c64a8229143",
  measurementId: "G-MGRQKSDB4K"
};

// Inicializa Firebase solo si no ha sido inicializado previamente
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Inicializa Firebase Auth con persistencia en React Native
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Inicializa Firestore y Storage
const firestore = getFirestore(app);
const storage = getStorage(app);

export { auth, firestore, storage };
