// InformeEstudiante.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { API_BASE_URL } from './Config';

const InformeEstudiante = () => {
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState([]);
  const navigation = useNavigation();

  const buscarEstudiantes = async (text) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/estudiantes?search=${text}`);
      const data = await response.json();
      setResultados(data);
    } catch (error) {
      console.error('Error al buscar estudiantes:', error);
    }
  };

  const changeText = (text) => {
    setBusqueda(text);
    if (text.length > 0) {
      buscarEstudiantes(text);
    } else {
      setResultados([]);
    }
  };

  const estudianteSeleccionado = (estudiante) => {
    navigation.navigate('StudentDetail', { documento: estudiante.documento });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.itemContainer} onPress={() => estudianteSeleccionado(item)}>
      <Text style={styles.itemText}>{`${item.nombres} ${item.apellidos}`}</Text>
    </TouchableOpacity>
  );

  return (
    <ImageBackground source={require('../assets/fondoinicio.jpg')} style={styles.backgroundImage}>
      <View style={styles.container}>
        <Text style={styles.title}>Informe detallado por estudiante:</Text>
        <Text style={styles.subtitle}>Por favor escriba el nombre del estudiante que desea consultar:</Text>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.input}
            placeholder="Buscar estudiante..."
            onChangeText={changeText}
            value={busqueda}
          />
          <FlatList
            data={resultados}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
            style={styles.resultadosList}
          />
        </View>
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
  searchContainer: {
    width: '100%',
    alignItems: 'center',
  },
  input: {
    backgroundColor: "#F0FFF2",
    fontFamily: 'Montserrat-Bold',
    fontSize: 18,
    height: 50,
    width: '100%',
    borderColor: '#132F20',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  resultadosList: {
    width: '100%',
    maxHeight: 300,
    marginTop: -20,
    borderRadius: 20,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  itemContainer: {
    backgroundColor: "#F0FFF2",
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  itemText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 14,
    marginLeft: 15,
  }
});

export default InformeEstudiante;
