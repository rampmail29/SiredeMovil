import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { getAuth, updateProfile } from 'firebase/auth';
import { getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';

const InitialSetupScreen = ({ navigation }) => {
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [profesion, setProfesion] = useState('');
  const [rol, setRol] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialSetupCompleted, setInitialSetupCompleted] = useState(true);

  

  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          console.log('Usuario actual:', user.uid);
          setEmail(user.email); // Mostrar el email del usuario
          const userRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log('Datos del usuario:', userData);
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Completa tu Perfil</Text>
      <TextInput
        style={styles.input}
        placeholder="Nombre Completo"
        value={nombre}
        onChangeText={setNombre}
      />
      <TextInput
        style={styles.input}
        placeholder="Número de Teléfono"
        value={telefono}
        onChangeText={setTelefono}
      />
      <TextInput
        style={styles.input}
        placeholder="Carrera o Profesión"
        value={profesion}
        onChangeText={setProfesion}
      />
      <TextInput
        style={styles.input}
        placeholder="Rol"
        value={rol}
        onChangeText={setRol}
      />
      <TextInput
        style={styles.input}
        placeholder="Correo Electrónico"
        value={email}
        editable={false} // El email no se puede editar
      />
      <Button
        title={isSubmitting ? "Enviando..." : "Enviar"}
        onPress={handleSubmit}
        disabled={isSubmitting}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
  },
});

export default InitialSetupScreen;
