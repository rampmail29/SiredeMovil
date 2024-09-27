import React, { useState } from 'react';
import { View, Text, Button, Alert,StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import Papa from 'papaparse';

const CargarCSV = () => {
  const [csvData, setCsvData] = useState(null);

  const pickDocument = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: '*/*', // Aceptar todos los tipos de archivo
      });
  
      console.log('Resultado de selección de documento:', res);
  
      if (!res.canceled) { // Verifica si no se ha cancelado
        const fileUri = res.assets[0].uri; // Accede al URI del archivo
        console.log('URI del archivo:', fileUri);
  
        // Lee el contenido del archivo CSV
        const response = await fetch(fileUri);
        const csvContent = await response.text();
  
        // Parsear el CSV con PapaParse
        Papa.parse(csvContent, {
          header: true,
          complete: (results) => {
            console.log('Datos del CSV:', results.data);
            setCsvData(results.data);
          },
          error: (error) => {
            console.error('Error al parsear el CSV:', error);
            Alert.alert('Error al cargar el CSV');
          },
        });
      } else {
        Alert.alert('Cancelaste la selección del archivo');
      }
    } catch (err) {
      console.error('Error:', err);
      Alert.alert('Error al seleccionar el archivo');
    }
  };
  
  
  const handleUpload = async () => {
    if (csvData && csvData.length > 0) {
      const validData = csvData.filter(item => item.nombre && item.apellido && item.telefono && item.ciudad);
      if (validData.length > 0) {
        // Aquí envías validData a tu backend
        try {
          const response = await fetch('http://tu-api-url.com/subir-csv', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(validData),
          });
          const result = await response.json();
          if (result.success) {
            Alert.alert(`Se cargaron ${validData.length} registros con éxito.`);
          } else {
            Alert.alert('Hubo un error al cargar el archivo CSV');
          }
        } catch (error) {
          console.error('Error al enviar los datos:', error);
          Alert.alert('Error al enviar los datos al servidor');
        }
      } else {
        Alert.alert('No se encontraron registros válidos en el archivo CSV.');
      }
    } else {
      Alert.alert('Primero debes seleccionar un archivo CSV');
    }
  };
  

  return (
    <ImageBackground source={require('../assets/fondoinicio.jpg')} style={styles.backgroundImage}>
        <View style={styles.container}>
        <Text style={styles.title}>Carga de datos</Text>
        <Text style={styles.subtitle}>Por favor, cargue el archivo CSV con los datos correctos y en el formato adecuado.</Text>

        <TouchableOpacity style={styles.button} onPress={pickDocument}>
             <Text style={styles.buttonText}>Seleccionar Archivo .csv</Text>
        </TouchableOpacity>
          
            {csvData && <Text style={{ marginVertical: 10 }}>Archivo CSV cargado correctamente</Text>}

         <TouchableOpacity style={styles.button1} onPress={handleUpload}>
             <Text style={styles.buttonText1}>Subir archivo a la Base de Datos</Text>
        </TouchableOpacity>
      
        </View>
    </ImageBackground>
  );
};


const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  container:{
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 30,
  },
  title: {
    fontSize: 40,
    fontFamily: 'Montserrat-Bold',
    alignSelf: 'flex-start',
    marginBottom: 20,
    color: '#C3D730',
  },
  subtitle: {
    fontSize: 20,
    fontFamily: 'Montserrat-Medium',
    alignSelf: 'flex-start',
    color: '#132F20',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#F0FFF2',
    padding: 18,
    marginBottom: 20,
    alignItems: 'center',
    width: '70%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 10,
    borderRadius:20,
    borderWidth: 3,          // Ancho del borde
    borderColor: '#34531F',     // Color del borde 
    justifyContent:"center"
  },
  buttonText: {
    color: '#132F20',
    fontSize: 17,
    textAlign:"center",
    fontFamily: 'Montserrat-Bold',
  },
  button1: {
    backgroundColor: '#F0FFF2',
    padding: 10,
    marginBottom: 20,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 10,
    borderRadius:10,
    borderWidth: 3,          // Ancho del borde
    borderColor: '#34531F',     // Color del borde 
    justifyContent:"center"
  },
  buttonText1: {
    color: '#132F20',
    fontSize: 17,
    textAlign:"center",
    fontFamily: 'Montserrat-Medium',
  },
});

export default CargarCSV;
