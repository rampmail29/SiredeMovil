import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Text, StyleSheet, Platform, Dimensions, View, Image } from 'react-native';
import * as Font from 'expo-font';
import VideoScreen from './VideoScreen';
import InicioSesion from './InicioSesion';
import Inicio from './Inicio';
import Estadisticas from './Estadisticas';
import Informes from './Informes';
import AcercaDe from './AcercaDe';
import Reporte from './Reporte';
import Graficar from './GraficarEstadisticas';
import GraficarPdf from './GraficarPdf';  
import InformeEstudiante from './InformeEstudiante';
import StudentDetail from './StudentDetail';
import StudentDetail2 from './StudentDetail2';
import InformeCarrera from './InformeCarrera';
import CerrarSesion from './CerrarSesion';
import AccessRequestForm from './AccessRequestForm';
import PasswordChangeScreen from './PasswordChangeScreen';
import InitialSetupScreen from './InitialSetupScreen';
import ConfigList from './ConfigList';
import SideBar from "./SideBar";
import Perfil from './Perfil'
import SireBot from './SireBot';
import Cargar from './Cargar';
import Animated from 'react-native-reanimated';
import { TapGestureHandler } from 'react-native-gesture-handler';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getStatusBarHeight } from 'react-native-status-bar-height';

const Drawer = createDrawerNavigator(); 
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();


const MainNavigator = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  const loadFontsAsync = async () => {
    try {
      await Font.loadAsync({
        'Montserrat-Bold': require('../assets/fonts/Montserrat/Montserrat-Bold.ttf'),
        'Montserrat-Medium': require('../assets/fonts/Montserrat/Montserrat-Medium.ttf'),
        'Montserrat-Black': require('../assets/fonts/Montserrat/Montserrat-Black.ttf'),
        'Montserrat-Regular': require('../assets/fonts/Montserrat/Montserrat-Regular.ttf'),


      });
      setFontsLoaded(true);
    } catch (error) {
      console.error('Error loading fonts:', error);
      // Trata de manejar el error de carga de la fuente
    }
  };

  useEffect(() => {
    loadFontsAsync();
  }, []);

 
  const { height } = Dimensions.get('window');
  const isIphoneWithNotch = Platform.OS === 'ios' && getStatusBarHeight() > 20;

  const tabBarStyles = StyleSheet.create({
    tabBar: {
      borderTopLeftRadius: hp('2%'),
      borderTopRightRadius: hp('2%'),
      backgroundColor: '#F0FFF2',
      position: 'absolute',
      alignItems:'center',
      justifyContent: 'center',  // Centra los elementos verticalmente
      ...Platform.select({
        ios: {
          shadowColor: '#000',
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
      alignItems: 'center',  // Centra los elementos horizontalmente
      justifyContent: 'center',  // Centra los elementos verticalmente
      ...Platform.select({
        ios: {
          ...(isIphoneWithNotch && {
            bottom: height * (-0.009),  // Ajusta el valor según tus necesidades
          }),
          
        },
      }),
    },
    iconText: {
      fontSize: 12,
      marginTop: 5,
      justifyContent: 'center',  // Centra los elementos verticalmente
      textAlign: 'center',  // Alinea el texto al centro
    
    },
  });

  function TabNavi(){

    return(
    <Tab.Navigator 
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        let iconTextStyles = [tabBarStyles.iconText];

        if (route.name === 'Inicio') {
          iconName = focused 
          ? 'home' 
          : 'home-outline';
        } else if (route.name === 'Estadisticas') {
          iconName = focused 
          ? 'stats-chart' 
          : 'stats-chart-outline';
        } else if (route.name === 'Informes') {
          iconName = focused 
          ? 'document-text' 
          : 'document-text-outline';
        } else if (route.name === 'Cargar') {
          iconName = focused 
          ? 'cloud-upload' 
          : 'cloud-upload-outline';
        } 

        if (focused) {
          iconTextStyles.push({ color: '#132F20' });
        } else {
          iconTextStyles.push({ color: '#B3B3B3' });
        }

        
        return (
          <TapGestureHandler >
            <Animated.View style={[tabBarStyles.iconContainer]}>
              <Ionicons name={iconName} size={size} color={color} />
              <Text style={{ ...tabBarStyles.iconText, fontFamily: 'Montserrat-Bold', ...(focused ? { color: '#34531F' } : { color: '#B3B3B3' }) }}>
                {route.name}
              </Text>
            </Animated.View>
          </TapGestureHandler>
        );
      },
      tabBarActiveTintColor: '#C3D730',
      tabBarInactiveTintColor: '#B3B3B3',
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
  <Tab.Screen 
  name="Cargar" 
  component={Cargar}
  options={{ headerShown: false }}
  />
 
  <Tab.Screen 
  name="Graficar" 
  component={Graficar}
  options={{
    tabBarButton: () => null,
    tabBarVisible:false,
    headerShown: false 
}}
  />
   <Tab.Screen 
  name="GraficarPdf" 
  component={GraficarPdf}
  options={{
    tabBarButton: () => null,
    tabBarVisible:false,
    headerShown: false 
}}
  />
<Tab.Screen 
  name="InformeEstudiante" 
  component={InformeEstudiante}
  options={{
    tabBarButton: () => null,
    tabBarVisible:false,
    headerShown: false 
}}
  />
  <Tab.Screen 
  name="StudentDetail" 
  component={StudentDetail}
  options={{
    tabBarButton: () => null,
    tabBarVisible:false,
    headerShown: false 
}}
  />
   <Tab.Screen 
  name="InformeCarrera" 
  component={InformeCarrera}
  options={{
    tabBarButton: () => null,
    tabBarVisible:false,
    headerShown: false 
}}
  />

  </Tab.Navigator>  
  )};

  function DrawerNavi(){

	return(
   <Drawer.Navigator
        drawerContent={(props) => <SideBar {...props} />}
        screenOptions={({ route }) => ({
          headerStyle: {
            backgroundColor: '#F0FFF2', // Cambia el color del encabezado
          },
            drawerHideStatusBarOnOpen: true, //Ocultar la barra del sistema operativo (reloj,señal. etc)
            //drawerType: 'front',
            //drawerPosition:'right',
            drawerStyle: {
                width: '74.9%',
                //height: "75%",
                //borderTopRightRadius: 20,
                //borderBottomRightRadius: 20,
                //borderBottomLeftRadius:20,
                backgroundColor: '#F0FFF2', // Color de fondo del Drawer
                shadowColor: "#000", // Color de la sombra
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
              },
              drawerActiveTintColor: '#34531F', // Color del icono y la etiqueta del elemento activo en el cajón.
              drawerActiveBackgroundColor:'#C3D730', // Color de fondo del elemento activo en el cajón
              drawerInactiveTintColor:'#B3B3B3', //Color del icono y la etiqueta de los elementos inactivos del cajón.
            
              drawerIcon: ({ focused, color, size }) => { 
        
                  let iconName;
              
                  if (route.name === 'Perfil') {
                    iconName = focused ? 'person' : 'person-outline';
                  } else if (route.name === 'SireBot') {
                    iconName = focused ? 'chatbox-ellipses' : 'chatbox-ellipses-outline';
                  } else if (route.name === 'Reporte') {
                    const gifSource = focused
                    ? require('../assets/carta.gif') //  Activado
                    : require('../assets/carta-off.gif'); // Desactivado
      
                  return (
                    <View style={{ alignItems: 'center' }}>
                      <Image source={gifSource} style={{ width: size, height: size }} />
                    </View>
                  );
                  } else if (route.name === 'Acerca de') {
                    const gifSource = focused
                    ? require('../assets/acercade.gif') //  Activado
                    : require('../assets/acercade-off.gif'); // Desactivado
      
                  return (
                    <View style={{ alignItems: 'center' }}>
                      <Image source={gifSource} style={{ width: size, height: size }} />
                    </View>
                  );
                  }
              
                  iconComponent = <Ionicons name={iconName} size={size} color={color} />;
                
              
                return iconComponent;
              },
              drawerLabelStyle: {
                // Establecer el estilo del texto del título
                fontSize: 16,
                fontFamily: 'Montserrat-Medium',
              },
              headerTintColor: '#34531F', // Cambiar el color del texto del encabezado
              headerTitleStyle: {
                //fontSize: 20, // Tamaño de la fuente del encabezado
                //fontFamily: 'Montserrat-Black', // Cambia a la fuente deseada
                display: 'none', // También puedes intentar con display: 'none'
              },
              
        })}

      >
      <Drawer.Screen 
                name="SIREDE Móvil">{() => <TabNavi />}</Drawer.Screen>

      <Drawer.Screen
                name="Perfil"
                component={Perfil}
            />
            <Drawer.Screen
                name="SireBot"
                component={SireBot}
            />
            <Drawer.Screen
                name="Reporte"
                component={Reporte}
            />
            <Drawer.Screen
                name="Acerca de"
                component={AcercaDe}
            />  
           
        </Drawer.Navigator>  
	)};
  
  return fontsLoaded ? (
    
    <NavigationContainer>
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
          options={{ headerShown: false }}
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
    
    </NavigationContainer>
    
  ) : null;
};

export default MainNavigator;