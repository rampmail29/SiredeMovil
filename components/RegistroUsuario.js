import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

const RegistroUsuario = ({ volverAInicio }) => {
  const [nombre, setNombre] = useState('');
  const [edad, setEdad] = useState('');
  const [cedula, setCedula] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [registroExitoso, setRegistroExitoso] = useState(false);
  const [mostrarMensajes, setMostrarMensajes] = useState(false);
  const [mostrarTitulos, setMostrarTitulos] = useState(true);
  
  const [contador, setContador] = useState(5);

  const guardarUsuarioEnFirestore = async () => {
    try {
      const db = getFirestore();
      const usuariosRef = collection(db, 'clientes');
      await addDoc(usuariosRef, {
        nombre: nombre,
        edad: edad,
        cedula: cedula,
        email: email,
        password: password,
      });
      console.log('Usuario guardado en Firestore');
    } catch (error) {
      console.error('Error al guardar el usuario en Firestore:', error);
    }
  };

  const autenticarCorreoElectronico = async () => {
    try {
      const auth = getAuth();
      await createUserWithEmailAndPassword(auth, email, password);
      console.log('Correo electrónico autenticado correctamente');
      setRegistroExitoso(true);
      setMostrarMensajes(true);
      setMostrarTitulos(false);
    } catch (error) {
      console.error('Error al autenticar el correo electrónico:', error);
    }
  };

  const guardarUsuarioYAutenticar = async () => {
    try {
      await guardarUsuarioEnFirestore();
      await autenticarCorreoElectronico();
      console.log('Usuario guardado y autenticado correctamente');
    } catch (error) {
      console.error('Error al guardar el usuario y autenticar:', error);
    }
  };

  const guardarUsuario = async () => {
    await guardarUsuarioYAutenticar();
  };

  useEffect(() => {
    if (contador === 0) {
      volverAInicio();
    }
  }, [contador, volverAInicio]);
  
  useEffect(() => {
    if (registroExitoso) {
      const timer = setInterval(() => {
        setContador((prevContador) => prevContador - 1);
      }, 1000);
  
      setTimeout(() => {
        setMostrarMensajes(false);
        clearInterval(timer);
        setRegistroExitoso(false); 
      }, 5000);
  
      return () => clearInterval(timer);
    }
  }, [registroExitoso]);

  return (
    <View style={styles.container}>
      {mostrarTitulos && (
        <View> 
          <Text style={styles.titulo}>Registrarte</Text>
          <Text style={styles.subtitulo}>Es rápido y fácil.</Text>
        </View>
      
      )}
      {!registroExitoso && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Nombre"
            onChangeText={(text) => setNombre(text)}
            value={nombre}
          />
          <TextInput
            style={styles.input}
            placeholder="Edad"
            onChangeText={(text) => setEdad(text)}
            value={edad}
          />
          <TextInput
            style={styles.input}
            placeholder="Cédula"
            onChangeText={(text) => setCedula(text)}
            value={cedula}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            onChangeText={(text) => setEmail(text)}
            value={email}
          />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            onChangeText={(text) => setPassword(text)}
            value={password}
            secureTextEntry
          />
          <Button title="Registrar Usuario" onPress={guardarUsuario} color="#841584" />
        </>
      )}
      {mostrarMensajes && (
        <>
          <Text style={styles.mensajeExitoso}>Felicidades, te has registrado correctamente!</Text>
          <Text style={styles.mensajeRedireccion}>
            Serás redirigido a la página de inicio de sesión en {contador} segundos.
          </Text>
        </>
      )}

      {mostrarTitulos && (
       <TouchableOpacity
           onPress={volverAInicio}
         >
           <Text style={styles.botonText}>Volver a Inicio</Text>
         </TouchableOpacity>
         )}
    </View>
  );
};

const styles = StyleSheet.create({
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
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 10,
    borderRadius: 20, 
  },
  input: {
    fontSize: 12,
    height: 40,
    width: 210,
    margin: 10,
    borderWidth: 1,
    padding: 10,
    borderColor: 'mediumvioletred',
    borderWidth: 3,
  },
  mensajeExitoso: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#C71585',
    marginBottom: 10,
  },
  mensajeRedireccion: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  botonContainer: {
    marginTop: 10,
  },
  titulo: {
    fontSize: 24,
    color: '#C71585',
    fontWeight: 'bold',
    marginBottom: 0,
  },
  subtitulo: {
    fontSize: 13,
    color: '#C71585',
    textAlign: 'center',
    marginBottom: 5,
  },
  botonText: {
    color: '#C71585',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    
  },
});

export default RegistroUsuario;