import React, { useEffect, useState } from 'react';
import { useWindowDimensions, View, Text, Modal, TextInput, StyleSheet, ImageBackground, TouchableOpacity, ActivityIndicator, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { FontAwesome } from '@expo/vector-icons';
import { showMessage } from "react-native-flash-message";
import { ref, getDownloadURL, uploadBytes } from 'firebase/storage';
import { storage } from '../firebaseConfig';
import { getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';
import { getAuth, updateProfile } from 'firebase/auth';

const auth = getAuth();
const db = getFirestore();


const Perfil = () => {
    const { height: windowHeight } = useWindowDimensions();
    const [imageUri, setImageUri] = useState(null);
    const [nombre, setNombre] = useState('');
    const [telefono, setTelefono] = useState('');
    const [profesion, setProfesion] = useState('');
    const [rol, setRol] = useState('');
    const [uid, setUid] = useState('');
    const [email, setEmail] = useState('');
    const [isFocused1, setIsFocused1] = useState(false);
  const [isFocused2, setIsFocused2] = useState(false);
  const [isFocused3, setIsFocused3] = useState(false);
  const [isFocused4, setIsFocused4] = useState(false);
  const [loading, setLoading] = useState(false); 
  const isSmallScreen = windowHeight < 750; // Por ejemplo, iPhone 8 Plus tiene un ancho de 375px
 
  useEffect(() => {
 
    const loadUserData = async () => {
        try {
          const user = auth.currentUser;
          if (user) {
            console.log('Usuario actual:', user.uid);
            setEmail(user.email); // Mostrar el email del usuario
            const userRef = doc(db, 'users', user.uid);
            setUid(user.uid);
            const userDoc = await getDoc(userRef);
            if (userDoc.exists()) {
              const userData = userDoc.data();
              setNombre(userData.nombre || '');
              setTelefono(userData.telefono|| '');
              setProfesion(userData.profesion || '');
              setRol(userData.rol || '');   
            } else {
              console.log('El documento del usuario no existe.');
            }
          } else {
            showMessage({
              message: "Error",
              description: "No hay un Usuario registrado.",
              type: "danger",
              titleStyle: { fontSize: 18, fontFamily: 'Montserrat-Bold' }, // Estilo del título
              textStyle: { fontSize: 18, fontFamily: 'Montserrat-Regular' }, // Estilo del texto
              icon: "danger",
              duration: 2500,
              position:"top",
            });
            return;
          }
        } catch (error) {
          console.log('Error al cargar los datos del usuario:', error);
          showMessage({
            message: "Error",
            description: "Hubo un problema al cargar los datos del usuario.",
            type: "danger",
            titleStyle: { fontSize: 18, fontFamily: 'Montserrat-Bold' }, // Estilo del título
            textStyle: { fontSize: 18, fontFamily: 'Montserrat-Regular' }, // Estilo del texto
            icon: "danger",
            duration: 2500,
            position:"top",
          });
          return;
        }
      };
  
      loadUserData();
    }, []);
    useEffect(() => {
        const obtenerImagenEstudiante = async () => {
          try {
            console.log('Intentando obtener imagen para UID:', uid);
            const extensions = ['png', 'jpg', 'jpeg'];
            let imageUrl = null;
        
            for (let ext of extensions) {
              console.log('Intentando obtener la imagen con extensión:', ext);
              const imageRef = ref(storage, `users/${uid}.${ext}`);
              try {
                const url = await getDownloadURL(imageRef);
                imageUrl = url;
                console.log('Imagen encontrada con extensión:', ext);
                break;
              } catch (error) {
                console.log('No se encontró imagen con extensión:', ext);
              }
            }
        
            if (imageUrl) {
              setImageUri(imageUrl);
              console.log('URL de la imagen:', imageUrl);
            } else {
              console.log('No se encontró imagen para el UID especificado.');
            }
          } catch (error) {
            console.error('Error al obtener la imagen del estudiante:', error);
          }
        };
        
      
        obtenerImagenEstudiante();
      }, [uid]);
      

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
      
      const allowedExtensions = ['png', 'jpg', 'jpeg'];
      let uploaded = false;

      for (let ext of allowedExtensions) {
        try {
          const storageRef = ref(storage, `users/${uid}.${ext}`);
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
    } catch (error) {
      console.error('Error al subir la imagen:', error);
    }
  };

  
  const guardar = async () => {
    if (!nombre || !profesion || !rol) {
      showMessage({
        message: "Faltan datos",
        description: "Por favor, complete todos los campos obligatorios.",
        type: "danger",
        titleStyle: { fontSize: 18, fontFamily: 'Montserrat-Bold' }, // Estilo del título
        textStyle: { fontSize: 18, fontFamily: 'Montserrat-Regular' }, // Estilo del texto
        icon: "danger",
        duration: 3000,
        position:"top",
      });
      return;
    }
    try {
        setLoading(true); // Mostrar el modal de carga
      const user = auth.currentUser;
      if (user) {
        // Actualizar el perfil del usuario
        await updateProfile(user, {
          displayName: nombre,
        });
  
        // Actualizar Firestore
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          nombre,
          telefono,
          profesion,
          rol,
        });
        // Usar setTimeout para llamar a onNext después de 3 segundos
        setTimeout(() => {
          setLoading(false); // Oculta el modal de carga
        }, 2000);
  
      } else {
        Alert.alert('Error', 'No hay un usuario registrado.');
      }
    } catch (error) {
      console.log('Error al actualizar el perfil:', error);
      showMessage({
        message: "Error",
        description: "No se pudo actualizar el perfil. Inténtelo de nuevo.",
        type: "danger",
        titleStyle: { fontSize: 18, fontFamily: 'Montserrat-Bold' }, // Estilo del título
        textStyle: { fontSize: 18, fontFamily: 'Montserrat-Regular' }, // Estilo del texto
        icon: "danger",
        duration: 2500,
        position:"top",
      });
      return;
  
    } 
  };
  

  return (
    <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    keyboardVerticalOffset={90} // Ajusta este valor si es necesario
  >
    <ImageBackground source={require('../assets/fondoinicio.jpg')} style={styles.backgroundImage}>
        
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.container}>
          
                  <Text style={styles.title}>Información de Perfil</Text>
                  <View style={styles.infoContainer}>
                    {imageUri ? (
                      <TouchableOpacity style={styles.imageContainer} onPress={selectImage}>
                         <ImageBackground source={{ uri: imageUri }} style={styles.image}>               
                      </ImageBackground>
                        <View style={styles.editIcon}>
                          <FontAwesome name="edit" size={20} color="#34531F" />
                        </View>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity style={styles.imageContainer} onPress={selectImage}>
                        <View style={styles.imagePlaceholder}> 
                          <FontAwesome name="user" size={60} color="#575756" />
                          <Text style={styles.uploadText}>Subir Foto</Text>
                        </View>
                      </TouchableOpacity>
                    )}

                    <View style={styles.cuerpo}  >
                    <View style={styles.fieldContainer}>
                                <Text style={styles.asterisk}>*</Text>
                                <Text style={styles.infoText}>Nombre:</Text>
                          </View>                        
                              <TextInput
                                 style={[
                                  styles.input,
                                  isSmallScreen && styles.inputSmall,
                                  isFocused1 && styles.inputFocused
                                ]}
                                placeholder="Nombre"
                                value={nombre}
                                onChangeText={setNombre}
                                onFocus={() => setIsFocused1(true)}
                                onBlur={() => setIsFocused1(false)}
                              />

                               <View style={styles.fieldContainer}>
                                <Text style={styles.asterisk}>*</Text>
                                <Text style={styles.infoText}>Cargo:</Text>
                               </View>  
                              <TextInput
                                 style={[
                                  styles.input,
                                  isSmallScreen && styles.inputSmall,
                                  isFocused2 && styles.inputFocused
                                ]}
                                placeholder="Rol"
                                value={rol}
                                onChangeText={setRol}
                                onFocus={() => setIsFocused2(true)}
                                onBlur={() => setIsFocused2(false)}
                              />
                                <View style={styles.fieldContainer}>
                                <Text style={styles.asterisk}>*</Text>
                                <Text style={styles.infoText}>Profesión:</Text>
                               </View>   
                              <TextInput
                                 style={[
                                  styles.input,
                                  isSmallScreen && styles.inputSmall,
                                  isFocused3 && styles.inputFocused
                                ]}
                                placeholder="Carrera o Profesión"
                                value={profesion}
                                onChangeText={setProfesion}
                                onFocus={() => setIsFocused3(true)}
                                onBlur={() => setIsFocused3(false)}
                              />
                              <Text style={styles.infoText}>Teléfono: </Text>   
                               <TextInput
                                 style={[
                                  styles.input,
                                  isSmallScreen && styles.inputSmall,
                                  isFocused4 && styles.inputFocused
                                ]}
                                placeholder="Nᵒ de Celular"
                                value={telefono}
                                onChangeText={setTelefono}
                                onFocus={() => setIsFocused4(true)}
                                onBlur={() => setIsFocused4(false)}
                              />

                        
                             <Text style={styles.infoText}>Email:</Text>                                 
                              <TextInput
                                 style={[
                                  styles.inputDisable,
                                  isSmallScreen && styles.inputSmall,
                                ]}
                                placeholder="Correo Electronico"
                                value={email}
                                onChangeText={setEmail}
                                editable={false}
                              />
        
                              </View>
                              <TouchableOpacity style={[styles.sig, isSmallScreen && styles.sigSmall]} onPress={guardar}> 
                                 <Text style={styles.guardar}>Guardar Cambios</Text> 
                              </TouchableOpacity>  
                              {/* Modal para mostrar la pantalla de carga */}
                              <Modal
                                          animationType="fade"
                                          transparent={true}
                                          visible={loading}
                                        >
                                          <View style={styles.modalContainer}>
                                            {loading && (
                                              <View >
                                                <ActivityIndicator size="large" color="white" />
                                                <Text style={styles.loadingText}>Actualizando Datos...</Text>
                                              </View>
                                            )}
                                          </View>
                                        </Modal>

                                    
                  </View>
                      
        </View>
      </ScrollView>
      
      
      
    </ImageBackground>
    </KeyboardAvoidingView>
    
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
    marginBottom: 50,
    color: '#C3D730',
  },
  infoContainer: {
    backgroundColor: 'rgba(240,255,242,.7)',
    padding: 20,
    borderTopLeftRadius: 90,
    //borderTopRightRadius: 70,
    marginBottom: 20,
    width: '100%',
    height: '100%', 
    alignItems:'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,  
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
  textInfo: {
    marginTop:10,
    width:'90%',
    marginBottom:20
  },
  textName: {
    fontSize: 23,
    fontFamily: 'Montserrat-Bold',
    marginTop:15,
    marginBottom: 5,
    textAlign:'center',
    color:'#6D100A',  
  },
  textCarrera: {
    fontSize: 14,
    fontFamily: 'Montserrat-Medium',
    textAlign:'center',
    marginBottom:20
  },
  imageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginTop: -100, // Ajustar según el tamaño de la imagen y el diseño general
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 30, // Esto es para Android, donde la propiedad de sombra es diferente
  },
  
  image: {
    width: 130,
    height: 130,
    borderRadius: 100,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white', // Fondo blanco mientras se carga la imagen
    borderWidth: 8, // Agrega un borde
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
    width: 130,
    height: 130,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderWidth: 8,
    borderColor: 'white',
    elevation: 10
  },
  uploadText: {
    fontFamily: 'Montserrat-Medium',
    color: '#34531F',
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
  input: {
    height:37,
    width:'100%',
    borderColor: '#132F20',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: 'white',
    borderRadius:10,
    fontFamily:'Montserrat-Medium',
    fontSize: 16,
  },
  inputDisable: {
    height:37,
    borderColor: '#6D100A',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: '#e2e2e2',
    borderRadius:10,
    fontFamily:'Montserrat-Medium',
    fontSize: 16,
  },
  inputFocused: {
    borderColor: '#132F20',
    shadowColor: '#132F20',
    shadowOpacity: 0.8,
    shadowOffset: { width: 0, height: 0},
    shadowRadius: 6,
    elevation: 5,
  },
  inputSmall: { 
    fontSize: 17, 
    width: '100%',
    height:50,
  }, // Input más pequeño en pantallas pequeñas
  infoText:{
    fontFamily:'Montserrat-Bold',
    fontSize: 18,
    marginBottom: 2,
    color:'#34531F',
  },
  separator1: {
    height: 2,
    width: '70%',
    margin:20,
    alignItems:'center',
    justifyContent:'center',
    backgroundColor: '#6D100A',
    marginVertical:5,
    borderRadius:200,
  },
  linea:{
    justifyContent: 'center', // Centra verticalmente
    alignItems: 'center',     // Centra horizontalmente
    marginBottom:20,
    marginTop:10
  },
  sig:{
    alignItems:'center',
    left: 0,
    right: 0,
    backgroundColor:'#C3D730',
    padding:10,
    borderRadius:50,
  },
  guardar:{
    fontFamily:'Montserrat-Bold',
    fontSize:18,
    color:'white'
  },
  sigSmall:{
    alignItems:'center',
    left: 0,
    right: 0,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)', 
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
  },
  fieldContainer: {
    flexDirection: 'row', // Esto alinea el asterisco y el nombre en una fila
    alignItems: 'center', // Alinea verticalmente los elementos al centro
  },
  asterisk: {
    color: 'red', // Cambia esto al color que desees para el asterisco
    fontFamily: 'Montserrat-Bold', // Usa la misma fuente si deseas coherencia
    fontSize: 19, // Ajusta el tamaño para que coincida con el de "Nombre"
    marginRight: 2, // Espacio entre el asterisco y el texto "Nombre"
  },
  cuerpo:{
    width:'100%',
    padding:20
  }
  
});

export default Perfil;
