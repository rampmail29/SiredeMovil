// components/DrawerNavi.js

import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import TabInicio from "./TabInicio"; // Importas el TabInicio aquí
import Perfil from "./Perfil";
import SireBot from "./SireBot";
import Reporte from "./Reporte";
import AcercaDe from "./AcercaDe";
import Cargar from "./Cargar";
import SideBar from "./SideBar"; // Asegúrate de que SideBar esté correctamente importado

const Drawer = createDrawerNavigator();

export default function DrawerNavi() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <SideBar {...props} />} // Asegúrate de que SideBar esté bien importado
      screenOptions={{
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
      }}
    >
      {/* Cargar TabInicio como pantalla principal dentro del Drawer */}
      <Drawer.Screen
        name="SIREDE Móvil"
        component={TabInicio} // Este es el TabNavi como la pantalla principal dentro del Drawer
        options={{
          headerShown: false,
          drawerIcon: ({ focused, color, size }) => {
            let iconName = focused ? "home" : "home-outline"; // Cambié esta parte para que sea simple
            return <Ionicons name={iconName} size={size} color={color} />;
          },
        }}
      />
      {/* Otras pantallas del Drawer */}
      <Drawer.Screen name="Perfil" component={Perfil} />
      <Drawer.Screen name="SireBot" component={SireBot} />
      <Drawer.Screen name="Reporte" component={Reporte} />
      <Drawer.Screen name="Acerca de" component={AcercaDe} />
      <Drawer.Screen name="Cargar CSV" component={Cargar} />
    </Drawer.Navigator>
  );
}
