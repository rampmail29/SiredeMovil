import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { FontAwesome } from "@expo/vector-icons";
import { ref, getDownloadURL, uploadBytes } from "firebase/storage";
import { storage } from "../firebaseConfig";
import { API_BASE_URL } from "./Config";

const StudentDetail = ({ route, navigation }) => {
  const { id, fromScreen } = route.params || {};

  // Estados
  const [student, setStudent] = useState(null);
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);

  // Función de capitalización
  const capitalizeFirstLetter = (string) =>
    string
      //.toLowerCase()
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  const formatDate = (dateString) =>
    dateString?.split("T")[0] || "No disponible";

  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return "No disponible";
    const hoy = new Date();
    const fechaNac = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) edad--;
    return `${edad} años`;
  };

  const ordenarCarrerasPorFecha = (carreras) => {
    return carreras.sort(
      (a, b) => new Date(a.fecha_ingreso) - new Date(b.fecha_ingreso)
    );
  };

  const volverNavigation = () => {
    navigation.goBack();
  };

  // Obtener detalles del estudiante desde el backend
  useEffect(() => {
    const fetchStudent = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/obtener/${id}`);
        const data = await response.json();
        setStudent(data);
      } catch (error) {
        console.error("Error al obtener detalles del estudiante:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [id]);

  // Obtener imagen del estudiante desde Firebase
  useEffect(() => {
    const fetchImage = async () => {
      if (!student) return;
      const numeroDocumento = student.numero_documento;
      const extensions = ["png", "jpg", "jpeg"];
      let url = null;
      for (let ext of extensions) {
        try {
          const imageRef = ref(
            storage,
            `estudiantes/${numeroDocumento}.${ext}`
          );
          url = await getDownloadURL(imageRef);
          if (url) break;
        } catch {}
      }
      setImageUri(url);
    };
    fetchImage();
  }, [student]);

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
        const resizedUri = await ImageManipulator.manipulateAsync(
          uri,
          [{ resize: { width: 800 } }],
          {
            compress: 0.7,
            format: ImageManipulator.SaveFormat.JPEG,
          }
        );
        await uploadImage(resizedUri.uri);
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo seleccionar la imagen.");
    }
  };

  const uploadImage = async (uri) => {
    try {
      if (!student) return;
      const response = await fetch(uri);
      const blob = await response.blob();
      const numeroDocumento = student.numero_documento;
      const extensions = ["png", "jpg", "jpeg"];
      for (let ext of extensions) {
        try {
          const storageRef = ref(
            storage,
            `estudiantes/${numeroDocumento}.${ext}`
          );
          await uploadBytes(storageRef, blob);
          const url = await getDownloadURL(storageRef);
          setImageUri(url);
          break;
        } catch (error) {
          console.error(`Error subiendo imagen ${ext}:`, error);
        }
      }
    } catch (error) {
      console.error("Error al subir la imagen:", error);
    }
  };

  if (loading || !student) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#34531F" />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={require("../assets/fondoestudiante.jpg")}
      style={styles.backgroundImage}
    >
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.container}>
          <Text style={styles.title}>Información del Estudiante</Text>
          <ImageBackground
            source={require("../assets/fondoinicio.jpg")}
            style={styles.infoContainer}
          >
            {imageUri ? (
              <TouchableOpacity
                style={styles.imageContainer}
                onPress={selectImage}
              >
                <ImageBackground
                  source={{ uri: imageUri }}
                  style={styles.image}
                />
                <View style={styles.editIcon}>
                  <FontAwesome name="edit" size={20} color="#34531F" />
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.imageContainer}
                onPress={selectImage}
              >
                <View style={styles.imagePlaceholder}>
                  <FontAwesome name="user" size={50} color="#575756" />
                  <Text style={styles.uploadText}>Subir Foto</Text>
                </View>
              </TouchableOpacity>
            )}

            <Text style={styles.title2}>Detalles Personales</Text>
            <View style={styles.textInfo}>
              <View style={styles.infoItem1}>
                <FontAwesome name="user" size={35} color="#34531F" />
                <View>
                  <Text style={styles.label}>Nombre:</Text>
                  <Text style={styles.text}>
                    {capitalizeFirstLetter(student.nombre_completo)}
                  </Text>
                </View>
              </View>
              <View style={styles.infoItem1}>
                <FontAwesome name="id-card" size={23} color="#34531F" />
                <View>
                  <Text style={styles.label}>Documento:</Text>
                  <Text style={styles.text}>{student.numero_documento}</Text>
                </View>
              </View>
              <View style={styles.infoItem1}>
                <FontAwesome name="birthday-cake" size={25} color="#34531F" />
                <View>
                  <Text style={styles.label}>Fecha de Nacimiento:</Text>
                  <Text style={styles.text}>
                    {formatDate(student.fecha_nacimiento)}
                  </Text>
                </View>
              </View>
              <View style={styles.infoItem1}>
                <FontAwesome name="child" size={35} color="#34531F" />
                <View>
                  <Text style={styles.label}>Edad:</Text>
                  <Text style={styles.text}>
                    {calcularEdad(student.fecha_nacimiento)}
                  </Text>
                </View>
              </View>
            </View>

            <Text style={styles.title3}>Detalles Académicos</Text>
            {student.estudiantes_carreras &&
              ordenarCarrerasPorFecha(student.estudiantes_carreras).map(
                (carrera, index) => (
                  <View key={index} style={styles.infoCarrera}>
                    <Text style={styles.text}>
                      Carrera:{" "}
                      {capitalizeFirstLetter(carrera.carreras?.nombre_programa)}
                    </Text>
                    <Text style={styles.text}>
                      Fecha ingreso: {formatDate(carrera.fecha_ingreso)}
                    </Text>
                    <Text style={styles.text}>
                      Estado: {carrera.estado_academico}
                    </Text>
                  </View>
                )
              )}

            <TouchableOpacity style={styles.button} onPress={volverNavigation}>
              <Text style={styles.buttonText}>Volver</Text>
            </TouchableOpacity>
          </ImageBackground>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: { flex: 1, resizeMode: "cover" },
  scrollView: { flexGrow: 1 },
  container: { flex: 1, justifyContent: "flex-start", alignItems: "center" },
  title: {
    fontSize: 40,
    padding: 30,
    fontFamily: "Montserrat-Bold",
    alignSelf: "flex-start",
    color: "white",
  },
  title2: {
    fontSize: 37,
    padding: 20,
    marginTop: "-35%",
    fontFamily: "Montserrat-Bold",
    color: "#34531F",
    alignSelf: "flex-start",
  },
  title3: {
    fontSize: 37,
    padding: 20,
    fontFamily: "Montserrat-Bold",
    color: "#6D100A",
    alignSelf: "flex-start",
  },
  infoContainer: {
    padding: 20,
    alignItems: "center",
    paddingBottom: 40,
    borderTopRightRadius: 100,
    borderTopLeftRadius: 0,
    overflow: "hidden",
  },
  text: { fontSize: 18, fontFamily: "Montserrat-Medium", marginLeft: 10 },
  label: {
    fontFamily: "Montserrat-Bold",
    color: "#C3D730",
    fontSize: 20,
    marginLeft: 10,
  },
  textInfo: { alignSelf: "flex-start", padding: 20 },
  imageContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginLeft: "70%",
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 100,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    borderWidth: 6,
    borderColor: "white",
  },
  editIcon: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 5,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 90,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    marginBottom: 8,
    borderWidth: 8,
    borderColor: "white",
  },
  uploadText: {
    fontFamily: "Montserrat-Medium",
    color: "#34531F",
    fontSize: 12,
  },
  button: {
    backgroundColor: "#6D100A",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 60,
    width: 120,
    justifyContent: "center",
    marginTop: 20,
  },
  buttonText: { fontSize: 16, fontFamily: "Montserrat-Bold", color: "#fff" },
  infoItem1: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    alignSelf: "flex-start",
  },
  infoCarrera: { alignSelf: "flex-start", padding: 20, borderBottomWidth: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  loadingText: { marginTop: 10, fontSize: 16, fontFamily: "Montserrat-Medium" },
});

export default StudentDetail;
