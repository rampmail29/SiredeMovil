import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Platform, Dimensions } from "react-native";
import * as Font from "expo-font";
import VideoScreen from "./VideoScreen";
import InicioSesion from "./InicioSesion";
import Inicio from "./Inicio";
import Estadis_Cohorte from "./Estadis_Cohorte";
import Estadis_Matricula from "./Estadis_Matricula";
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
import Estadisticas from "./Estadisticas";
import Animated from "react-native-reanimated";
import TabInicio from "./TabInicio";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { getStatusBarHeight } from "react-native-status-bar-height";
import { View, ActivityIndicator, Text } from "react-native";

const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const MainNavigator = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  const loadFontsAsync = async () => {
    try {
      await Font.loadAsync({
        "Montserrat-Bold": require("../assets/fonts/Montserrat/Montserrat-Bold.ttf"),
        "Montserrat-Medium": require("../assets/fonts/Montserrat/Montserrat-Medium.ttf"),
        "Montserrat-Black": require("../assets/fonts/Montserrat/Montserrat-Black.ttf"),
        "Montserrat-Regular": require("../assets/fonts/Montserrat/Montserrat-Regular.ttf"),
      });
      setFontsLoaded(true);
    } catch (error) {
      console.error("Error loading fonts:", error);
      // Trata de manejar el error de carga de la fuente
    }
  };

  useEffect(() => {
    (async () => {
      try {
        await Font.loadAsync({
          "Montserrat-Bold": require("../assets/fonts/Montserrat/Montserrat-Bold.ttf"),
          "Montserrat-Medium": require("../assets/fonts/Montserrat/Montserrat-Medium.ttf"),
          "Montserrat-Black": require("../assets/fonts/Montserrat/Montserrat-Black.ttf"),
          "Montserrat-Regular": require("../assets/fonts/Montserrat/Montserrat-Regular.ttf"),
        });
        console.log("[MainNavigator] fonts loaded");
      } catch (e) {
        console.warn(
          "[MainNavigator] fonts failed, continue with system fonts",
          e
        );
      } finally {
        setFontsLoaded(true); // <- CLAVE: no nos quedamos en blanco si falla
      }
    })();
  }, []);

  const { height } = Dimensions.get("window");
  const isIphoneWithNotch = Platform.OS === "ios" && getStatusBarHeight() > 20;

  const tabBarStyles = StyleSheet.create({
    tabBar: {
      borderTopLeftRadius: hp("2%"),
      borderTopRightRadius: hp("2%"),
      backgroundColor: "#F0FFF2",
      position: "absolute",
      alignItems: "center",
      justifyContent: "center", // Centra los elementos verticalmente
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 3,
        },
        android: {
          elevation: 10,
          // Ajusta el padding vertical para aumentar la altura del tab bar en Android
          // paddingVertical: 10, // Ajusta este valor según tus necesidades
          height: 65,
        },
      }),
    },
    iconContainer: {
      alignItems: "center", // Centra los elementos horizontalmente
      justifyContent: "center", // Centra los elementos verticalmente
      ...Platform.select({
        ios: {
          ...(isIphoneWithNotch && {
            bottom: height * -0.009, // Ajusta el valor según tus necesidades
          }),
        },
      }),
    },
    iconText: {
      fontSize: 12,
      marginTop: 5,
      justifyContent: "center", // Centra los elementos verticalmente
      textAlign: "center", // Alinea el texto al centro
    },
  });

  function TabNavi() {
    return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarStyle: {
            backgroundColor: "#F0FFF2",
            height: 64,
            borderTopWidth: 0,
            elevation: 8, // Android sombra
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
              // paddingBottom para respetar safe area si hace falta
              paddingBottom: 6,
            },
          },
          tabBarActiveTintColor: "#C3D730",
          tabBarInactiveTintColor: "#B3B3B3",
          tabBarShowLabel: false,
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            let iconTextStyles = [tabBarStyles.iconText];

            if (route.name === "Inicio") {
              iconName = focused ? "home" : "home-outline";
            } else if (route.name === "Estadisticas") {
              iconName = focused ? "stats-chart" : "stats-chart-outline";
            } else if (route.name === "Informes") {
              iconName = focused ? "document-text" : "document-text-outline";
            }

            if (focused) {
              iconTextStyles.push({ color: "#132F20" });
            } else {
              iconTextStyles.push({ color: "#B3B3B3" });
            }

            return (
              <Animated.View style={[tabBarStyles.iconContainer]}>
                <Ionicons name={iconName} size={size} color={color} />
                <Text
                  style={{
                    ...tabBarStyles.iconText,
                    fontFamily: "Montserrat-Bold",
                    ...(focused ? { color: "#34531F" } : { color: "#B3B3B3" }),
                  }}
                >
                  {route.name}
                </Text>
              </Animated.View>
            );
          },
          tabBarActiveTintColor: "#C3D730",
          tabBarInactiveTintColor: "#B3B3B3",
          tabBarStyle: tabBarStyles.tabBar,
          tabBarShowLabel: false,
        })}
      >
        <Tab.Screen
          name="Inicio"
          component={Inicio}
          options={{ headerShown: false }}
        />
        <Tab.Screen
          name="Estadisticas"
          component={Estadisticas}
          options={{ headerShown: false }}
        />
        <Tab.Screen
          name="Informes"
          component={Informes}
          options={{ headerShown: false }}
        />

        {/* Las pantallas ocultas de la tab */}
        <Tab.Screen
          name="Graficar"
          component={Graficar}
          options={{ tabBarButton: () => null, headerShown: false }}
        />
        <Tab.Screen
          name="GraficarCohorte"
          component={GraficarCohorte}
          options={{
            unmountOnBlur: true,
            tabBarButton: () => null,
            headerShown: false,
          }}
        />
        <Tab.Screen
          name="GraficarMatriculas"
          component={GraficarMatriculas}
          options={{
            unmountOnBlur: true,
            tabBarButton: () => null,
            headerShown: false,
          }}
        />
        <Tab.Screen
          name="GraficarPdf"
          component={GraficarPdf}
          options={{ tabBarButton: () => null, headerShown: false }}
        />
        <Tab.Screen
          name="InformeEstudiante"
          component={InformeEstudiante}
          options={{ tabBarButton: () => null, headerShown: false }}
        />
        <Tab.Screen
          name="StudentDetail"
          component={StudentDetail}
          options={{ tabBarButton: () => null, headerShown: false }}
        />
        <Tab.Screen
          name="InformeCarrera"
          component={InformeCarrera}
          options={{ tabBarButton: () => null, headerShown: false }}
        />
        <Tab.Screen
          name="Estadis_Cohorte"
          component={Estadis_Cohorte}
          options={{ tabBarButton: () => null, headerShown: false }}
        />
        <Tab.Screen
          name="Estadis_Matricula"
          component={Estadis_Matricula}
          options={{ tabBarButton: () => null, headerShown: false }}
        />
      </Tab.Navigator>
    );
  }

  function DrawerNavi() {
    return (
      <Drawer.Navigator
        useLegacyImplementation={false} // <--- fuerza el modo moderno
        drawerContent={(props) => <SideBar {...props} />}
        screenOptions={({ route }) => ({
          headerStyle: { backgroundColor: "#F0FFF2" },
          drawerHideStatusBarOnOpen: true,
          drawerStyle: {
            width: "74.9%",
            backgroundColor: "#F0FFF2",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
          },
          drawerActiveTintColor: "#34531F",
          drawerActiveBackgroundColor: "#C3D730",
          drawerInactiveTintColor: "#B3B3B3",
          drawerIcon: ({ focused, color, size }) => {
            let iconName;
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
          drawerLabelStyle: { fontSize: 16, fontFamily: "Montserrat-Medium" },
          headerTintColor: "#34531F",
          headerTitleStyle: { display: "none" },
        })}
      >
        <Drawer.Screen name="SIREDE Móvil" component={TabNavi} />
        <Drawer.Screen name="Perfil" component={Perfil} />
        <Drawer.Screen name="SireBot" component={SireBot} />
        <Drawer.Screen name="Reporte" component={Reporte} />
        <Drawer.Screen name="Acerca de" component={AcercaDe} />
        <Drawer.Screen name="Cargar CSV" component={Cargar} />
      </Drawer.Navigator>
    );
  }

  if (!fontsLoaded) {
    console.log("[MainNavigator] waiting fonts...");
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#F0FFF2",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 12 }}>Cargando…</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator /* initialRouteName="VideoScreen" */>
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
    </Stack.Navigator>
  );
};

export default MainNavigator;
