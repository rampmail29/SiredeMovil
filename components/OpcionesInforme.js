import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { showMessage } from "react-native-flash-message";
import { useNavigation } from "@react-navigation/native";
import { ScrollView } from "react-native";

const OpcionesInforme = ({
  academicData,
  selectedCorteInicial,
  selectedCorteFinal,
}) => {
  /* console.log(
    "RETENIDOS RAW DETALLADO:\n",
    JSON.stringify(
      academicData?.retenidos?.map((est) => ({
        estudiante:
          est.documento || est.id_estudiante || est.codigo || "sin-id",
        historico: est.historico_estado?.map((h) => ({
          nuevo:
            h
              ?.estados_academicos_historico_estado_estado_nuevo_idToestados_academicos
              ?.nombre_estado,
          viejo:
            h
              ?.estados_academicos_historico_estado_estado_anterior_idToestados_academicos
              ?.nombre_estado,
        })),
      })),
      null,
      2
    )
  ); */

  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);

  /** ============================================
   *           Navegación genérica
   * ============================================ */
  const navigationInforme = (tipoInforme, datos) => {
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);

      navigation.navigate("GraficarPdf", {
        tipoInforme,
        datos,
        programa: academicData?.carrera ?? "N/D",
        corteInicial: selectedCorteInicial ?? "N/D",
        corteFinal: selectedCorteFinal ?? "N/D",
      });
    }, 800);
  };

  /** ============================================
   *          Mensaje genérico de error
   * ============================================ */
  const mostrarError = (nombre) => {
    showMessage({
      message: "Error",
      description: `No se puede generar el informe de ${nombre} porque no hay datos suficientes. Seleccione programa y cortes y presione Evaluar.`,
      duration: 5000,
      titleStyle: { fontSize: 19, fontFamily: "Montserrat-Bold" },
      textStyle: {
        fontSize: 18,
        fontFamily: "Montserrat-Regular",
        textAlign: "justify",
      },
      type: "danger",
      icon: "danger",
    });
  };

  /** ============================================
   *       Función genérica para informes
   * ============================================ */
  const generarInforme = (tipo, arreglo, nombreError) => {
    // Validar que existan cortes
    if (!selectedCorteInicial || !selectedCorteFinal) {
      return mostrarError("cortes académicos");
    }

    // Validar que existan datos
    if (!academicData || !arreglo || arreglo.length === 0) {
      return mostrarError(nombreError);
    }

    navigationInforme(tipo, { [tipo]: arreglo });
  };

  /** ============================================
   *        Helper para obtener estado final
   * ============================================ */
  const tieneEstado = (historico, estadoBuscado) => {
    return historico?.some((h) => {
      const estado =
        h.estados_academicos_historico_estado_estado_nuevo_idToestados_academicos;
      return estado?.nombre_estado === estadoBuscado;
    });
  };

  /** ============================================
   *               Filtrados
   * ============================================ */

  const obtenerGraduadosFiltrados = () =>
    academicData?.todosEstudiantes?.filter((est) =>
      tieneEstado(est.historico_estado, "Graduado")
    ) ?? [];

  const obtenerRetenidosFiltrados = () =>
    academicData?.todosEstudiantes?.filter((est) =>
      tieneEstado(est.historico_estado, "Retenido")
    ) ?? [];

  const obtenerDesertadosFiltrados = () =>
    academicData?.todosEstudiantes?.filter((est) =>
      tieneEstado(est.historico_estado, "Desertor")
    ) ?? [];

  const obtenerInactivosFiltrados = () =>
    academicData?.inactivos?.filter((est) =>
      tieneEstado(est.historico_estado, "Inactivo")
    ) ?? [];

  /** ============================================
   *        Handlers para cada informe
   * ============================================ */

  const generarInformeGraduados = () =>
    generarInforme("graduados", obtenerGraduadosFiltrados(), "graduados");

  const generarInformeRetenidos = () =>
    generarInforme("retenidos", obtenerRetenidosFiltrados(), "retenidos");

  const generarInformeDesertados = () =>
    generarInforme("desertados", obtenerDesertadosFiltrados(), "desertados");

  const generarInformeTodos = () =>
    generarInforme("general", academicData?.todosEstudiantes, "estudiantes");

  const generarInformeInactivos = () =>
    generarInforme("inactivos", obtenerInactivosFiltrados(), "inactivos");

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#34531F" />
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      ) : (
        <>
          <View style={styles.row}>
            <TouchableOpacity
              style={styles.button}
              onPress={generarInformeTodos}
            >
              <FontAwesome5
                name="users"
                size={45}
                color="white"
                style={styles.icon}
              />
              <Text style={styles.buttonText}>Todos los Estudiantes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={generarInformeGraduados}
            >
              <FontAwesome5
                name="user-graduate"
                size={45}
                color="white"
                style={styles.icon}
              />
              <Text style={styles.buttonText}>Graduados</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <TouchableOpacity
              style={styles.button}
              onPress={generarInformeRetenidos}
            >
              <FontAwesome5
                name="user-clock"
                size={45}
                color="white"
                style={styles.icon}
              />
              <Text style={styles.buttonText}>Retenidos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={generarInformeDesertados}
            >
              <FontAwesome5
                name="user-times"
                size={45}
                color="white"
                style={styles.icon}
              />
              <Text style={styles.buttonText}>Desertados</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <TouchableOpacity
              style={styles.button}
              onPress={generarInformeInactivos}
            >
              <FontAwesome5
                name="user-slash"
                size={45}
                color="white"
                style={styles.icon}
              />
              <Text style={styles.buttonText}>Inactivos</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 30,
    flex: 1,
  },
  container: {
    paddingVertical: 20, // para que el scroll no quede "pegado"
    paddingHorizontal: 10,
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 5,
    width: "100%",
  },
  button: {
    width: 170,
    height: 160,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#575756",
    borderRadius: 8,
    marginHorizontal: 10,
    flexDirection: "column",
    paddingVertical: 10,
    borderColor: "#878787",
    borderWidth: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 10,
  },
  icon: {
    marginBottom: 10,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: "Montserrat-Bold",
    color: "white",
    textAlign: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: "Montserrat-Medium",
  },
});

export default OpcionesInforme;
