// components/MainNavigator.js

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import VideoScreen from "./VideoScreen";
import InicioSesion from "./InicioSesion";
import DrawerNavi from "./DrawerNavi"; // Asegúrate de que DrawerNavi esté importado
import PasswordChangeScreen from "./PasswordChangeScreen"; // Importa la pantalla
const Stack = createNativeStackNavigator();
import StudentDetail2 from "./StudentDetail2";
import CerrarSesion from "./CerrarSesion";
import AccessRequestForm from "./AccessRequestForm";
import InitialSetupScreen from "./InitialSetupScreen";
import ConfigList from "./ConfigList";
import TabInicio from "./TabInicio";

export default function MainNavigator() {
  return (
    <Stack.Navigator initialRouteName="VideoScreen">
      <Stack.Screen
        name="VideoScreen"
        component={VideoScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="InicioSesion"
        component={InicioSesion}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DrawerNavi"
        component={DrawerNavi}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="StudentDetail2"
        component={StudentDetail2}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CerrarSesion"
        component={CerrarSesion}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AccessRequest"
        component={AccessRequestForm}
        options={{ headerShown: false, title: "Solicitud de Acceso" }}
      />
      <Stack.Screen
        name="PasswordChangeScreen"
        component={PasswordChangeScreen}
        options={{ headerShown: false }}
      />      
      <Stack.Screen
        name="InitialSetupScreen"
        component={InitialSetupScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ConfigList"
        component={ConfigList}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TabInicio"
        component={TabInicio}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
