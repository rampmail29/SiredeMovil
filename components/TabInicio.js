// components/TabInicio.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Inicio from './Inicio';
import Estadisticas from './Estadisticas';
import Informes from './Informes';

const Tab = createBottomTabNavigator();
export default function TabInicio() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Inicio" component={Inicio} />
      <Tab.Screen name="Estadisticas" component={Estadisticas} />
      <Tab.Screen name="Informes" component={Informes} />
    </Tab.Navigator>
  );
}
