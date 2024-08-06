import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ImageBackground, ScrollView, Image, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebaseConfig';
import { useFocusEffect } from '@react-navigation/native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { generatePDF } from './Generate'; // Asegúrate de que la importación sea correcta

const GraficarPdf = ({ route, navigation }) => {
  const { tipoInforme, datos, programa, corteInicial, corteFinal } = route.params;
  const dataArray = datos[tipoInforme];
  const [imageUrls, setImageUrls] = useState({});

  const fetchImages = async () => {
    const extensions = ['png', 'jpg', 'jpeg'];

    for (let student of dataArray) {
      const documento = student.documento;

      for (let ext of extensions) {
        try {
          const imageRef = ref(storage, `estudiantes/${documento}.${ext}`);
          const url = await getDownloadURL(imageRef);
          setImageUrls(prevUrls => ({
            ...prevUrls,
            [documento]: url,
          }));
          break; // Si encontramos la imagen, salimos del bucle de extensiones
        } catch (error) {
          // Si hay un error (imagen no encontrada), intentamos con la siguiente extensión
        }
      }
    }
  };

  useEffect(() => {
    fetchImages();
  }, [dataArray]);

  useFocusEffect(
    useCallback(() => {
      fetchImages(); // Ejecuta fetchImages cuando la pantalla gane foco
    }, [dataArray])
  );

  const capitalizeFirstLetter = (string) => {
    return string
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const scale = useSharedValue(1);
  const animationDuration = 800; // Duración de la animación (en milisegundos)
  const scaleFactor = 1.05; // Factor de escala para el zoom

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(scaleFactor, { duration: animationDuration }),
        withTiming(1, { duration: animationDuration })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <ImageBackground source={require('../assets/fondoinformes.jpg')} style={styles.backgroundImage}>
      <View style={styles.container}>
        <View style={styles.container2}>
          <Text style={styles.title}>{`Informe de ${tipoInforme.charAt(0).toUpperCase() + tipoInforme.slice(1)}`}</Text>
          <Animated.View style={animatedStyle}>
            <TouchableOpacity 
              style={styles.buttonPdf}
              onPress={() => generatePDF(dataArray, programa, tipoInforme, corteInicial, corteFinal)} // Llama a generatePDF directamente
            >
              <Text style={styles.textButtonPdf}>Generar Informe en PDF</Text>
              <FontAwesome name="file-pdf-o" size={22} color="#F8E9D4" style={styles.pdfIcon} />
            </TouchableOpacity>
          </Animated.View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.datosContainer}>
            {dataArray && dataArray.length > 0 ? (
              dataArray.map((dato, index) => (
                <View key={index} style={styles.datoContainer}>
                  <View style={styles.infoContainer}>
                    <View style={styles.imageContainer}>
                      {imageUrls[dato.documento] ? (
                        <Image source={{ uri: imageUrls[dato.documento] }} style={styles.image} />
                      ) : (
                        <FontAwesome name="user" size={40} color="#575756" />
                      )}
                    </View>
                    <View style={styles.textContainer}>
                      <Text style={styles.datoNombre}>{capitalizeFirstLetter(dato.nombres)} {capitalizeFirstLetter(dato.apellidos)}</Text>
                      <Text style={styles.datoDocumento}>Documento: {dato.documento}</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.infoIcon}
                      onPress={() => navigation.navigate('StudentDetail2', { documento: dato.documento })}
                    >
                      <FontAwesome name="info-circle" size={30} color="#6D100A" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyMessage}>No hay datos disponibles para mostrar.</Text>
            )}
          </View>
        </ScrollView>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    position: 'relative',
  },
  container2: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F8E9D4',
    borderBottomLeftRadius: 90,
    borderBottomRightRadius: 90,
    height: 'auto',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 30,
  },
  title: {
    fontSize: 40,
    color: '#6D100A',
    textAlign: 'center',
    fontFamily: 'Montserrat-Bold',
  },
  scrollViewContent: {
    paddingTop: 240,
    paddingBottom: 110,
  },
  datosContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  datoContainer: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    width: '90%',
    opacity: 0.9,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    flex: 1,
  },
  datoNombre: {
    fontSize: 18,
    fontFamily: 'Montserrat-Bold',
    color: '#333',
  },
  datoDocumento: {
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
    color: '#333',
  },
  emptyMessage: {
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
    color: '#888888',
  },
  infoIcon: {
    marginLeft: 'auto',
    marginRight: 10,
  },
  buttonPdf: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6D100A',
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  textButtonPdf: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 18,
    color: '#F8E9D4',
    marginRight: 5,
  },
  pdfIcon: {
    marginLeft: 5,
  },
});

export default GraficarPdf;
