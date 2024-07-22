import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ImageBackground, Dimensions, FlatList, Alert, ScrollView, Animated, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Facultades } from './Facultades';
import { FontAwesome } from '@expo/vector-icons';

const InformeCarrera = () => {
  const navigation = useNavigation();
  const [programas, setProgramas] = useState({});
  const [mostrarCienciasNaturales, setMostrarCienciasNaturales] = useState(false);
  const [mostrarCienciasSocioeconomicas, setMostrarCienciasSocioeconomicas] = useState(false);
  const [error, setError] = useState('');
  const [rotateAnimNaturales] = useState(new Animated.Value(0));
  const [rotateAnimSocioeconomicas] = useState(new Animated.Value(0));
  const [programaAnim] = useState(new Animated.Value(0));

  const normalizeString = (str) => {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  };

  useEffect(() => {
    const obtenerProgramas = async () => {
      try {
        console.log('Fetching programas...');
        const response = await fetch("http://192.168.18.21:4001/api/programas");
        const data = await response.json();
        console.log('Data received:', data);

        const groupedPrograms = {
          cienciasNaturales: data.filter(programa =>
            Facultades["FACULTAD DE CIENCIAS NATURALES E INGENIERÍAS"].some(facultadPrograma =>
              normalizeString(facultadPrograma) === normalizeString(programa.programa)
            )
          ),
          cienciasSocioeconomicas: data.filter(programa =>
            Facultades["FACULTAD DE CIENCIAS SOCIOECONÓMICAS Y EMPRESARIALES"].some(facultadPrograma =>
              normalizeString(facultadPrograma) === normalizeString(programa.programa)
            )
          )
        };

        setProgramas(groupedPrograms);
        console.log('Grouped Programs:', groupedPrograms);
      } catch (error) {
        console.error('Error al obtener programas:', error);
        setError('No se pudieron obtener los programas.');
      }
    };

    obtenerProgramas();
  }, []);

  const toggleAnimation = (isOpen, rotateAnim) => {
    Animated.timing(rotateAnim, {
      toValue: isOpen ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const rotateNaturales = rotateAnimNaturales.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  const rotateSocioeconomicas = rotateAnimSocioeconomicas.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  const handleToggle = (setState, state, rotateAnim) => {
    setState(!state);
    toggleAnimation(!state, rotateAnim);
  };

  useEffect(() => {
    if (mostrarCienciasNaturales || mostrarCienciasSocioeconomicas) {
      programaAnim.setValue(0);
      Animated.timing(programaAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [mostrarCienciasNaturales, mostrarCienciasSocioeconomicas]);

  const capitalizeFirstLetter = (string) => {
    return string
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <ImageBackground source={require('../assets/fondoinicio.jpg')} style={styles.backgroundImage}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Informe por programas y cortes académicos.</Text>
        <Text style={styles.subtitle}>Por favor seleccione el programa académico al cual quiere consultar:</Text>

        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <>
            <View style={styles.facultadContainer}>
              <Pressable onPress={() => handleToggle(setMostrarCienciasNaturales, mostrarCienciasNaturales, rotateAnimNaturales)} style={styles.facultadButton}>
                <Text style={styles.facultadText}>
                  Facultad de Ciencias Naturales e Ingenierías ({programas.cienciasNaturales?.length || 0})
                </Text>
                <Animated.View style={{ transform: [{ rotate: rotateNaturales }] }}>
                  <FontAwesome name="caret-right" size={24} color="#fff" />
                </Animated.View>
              </Pressable>
              {mostrarCienciasNaturales && programas.cienciasNaturales && (
                <FlatList
                  data={programas.cienciasNaturales}
                  keyExtractor={(item) => item.cod_snies.toString()}
                  horizontal
                  renderItem={({ item }) => (
                    <Animated.View style={{ opacity: programaAnim, transform: [{ scale: programaAnim }] }}>
                      <TouchableOpacity style={styles.programButton} onPress={() => Alert.alert(capitalizeFirstLetter(item.programa))}>
                        <Text style={styles.programText}>{capitalizeFirstLetter(item.programa)}</Text>
                      </TouchableOpacity>
                    </Animated.View>
                  )}
                />
              )}
            </View>

            <View style={styles.facultadContainer}>
              <Pressable onPress={() => handleToggle(setMostrarCienciasSocioeconomicas, mostrarCienciasSocioeconomicas, rotateAnimSocioeconomicas)} style={styles.facultadButton}>
                <Text style={styles.facultadText}>
                  Facultad de Ciencias Socioeconómicas y Empresariales ({programas.cienciasSocioeconomicas?.length || 0})
                </Text>
                <Animated.View style={{ transform: [{ rotate: rotateSocioeconomicas }] }}>
                  <FontAwesome name="caret-right" size={24} color="#fff" />
                </Animated.View>
              </Pressable>
              {mostrarCienciasSocioeconomicas && programas.cienciasSocioeconomicas && (
                <FlatList
                  data={programas.cienciasSocioeconomicas}
                  keyExtractor={(item) => item.cod_snies.toString()}
                  horizontal
                  renderItem={({ item }) => (
                    <Animated.View style={{ opacity: programaAnim, transform: [{ scale: programaAnim }] }}>
                      <TouchableOpacity style={styles.programButton} onPress={() => Alert.alert(capitalizeFirstLetter(item.programa))}>
                        <Text style={styles.programText}>{capitalizeFirstLetter(item.programa)}</Text>
                      </TouchableOpacity>
                    </Animated.View>
                  )}
                />
              )}
            </View>
          </>
        )}
      </ScrollView>
    </ImageBackground>
  );
};

const { width: windowWidth, height: windowHeight } = Dimensions.get('window');
const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 30,
  },
  title: {
    fontSize: 30,
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
  facultadContainer: {
    marginBottom: 20,
    width: '100%',
  },
  facultadButton: {
    backgroundColor: '#575756',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  facultadText: {
    fontSize: 15,
    fontFamily: 'Montserrat-Bold',
    color: '#fff',
    marginRight: 20,
  },
  programButton: {
    backgroundColor: '#6D100A',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: windowWidth * 0.03, // Por ejemplo, 3% del ancho de la pantalla
    height: windowHeight * 0.15,     // Por ejemplo, 20% de la altura de la pantalla
    width: windowHeight * 0.192,      // Por ejemplo, 20% del ancho de la pantalla
  },
  programText: {
    fontSize: 14,
    paddingHorizontal:10,
    fontFamily: 'Montserrat-Medium',
    color: '#F8E9D4',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    marginTop: 20,
  },
});

export default InformeCarrera;