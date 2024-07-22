import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
  Image,
  TouchableOpacity,
} from "react-native";
import { DrawerItemList } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import { getAuth, signOut } from "firebase/auth";

const CerrarSesion = ({ navigation }) => {
  const auth = getAuth(); // Obtiene la instancia de autenticación de Firebase

  signOut(auth)
    .then(() => {
      console.log("Sesión cerrada correctamente");
      navigation.replace("InicioSesion");
    })
    .catch((error) => {
      console.error("Error al cerrar sesión:", error);
    });

  return (
    <View>
      <Text>Cerrando sesión...</Text>
    </View>
  );
};

const SideBar = (props) => {
  return (
    <View style={{ flex: 1 }}>
       <ImageBackground
          source={require("../assets/background.jpg")}
          style={{ ...styles.backgroundImage, paddingTop: 48 }}
        >
          <Image
            source={require("../assets/prueba.jpg")}
            style={styles.profile}
          />
          <Text style={styles.name}>Jennifer Smith Prada Vargas</Text>
          <View style={{ flexDirection: "row" }}>
            <Text style={styles.followers}>
              Ingeniera de Sistemas
            </Text>
            <Ionicons
              name="analytics"
              size={17}
              color="rgba(255, 255, 255, 0.8)"
            />
          </View>
        </ImageBackground>

      <ScrollView>
       
        <View
          style={styles.container}
          forceInset={{ top: "always", horizontal: "never" }}
        >
          <DrawerItemList {...props} />
        </View>
      </ScrollView>
      <TouchableOpacity
        onPress={() => CerrarSesion({ navigation: props.navigation })}
        style={styles.bottomDrawerSection}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            alignSelf: "flex-end",
          }}
        >
          <Ionicons name="log-out-outline" size={25} color="black" style={styles.iconStyles}/>
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  
  },
  backgroundImage: {
    width: undefined,
    padding: 16,
  },
  profile: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#FFF",
  },
  name: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "800",
    marginVertical: 8,
    textShadowColor: "rgba(0, 0, 0, 0.25)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  followers: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 13,
    marginRight: 4,
    textShadowColor: "rgba(0, 0, 0, 0.25)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  bottomDrawerSection: {
    borderTopColor: '#34531F',
    borderTopWidth: 0.5,
    flexDirection: "row",
    padding: 16,
  },
  logoutText: {
    marginLeft: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color:'#34531F',
  },
  iconStyles: {
    marginLeft: 10,
    color:'#C3D730',
  }
});

export default SideBar;
