import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import Papa from 'papaparse';
import { showMessage } from "react-native-flash-message";
import { FontAwesome5 } from '@expo/vector-icons'; // Asegúrate de importar FontAwesome5
import { API_BASE_URL } from './Config';

const CargarCSV = () => {
  const [csvData, setCsvData] = useState(null);
  const [fileName, setFileName] = useState(''); // Nuevo estado para el nombre del archivo

  const pickDocument = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({  //seleccion de archivo en el explorador
        type: 'text/csv', // formato aceptado =)
      });
  
      console.log('Resultado de selección de documento:', res);
  
      if (!res.canceled) { // Verifica si no se ha cancelado
        const fileUri = res.assets[0].uri; // Accede al URI del archivo
        const name = res.assets[0].name; // Guarda el nombre del archivo
        setFileName(name); // Actualiza el nombre del archivo en el estado
        
        // Lee el contenido del archivo CSV
        const response = await fetch(fileUri);
        const csvContent = await response.text();
  
        // Parsear el CSV con PapaParse se pasa a formato JSON
        Papa.parse(csvContent, {
          header: true,
          complete: (results) => {
            setCsvData(results.data);
          },
          error: (error) => {
            console.error('Error al parsear el CSV:', error);
            showMessage({
              message: "Error",
              description: "Error al cargar el CSV. Por favor, revisa tu conexión e inténtalo de nuevo.",
              type: "danger",
              icon: "danger",
              position: "top",
              titleStyle: { fontSize: 18, fontFamily: 'Montserrat-Bold' }, // Estilo del título
              textStyle: { fontSize: 18, fontFamily: 'Montserrat-Regular' }, // Estilo del texto
              duration: 3000,
            });
          },
        });
      } else {
    
        showMessage({
          message: "Advertencia",
          description: "Se Cancelo la selección del archivo.",
          type: "warning",
          icon: "warning",
          position: "top",
          titleStyle: { fontSize: 18, fontFamily: 'Montserrat-Bold' }, // Estilo del título
          textStyle: { fontSize: 18, fontFamily: 'Montserrat-Regular' }, // Estilo del texto
          duration: 3000,
        });
        
      }
    } catch (err) {
      console.error('Error:', err);
      showMessage({
        message: "Error",
        description: "Error al seleccionar el archivo.",
        type: "danger",
        icon: "danger",
        position: "top",
        titleStyle: { fontSize: 18, fontFamily: 'Montserrat-Bold' }, // Estilo del título
        textStyle: { fontSize: 18, fontFamily: 'Montserrat-Regular' }, // Estilo del texto
        duration: 3000,
      });
    }
  };
  
  const upload = async () => {
    if (csvData && csvData.length > 0) {
        // Verifica si el archivo CSV tiene la cabecera 'TIPOPROGRAMA' solo para cargageneral
        const hasHeader = csvData.some(row => row.hasOwnProperty('TIPOPROGRAMA'));
        

        // Verifica el formato del nombre del archivo
        const isGraduadosFormat = /^graduados_\d{4}-(1|2)\.csv$/.test(fileName);
        const isNormalFormat = /^\d{4}-(1|2)\.csv$/.test(fileName);

        // Mensaje de error si el formato del archivo no es válido
        if (!isNormalFormat && !isGraduadosFormat) {
            showMessage({
                message: "Error",
                description: "El nombre del archivo debe seguir el formato 'año-período.csv' (ej. 2023-1.csv) o 'graduados_año-período.csv' (ej. graduados_2023-1.csv).",
                type: "danger",
                icon: "danger",
                position: "top",
                titleStyle: { fontSize: 18, fontFamily: 'Montserrat-Bold' },
                textStyle: { fontSize: 18, fontFamily: 'Montserrat-Regular' },
                duration: 8000,
            });
            return; // Detiene la ejecución si el formato no es válido
        }

        // Si el formato es normal, valida la cabecera
        if (isNormalFormat && !hasHeader) {
            showMessage({
                message: "Cabecera faltante",
                description: "El archivo CSV debe contener la cabecera 'TIPOPROGRAMA' para ser cargado.",
                type: "danger",
                icon: "danger",
                position: "top",
                titleStyle: { fontSize: 18, fontFamily: 'Montserrat-Bold' },
                textStyle: { fontSize: 18, fontFamily: 'Montserrat-Regular' },
                duration: 3000,
            });
            return; // Detiene la ejecución si la cabecera no está presente
        }

        // Decide el endpoint basado en el nombre del archivo
        let endpoint = isNormalFormat ? `${API_BASE_URL}/api/cargageneral` : `${API_BASE_URL}/api/cargagraduados`;

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(csvData),
            });
            const result = await response.json();
            if (result.success) {
                showMessage({
                    message: "Carga exitosa",
                    description: `Se cargaron ${csvData.length-1} registros con éxito.`,
                    type: "success",
                    icon: "success",
                    position: "top",
                    titleStyle: { fontSize: 18, fontFamily: 'Montserrat-Bold' },
                    textStyle: { fontSize: 18, fontFamily: 'Montserrat-Regular' },
                    duration: 3000,
                });
            } else {
                showMessage({
                    message: "Error en la carga",
                    description: "Hubo un error al cargar el archivo CSV. Por favor verifica el formato y el contenido.",
                    type: "danger",
                    icon: "danger",
                    position: "top",
                    titleStyle: { fontSize: 18, fontFamily: 'Montserrat-Bold' },
                    textStyle: { fontSize: 18, fontFamily: 'Montserrat-Regular' },
                    duration: 3000,
                });
            }
        } catch (error) {
            console.error('Error al enviar los datos:', error);
            showMessage({
                message: "Error en el servidor",
                description: "Error al enviar los datos al servidor. Por favor intenta más tarde.",
                type: "danger",
                icon: "danger",
                position: "top",
                titleStyle: { fontSize: 18, fontFamily: 'Montserrat-Bold' },
                textStyle: { fontSize: 18, fontFamily: 'Montserrat-Regular' },
                duration: 3000,
            });
        }
    } else {
        showMessage({
            message: "Archivo no seleccionado",
            description: "Primero debes seleccionar un archivo CSV antes de proceder con la carga.",
            type: "danger",
            icon: "danger",
            position: "top",
            titleStyle: { fontSize: 18, fontFamily: 'Montserrat-Bold' },
            textStyle: { fontSize: 18, fontFamily: 'Montserrat-Regular' },
            duration: 3000,
        });
    }
};



  return (
    <ImageBackground source={require('../assets/fondoinicio.jpg')} style={styles.backgroundImage}>
        <View style={styles.container}>
        <Text style={styles.title}>Carga de datos</Text>
        <Text style={styles.subtitle}>Por favor, cargue el archivo CSV con los datos correctos y en el formato adecuado.</Text>

        <TouchableOpacity style={styles.button} onPress={pickDocument}>
             <FontAwesome5 name="cloud-upload-alt" size={55} color="#132F20" />
             <Text style={styles.buttonText}>Seleccionar Archivo</Text>
        </TouchableOpacity>
          
         {/* Mostrar el ícono y el nombre del archivo en una fila */}
         {fileName && (
          <View style={styles.fileContainer}>
            <FontAwesome5 name="file-csv" size={24} color="#132F20" />
            <Text style={styles.fileName}>{fileName}</Text>
          </View>
        )}

            {/* Mostrar el botón de cargar archivo solo si hay un archivo seleccionado */}
            {fileName && (
          <TouchableOpacity style={styles.button1} onPress={upload}>
               <Text style={styles.buttonText1}>Cargar archivo</Text>
          </TouchableOpacity>
        )}
       
      
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
    marginBottom: 8,
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
    backgroundColor: 'white',
    padding: 5,
    marginBottom: 20,
    marginTop:15,
    alignItems: 'center',
    borderRadius:10,
    borderWidth: 3,          // Ancho del borde
    borderColor: '#C3D730',     // Color del borde 
    justifyContent:"center"
  },
  buttonText1: {
    color: '#C3D730',
    fontSize: 20,
    textAlign:"center",
    fontFamily: 'Montserrat-Bold',
  },
  fileContainer: {
    flexDirection: 'row', // Alinea los ítems en fila
    alignItems: 'center', // Centra verticalmente
    marginVertical: 10,
  },
  fileName: {
    marginLeft: 10, // Espacio entre el ícono y el nombre del archivo
    fontSize: 20,
    fontFamily:'Montserrat-Medium'
  },
});

export default CargarCSV;
