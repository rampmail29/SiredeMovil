import React, { useState } from 'react';
import { TextInput, StyleSheet, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ImageBackground, View  } from 'react-native';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { showMessage } from "react-native-flash-message"; 
import AntDesign from '@expo/vector-icons/AntDesign';

const AccessRequestForm = () => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');

  const submitRequest = async () => {
    if (!name || !role || !email) {
      showMessage({
        message: "Faltan datos",
        description: "Por favor, completa todos los campos antes de enviar tu solicitud de acceso.",
        type: "danger",
        titleStyle: { fontSize: 18, fontFamily: 'Montserrat-Bold' }, // Estilo del título
        textStyle: { fontSize: 18, fontFamily: 'Montserrat-Regular' }, // Estilo del texto
        icon: "danger",
        duration: 4000,
        position:"top",
      });
      return;
    }

    try {
      const db = getFirestore();
      await addDoc(collection(db, 'AccessRequest'), {
        nombre: name,
        cargo: role,
        correo: email,
        timestamp: serverTimestamp(),
      });
      showMessage({
        message: "Solicitud enviada",
        description: "Tu solicitud ha sido enviada correctamente, pronto estaremos en contacto contigo.",
        type: "success",
        titleStyle: { fontSize: 18, fontFamily: 'Montserrat-Bold' }, // Estilo del título
        textStyle: { fontSize: 18, fontFamily: 'Montserrat-Regular' }, // Estilo del texto
        icon: "success",
        duration: 4000,
        position:"top",
      });
      // Limpiar los campos después de enviar la solicitud
      setName('');
      setRole('');
      setEmail('');
    } catch (error) {
      showMessage({
        message: "Error",
        description: "Hubo un problema al enviar la solicitud. Inténtalo de nuevo.",
        type: "danger",
        titleStyle: { fontSize: 18, fontFamily: 'Montserrat-Bold' }, // Estilo del título
        textStyle: { fontSize: 18, fontFamily: 'Montserrat-Regular' }, // Estilo del texto
        icon: "danger",
        duration: 3000,
        position:"top",
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={-20} // Ajusta este valor si es necesario
    >
      <ImageBackground
        source={require('../assets/fondoinicio.jpg')} // Ruta de tu imagen de fondo
        style={styles.background}> 
        <ScrollView contentContainerStyle={styles.container}>
           <View style={styles.icon}>
            <AntDesign name="adduser" size={80} color="#6D100A" />
          </View>
        <Text style={styles.title}>Solicitud de Acceso</Text>
        <Text style={styles.description}>
          Completa el siguiente formulario para poder solicitar acceso a nuestra plataforma SIREDE Móvil. Recuerda que esta app es de uso exclusivo del personal administrativo autorizado de las UTS. Nos pondremos en contacto contigo a través de tu correo institucional en la mayor brevedad posible.
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Nombre"
          placeholderTextColor="#999"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Cargo"
          placeholderTextColor="#999"
          value={role}
          onChangeText={setRole}
        />
        <TextInput
          style={styles.input}
          placeholder="Correo Institucional"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <TouchableOpacity style={styles.button} onPress={submitRequest}>
          <Text style={styles.buttonText}>Enviar Solicitud</Text>
        </TouchableOpacity>
      </ScrollView>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 30,
    justifyContent: 'center',
    
  },
  background: {
    flex: 1,
    resizeMode: 'cover', // Ajusta la imagen de fondo para cubrir toda la pantalla
  },
  title: {
    fontSize: 30,
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'Montserrat-Bold',
    color: '#6D100A',
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
    textAlign:'justify',
    color: '#575756',
    lineHeight: 22,
    fontFamily: 'Montserrat-Medium',
  },
  input: {
    backgroundColor: '#FFF',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderColor: '#6D100A',
    borderWidth: 1,
    fontSize: 16,
    color: '#333',
    fontFamily: 'Montserrat-Medium',
  },
  button: {
    backgroundColor: '#6D100A',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Montserrat-Bold',
  },
  icon: {
    justifyContent: 'center', // centra verticalmente
    alignItems: 'center', // centra horizontalmente
  },
});

export default AccessRequestForm;
