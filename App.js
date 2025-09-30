/*
 *
 *  Esta es la versión antigue del script de app.js
 *
 */
/* import React from 'react';
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
 */

/*
 *
 *  Esta es la versión nueva del script de app.js
 *
 */

console.log('[App] start (before any screen)');

import './firebaseConfig';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebaseConfig';
import MainNavigator from './components/MainNavigator';
import InicioSesion from './components/InicioSesion';

const Stack = createNativeStackNavigator();

function AuthGate() {
  const [user, setUser] = React.useState(undefined);

  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return () => unsub();
  }, []);

  if (user === undefined) return null; // splash / loading

  return (
    <Stack.Navigator>
      {user ? (
        <Stack.Screen name="Home" component={MainNavigator}/>
      ) : (
        <Stack.Screen name="Login" component={InicioSesion}/>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <AuthGate />
    </NavigationContainer>
  );
}


// App.js (primera línea)
/* import "./firebaseConfig";

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { onAuthStateChanged } from "firebase/auth"; // ✅ desde el SDK
import { auth } from "./firebaseConfig"; // ✅ singleton desde tu config

function AuthGate({ children }) {
  const [ready, setReady] = React.useState(false);
  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, () => setReady(true));
    return unsub;
  }, []);
  if (!ready) return null; // o tu Splash
  return children;
}

export default function App() {
  return (
    <AuthGate>
      <NavigationContainer>{}</NavigationContainer>
    </AuthGate>
  );
}
 */