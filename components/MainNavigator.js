/* // components/MainNavigator.js

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import VideoScreen from "./VideoScreen";
import InicioSesion from "./InicioSesion";
import DrawerNavi from "./DrawerNavi";
import PasswordChangeScreen from "./PasswordChangeScreen";
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
        name="TabInicio"
        component={TabInicio}
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
    </Stack.Navigator>
  );
}
 */
import React from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Platform,
  StyleSheet,
} from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";

// Screens
import VideoScreen from "./VideoScreen";
import InicioSesion from "./InicioSesion";
import Inicio from "./Inicio";
import Estadisticas from "./Estadisticas";
import Informes from "./Informes";
import AcercaDe from "./AcercaDe";
import Reporte from "./Reporte";
import Graficar from "./GraficarEstadisticas";
import GraficarCohorte from "./GraficarPorCohorte";
import GraficarMatriculas from "./GraficarPorMatriculas";
import GraficarPdf from "./GraficarPdf";
import InformeEstudiante from "./InformeEstudiante";
import StudentDetail from "./StudentDetail";
import StudentDetail2 from "./StudentDetail2";
import InformeCarrera from "./InformeCarrera";
import CerrarSesion from "./CerrarSesion";
import AccessRequestForm from "./AccessRequestForm";
import PasswordChangeScreen from "./PasswordChangeScreen";
import InitialSetupScreen from "./InitialSetupScreen";
import ConfigList from "./ConfigList";
import SideBar from "./SideBar";
import Perfil from "./Perfil";
import SireBot from "./SireBot";
import Cargar from "./Cargar";
import TabInicio from "./TabInicio";

const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const tabBarStyles = StyleSheet.create({
  iconText: {
    fontSize: 12,
    marginTop: 5,
    textAlign: "center",
    fontFamily: "Montserrat-Bold",
  },
});

function TabNavi() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: "#C3D730",
        tabBarInactiveTintColor: "#B3B3B3",
        tabBarStyle: {
          position: "absolute",
          left: 12,
          right: 12,
          bottom: 12,
          height: 64,
          borderRadius: 16,
          backgroundColor: "#F0FFF2",
          borderTopWidth: 0,
          elevation: 8,
          paddingBottom: Platform.OS === "android" ? 6 : 12,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = "ellipse";
          if (route.name === "Inicio")
            iconName = focused ? "home" : "home-outline";
          if (route.name === "Estadisticas")
            iconName = focused ? "stats-chart" : "stats-chart-outline";
          if (route.name === "Informes")
            iconName = focused ? "document-text" : "document-text-outline";
          return (
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <Ionicons name={iconName} size={size} color={color} />
              <Text
                style={[
                  tabBarStyles.iconText,
                  { color: focused ? "#34531F" : "#B3B3B3" },
                ]}
              >
                {route.name}
              </Text>
            </View>
          );
        },
      })}
    >
      {/*   <Tab.Screen name="Inicio" component={Inicio} />
      <Tab.Screen name="Estadisticas" component={Estadisticas} />
      <Tab.Screen name="Informes" component={Informes} /> */}

      {/* Ocultas en tab bar */}
      <Tab.Screen
        name="Graficar"
        component={Graficar}
        options={{ tabBarButton: () => null }}
      />
      <Tab.Screen
        name="GraficarCohorte"
        component={GraficarCohorte}
        options={{ tabBarButton: () => null, unmountOnBlur: true }}
      />
      <Tab.Screen
        name="GraficarMatriculas"
        component={GraficarMatriculas}
        options={{ tabBarButton: () => null, unmountOnBlur: true }}
      />
      <Tab.Screen
        name="GraficarPdf"
        component={GraficarPdf}
        options={{ tabBarButton: () => null }}
      />
      <Tab.Screen
        name="InformeEstudiante"
        component={InformeEstudiante}
        options={{ tabBarButton: () => null }}
      />
      <Tab.Screen
        name="StudentDetail"
        component={StudentDetail}
        options={{ tabBarButton: () => null }}
      />
      <Tab.Screen
        name="InformeCarrera"
        component={InformeCarrera}
        options={{ tabBarButton: () => null }}
      />
      <Tab.Screen
        name="Estadis_Cohorte"
        component={GraficarCohorte}
        options={{ tabBarButton: () => null }}
      />
      <Tab.Screen
        name="Estadis_Matricula"
        component={GraficarMatriculas}
        options={{ tabBarButton: () => null }}
      />
    </Tab.Navigator>
  );
}
//DrawerNavi()
function DrawerNavi() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <SideBar {...props} />}
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: "#F0FFF2" },
        drawerHideStatusBarOnOpen: true,
        drawerStyle: { width: "74.9%", backgroundColor: "#F0FFF2" },
        drawerActiveTintColor: "#34531F",
        drawerActiveBackgroundColor: "#C3D730",
        drawerInactiveTintColor: "#B3B3B3",
        drawerLabelStyle: { fontSize: 16, fontFamily: "Montserrat-Medium" },
        headerTintColor: "#34531F",
        headerTitleStyle: { display: "none" },
        drawerIcon: ({ focused, color, size }) => {
          let iconName = "menu";
          if (route.name === "Perfil")
            iconName = focused ? "person" : "person-outline";
          else if (route.name === "SireBot")
            iconName = focused
              ? "chatbox-ellipses"
              : "chatbox-ellipses-outline";
          else if (route.name === "Reporte")
            iconName = focused ? "clipboard" : "clipboard-outline";
          else if (route.name === "Acerca de")
            iconName = focused
              ? "information-circle"
              : "information-circle-outline";
          else if (route.name === "Cargar CSV")
            iconName = focused ? "cloud-upload" : "cloud-upload-outline";
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Drawer.Screen
        name="SIREDE Móvil"
        component={TabNavi}
        options={{ headerShown: false }}
      />
      <Drawer.Screen name="Perfil" component={Perfil} />
      <Drawer.Screen name="SireBot" component={SireBot} />
      <Drawer.Screen name="Reporte" component={Reporte} />
      <Drawer.Screen name="Acerca de" component={AcercaDe} />
      <Drawer.Screen name="Cargar CSV" component={Cargar} />
    </Drawer.Navigator>
  );
}

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
        name="TabInicio"
        component={TabInicio}
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
        name="DrawerNavi"
        component={DrawerNavi}
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
    </Stack.Navigator>
  );
}
