import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native'; // Importar useNavigation

const OpcionesInforme = ({ academicData, selectedCorteInicial, selectedCorteFinal }) => {
  const navigation = useNavigation(); // Inicializar useNavigation
  const generarInformeGraduados = () => {
    if (academicData && (academicData.graduados.length > 0 || academicData.retenidos.length > 0 || academicData.desertores.length > 0 || academicData.todos.length > 0)) {
      console.log('Generando informe de Graduados');
      navigation.navigate('GraficarPdf', {
          tipoInforme: 'graduados',
          datos: {
          graduados: academicData.graduados,
          },
          programa:academicData.carrera,
          corteInicial:selectedCorteInicial,
          corteFinal:selectedCorteFinal
          });
    } else {
      // Aquí se maneja el caso de error porque todos los arrays están vacíos
      console.log('Error: No hay datos suficientes para generar el informe.');
     
    }
  };

  const generarInformeRetenidos = () => {
    if (academicData && (academicData.graduados.length > 0 || academicData.retenidos.length > 0 || academicData.desertores.length > 0 || academicData.todos.length > 0)) {
     
      console.log('Generando informe de Retenidos');
      navigation.navigate('GraficarPdf', {
        tipoInforme: 'retenidos',
        datos: {
        retenidos: academicData.retenidos,
        },
        programa:academicData.carrera,
        corteInicial:selectedCorteInicial,
        corteFinal:selectedCorteFinal
        });
    } else {
      // Aquí se maneja el caso de error porque todos los arrays están vacíos
      console.log('Error: No hay datos suficientes para generar el informe.');
      // Mostrar un mensaje de error o manejar la situación de otra manera
    }
  };

  const generarInformeDesertados = () => {
    if (academicData && (academicData.graduados.length > 0 || academicData.retenidos.length > 0 || academicData.desertores.length > 0 || academicData.todos.length > 0)) {
      // Aquí se genera el informe porque al menos uno de los arrays tiene datos
      console.log('Generando informe de Desertados');
      navigation.navigate('GraficarPdf', {
        tipoInforme: 'desertados',
        datos: {
        desertados: academicData.desertores,
        },
        programa:academicData.carrera,
        corteInicial:selectedCorteInicial,
        corteFinal:selectedCorteFinal
        });
    } else {
      // Aquí se maneja el caso de error porque todos los arrays están vacíos
      console.log('Error: No hay datos suficientes para generar el informe.');
      // Mostrar un mensaje de error o manejar la situación de otra manera
    }
  };
  const generarInformeTodos = () => {
    if (academicData && (academicData.graduados.length > 0 || academicData.retenidos.length > 0 || academicData.desertores.length > 0 || academicData.todos.length > 0)) {
      // Aquí se genera el informe porque al menos uno de los arrays tiene datos
      console.log('Generando informe de Todos los estudiantes');
      navigation.navigate('GraficarPdf', {
        tipoInforme: 'general',
        datos: {
        general: academicData.todos,
        },
        programa:academicData.carrera,
        corteInicial:selectedCorteInicial,
        corteFinal:selectedCorteFinal
        });
    } else {
      // Aquí se maneja el caso de error porque todos los arrays están vacíos
      console.log('Error: No hay datos suficientes para generar el informe.');
      // Mostrar un mensaje de error o manejar la situación de otra manera
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
      <TouchableOpacity style={styles.button} onPress={generarInformeTodos}>
        <FontAwesome5  name="users" size={45} color="#C3D730" style={styles.icon} />
        <Text style={styles.buttonText}>Todos los Estudiantes</Text>
      </TouchableOpacity> 
      <TouchableOpacity style={styles.button} onPress={generarInformeGraduados}>
        <FontAwesome5  name="user-graduate" size={45} color="#C3D730" style={styles.icon} />
        <Text style={styles.buttonText}>Graduados</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={generarInformeRetenidos}>
        <FontAwesome5  name="user-clock" size={45} color="#C3D730" style={styles.icon} />
        <Text style={styles.buttonText}>Retenidos</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={generarInformeDesertados}>
        <FontAwesome5  name="user-times" size={45} color="#C3D730" style={styles.icon} />
        <Text style={styles.buttonText}>Desertados</Text>
      </TouchableOpacity>
      </ScrollView>
    </View>
 
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  button: {
    width: 250,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#575756',
    borderRadius: 8,
    marginVertical: 10,
    flexDirection: 'column',
    paddingVertical: 10,
    borderColor:'#878787',
    borderWidth:5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 10,
  },
  icon: {
    marginBottom: 10,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
    color: 'white',
    textAlign: 'center',
  },
});

export default OpcionesInforme;
