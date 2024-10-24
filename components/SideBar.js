import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, ImageBackground, TouchableOpacity, AppState } from "react-native";
import { DrawerItemList, DrawerItem } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import { FontAwesome } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';
import { ref, getDownloadURL } from 'firebase/storage';
import { getFirestore, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { useDrawerStatus } from '@react-navigation/drawer';
import { storage } from '../firebaseConfig'; // Ajusta la ruta según tu estructura de archivos

const SideBar = (props) => {
  const [imageUri, setImageUri] = useState(null);
  const [nombre, setNombre] = useState('');
  const [profesion, setProfesion] = useState('');
  const [rol, setRol] = useState('');
  const [superRol, setSuperRol] = useState('');
  const [uid, setUid] = useState('');
  const isDrawerOpen = useDrawerStatus() === 'open';

  const obtenerImagenEstudiante = useCallback(async () => {
    if (!uid) return;

    try {
      const extensions = ['png', 'jpg', 'jpeg'];
      let imageUrl = null;

      for (let ext of extensions) {
        const imageRef = ref(storage, `users/${uid}.${ext}`);
        try {
          const url = await getDownloadURL(imageRef);
          imageUrl = url;
          break;
        } catch (error) {}
      }

      if (imageUrl) {
        setImageUri(imageUrl);
      } else {
        console.log('No se encontró imagen para el UID especificado.');
      }
    } catch (error) {
      console.error('Error al obtener la imagen del estudiante:', error);
    }
  }, [uid]);

  const loadUserData = useCallback(async () => {
    const auth = getAuth();
    const db = getFirestore();

    try {
      const user = auth.currentUser;
      if (user) {
        setUid(user.uid);
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setNombre(userData.nombre || '');
          setProfesion(userData.profesion || '');
          setRol(userData.rol || '');
          setSuperRol(userData.superRol || ''); 
        } else {
          console.log('El documento del usuario no existe.');
        }
      } else {
        console.log("No hay un Usuario registrado.");
      }
    } catch (error) {
      console.log('Error al cargar los datos del usuario:', error);
    }
  }, []);

  useEffect(() => {
    // Cargar los datos del usuario y su imagen inicialmente
    loadUserData();
    obtenerImagenEstudiante();
  
    const auth = getAuth();
    const db = getFirestore();
    const user = auth.currentUser;
    let unsubscribe;
  
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      
      // Suscribirnos al listener de Firestore tan pronto se monte el componente
      unsubscribe = onSnapshot(userRef, (userDoc) => {
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setNombre(userData.nombre || '');
          setProfesion(userData.profesion || '');
          setRol(userData.rol || '');
          setSuperRol(userData.superRol || '');
          
          // También actualizar la imagen en tiempo real
          obtenerImagenEstudiante();
        }
      });
    }
  
    // Cleanup para desuscribirse del listener cuando el componente se desmonte
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [loadUserData, obtenerImagenEstudiante]);

  useEffect(() => {
    if (isDrawerOpen) {
      obtenerImagenEstudiante();
    }
  }, [isDrawerOpen, obtenerImagenEstudiante]);


  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={require("../assets/fondoinicio.jpg")}
        style={{ ...styles.backgroundImage, paddingTop: 48 }}
      >
       {imageUri ? (
                      <View style={styles.imageContainer}>
                         <ImageBackground source={{ uri: imageUri }} style={styles.image}>               
                      </ImageBackground>
                      
                      </View>
                    ) : (
                      <View style={styles.imageContainer}>
                        <View style={styles.imagePlaceholder}> 
                          <FontAwesome name="user" size={60} color="#575756" />
                        </View>
                      </View>
                    )}

        <Text style={styles.name}>{nombre || 'Cargando...'}</Text>
        <Text style={styles.rol}>{rol || 'Cargando...'}</Text>
        <View style={{ flexDirection: "row" }}>
          <Text style={styles.profesion}>{profesion || 'Cargando...'}</Text>
          <Ionicons
            name="analytics"
            size={17}
            color="#132F20"
          />
        </View>
      </ImageBackground>

      <ScrollView>
        <View
          style={styles.container}
          forceInset={{ top: "always", horizontal: "never" }}
        >
        {superRol === 'admin' ? (
            <DrawerItemList {...props} />
          ) : (
            <>
          {props.state.routes.map((route) => {
            if (route.name !== 'Cargar CSV') { // Excluye 'Cargar CSV'
              return (
                <DrawerItem
                  key={route.name}
                  label={route.name}
                  onPress={() => props.navigation.navigate(route.name)}
                  style={{
                    ...props.drawerItemStyle, // Aplica los estilos de props
                    backgroundColor: route.name === props.state.routeNames[props.state.index] ? '#C3D730' : '#F0FFF2', // Color de fondo según el estado activo/inactivo
                    shadowColor: "#000", // Color de la sombra
                    shadowOffset: {
                      width: 0,
                      height: 2,
                    },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    
                  }}
                  labelStyle={{
                    fontSize: 16,
                    fontFamily: 'Montserrat-Medium',
                    color: route.name === props.state.routeNames[props.state.index] ? '#34531F' : '#B3B3B3', // Color del texto según el estado activo/inactivo
                  }}
                  icon={({ focused, color, size }) => {
                    let iconName;
                    if (route.name === 'Perfil') {
                      iconName = focused ? 'person' : 'person-outline';
                    } else if (route.name === 'SireBot') {
                      iconName = focused ? 'chatbox-ellipses' : 'chatbox-ellipses-outline';
                    } else if (route.name === 'Reporte') {
                      iconName = focused ? 'clipboard' : 'clipboard-outline';
                    } else if (route.name === 'Acerca de') {
                      iconName = focused ? 'information-circle' : 'information-circle-outline';
                    } else if (route.name === 'Cargar CSV') {
                      iconName = focused ? 'cloud-upload' : 'cloud-upload-outline';
                    }
                    return <Ionicons name={iconName} size={size} color={color} />;
                  }}
                />
              );
            }
            return null; // Si es 'Cargar CSV', no lo renderizamos
          })}
        </>
          )}
        </View>
      </ScrollView>
      <TouchableOpacity
        onPress={() => props.navigation.navigate('CerrarSesion')}
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 30, // Esto es para Android, donde la propiedad de sombra es diferente
  },
  name: {
    color: "#C3D730",
    fontSize: 20,
    fontFamily:'Montserrat-Bold'
  },
  rol: {
    color: "#132F20",
    fontSize: 13,
    fontFamily:'Montserrat-Medium'
  },
  profesion: {
    color: "#132F20",
    fontSize: 13,
    fontFamily:'Montserrat',
    marginRight:5
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
    fontFamily:'Montserrat-Bold',
    color:'#34531F',
  },
  iconStyles: {
    marginLeft: 10,
    color:'#C3D730',
  },
  imageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 30, // Esto es para Android, donde la propiedad de sombra es diferente
    marginBottom:10
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 100,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white', // Fondo blanco mientras se carga la imagen
    borderWidth: 5, // Agrega un borde
    borderColor: '#F0FFF2', // Color del borde
    elevation: 10, // Esto es para Android, donde la propiedad de sombra es diferente
  },
  imagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderWidth: 5,
    borderColor: '#F0FFF2',
    elevation: 10
  },
  
});

export default SideBar;
