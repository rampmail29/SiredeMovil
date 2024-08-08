import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { showMessage } from "react-native-flash-message";
import { useNavigation } from '@react-navigation/native';

const OpcionesInforme = ({ academicData, selectedCorteInicial, selectedCorteFinal }) => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);

  const handleNavigation = (tipoInforme, datos) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigation.navigate('GraficarPdf', {
        tipoInforme,
        datos,
        programa: academicData.carrera,
        corteInicial: selectedCorteInicial,
        corteFinal: selectedCorteFinal
      });
    }, 1000);
  };

  const generarInformeGraduados = () => {
    if (academicData && (academicData.graduados.length > 0 || academicData.retenidos.length > 0 || academicData.desertores.length > 0 || academicData.todos.length > 0)) {
      console.log('Generando informe de Graduados');
      handleNavigation('graduados', { graduados: academicData.graduados });
    } else {
      showMessage({
        message: "Error",
        description: "No se puede generar un informe de graduados pues no hay ningún programa académico ni cortes seleccionado, Por favor seleccione todos los datos necesarios y presione el botón de Evaluar.",
        duration: 10000,
        titleStyle: { fontSize: 19, fontFamily: 'Montserrat-Bold' },
        textStyle: { fontSize: 18, fontFamily: 'Montserrat-Regular',textAlign:'justify' },
        type: "danger",
        icon: "danger",
      });
    }
  };

  const generarInformeRetenidos = () => {
    if (academicData && (academicData.graduados.length > 0 || academicData.retenidos.length > 0 || academicData.desertores.length > 0 || academicData.todos.length > 0)) {
      console.log('Generando informe de Retenidos');
      handleNavigation('retenidos', { retenidos: academicData.retenidos });
    } else {
      showMessage({
        message: "Error",
        description: "No se puede generar un informe de retenidos pues no hay ningún programa académico ni cortes seleccionado, Por favor seleccione todos los datos necesarios y presione el botón de Evaluar.",
        duration: 10000,
        titleStyle: { fontSize: 19, fontFamily: 'Montserrat-Bold' },
        textStyle: { fontSize: 18, fontFamily: 'Montserrat-Regular',textAlign:'justify' },
        type: "danger",
        icon: "danger",
      });
    }
  };

  const generarInformeDesertados = () => {
    if (academicData && (academicData.graduados.length > 0 || academicData.retenidos.length > 0 || academicData.desertores.length > 0 || academicData.todos.length > 0)) {
      console.log('Generando informe de Desertados');
      handleNavigation('desertados', { desertados: academicData.desertores });
    } else {
      showMessage({
        message: "Error",
        description: "No se puede generar un informe de desertados pues no hay ningún programa académico ni cortes seleccionado, Por favor seleccione todos los datos necesarios y presione el botón de Evaluar.",
        duration: 10000,
        titleStyle: { fontSize: 19, fontFamily: 'Montserrat-Bold' },
        textStyle: { fontSize: 18, fontFamily: 'Montserrat-Regular',textAlign:'justify' },
        type: "danger",
        icon: "danger",
      });
    }
  };

  const generarInformeTodos = () => {
    if (academicData && (academicData.graduados.length > 0 || academicData.retenidos.length > 0 || academicData.desertores.length > 0 || academicData.todos.length > 0)) {
      console.log('Generando informe de Todos los estudiantes');
      handleNavigation('general', { general: academicData.todos });
    } else {
      showMessage({
        message: "Error",
        description: "No se puede generar un informe general pues no hay ningún programa académico ni cortes seleccionado, Por favor seleccione todos los datos necesarios y presione el botón de Evaluar.",
        duration: 10000,
        titleStyle: { fontSize: 19, fontFamily: 'Montserrat-Bold' },
        textStyle: { fontSize: 18, fontFamily: 'Montserrat-Regular',textAlign:'justify' },
        type: "danger",
        icon: "danger",
      });
    }
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
         <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#34531F" />
            <Text style={styles.loadingText}>Cargando...</Text>
       </View>
      ) : (
        <>
          <View style={styles.row}>
            <TouchableOpacity style={styles.button} onPress={generarInformeTodos}>
              <FontAwesome5 name="users" size={45} color="white" style={styles.icon} />
              <Text style={styles.buttonText}>Todos los Estudiantes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={generarInformeGraduados}>
              <FontAwesome5 name="user-graduate" size={45} color="white" style={styles.icon} />
              <Text style={styles.buttonText}>Graduados</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.row}>
            <TouchableOpacity style={styles.button} onPress={generarInformeRetenidos}>
              <FontAwesome5 name="user-clock" size={45} color="white" style={styles.icon} />
              <Text style={styles.buttonText}>Retenidos</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={generarInformeDesertados}>
              <FontAwesome5 name="user-times" size={45} color="white" style={styles.icon} />
              <Text style={styles.buttonText}>Desertados</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 30,
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 5,
    width: '100%',
  },
  button: {
    width: 170,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#575756',
    borderRadius: 8,
    marginHorizontal: 10,
    flexDirection: 'column',
    paddingVertical: 10,
    borderColor: '#878787',
    borderWidth: 5,
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: 'Montserrat-Medium',
  },
});

export default OpcionesInforme;
