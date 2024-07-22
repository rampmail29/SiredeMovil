import React from 'react';
window.navigator.userAgent = "ReactNative";
import Toast from 'react-native-toast-message';
import MainNavigator from './components/MainNavigator';
import FlashMessage from 'react-native-flash-message';
import { auth, firestore, storage } from './firebaseConfig'; // Importa desde firebaseConfig

export default function App() {
  return (
    <>
      <MainNavigator />
      <Toast />
      <FlashMessage position="center" />
    </>
  );
}
