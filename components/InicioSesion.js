import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import Toast from 'react-native-toast-message';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { getAuth } from 'firebase/auth';
import { Video } from 'expo-av';

const InicioSesion = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [usuarioAutenticado, setUsuarioAutenticado] = useState(false);
  const [mostrarCargando, setMostrarCargando] = useState(false);

  const auth = getAuth();

  const iniciarSesion = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('Usuario autenticado:', user.email);
      setUsuarioAutenticado(true);
      setMostrarCargando(true);
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
        default:
          mensajeError = 'Lo sentimos, no se han podido autenticar tus credenciales. Por favor, intenta nuevamente.';
      }
      mostrarNotificacion(mensajeError);
    }
  };

  const restablecerContrasena = async () => {
    if (email.trim() === '') {
      mostrarNotificacion('Por favor, ingresa tu correo electrónico para restablecer tu contraseña.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      mostrarNotificacion('Se ha enviado un correo para restablecer tu contraseña.');
    } catch (error) {
      console.log('Error al enviar el correo de restablecimiento:', error);
      mostrarNotificacion('No se pudo enviar el correo de restablecimiento. Inténtalo de nuevo.');
    }
  };

  useEffect(() => {
    if (usuarioAutenticado) {
      const timer = setTimeout(() => {
        navigation.replace('TabInicio');
        setMostrarCargando(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [usuarioAutenticado]);

  const estilos = StyleSheet.create({
    container: {
      backgroundColor: '#E6E6FA',
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
      fontSize: 20,
      fontWeight: 'bold',
      color: 'mediumvioletred',
    },
    inputsTexto: {
      fontSize: 15,
      height: 45,
      width: 300,
      marginBottom: -3,
      borderWidth: 1,
      padding: 15,
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
      width: 300,
      alignItems: 'flex-end',
      marginTop:10,
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
      fontFamily:'Montserrat-Bold',
    },
    boton: {
      backgroundColor: 'rgba(250, 250, 250, 0.1)',
      padding: 10,
      borderRadius: 10, 
    },
  });

  const mostrarNotificacion = (mensaje) => {
    Toast.show({
      type: 'error',
      position: 'bottom',
      text1: 'Atención!',
      text2: mensaje,
      visibilityTime: 5000,
      bottomOffset: 250,
      autoHide: true,
    });
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
          placeholderTextColor="#696969"
        />
        <TextInput
          style={estilos.inputsTexto}
          onChangeText={setPassword}
          value={password}
          placeholder="Contraseña"
          color="#FFFFFF"
          placeholderTextColor="#696969"
          secureTextEntry={true}
        />
            <View style={estilos.olvideContrasenaContainer}>
              <TouchableOpacity onPress={restablecerContrasena}>
                <Text style={estilos.olvideContrasena}>¿Has olvidado tu contraseña?</Text>
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
          <Text style={estilos.botonTexto} >Iniciar Sesión</Text>
      </TouchableOpacity>
        )}
      
      </View>
    </View>
  );
};

export default InicioSesion;
