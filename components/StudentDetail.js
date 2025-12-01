// StudentDetail.js
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

  // Vars opcionales según la pantalla de origen
  let selectedCorteInicial,
    corteFinal,
    programaSeleccionado,
    datosBackend,
    graduacionOportuna,
    graduadosOportunos,
    tipoProgramaSeleccionado,
    idSeleccionado,
    tipoInforme,
    datos;

  if (fromScreen === "GraficarCohorte") {
    selectedCorteInicial = route.params.selectedCorteInicial;
    corteFinal = route.params.corteFinal;
    programaSeleccionado = route.params.programaSeleccionado;
    datosBackend = route.params.datosBackend;
    graduacionOportuna = route.params.graduacionOportuna;
    graduadosOportunos = route.params.graduadosOportunos;
    tipoProgramaSeleccionado = route.params.tipoProgramaSeleccionado;
    idSeleccionado = route.params.idSeleccionado;
  }

  if (fromScreen === "GraficarPdf") {
    tipoInforme = route.params.tipoInforme;
    datos = route.params.datos;
  }

  const [student, setStudent] = useState(null);
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);

  // === Helpers seguros ===
  const capitalizeFirstLetter = (str) => {
    if (!str || typeof str !== "string") return "";
    return str
      .toLowerCase()
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  const safeText = (str) =>
    str && typeof str === "string" ? str : "No disponible";

  const formatDate = (dateString) =>
    typeof dateString === "string" && dateString.includes("T")
      ? dateString.split("T")[0]
      : dateString || "No disponible";

  const safeDate = (dateStr) =>
    dateStr ? formatDate(dateStr) : "No disponible";

  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return "No disponible";
    const hoy = new Date();
    const fechaNac = new Date(fechaNacimiento);
    if (isNaN(fechaNac.getTime())) return "No disponible";
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }
    return `${edad} años`;
  };

  const ordenarCarrerasPorFecha = (carreras) => {
    if (!Array.isArray(carreras)) return [];
    return [...carreras].sort((a, b) => {
      const fa = new Date(a.fecha_matricula || a.fecha_ingreso || "");
      const fb = new Date(b.fecha_matricula || b.fecha_ingreso || "");
      return fa - fb;
    });
  };

  // === Navegación volver ===
  const volverNavigation = () => {
    if (fromScreen === "GraficarCohorte") {
      navigation.navigate("GraficarCohorte", {
        fromScreen: "Estadis_Cohorte",
        selectedCorteInicial,
        corteFinal,
        programaSeleccionado,
        datosBackend,
        graduacionOportuna,
        graduadosOportunos,
        tipoProgramaSeleccionado,
        idSeleccionado,
      });
    } else if (fromScreen === "InformeEstudiante") {
      navigation.navigate("InformeEstudiante");
    } else if (fromScreen === "GraficarPdf") {
      navigation.navigate("GraficarPdf", {
        tipoInforme,
        datos,
      });
    } else {
      navigation.goBack();
    }
  };

  // === Fetch de detalles del estudiante ===
  useEffect(() => {
    const obtenerDetallesEstudiante = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/obtener/${id}`);
        const data = await response.json();
        console.log(
          "🚀 ~ obtenerDetallesEstudiante ~ data:",
          data.estudiantes_carreras[0].historico_estado
        );
        setStudent(data);
      } catch (error) {
        console.error("Error al obtener detalles del estudiante:", error);
      } finally {
        setTimeout(() => setLoading(false), 1000);
      }
    };

    obtenerDetallesEstudiante();
  }, [id]);

  // === Carga de imagen del estudiante desde Firebase ===
  useEffect(() => {
    const obtenerImagenEstudiante = async () => {
      try {
        if (!student) return;

        // ahora student es un objeto, no array
        const numeroDocumento = safeText(student.numero_documento);
        if (!numeroDocumento || numeroDocumento === "No disponible") return;

        const extensions = ["png", "jpg", "jpeg"];
        let imageUrl = null;

        for (let ext of extensions) {
          try {
            const imageRef = ref(
              storage,
              `estudiantes/${numeroDocumento}.${ext}`
            );
            const url = await getDownloadURL(imageRef);
            imageUrl = url;
            break;
          } catch (error) {
            // prueba con la siguiente extensión
          }
        }

        setImageUri(imageUrl || null);
      } catch (error) {
        console.error("Error al obtener la imagen del estudiante:", error);
      }
    };

    if (student) {
      obtenerImagenEstudiante();
    }
  }, [student]);

  // === Seleccionar y subir imagen ===
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
        const manipulatedImage = await ImageManipulator.manipulateAsync(
          uri,
          [{ resize: { width: 800 } }],
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );
        await uploadImage(manipulatedImage.uri);
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo seleccionar la imagen.");
    }
  };

  const uploadImage = async (uri) => {
    try {
      if (!student) return;

      const numeroDocumento = safeText(student.numero_documento);
      if (!numeroDocumento || numeroDocumento === "No disponible") return;

      const response = await fetch(uri);
      const blob = await response.blob();

      const allowedExtensions = ["png", "jpg", "jpeg"];
      for (let ext of allowedExtensions) {
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
          console.error(`Error al subir la imagen ${ext}:`, error);
        }
      }
    } catch (error) {
      console.error("Error al subir la imagen:", error);
    }
  };

  // === Renderización ===
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#34531F" />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  if (!student) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Estudiante no encontrado</Text>
      </View>
    );
  }

  // student es un objeto con:
  // { id_estudiante, nombre_completo, numero_documento, fecha_nacimiento, ... , estudiantes_carreras: [] }
  const carrerasOrdenadas = ordenarCarrerasPorFecha(
    student.estudiantes_carreras || []
  );

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
            {/* Foto */}
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

            {/* Detalles personales */}
            <Text style={styles.title2}>Detalles Personales</Text>
            <View style={styles.textInfo}>
              <View style={styles.infoItem1}>
                <FontAwesome name="user" size={35} color="#34531F" />
                <View>
                  <Text style={styles.label}>Nombre:</Text>
                  <Text style={styles.text}>
                    {capitalizeFirstLetter(safeText(student.nombre_completo))}
                  </Text>
                </View>
              </View>

              <View style={styles.infoItem1}>
                <FontAwesome name="id-card" size={23} color="#34531F" />
                <View>
                  <Text style={styles.label}>Documento:</Text>
                  <Text style={styles.text}>
                    {safeText(String(student.tipo_documento_id || ""))}{" "}
                    {safeText(student.numero_documento)}
                  </Text>
                </View>
              </View>

              <View style={styles.infoItem1}>
                <FontAwesome name="birthday-cake" size={25} color="#34531F" />
                <View>
                  <Text style={styles.label}>Fecha de Nacimiento:</Text>
                  <Text style={styles.text}>
                    {safeDate(student.fecha_nacimiento)}
                  </Text>
                </View>
              </View>

              <View style={styles.infoItem1}>
                <FontAwesome name="child" size={35} color="#34531F" />
                <View>
                  <Text style={styles.label}>Edad:</Text>
                  <Text style={styles.text}>
                    {student.fecha_nacimiento
                      ? calcularEdad(student.fecha_nacimiento)
                      : "No disponible"}
                  </Text>
                </View>
              </View>

              <View style={styles.infoItem1}>
                <FontAwesome name="envelope" size={25} color="#34531F" />
                <View>
                  <Text style={styles.label}>Correo:</Text>
                  <Text style={styles.text}>
                    {safeText(student.correo_electronico)}
                  </Text>
                </View>
              </View>

              <View style={styles.infoItem1}>
                <FontAwesome name="phone" size={30} color="#34531F" />
                <View>
                  <Text style={styles.label}>Celular:</Text>
                  <Text style={styles.text}>{safeText(student.celular)}</Text>
                </View>
              </View>
            </View>

            {/* Detalles académicos */}
            <Text style={styles.title3}>Detalles Académicos</Text>

            {carrerasOrdenadas.map((carrera, index) => (
              <View key={index} style={styles.infoCarrera}>
                <View style={styles.infoItem1}>
                  <FontAwesome
                    name="chevron-circle-right"
                    size={30}
                    color="#6D100A"
                  />
                  <View>
                    <Text style={styles.labell}>Carrera:</Text>
                    <Text style={styles.text}>
                      {capitalizeFirstLetter(
                        safeText(carrera?.carreras?.nombre)
                      )}
                    </Text>
                  </View>
                </View>

                <View style={styles.infoItem1}>
                  <FontAwesome name="calendar" size={30} color="#6D100A" />
                  <View>
                    <Text style={styles.labell}>Periodo de Inicio:</Text>
                    <Text style={styles.text}>
                      {safeText(String(carrera.periodos.codigo_periodo || ""))}
                    </Text>
                  </View>
                </View>

                <View style={styles.infoItem1}>
                  <FontAwesome name="map-signs" size={30} color="#6D100A" />
                  <View>
                    <Text style={styles.labell}>Sede:</Text>
                    <Text style={styles.text}>
                      {safeText(
                        carrera?.carreras?.sede_id
                          ? String(carrera.carreras.sede.nombre)
                          : ""
                      )}
                    </Text>
                  </View>
                </View>

                <View style={styles.infoItem1}>
                  <FontAwesome name="spinner" size={30} color="#6D100A" />
                  <View>
                    <Text style={styles.labell}>Estado Académico:</Text>
                    <Text style={styles.text}>
                      {safeText(
                        carrera.historico_estado[0]
                          .estados_academicos_historico_estado_estado_anterior_idToestados_academicos
                          .nombre_estado || ""
                      )}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
            {/* estudiantes_carreras[0].historico_estado[0]
            .estados_academicos_historico_estado_estado_anterior_idToestados_academicos
            .nombre_estado */}
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
  backgroundImage: {
    flex: 1,
    resizeMode: "cover",
  },
  scrollView: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
  },
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
  text: {
    fontSize: 18,
    fontFamily: "Montserrat-Medium",
    marginLeft: 10,
  },
  label: {
    fontFamily: "Montserrat-Bold",
    color: "#C3D730",
    fontSize: 20,
    marginLeft: 10,
  },
  labell: {
    fontFamily: "Montserrat-Bold",
    color: "#132F20",
    fontSize: 20,
    marginLeft: 10,
  },
  textInfo: {
    alignSelf: "flex-start",
    padding: 20,
  },
  imageContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginLeft: "70%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 30,
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
    elevation: 10,
  },
  editIcon: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 5,
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
    elevation: 10,
  },
  uploadText: {
    fontFamily: "Montserrat-Medium",
    color: "#34531F",
    fontSize: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: "Montserrat-Medium",
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
  buttonText: {
    fontSize: 16,
    fontFamily: "Montserrat-Bold",
    color: "#fff",
  },
  infoItem1: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    alignSelf: "flex-start",
  },
  infoCarrera: {
    alignSelf: "flex-start",
    padding: 20,
    borderBottomWidth: 1,
  },
});

export default StudentDetail;
/* {"celular": "3208815748", 
  "codigo_estudiante": 1, 
  "correo_electronico": "deiver1607.com@hotmail.com",
   "edad": null, 
   "estudiantes_carreras":
    [
      {"carrera_id": 1, 
      "carreras": [Object], 
      "codigo_estudiante": 1, 
      "fecha_ingreso": "2017-07-04T00:00:00.000Z", 
      "historico_estado": [Array], 
      "historico_matriculas": [Array], 
      "id_estudiante_carrera": 1,
       "id_matricula": 99400, 
       "periodo_ingreso_id": 1, 
       "periodos": [Object]
      }
    ], 
      "fecha_nacimiento": null, 
      "id_estudiante": 1, 
      "nombre_completo": "DEYVER JULIAN SEQUEDA DELGADO",
      "numero_documento": "1095834336", 
      "sexo_id": 1, 
      "tipo_documento_id": 1
    } */

/* YA capturé el objeto de la tabla periodo con data.estudiantes_carrera[0].periodos --> falta agregar .codigo_periodo */
