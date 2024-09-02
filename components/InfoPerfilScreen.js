import React, { useState, useEffect, useRef } from 'react';
import { 
  ScrollView, 
  StyleSheet, 
  View, 
  Animated, 
  useWindowDimensions, 
  ImageBackground, 
  Text, 
  TouchableOpacity, 
  TextInput, 
  Easing, 
  Alert,
  KeyboardAvoidingView,
  Platform
 } from 'react-native';
 import { getAuth, updateProfile } from 'firebase/auth';
 import { getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';
 import * as ImagePicker from 'expo-image-picker';
 import * as ImageManipulator from 'expo-image-manipulator';
 import { FontAwesome } from '@expo/vector-icons';
 import { ref, getDownloadURL, uploadBytes } from 'firebase/storage';
 import { storage } from '../firebaseConfig';
 

const InfoPerfilScreen = () => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [imageUri, setImageUri] = useState(null);
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [profesion, setProfesion] = useState('');
  const [rol, setRol] = useState('');
  const [uid, setUid] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [isFocused1, setIsFocused1] = useState(false);
  const [isFocused2, setIsFocused2] = useState(false);
  const [isFocused3, setIsFocused3] = useState(false);
  const [isFocused4, setIsFocused4] = useState(false);
  const [initialSetupCompleted, setInitialSetupCompleted] = useState(true);
  const auth = getAuth();
  const db = getFirestore();

  // Imprime las dimensiones en la consola
  //console.log(`Height: ${windowHeight}, Width: ${windowWidth}`);

   // Crear referencias para las animaciones de cada pantalla
   const slideAnim1 = useRef(new Animated.Value(300)).current; // Pantalla 1
   const slideAnim2 = useRef(new Animated.Value(-300)).current; // Pantalla 
   const fadeAnim = useRef(new Animated.Value(0)).current; // Inicialmente invisible
   const slideAnim3 = useRef(new Animated.Value(-500)).current; // Pantalla 3
   const slideAnim4 = useRef(new Animated.Value(300)).current; // Pantalla 4

    // Función para iniciar las animaciones
  const animateScreen = (slideAnim, fadeAnim) => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      fadeAnim &&
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
    ]).start();
  };

  const isSmallScreen = windowHeight < 750; // Por ejemplo, iPhone 8 Plus tiene un ancho de 375px
  const scaleFactor = windowHeight < 750 ? 0.9 : 1; // Ajusta según tus necesidades


  useEffect(() => {
    const listenerId = scrollX.addListener(({ value }) => {
      const screenIndex = Math.floor(value / windowWidth);
      // Iniciar la animación de la pantalla correspondiente
      if (screenIndex === 0) {
        animateScreen(slideAnim1, null);
      } else if (screenIndex === 1) {
        animateScreen(slideAnim2, fadeAnim);
      } else if (screenIndex === 2) {
        animateScreen(slideAnim3, null);
      } else if (screenIndex === 3) {
        animateScreen(slideAnim4, null);
      }
    });

    // Iniciar la animación de la primera pantalla al montar el componente
    animateScreen(slideAnim1, null);

    return () => {
      scrollX.removeListener(listenerId);
    };
  }, [scrollX]);

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
          Alert.alert('Error', 'No hay un usuario registrado.');
        }
      } catch (error) {
        console.log('Error al cargar los datos del usuario:', error);
        Alert.alert('Error', 'Hubo un problema al cargar los datos del usuario.');
      }
    };

    loadUserData();
  }, []);

  
  const handleSubmit = async () => {
    if (!nombre || !telefono || !profesion || !rol) {
      Alert.alert('Error', 'Por favor, complete todos los campos obligatorios.');
      return;
    }

    setIsSubmitting(true);

    try {
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
          initialSetupCompleted
        });

        // Navegar a la pantalla principal de la app
        navigation.navigate('TabInicio'); // O la pantalla principal de tu app
      } else {
        Alert.alert('Error', 'No hay un usuario registrado.');
      }
    } catch (error) {
      console.log('Error al actualizar el perfil:', error);
      Alert.alert('Error', 'No se pudo actualizar el perfil. Inténtelo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  
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

  const animatedScroll1  = async () => {
    scrollViewRef.current.scrollTo({ x: windowWidth*2, animated: true });
  }


  return (
    <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={0} // Ajusta este valor si es necesario
          >
          <ScrollView style={[styles.container, isSmallScreen && styles.containerPantalla2Small]}>
          
                 <Text style={[styles.title, isSmallScreen && styles.titleSmall]}>Completa la información de tu perfil.</Text>
                
             
                            
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
                                    <FontAwesome name="user" size={70} color="#6D100A" />
                                    <Text style={styles.uploadText}>Subir Foto</Text>
                                  </View>
                                </TouchableOpacity>
                              )} 
                                  <Text style={styles.textName}>{email}</Text>

                                  <View style={styles.linea}>
                                    <View style={styles.separator1} />
                                  </View>

                          <View style={styles.infoContainer} >
                            <Text style={styles.infoText}>Nombre: </Text>                              
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
                              <Text style={styles.infoText}>Cargo: </Text>   
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
                               <Text style={styles.infoText}>Profesión: </Text>   
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
        
                              </View>
                              <TouchableOpacity style={[styles.sig, isSmallScreen && styles.sigSmall]} onPress={animatedScroll1}> 
                                 <FontAwesome name="arrow-circle-right" size={80} color="#6D100A" />   
                              </TouchableOpacity>  
                         
                      </ScrollView>
                      </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
  },
  containerPantalla2Small: { 
    padding: 0,
    margin:-20,
  }, // Menos padding para pantallas pequeñas
  title: {
    fontSize: 35,
    fontFamily: 'Montserrat-Bold',
    marginTop:35,
    marginBottom: 0,
    color: '#6D100A',
  },
  titleSmall: { 
    fontSize: 35,
    marginTop:0,
  }, // Texto más pequeño en pantallas pequeñas
  imageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 2.5,
    elevation: 10, // Esto es para Android, donde la propiedad de sombra es diferente
  }, 
  image: {
    width: 140,
    height: 140,
    borderRadius: 100,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white', 
    borderWidth: 8, 
    borderColor: '#f1f1f1', 
    elevation: 10, // Esto es para Android, donde la propiedad de sombra es diferente
  },
  editIcon: {
    position: 'absolute',
    bottom: 10, 
    right: 120, 
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
    width: 140,
    height: 140,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(250, 250, 250, 0.2)',
    borderWidth: 5,
    borderColor: '#6D100A',
  },
  uploadText: {
    fontFamily: 'Montserrat-Medium',
    color: '#6D100A',
  },
  textName: {
    fontSize: 20,
    fontFamily: 'Montserrat-Bold',
    marginTop:10,
    textAlign:'center',
    color:'#6D100A',  
  },
  input: {
    width: '100%',
    height:40,
    borderColor: '#6D100A',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: 'white',
    borderRadius:10,
    fontFamily:'Montserrat-Medium',
    fontSize: 18,
  },
  inputFocused: {
    borderColor: '#6D100A',
    shadowColor: '#6D100A',
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
    fontSize: 19,
    marginBottom: 2,
    color:'#6d100a',
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
  },
  sigSmall:{
    alignItems:'center',
    left: 0,
    right: 0,
  },
});

export default InfoPerfilScreen;
