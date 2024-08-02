import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { showMessage } from "react-native-flash-message";
import { useNavigation } from '@react-navigation/native';
import { API_BASE_URL } from './Config';

const CortesAcademicos = ({ selectedProgram, onNext }) => {
  const navigation = useNavigation();
  const [cortesIniciales, setCortesIniciales] = useState([]);
  const [cortesFinales, setCortesFinales] = useState([]);
  const [selectedCorteInicial, setSelectedCorteInicial] = useState('');
  const [selectedCorteFinal, setSelectedCorteFinal] = useState('');
  const [modalCorteInicialVisible, setModalCorteInicialVisible] = useState(false);
  const [modalCorteFinalVisible, setModalCorteFinalVisible] = useState(false);
  const [datosBackend, setDatosBackend] = useState({
    graduados: [],
    retenidos: [],
    desertores: []
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const obtenerCortesIniciales = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/cortes-iniciales`);
        const data = await response.json();
        if (Array.isArray(data)) {
          const datCortes = data.map(element => `${element.ano}-${element.periodo}`);
          setCortesIniciales(datCortes);
        }
      } catch (error) {
        console.error('Error al obtener cortes iniciales:', error);
      }
    };

    obtenerCortesIniciales();
  }, []);

  useEffect(() => {
    const cargarCortesFinales = () => {
      if (!selectedCorteInicial || typeof selectedCorteInicial !== 'string') return;

      const cortesFinalesCalculados = [];
      let anoi, anof, peri, perf;
      const [ai, pi] = selectedCorteInicial.split('-');
      anoi = parseInt(ai);
      peri = parseInt(pi);

      if (peri === 1) {
        anof = anoi + 3;
        perf = 2;
      } else {
        anof = anoi + 4;
        perf = 1;
      }

      cortesFinalesCalculados.push({ label: `${anof}-${perf}`, key: `${anof}-${perf}` });

      cortesIniciales.forEach((corte) => {
        if (parseInt(corte.split('-')[0]) > anof) {
          cortesFinalesCalculados.push({ label: corte, key: corte });
        }
      });
      setCortesFinales(cortesFinalesCalculados);
      setSelectedCorteFinal('');
    };

    cargarCortesFinales();
  }, [selectedCorteInicial, cortesIniciales]);

  const corteInicialSelect = (corteInicial) => {
    setSelectedCorteInicial(corteInicial);
    setSelectedCorteFinal('');
    setModalCorteInicialVisible(false);
  };

  const corteFinalSelect = (corteFinal) => {
    setSelectedCorteFinal(corteFinal);
    setModalCorteFinalVisible(false);
  };

  const cancelarModal = () => {
    setModalCorteInicialVisible(false);
    setModalCorteFinalVisible(false);
  };

  const capitalizeFirstLetter = (string) => {
    return string
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const evaluarClick = async () => {
    try {
      if (!selectedProgram || !selectedCorteInicial || !selectedCorteFinal) {
        showMessage({
          message: "Error",
          description: "Por favor seleccione todos los datos necesarios",
          duration: 2500,
          titleStyle: { fontSize: 18, fontFamily: 'Montserrat-Bold' },
          textStyle: { fontSize: 16, fontFamily: 'Montserrat-Regular' },
          type: "danger",
          icon: "danger",
        });
        return;
      }
      const response = await fetch(`${API_BASE_URL}/api/estadisticasPdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          programa: selectedProgram.cod_snies,
          corteInicial: selectedCorteInicial,
          corteFinal: selectedCorteFinal,
        }),
      });

      const data = await response.json();
      //console.log('Datos recibidos del backend:', data);
      setDatosBackend(data);
      data.carrera=selectedProgram;
     
      if (typeof onNext === 'function') {
        onNext(data);  // Llamada a la función onNext para avanzar al siguiente paso
      } else {
        console.warn('onNext no está definida como una función.');
      }
    } catch (error) {
      console.error('Error al obtener datos del backend:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (
      datosBackend.graduados.length !== 0 ||
      datosBackend.retenidos.length !== 0 ||
      datosBackend.desertores.length !== 0
    ) {
      const timeout = setTimeout(() => {
       
      }, 1000);

      return () => clearTimeout(timeout);
    }
  }, [datosBackend, onNext]);

  return (
    <View style={styles.container}>
      {selectedProgram && (
        <Text style={styles.title}>{capitalizeFirstLetter(selectedProgram.programa)}</Text>
      )}

      <TouchableOpacity style={styles.buttonCorte} onPress={() => setModalCorteInicialVisible(true)}>
        <Text style={styles.buttonTextCortes}>
          {selectedCorteInicial ? `Corte inicial: ${selectedCorteInicial}` : 'Seleccionar Corte Inicial'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.buttonCorte} onPress={() => setModalCorteFinalVisible(true)}>
        <Text style={styles.buttonTextCortes}>
          {selectedCorteFinal ? `Corte final: ${selectedCorteFinal}` : 'Seleccionar Corte Final'}
        </Text>
      </TouchableOpacity>

      {/* Modal para seleccionar Corte Inicial */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalCorteInicialVisible}
        onRequestClose={() => setModalCorteInicialVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seleccione un corte inicial</Text>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
              {cortesIniciales.map((corte, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.modalItemContainer}
                  onPress={() => corteInicialSelect(corte)}
                >
                  <Text style={styles.modalItemTextCorte}>{corte}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={cancelarModal}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal para seleccionar Corte Final */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalCorteFinalVisible}
        onRequestClose={() => setModalCorteFinalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seleccione un corte final</Text>
            {cortesFinales.map((corte, index) => (
              <TouchableOpacity
                key={index}
                style={styles.modalButton}
                onPress={() => corteFinalSelect(corte.label)}
              >
                <Text style={styles.modalItemTextCorte}>{corte.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={cancelarModal}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal para mostrar la pantalla de carga */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={loading}
      >
        <View style={styles.modalContainer}>
          {loading && (
            <View>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.loadingText}>Cargando...</Text>
            </View>
          )}
        </View>
      </Modal>
      {/* Botón para evaluar */}
      <TouchableOpacity style={styles.evaluarButton} onPress={evaluarClick}>
        <Text style={styles.buttonText}>Evaluar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    marginTop:-0,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Montserrat-Bold',
    marginTop:-30,
    marginBottom: 20,
    textAlign: 'center',
    color: '#34531F',
  
  },
  buttonCorte: {
    width: '100%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#575756',
    marginBottom: 10,
    borderRadius: 8,
  },
  buttonTextCortes: {
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
    color: '#Fff',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 20,
    textAlign: 'center',
    width: '80%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Montserrat-Bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#34531F',
  },
  modalItemContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  modalItemTextCorte: {
    fontSize: 30,
    fontFamily: 'Montserrat-Bold',
    textAlign: 'center',
    color: '#666',
  },
  cancelButton: {
    marginTop: 20,
    backgroundColor: '#f44336',
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    width: 150,
    alignSelf: 'center',
  },
  cancelButtonText: {
    fontSize: 18,
    fontFamily: 'Montserrat-Bold',
    color: '#fff',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
  },
  evaluarButton: {
    width: '60%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#B3B3B3',
    marginTop: 20,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
    color: '#34531F',
    textAlign:'center'
  },
});

export default CortesAcademicos;
