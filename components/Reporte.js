import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, Text, ImageBackground, KeyboardAvoidingView, Platform, TouchableOpacity  } from 'react-native';
import { getFirestore, collection, addDoc, doc, getDoc,serverTimestamp   } from 'firebase/firestore';
import { showMessage } from "react-native-flash-message"; 
import { getAuth} from 'firebase/auth';

const auth = getAuth();
const db = getFirestore();

const Reportes = ({ navigation }) => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [uid, setUid] = useState('');
  const [mostrarTitulos, setMostrarTitulos] = useState(true);
  const [alturaTextArea, setAlturaTextArea] = useState(80);
  const [envioExitoso, setEnvioExitoso] = useState(false);
  const [mostrarMensajes, setMostrarMensajes] = useState(false);
  const [contador, setContador] = useState(5);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          setEmail(user.email);
          const userRef = doc(db, 'users', user.uid);
          setUid(user.uid);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setNombre(userData.nombre || '');
          }
        }
      } catch (error) {
        console.log('Error al cargar los datos del usuario:', error);
      } finally {
      }
    };
  
    loadUserData();
  }, []);


  const guardarReporteEnFirestore = async () => {
    try {
      const db = getFirestore();
      const reportesRef = collection(db, 'reportes');
      await addDoc(reportesRef, {
        nombre: nombre,
        correo: email,
        mensaje: mensaje,
        timestamp: serverTimestamp(),
      });
      console.log('Reporte guardado en Firestore');
    } catch (error) {
      console.error('Error al guardar el reporte en Firestore:', error);
    }
  };

  const enviarReporte = async () => {
   
    if (!mensaje) {
      showMessage({
        message: "Faltan datos",
        description: "Por favor, describe el problema correctamente para poder enviar el reporte.",
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
      await guardarReporteEnFirestore();
      setEnvioExitoso(true);
      setMostrarMensajes(true);
      setMostrarTitulos(false);
    } catch (error) {
      console.error('Error al enviar el reporte:', error);
    }
  };

  useEffect(() => {
    if (envioExitoso) {
      const timer = setInterval(() => {
        setContador((prevContador) => prevContador - 1);
      }, 1000);

      setTimeout(() => {
        setMostrarMensajes(false);
        clearInterval(timer); //esto es para que el contador no siga restando
        setEnvioExitoso(false);
        navigation.replace('TabInicio');
      }, 5000);

      return () => clearInterval(timer);
    }
  }, [envioExitoso]);
  const primerNombre = nombre.split(" ")[0];

  return (
    <KeyboardAvoidingView
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    style={styles.container1}
   >
    <ImageBackground
       source={require('../assets/fondoinicio.jpg')} // Ruta de tu imagen de fondo
       style={styles.background}> 
              <View style={styles.container}>
                  {mostrarTitulos ? (
                    <>
                      <View>
                        <Text style={styles.titulo}>Reportar un Problema</Text>
                        <Text style={styles.subtitulo}>¡{primerNombre}, tu retroalimentación es valiosa para nosotros!</Text>
                      </View>

                      <TextInput
                        style={[styles.input, { height: Math.max(130, alturaTextArea) }]}
                        placeholder="Describe el problema"
                        onChangeText={(text) => setMensaje(text)}
                        value={mensaje}
                        multiline
                        onContentSizeChange={(event) => {
                          setAlturaTextArea(event.nativeEvent.contentSize.height);
                        }}
                      />
                       <TouchableOpacity
                          style={styles.boton}
                          onPress={enviarReporte}
                        >
                          <Text style={styles.botonTexto} >Enviar Reporte</Text>
                      </TouchableOpacity>
                    
                    </>
                  ) : (
                    mostrarMensajes && (
                      <>
                        <Text style={styles.mensajeExitoso}>Reporte enviado exitosamente. ¡Gracias por tu colaboración!</Text>
                        <Text style={styles.mensajeRedireccion}>
                          Serás redirigido a la página principal en {contador} segundos.
                        </Text>
                      </>
                    )
                  )}
            </View>
          
    </ImageBackground>
  </KeyboardAvoidingView>
  );
};


const styles = StyleSheet.create({
  container1: {
    flex: 1,
  },
  background: {
    flex: 1,
    resizeMode: 'cover', // Ajusta la imagen de fondo para cubrir toda la pantalla
  },
  container: {
    backgroundColor: '#F0FFF2',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
    marginBottom: 'auto',
    marginRight: 30,
    marginLeft: 30,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 10,
    borderRadius: 20, 
  },
  input: {
    fontSize: 14,
    height: 40,
    width: 260,
    margin: 10,
    padding: 10,
    borderColor: '#132F20',
    borderWidth: 2,
    borderRadius: 8,
    fontFamily: 'Montserrat-Medium',
  },
  textArea: {
    textAlignVertical: 'top',
  },
  mensajeExitoso: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6D100A',
    marginBottom: 10,
    fontFamily: 'Montserrat-Bold',
  },
  mensajeRedireccion: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'Montserrat-Medium',
  },
  titulo: {
    fontSize: 30,
    color: '#C3D730',
    textAlign:'center',
    marginBottom: 15,
    fontFamily: 'Montserrat-Bold',
  },
  subtitulo: {
    fontSize: 19,
    color: '#34531F',
    textAlign: 'center',
    marginBottom: 5,
    fontFamily: 'Montserrat-Medium',
  },
  botonTexto: {
    fontSize: 15,
    color: '#F0FFF2',
    fontWeight: 'bold',
    fontFamily:'Montserrat-Bold',
  },
  boton: {
    backgroundColor:"#C3D730",
    padding: 10,
    borderRadius: 30, 
  },
});

export default Reportes;
