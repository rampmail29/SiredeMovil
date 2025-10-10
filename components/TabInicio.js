// components/TabInicio.js
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import Inicio from "./Inicio";
import Estadisticas from "./Estadisticas";
import Informes from "./Informes";
import { Platform } from "react-native";
import Graficar from "./GraficarEstadisticas";
import GraficarCohorte from "./GraficarPorCohorte";
import GraficarMatriculas from "./GraficarPorMatriculas";
import GraficarPdf from "./GraficarPdf";
import InformeEstudiante from "./InformeEstudiante";
import StudentDetail from "./StudentDetail";
import InformeCarrera from "./InformeCarrera";

const Tab = createBottomTabNavigator();

export default function TabNavi() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true, // Mostrar los textos debajo de los íconos
        tabBarActiveTintColor: "#C3D730",
        tabBarInactiveTintColor: "#B3B3B3",
        tabBarStyle: {
          position:"absolute",
          left: 12,
          right: 12,
          bottom: 12,
          height: 64,
          borderRadius: 16,
          backgroundColor: "#2c302dff",
          borderTopWidth: 0,
          elevation: 8,
          paddingBottom: Platform.OS === "android" ? 6 : 12,
        },
      }}
    >
      <Tab.Screen
        name="Inicio"
        component={Inicio}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Estadisticas"
        component={Estadisticas}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Informes"
        component={Informes}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Pantallas que se ocultan de la barra de tabs */}
     {/*  <Tab.Screen
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
      /> */}
    </Tab.Navigator>
  );
}
