import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Image, ActivityIndicator, TouchableOpacity, Modal } from 'react-native';
import { signInWithEmailAndPassword, sendPasswordResetEmail, getAuth, fetchSignInMethodsForEmail } from 'firebase/auth';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Video } from 'expo-av';
import { showMessage } from "react-native-flash-message";
import { firestore } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const InicioSesion = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [usuarioAutenticado, setUsuarioAutenticado] = useState(false);
  const [mostrarCargando, setMostrarCargando] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [emailReset, setEmailReset] = useState('');
  const [initialSetupCompleted, setInitialSetupCompleted] = useState(null);

  const passwordVisibility = () => {
    setSecureTextEntry(!secureTextEntry);
  };
  
  const auth = getAuth();

  const iniciarSesion = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('Usuario autenticado:', user.email);
      setUsuarioAutenticado(true);
      setMostrarCargando(true);

      // Aquí se realiza la verificación en Firestore
      const checkInitialSetupCompleted = async () => {
        const userId = user.uid;
        const userDocRef = doc(firestore, 'users', userId); // Ruta: colección 'users', documento con ID del usuario
    
        try {
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const data = userDoc.data();
            const setupCompleted = data.initialSetupCompleted;
    
            if (setupCompleted) {
              console.log('Initial setup completed:', setupCompleted);
              // Navegar a la pantalla principal si el setup está completado
              navigation.replace('TabInicio');
            } else {
              console.log('Initial setup not completed.');
              // Navegar a la pantalla de configuración inicial si no está completado
              navigation.replace('PasswordChangeScreen');
            }
          } else {
            console.log('No such document!');
          }
        } catch (error) {
          setMostrarCargando(false);
          console.error('Error fetching document:', error);
          showMessage({
            message: "Error",
            description: "Hubo un error al verificar tu cuenta. Por favor, intenta de nuevo.",
            type: "danger",
            position: "top",
            icon: "danger",
            duration: 4000,
          });
        }
      };

      // Ejecuta la verificación en Firestore
      checkInitialSetupCompleted();
      
    } catch (error) {
      console.log('Error al autenticar usuario:', error);
      let mensajeError;
      switch (error.code) {
        case 'auth/invalid-email':
          mensajeError = 'El correo electrónico que ingresaste no es válido.';
          break;
        case 'auth/user-disabled':
          mensajeError = 'Este usuario ha sido deshabilitado.';
          break;
        case 'auth/user-not-found':
          mensajeError = 'No se encontró ninguna cuenta con este correo electrónico.';
          break;
        case 'auth/wrong-password':
          mensajeError = 'La contraseña que ingresaste es incorrecta.';
          break;
        case 'auth/too-many-requests':
          mensajeError = 'Por favor, inténtelo más tarde, ha excedido el número de intentos para iniciar sesión.';
          break;
        default:
          mensajeError = 'Lo sentimos, no se han podido autenticar tus credenciales. Por favor, intenta nuevamente.';
      }
      showMessage({
        message: "Error",
        description: mensajeError,
        type: "danger",
        position: "top",
        icon: "danger",
        duration: 4000,
      });
    }
  };

  const comprobarEmail = async () => {
    try {
      const signInMethods = await fetchSignInMethodsForEmail(auth, emailReset);
      if (signInMethods.length > 0) {
        await sendPasswordResetEmail(auth, emailReset);
        showMessage({
          message: "Éxito",
          description: "Se ha enviado un correo para restablecer tu contraseña. Revisa tu bandeja de entrada o la carpeta de spam.",
          type: "success",
          position: "top",
          icon: "success",
          duration: 6000,
        });
      } else {
        showMessage({
          message: "Error",
          description: "No se encontró ninguna cuenta registrada con este correo electrónico.",
          type: "danger",
          position: "top",
          icon: "danger",
          duration: 4000,
        });
      }
    } catch (error) {
      console.log('Error al comprobar el correo:', error);
      showMessage({
        message: "Error",
        description: "Ocurrió un error. Por favor, intenta de nuevo.",
        type: "danger",
        position: "top",
        icon: "danger",
        duration: 4000,
      });
    }
  };

  return (
    <View style={estilos.container}>
      <Video
        source={require('../assets/fondoInicio.mp4')}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
        shouldPlay
        isLooping
      />

      <View style={estilos.contenidoContainer}>
        <Image source={require('../assets/siredelogo1.png')} style={estilos.logo} />
        <TextInput
          style={estilos.inputsTexto}
          onChangeText={setEmail}
          value={email}
          color="#FFFFFF"
          placeholder="Correo electrónico"
          placeholderTextColor="#B3B3B3"
        />
        <View style={estilos.inputContainer}>
          <TextInput
            style={estilos.inputsTexto}
            onChangeText={setPassword}
            value={password}
            color="#FFFFFF"
            placeholder="Contraseña"
            placeholderTextColor="#B3B3B3"
            secureTextEntry={secureTextEntry}
          />
         <TouchableOpacity style={estilos.iconContainer} onPress={passwordVisibility}>
            <Ionicons
              name={secureTextEntry ? 'eye-off' : 'eye'} // Cambia el nombre según los íconos que prefieras
              size={20}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>
        
        <View style={estilos.olvideContrasenaContainer}>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Text style={estilos.olvideContrasena}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>
        </View>
        {mostrarCargando ? (
          <View style={estilos.cargandoContainer}>
            <ActivityIndicator size="large" color="#696969" />
            <Text style={estilos.mensajeCargando}>Iniciando Sesión...</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={estilos.boton}
            onPress={iniciarSesion}
          >
            <Text style={estilos.botonTexto}>Iniciar Sesión</Text>
          </TouchableOpacity>
        )}
        <View style={estilos.signupContainer}>
          <Text style={estilos.signupText}>¿No tienes tu cuenta aún?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('AccessRequest')}>
            <Text style={estilos.signupLink}>¡Solicita acceso aquí!</Text>
          </TouchableOpacity>
      </View>
      </View>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={estilos.modalContainer}>
          
          <View style={estilos.modalContent}>
             <MaterialIcons name="password" size={100} color="#6D100A" />
            <Text style={estilos.titulo}>Restablecer Contraseña</Text>
            <Text style={estilos.subtitulo}>Por favor ingresa en el recuadro el correo Institucional con el que te registraste para poder restablecer tu contraseña.</Text>
            <TextInput
              style={estilos.modalInput}
              placeholder="Correo electrónico"
              placeholderTextColor="#696969"
              value={emailReset}
              onChangeText={setEmailReset}
            />
            <TouchableOpacity style={estilos.modalButton} onPress={comprobarEmail}>
              <Text style={estilos.modalButtonText}>Restablecer</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[estilos.modalButton, { marginTop: 10, backgroundColor: 'gray' }]} onPress={() => setModalVisible(false)}>
              <Text style={estilos.modalButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};


const estilos = StyleSheet.create({
  container: {
    backgroundColor: '#E6E6FA',
    position: 'relative', // Necesario para posicionar elementos hijos absolutamente
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },
  contenidoContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titulo: {
    fontSize: 22,
    fontFamily: 'Montserrat-Bold',
    color: '#6D100A',
  },
  subtitulo: {
    fontSize: 15,
    color: '#132F20',
    fontFamily: 'Montserrat-Medium',
    textAlign:'justify',
    marginTop:10,
    marginBottom:10
  },
  inputsTexto: {
    fontSize: 15,
    height: 45,
    width: 300,
    marginBottom: -3,
    borderWidth: 1,
    padding: 10,
    borderColor: 'yellowgreen',
    borderWidth: 3,
    color: '#FFFFFF',
    borderRadius: 10,
    fontFamily: 'Montserrat-Medium',
  },
  logo: {
    width: 400,
    height: 75,
    resizeMode: 'contain',
    marginBottom: 40,
    
  },
  cargandoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mensajeCargando: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
  },
  animacionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  olvideContrasenaContainer: {
    //width: 300,
    //alignItems: 'flex-end',
    marginTop: 10,
    marginBottom: 25,
  },
  olvideContrasena: {
    color: '#FFFFFF',
    textDecorationLine: 'underline',
    fontFamily: 'Montserrat-Medium',
  },
  botonTexto: {
    fontSize: 15,
    color: 'white',
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
  },
  boton: {
    backgroundColor: 'rgba(250, 250, 250, 0.1)',
    padding: 10,
    borderRadius: 10, 
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 15,
    width: 320,
    alignItems: 'center',
    elevation: 10, // Sombra en Android
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  modalInput: {
    height: 45,
    width: '100%',
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 8,
    paddingLeft: 10,
    marginBottom: 15,
    fontFamily: 'Montserrat-Medium',
  },
  modalButton: {
    backgroundColor: '#6D100A',
    padding: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontFamily: 'Montserrat-Bold',
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  iconContainer: {
    position: 'absolute',
    right: 20,
    top:13
  },
  signupContainer: {
    position: 'absolute', // Posiciona el View en relación al contenedor principal
    bottom: -1, // Ubica el View en la parte inferior del contenedor
    width: '100%', // Asegúrate de que ocupe el ancho completo
    alignItems: 'center',
    padding: 20, // Agrega un poco de padding si es necesario
  },
  signupText: {
    fontSize: 16,
    color: '#696969',
    fontFamily: 'Montserrat-Medium',
  },
  signupLink: {
    fontSize: 16,
    color: '#C3D730',
    marginTop: 5,
    fontFamily: 'Montserrat-Bold',
  },
});

export default InicioSesion;
