import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ImageBackground, ScrollView,  ActivityIndicator } from 'react-native';
import { showMessage } from "react-native-flash-message";
import { useNavigation } from '@react-navigation/native'; 
import { API_BASE_URL } from './Config';

const Estadisticas = () => {
  const navigation = useNavigation();
  const [programas, setProgramas] = useState([]);
  const [cortesIniciales, setCortesIniciales] = useState([]);
  const [corteFinal, setCorteFinal] = useState([]);
  const [programaSeleccionado, setProgramaSeleccionado] = useState('');
  const [codigoSeleccionado, setCodigoSeleccionado] = useState('');
  const [idSeleccionado, setIdSeleccionado] = useState('');
  const [tipoProgramaSeleccionado, setTipoProgramaSeleccionado] = useState('');
  const [selectedCorteInicial, setSelectedCorteInicial] = useState('');
  const [modalProgramaVisible, setModalProgramaVisible] = useState(false);
  const [modalCorteInicialVisible, setModalCorteInicialVisible] = useState(false);
  const [loading, setLoading] = useState(false); 
  const [datosBackend, setDatosBackend] = useState({
    totalEstudiantes: [],
    graduados: [],
    retenidos: [],
    desertados: [],
    activos: [],
    inactivos: [],
    
  });

      const capitalizeFirstLetter = (string) => {
        return string
          .toLowerCase()
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      };

     useEffect(() => {
            const obtenerProgramas = async () => {
              try {
                  const response = await fetch(`${API_BASE_URL}/api/programas`);
                  const data = await response.json();
                  const filteredData = data.map(element => ({
                      cod_snies: element.codigo_programa,
                      programa: element.nombre_programa,
                      tipo: element.tipo_programa,
                      id: element.id_carrera
                  }));
                  setProgramas(filteredData); 
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


  const obtenerCortesIniciales = async (id_carrera) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/cortes-iniciales/${id_carrera}`);
      const data = await response.json();
      console.log(data)
      if (Array.isArray(data)) {
        setCortesIniciales(data);
      } 
    } catch (error) {
      showMessage({
        message: "Error",
        description: "Error al obtener cortes iniciales. Por favor, revisa tu conexión e inténtalo de nuevo.",
        type: "danger",
        icon: "danger",
        position: "top",
        titleStyle: { fontSize: 18, fontFamily: 'Montserrat-Bold' }, // Estilo del título
        textStyle: { fontSize: 18, fontFamily: 'Montserrat-Regular' }, // Estilo del texto
        duration: 3000,
      });
     
    }
  };

        useEffect(() => {
          const cohorteTope = () => {
              if (!selectedCorteInicial || typeof selectedCorteInicial !== 'string') return;

              // Obtener año y periodo del corte inicial
              const [anioInicial, periodoInicial] = selectedCorteInicial.split('-').map(Number);
              
              // Determinar la cantidad de semestres según el tipo de programa
              let cantidadSemestres = 0;
              if (tipoProgramaSeleccionado === "Profesional") {
                  cantidadSemestres = 4; // 4 periodos (2 años) para programas profesionales
              } else if (tipoProgramaSeleccionado === "Tecnologia") {
                  cantidadSemestres = 6; // 6 periodos (3 años) para programas tecnológicos
              } else {
                  console.error("Tipo de programa no válido.");
                  return;
              }

              // Generar los cortes finales según el tipo de programa
              const cortesFinalesCalculados = generarcohorte(anioInicial, periodoInicial, cantidadSemestres);

              // Agregar cortes iniciales posteriores al corte calculado
              cortesIniciales.forEach((corte) => {
                  if (corte.key > selectedCorteInicial) {
                      cortesFinalesCalculados.push({ label: corte.key, key: corte.key });
                  }
              });

              // Obtener solo el último corte
              const ultimoCorteFinal = cortesFinalesCalculados.slice(-1)[0]?.key || null;
              


              // Actualizar estado con el último corte final generado
              setCorteFinal(ultimoCorteFinal);
          };

          cohorteTope();
      }, [selectedCorteInicial, tipoProgramaSeleccionado, cortesIniciales]);

      // Función para generar cortes finales
      const generarcohorte = (anio, periodo, cantidadSemestres) => {
        const cortes = [];
        let anioActual = anio;
        let periodoActual = periodo;

        for (let i = 0; i < cantidadSemestres; i++) {
          cortes.push({ label: `${anioActual}-${periodoActual}`, key: `${anioActual}-${periodoActual}` });

          if (periodoActual === 1) {
            periodoActual = 2;
          } else {
            periodoActual = 1;
            anioActual += 1;
          }
        }

        return cortes;
      };

          const ProgramaSelect = (programa) => {
            setProgramaSeleccionado(programa.programa);
            setCodigoSeleccionado(programa.cod_snies);
            setTipoProgramaSeleccionado(programa.tipo);
            setIdSeleccionado(programa.id);
            obtenerCortesIniciales(programa.id);
            setModalProgramaVisible(false);
          };

          const cohorteInicialSelect = (corteInicial) => {
            setSelectedCorteInicial(corteInicial);
            setModalCorteInicialVisible(false);
          };

          const cancelarModal = () => {
            setModalProgramaVisible(false);
            setModalCorteInicialVisible(false);
          };

  const evaluarClick = async () => {
    try {
      if (!programaSeleccionado || !selectedCorteInicial ) {
        showMessage({
          message: "Error",
          description: "Por favor seleccione todos los datos necesarios",
          duration: 3000, 
          titleStyle: { fontSize: 18, fontFamily: 'Montserrat-Bold' }, // Estilo del título
          textStyle: { fontSize: 16, fontFamily: 'Montserrat-Regular' }, // Estilo del texto
          type: "danger",
          icon: "danger",
          position: "top",
        });
        return;
      }
      const response = await fetch(`${API_BASE_URL}/api/estudiantes-por-corte`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idCarrera: idSeleccionado,
          periodoInicial: selectedCorteInicial,
        }),
      });

      const data = await response.json();
      console.log(data);
      setDatosBackend(data);
      setLoading(true); // Mostrar el modal de carga
      
    } catch (error) {
      console.error('Error al obtener datos del backend:', error);
    }
  };

  useEffect(() => {
    if (
      datosBackend?.todosEstudiantes?.length > 0 || 
      datosBackend?.graduados?.length > 0 || 
      datosBackend?.retenidos?.length > 0 || 
      datosBackend?.desertados?.length > 0 || 
      datosBackend?.activos?.length > 0 || 
      datosBackend?.inactivos?.length > 0
    ) {
      const timeout = setTimeout(() => {
        setLoading(false);
        navigation.navigate('GraficarCohorte', {
          selectedCorteInicial,
          corteFinal,
          programaSeleccionado,
          datosBackend: {
            totalEstudiantes: datosBackend.todosEstudiantes,
            graduados: datosBackend.graduados,
            retenidos: datosBackend.retenidos,
            desertados: datosBackend.desertados,
            activos: datosBackend.activos,
            inactivos: datosBackend.inactivos,
          },
        });
      }, 2500);
  
      return () => clearTimeout(timeout);
    }
  }, [datosBackend]);
  
  

  
 
 



  return (
    <ImageBackground source={require('../assets/fondoinicio.jpg')} style={styles.backgroundImage}>
    <View style={styles.container}>
      <Text style={styles.title}>Estadísticas de cohorte inicial</Text>
      <Text style={styles.subtitle}>Seleccione el programa académico y el periodo inicial de matricula:</Text>
      
      <TouchableOpacity style={styles.button} onPress={() => setModalProgramaVisible(true)}>
        <Text style={styles.buttonText}>
          {programaSeleccionado ? `${capitalizeFirstLetter(programaSeleccionado)}` : 'Seleccionar Programa'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.buttonCorte} onPress={() => setModalCorteInicialVisible(true)}>
        <Text style={styles.buttonTextCortes}>
          {selectedCorteInicial ? `Corte inicial: ${selectedCorteInicial}` : 'Seleccionar Cohorte Inicial'}
        </Text>
      </TouchableOpacity>

 
      {/* Modal para seleccionar el Programa academico */}
      <Modal
          animationType="slide"
          transparent={true}
          visible={modalProgramaVisible}
          onRequestClose={() => setModalProgramaVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Seleccione un programa</Text>
              <ScrollView contentContainerStyle={styles.scrollViewContent}>
                {programas.map((programa, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.modalItemContainer}
                    onPress={() => ProgramaSelect(programa)}
                  >
                    <Text style={styles.modalItemText}>{capitalizeFirstLetter(programa.programa)}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            {/* Botón de cancelar */}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={cancelarModal}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal para seleccionar Cohorte Inicial */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalCorteInicialVisible}
        onRequestClose={() => setModalCorteInicialVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seleccione un periodo inicial</Text>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                {cortesIniciales.map((corte, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.modalItemContainer}
                    onPress={() => cohorteInicialSelect(corte)}
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

           {/* Modal para mostrar la pantalla de carga */}
           <Modal
                  animationType="fade"
                  transparent={true}
                  visible={loading}
                >
                  <View style={styles.modalContainer}>
                    {loading && (
                      <View >
                        <ActivityIndicator size="large" color="#132F20" />
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
    marginBottom: 50,
  },
  button: {
    width: '100%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#34531F',
    marginBottom: 10,
    borderRadius: 8,
  },
  buttonCorte: {
    width: '100%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8E9D4',
    marginBottom: 10,
    borderRadius: 8,
  },
  evaluarButton: {
    width: '60%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#6D100A',
    marginTop: 20,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
    color: '#F8E9D4',
    textAlign:'center'
  },
  buttonTextCortes: {
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
    color: '#34531F',
    textAlign:'center'
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 20,
    textAlign:'center',
    width: '80%',
    maxHeight: '70%',
    
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Montserrat-Bold',
    textAlign:'center',
    marginBottom: 10,
    color: '#34531F',
  },
  modalItemContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  modalItemText: {
    fontSize: 20,
    fontFamily: 'Montserrat-Bold',
    textAlign:'center',
    color: '#666',
  },
  modalItemTextCorte: {
    fontSize:30,
    fontFamily: 'Montserrat-Bold',
    textAlign:'center',
    color: '#666',
  },
  cancelButton: {
    marginTop: 50,
    backgroundColor: '#f44336', // Color de fondo rojo, puedes cambiarlo según tu preferencia
    paddingVertical: 10,
    justifyContent: 'center', // Centra verticalmente
    alignItems: 'center', // Centra horizontalmente
    borderRadius: 8,
    width: 150, // Ancho del botón, ajusta según tu diseño
    alignSelf: 'center', // Centra el botón horizontalmente
  },
  cancelButtonText: {
    fontSize: 18,
    fontFamily: 'Montserrat-Bold',
    color: '#fff', // Color del texto blanco, puedes cambiarlo según tu preferencia
  },
  resultadosContainer: {
    marginVertical: 10,
  },
  resultadosText: {
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
    textAlign:'center',
    color: '#34531F',
  },
  analisisText: {
    padding:20,
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
    textAlign:'center',
    color: '#575756',
  },
  
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
  },
});

export default Estadisticas;
