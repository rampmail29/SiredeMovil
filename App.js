import React from 'react';
window.navigator.userAgent = "ReactNative";
import MainNavigator from './components/MainNavigator';
import FlashMessage from 'react-native-flash-message';

export default function App() {
  return (
    <>
      <MainNavigator />
      <FlashMessage position="center" />
    </>
  );
}
