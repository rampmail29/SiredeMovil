import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { FontAwesome } from '@expo/vector-icons';
import { ref, getDownloadURL, uploadBytes } from 'firebase/storage';
import { storage } from '../firebaseConfig';
import { API_BASE_URL } from './Config';

const StudentDetail = ({ route, navigation }) => {
  const { id, fromScreen } = route.params || {};
  
  // Inicializa variables opcionales
  let selectedCorteInicial, corteFinal, programaSeleccionado, datosBackend;

  // Verifica de dónde proviene la navegación
  if (fromScreen === 'GraficarCohorte') {
    selectedCorteInicial = route.params.selectedCorteInicial; // Asigna si proviene de GraficarCohorte
    corteFinal = route.params.corteFinal;
    programaSeleccionado = route.params.programaSeleccionado;
    datosBackend = route.params.datosBackend;
  }


  
  const [student, setStudent] = useState(null);
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(true);
  console.log(`El id del estudiante es`, id)

  useEffect(() => {
    const obtenerDetallesEstudiante = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/obtener/${id}`);
        const data = await response.json();
        setStudent(data);
      } catch (error) {
        console.error('Error al obtener detalles del estudiante:', error);
      } finally {
        setLoading(false); // Esto asegura que loading se establezca en false incluso si hay un error
      }
    };
  
    obtenerDetallesEstudiante();
  }, [id]); // Solo dependemos de id para obtener detalles
  
  useEffect(() => {
    const obtenerImagenEstudiante = async () => {
      try {
        if (student && student.length > 0) {
          const numeroDocumento = student[0].numero_documento; // Extraer el numero_documento del primer objeto
          const extensions = ['png', 'jpg', 'jpeg'];
          let imageUrl = null;
  
          for (let ext of extensions) {
            try {
              const imageRef = ref(storage, `estudiantes/${numeroDocumento}.${ext}`);
              const url = await getDownloadURL(imageRef);
              imageUrl = url;
              break; // Sale del bucle si se obtiene la URL
            } catch (error) {
              // No es necesario manejar errores aquí
            }
          }
  
          setImageUri(imageUrl || null);
        }
      } catch (error) {
        console.error('Error al obtener la imagen del estudiante:', error);
      }
    };
  
    if (student) {
      obtenerImagenEstudiante(); // Solo se llama si student está definido
    }
  }, [student]); // Este efecto se ejecutará cada vez que student cambie
  

  const selectImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        const { uri } = result.assets[0];
        const resizedUri = await resizeImage(uri);
        uploadImage(resizedUri);
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo seleccionar la imagen.");
    }
  };

  const resizeImage = async (uri) => {
    try {
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 800 } }], // Ajusta el ancho según sea necesario
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG } // Ajusta la compresión según sea necesario
      );
      return manipulatedImage.uri;
    } catch (error) {
      console.error('Error al redimensionar la imagen:', error);
      return uri; // En caso de error, devuelve la URI original
    }
  };

  const uploadImage = async (uri) => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    
    // Asegúrate de que student esté definido y tenga al menos un elemento para acceder al numero_documento
    if (student && student.length > 0) {
      const numeroDocumento = student[0].numero_documento; // Extraer el numero_documento del primer objeto
      
      const allowedExtensions = ['png', 'jpg', 'jpeg'];
      let uploaded = false;

      for (let ext of allowedExtensions) {
        try {
          const storageRef = ref(storage, `estudiantes/${numeroDocumento}.${ext}`); // Cambia id por numeroDocumento
          await uploadBytes(storageRef, blob);
          const url = await getDownloadURL(storageRef);
          setImageUri(url);
          uploaded = true;
          break;
        } catch (error) {
          console.error(`Error al subir la imagen ${ext}:`, error);
        }
      }

      if (!uploaded) {
        console.error('No se pudo subir la imagen con ninguna extensión válida.');
      }
    }
  } catch (error) {
    console.error('Error al subir la imagen:', error);
  }
};


  const capitalizeFirstLetter = (string) => {
    return string
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatDate = (dateString) => {
    return dateString.split('T')[0];
  };

  const calcularEdad = (fechaNacimiento) => {
    const hoy = new Date();
    const fechaNac = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }

    return edad;
  };

   // Función para ordenar las carreras cronológicamente
   const ordenarCarrerasPorFecha = (carreras) => {
    return carreras.sort((a, b) => new Date(a.fecha_matricula) - new Date(b.fecha_matricula));
  };

  return (
    <ImageBackground source={require('../assets/fondoestudiante.jpg')} style={styles.backgroundImage}>
      <ScrollView contentContainerStyle={styles.scrollView}>

        <View style={styles.container}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#34531F" />
              <Text style={styles.loadingText}>Cargando...</Text>
            </View>
          ) : (
            <>
              {student && student.length > 0 && (
                <>
                  <Text style={styles.title}>Información del Estudiante</Text>
                  <ImageBackground source={require('../assets/fondoinicio.jpg')} style={styles.infoContainer}> 
                  
                    {imageUri ? (
                      <TouchableOpacity style={styles.imageContainer} onPress={selectImage}>
                        <ImageBackground source={{ uri: imageUri }} style={styles.image} />                       
                        <View style={styles.editIcon}>
                          <FontAwesome name="edit" size={20} color="#34531F" />
                        </View>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity style={styles.imageContainer} onPress={selectImage}>
                        <View style={styles.imagePlaceholder}> 
                          <FontAwesome name="user" size={50} color="#575756" />
                          <Text style={styles.uploadText}>Subir Foto</Text>
                        </View>
                      </TouchableOpacity>
                    )}
                      
                            <Text style={styles.title2}>Detalles Personales</Text>
                            <View style={styles.textInfo}>   

                            <View style={styles.infoItem1}>
                                <FontAwesome name="user" size={35} color="#34531F" />
                                <View>
                                  <Text style={styles.label}>Nombre:</Text>
                                  <Text style={styles.text}>{capitalizeFirstLetter(student[0].nombre)} {capitalizeFirstLetter(student[0].apellido)}</Text>
                                </View>
                              </View>

                            <View style={styles.infoItem1}>
                                <FontAwesome name="id-card" size={23} color="#34531F" />
                                <View>
                                  <Text style={styles.label}>Documento:</Text>
                                  <Text style={styles.text}>{student[0].tipo_documento} {student[0].numero_documento}</Text>
                                </View>
                              </View>

                              <View style={styles.infoItem1}>
                                <FontAwesome name="birthday-cake" size={25} color="#34531F" />
                                <View>
                                  <Text style={styles.label}>Fecha de Nacimiento:</Text>
                                  <Text style={styles.text}>
                                      {student[0].fecha_nacimiento ? formatDate(student[0].fecha_nacimiento) : 'No disponible'}
                                  </Text>
                                </View>
                              </View>
                        
                              <View style={styles.infoItem1}>
                                <FontAwesome name="child" size={35} color="#34531F" />
                                <View>
                                <Text style={styles.label}>Edad:</Text>
                                <Text style={styles.text}>
                                  {student[0].fecha_nacimiento ? `${calcularEdad(student[0].fecha_nacimiento)} años` : 'No disponible'}
                                </Text>
                                </View>
                              </View>

              
                              <View style={styles.infoItem1}>
                                <FontAwesome name="envelope" size={25} color="#34531F" />
                                <View>
                                  <Text style={styles.label}>Correo:</Text>
                                  <Text style={styles.text}>{student[0].correo_electronico}</Text> 
                                </View>
                              </View>
          
                          

                              <View style={styles.infoItem1}>
                                <FontAwesome name="phone" size={30} color="#34531F" />
                                <View>
                                  <Text style={styles.label}>Celular:</Text>
                                  <Text style={styles.text}>{student[0].celular}</Text> 
                                </View>
                              </View>
                          </View>
                          

                          <Text style={styles.title3}>Detalles Académicos</Text>
                                              
                                      
                          {student.length > 1 && ordenarCarrerasPorFecha(student.slice(1)).map((carrera, index) => (
                            <View key={index} style={styles.infoCarrera}>

                              
                              <View style={styles.infoItem1}>
                                <FontAwesome name="chevron-circle-right" size={30} color="#6D100A" />
                                <View>
                                  <Text style={styles.labell}>Carrera:</Text>
                                  <Text style={styles.text}>{capitalizeFirstLetter(carrera.nombre_programa)}</Text>
                                </View>
                              </View>

                              <View style={styles.infoItem1}>
                                <FontAwesome name="calendar" size={30} color="#6D100A" />
                                <View>
                                  <Text style={styles.labell}>Periodo de Inicio:</Text>
                                  <Text style={styles.text}>{carrera.periodo_inicio}</Text>
                                </View>
                              </View>

                              <View style={styles.infoItem1}>
                                <FontAwesome name="map-signs" size={30} color="#6D100A" />
                                <View>
                                  <Text style={styles.labell}>Sede:</Text>
                                  <Text style={styles.text}>{carrera.sede}</Text>
                                </View>
                              </View>

                              <View style={styles.infoItem1}>
                                <FontAwesome name="compass" size={35} color="#6D100A" />
                                <View>
                                  <Text style={styles.labell}>Jornada:</Text>
                                  <Text style={styles.text}>{carrera.jornada}</Text>
                                </View>
                              </View>

                              <View style={styles.infoItem1}>
                                <FontAwesome name="spinner" size={30} color="#6D100A" />
                                <View>
                                  <Text style={styles.labell}>Estado Académico:</Text>
                                  <Text style={styles.text}>{carrera.estado_academico}</Text>
                                </View>
                              </View>

                             
                              {carrera.estado_academico === 'Graduado' && (
                                <View style={styles.infoItem1}>
                                  <FontAwesome name="calendar-check-o" size={30} color="#6D100A" />
                                  <View>
                                    <Text style={styles.labell}>Fecha de Graduación:</Text>
                                    <Text style={styles.text}>{formatDate(carrera.fecha_graduacion)}</Text>
                                  </View>
                                </View>
                              )}

                          
                              {carrera.estado_academico === 'Desertor' && (
                                <View style={styles.infoItem1}>
                                  <FontAwesome name="calendar-times-o" size={30} color="#6D100A" />
                                  <View>
                                    <Text style={styles.labell}>Periodo de Deserción:</Text>
                                    <Text style={styles.text}>{carrera.periodo_desercion}</Text>
                                  </View>
                                </View>
                              )}
       
                            </View>
                          ))}

                                                                        
                                    
                    <TouchableOpacity 
                            style={styles.button} 
                            onPress={() => {
                              if (fromScreen === 'GraficarCohorte') {
                                // Regresa a GraficarCohorte y pasa los datos
                                navigation.navigate(fromScreen, { 
                                  selectedCorteInicial, 
                                  corteFinal, 
                                  programaSeleccionado, 
                                  datosBackend 
                                });
                              } else if (fromScreen === 'InformeEstudiante') {
                                // Solo regresa a InformeEstudiante
                                navigation.navigate(fromScreen); // O solo navigation.goBack();
                              } else {
                                navigation.goBack(); // Regresa a la pantalla anterior si no coincide
                              }
                            }}
                          >
                          <Text style={styles.buttonText}>Volver</Text>
                        </TouchableOpacity>
                   
                  

                  </ImageBackground>
                  
                 
                 
                 
                </>
              )}
            </>
          )}
                 
        </View>
      </ScrollView>
    </ImageBackground>
  );
};
const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  scrollView: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  title: {
    fontSize: 40,
    padding:30,
    fontFamily: 'Montserrat-Bold',
    alignSelf: 'flex-start',
    color: 'white',
  },
  title2: {
    fontSize: 37,
    padding:20,
    marginTop:'-35%',
    fontFamily: 'Montserrat-Bold',
    color: '#34531F',
    alignSelf: 'flex-start',
  },
  title3: {
    fontSize: 37,
    padding:20,
    fontFamily: 'Montserrat-Bold',
    color: '#6D100A',
    alignSelf: 'flex-start',
  },
  infoContainer: {
    padding: 20,
    alignItems:'center',
    paddingBottom:40,
    borderTopRightRadius: 100, // Ajusta el valor según sea necesario
    borderTopLeftRadius: 0, // 0 si no deseas radio en la parte izquierda
    overflow: 'hidden', // Esto es importante para que el radio se aplique correctamente  
  },  
  text: {
    fontSize: 18,
    fontFamily: 'Montserrat-Medium',
    marginLeft:10
  },
  label: {
    fontFamily: 'Montserrat-Bold',
    color: '#C3D730',
    fontSize:20,
    marginLeft:10
  },
  labell: {
    fontFamily: 'Montserrat-Bold',
    color: '#132F20',
    fontSize:20,
    marginLeft:10
  },
  textInfo: {
    alignSelf: 'flex-start',
    padding:20,
  },
  imageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginLeft:'70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 30, // Esto es para Android, donde la propiedad de sombra es diferente
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 100,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white', // Fondo blanco mientras se carga la imagen
    borderWidth: 6, // Agrega un borde
    borderColor: 'white', // Color del borde
    elevation: 10, // Esto es para Android, donde la propiedad de sombra es diferente
  },
  editIcon: {
    position: 'absolute',
    bottom: 10, // Ajusta este valor según sea necesario
    right: 10, // Ajusta este valor según sea necesario
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 5, // Esto es para Android
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    marginBottom: 8,
    borderWidth: 8,
    borderColor: 'white',
    elevation: 10
  },
  uploadText: {
    fontFamily: 'Montserrat-Medium',
    color: '#34531F',
    fontSize:12
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
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
  button: {
    backgroundColor: '#6D100A',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 60,
    width:120,
    justifyContent:'center',
    marginTop:20,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
    color: '#fff',
  },
  infoItem1: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    alignSelf: 'flex-start',
  },
  infoCarrera: {
    alignSelf: 'flex-start',
    padding:20,
    borderBottomWidth:1,
  },
  
});

export default StudentDetail;
