import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions, SectionList } from 'react-native';
import { showMessage } from "react-native-flash-message";
import { Facultades } from './Facultades';
import { FontAwesome } from '@expo/vector-icons';
import { API_BASE_URL } from './Config';

const ProgramasAcademicos = ({ onProgramSelect }) => {
  const [programas, setProgramas] = useState([]);
  const [rotateAnimNaturales] = useState(new Animated.Value(0));
  const [rotateAnimSocioeconomicas] = useState(new Animated.Value(0));
  const [programaAnim] = useState(new Animated.Value(0));

  const normalizeString = (str) => {
    return (str || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  };

  useEffect(() => {
    const obtenerProgramas = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/programas`);
        const data = await response.json();   
         
        const groupedPrograms = [
          {
            title: 'Facultad de Ciencias Naturales e Ingenierías',
            data: data.filter(programa =>
              Facultades["FACULTAD DE CIENCIAS NATURALES E INGENIERÍAS"].some(facultadPrograma =>
                normalizeString(facultadPrograma) === normalizeString(programa.programa)
              )
            ),
            rotateAnim: rotateAnimNaturales,
            isOpen: false,
          },
          {
            title: 'Facultad de Ciencias Socioeconómicas y Empresariales',
            data: data.filter(programa =>
              Facultades["FACULTAD DE CIENCIAS SOCIOECONÓMICAS Y EMPRESARIALES"].some(facultadPrograma =>
                normalizeString(facultadPrograma) === normalizeString(programa.programa)
              )
            ),
            rotateAnim: rotateAnimSocioeconomicas,
            isOpen: false,
          }
        ];

        setProgramas(groupedPrograms);
      
      } catch (error) {
        showMessage({
          message: "Error",
          description: "No se pudo conectar con la base de datos. Por favor, revisa tu conexión e inténtalo de nuevo.",
          type: "danger",
          icon: "danger",
          titleStyle: { fontSize: 18, fontFamily: 'Montserrat-Bold' }, // Estilo del título
          textStyle: { fontSize: 18, fontFamily: 'Montserrat-Regular' }, // Estilo del texto
          duration: 3000,
        });
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

  const toggle = (section) => {
    const newData = programas.map((item) => {
      if (item.title === section.title) {
        toggleAnimation(!section.isOpen, section.rotateAnim);
        return { ...item, isOpen: !section.isOpen };
      }
      return item;
    });
    setProgramas(newData);
  };

  useEffect(() => {
    const naturalesSection = programas.find(section => section.title === 'Facultad de Ciencias Naturales e Ingenierías');
    if (naturalesSection && naturalesSection.isOpen) {
      programaAnim.setValue(0);
      Animated.timing(programaAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [programas.find(section => section.title === 'Facultad de Ciencias Naturales e Ingenierías')?.isOpen]);

  const capitalizeFirstLetter = (string) => {
    return (string || '')
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const programSelect = (programa) => {
    if (onProgramSelect) {
      onProgramSelect({
        cod_snies: programa.cod_snies,
        programa: programa.programa,
        tipo: programa.tipo,
      });
    }
  };

  const renderItem = ({ item, index, section }) => {
    if (!section.isOpen || index % 2 !== 0) return null;

    const secondItem = section.data[index + 1];

    return (
      <View style={styles.programRow}>
        <Animated.View style={[styles.programButtonWrapper, { opacity: programaAnim, transform: [{ scale: programaAnim }] }]}>
          <TouchableOpacity style={styles.programButton} onPress={() => programSelect(item)}>
            <Text style={styles.programText}>{capitalizeFirstLetter(item.programa)}</Text>
          </TouchableOpacity>
        </Animated.View>
        {secondItem && (
          <Animated.View style={[styles.programButtonWrapper, { opacity: programaAnim, transform: [{ scale: programaAnim }] }]}>
            <TouchableOpacity style={styles.programButton} onPress={() => programSelect(secondItem)}>
              <Text style={styles.programText}>{capitalizeFirstLetter(secondItem.programa)}</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    );
  };

  const renderSectionHeader = ({ section }) => (
    <View style={styles.facultadContainer}>
      <TouchableOpacity onPress={() => toggle(section)} style={styles.facultadButton}>
        <Text style={styles.facultadText}>
          {section.title} ({section.data.length})
        </Text>
        <Animated.View style={{ transform: [{ rotate: section.title.includes('Naturales') ? rotateNaturales : rotateSocioeconomicas }] }}>
          <FontAwesome name="caret-right" size={24} color="#fff" />
        </Animated.View>
      </TouchableOpacity>
      {section.isOpen && <View style={styles.programContainer} />}
    </View>
  );

  const EmptyComponent = () => (
    <Text style={styles.errorText}>
      No se encontraron programas academicos. Verifica tu conexión a internet.
    </Text>
  );

  return (
      <View style={styles.container}>
    <SectionList
      sections={programas}
      keyExtractor={(item, index) => item.cod_snies?.toString() + index}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      contentContainerStyle={styles.listContent}
      ListEmptyComponent={EmptyComponent}
    />
  </View>
  );
};

const { height: windowHeight } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    marginTop: -30
  },
  facultadContainer: {
    width: '100%',
  },
  facultadButton: {
    backgroundColor: '#575756',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  facultadText: {
    fontSize: 15,
    fontFamily: 'Montserrat-Bold',
    color: '#fff',
    marginRight: 20,
  },
  programContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  programRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  programButtonWrapper: {
    width: '49%', // Ajuste para que dos botones ocupen el 100% con un margen
    marginBottom: 5,
  },
  programButton: {
    backgroundColor: '#B3B3B3',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    height: windowHeight * 0.18,
  },
  programText: {
    fontSize: 16,
    paddingHorizontal: 10,
    fontFamily: 'Montserrat-Bold',
    color: '#34531F',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 20,
    color: '#6D100A',
    fontFamily: 'Montserrat-Bold',
    marginTop: 20,
  },
  listContent: {
    flexGrow: 1,
  },
});

export default ProgramasAcademicos;
