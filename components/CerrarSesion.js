import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, ImageBackground } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getAuth, signOut } from "firebase/auth";

const CerrarSesion = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(true);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prevCountdown => {
        if (prevCountdown <= 1) {
          clearInterval(timer);
          handleSignOut();  
        }
        return prevCountdown - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSignOut = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        setModalVisible(false);
        console.log("Sesión cerrada correctamente");
        navigation.reset({
          index: 0,
          routes: [{ name: 'InicioSesion' }],
        });
      })
      .catch((error) => {
        console.error("Error al cerrar sesión:", error);
      });
  };

  return (
    <ImageBackground source={require('../assets/fondocerrar.jpg')} style={styles.backgroundImage}>
    <Modal
      transparent={true}
      visible={modalVisible}
      animationType="fade"
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
         <Ionicons name="log-out-outline" size={50} color="#FF6347" style={styles.icon} />
          <Text style={styles.modalTitle}>¡Gracias por visitar SiredeMovil!</Text>
          <Text style={styles.modalMessage}>Tu cuenta se cerrará en {countdown} segundos.</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              setModalVisible(false);
              handleSignOut();
            }}
          >
            <Text style={styles.buttonText}>Cerrar Ahora</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: 300,
    padding: 20,
    borderRadius: 10,
    backgroundColor: "white",
    alignItems: "center",
  },
  icon: {
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 25,
    fontFamily: 'Montserrat-Bold',
    textAlign: "center",
    marginBottom: 15,
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
    fontFamily: 'Montserrat-Medium',
  },
  button: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#FF6347",
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontFamily: 'Montserrat-Bold',
  },
});

export default CerrarSesion;
