import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { getFirestore, collection, addDoc } from 'firebase/firestore';


const AccessRequestForm = () => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');

  const submitRequest = async () => {
    if (!name || !role || !email) {
      Alert.alert('Error', 'Por favor, completa todos los campos.');
      return;
    }

    try {
      await firestore().collection('accessRequests').add({
        name: name,
        role: role,
        email: email,
        timestamp: firestore.FieldValue.serverTimestamp(),
      });
      Alert.alert('Solicitud enviada', 'Tu solicitud ha sido enviada correctamente.');
      // Limpiar los campos después de enviar la solicitud
      setName('');
      setRole('');
      setEmail('');
    } catch (error) {
      Alert.alert('Error', 'Hubo un problema al enviar la solicitud. Inténtalo de nuevo.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Solicitud de Acceso</Text>
      <TextInput
        style={styles.input}
        placeholder="Nombre"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Cargo"
        value={role}
        onChangeText={setRole}
      />
      <TextInput
        style={styles.input}
        placeholder="Correo Institucional"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TouchableOpacity style={styles.button} onPress={submitRequest}>
        <Text style={styles.buttonText}>Enviar Solicitud</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#E0E0E0',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#1E90FF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});

export default AccessRequestForm;