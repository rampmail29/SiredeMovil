// components/MainNavigator.js
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import VideoScreen from "./VideoScreen";
import InicioSesion from "./InicioSesion";
import DrawerNavi from "./DrawerNavi";
import PasswordChangeScreen from "./PasswordChangeScreen";
import StudentDetail2 from "./StudentDetail2";
import CerrarSesion from "./CerrarSesion";
import AccessRequestForm from "./AccessRequestForm";
import InitialSetupScreen from "./InitialSetupScreen";
import ConfigList from "./ConfigList";
import InformeEstudiante from "./InformeEstudiante";
import InformeCarrera from "./InformeCarrera";
import StudentDetail from "./StudentDetail";
import GraficarPdf from "./GraficarPdf";

const Stack = createNativeStackNavigator();

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
        name="PasswordChangeScreen"
        component={PasswordChangeScreen}
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
        name="InformeEstudiante"
        component={InformeEstudiante}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="StudentDetail"
        component={StudentDetail}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="InformeCarrera"
        component={InformeCarrera}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="GraficarPdf"
        component={GraficarPdf}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
