import React, { useState, useEffect } from 'react';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Animated, {Easing, useSharedValue, useAnimatedStyle, withTiming,withSpring } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { showMessage } from "react-native-flash-message";
import { getAuth, updatePassword } from 'firebase/auth';
import { 
    ScrollView, 
    StyleSheet, 
    View, 
    Text, 
    TouchableOpacity, 
    TextInput, 
    KeyboardAvoidingView,
    Platform,
    useWindowDimensions,
    ImageBackground,
   } from 'react-native';
const auth = getAuth();

const PasswordChangeScreen = ({ navigation }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const { height: windowHeight } = useWindowDimensions();
  const isSmallScreen = windowHeight < 750; // Por ejemplo, iPhone 8 Plus tiene un ancho de 375px

          // Define un valor compartido 
          const translateY = useSharedValue(-200); // Posición inicial fuera de pantalla
          const opacity = useSharedValue(0);

          // Define el estilo animado usando el valor compartido
          const animatedStyle = useAnimatedStyle(() => {
            return {
              opacity: withTiming(opacity.value, {
                duration: 1500, // Duración de la animación en milisegundos
                easing: Easing.inOut(Easing.ease),
              }),
              transform: [
                {
                  translateY: withTiming(translateY.value, {
                    duration: 1000,
                    easing: Easing.inOut(Easing.ease),
                  }),
                },
              ],
            };
          });
          const animatedStyle2 = useAnimatedStyle(() => {
            return {
              opacity: withTiming(opacity.value, {
                duration: 2000, // Duración de la animación en milisegundos
                easing: Easing.inOut(Easing.ease),
              }),
            };
          });

          // Inicia la animación cuando el componente se monta
          useEffect(() => {
            opacity.value = 1;
            translateY.value = 0; // La posición final en la pantalla
          }, []);

    
  const passwordVisibility = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  const validatePassword = () => {
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    return {
      hasMinLength,
      hasUpperCase,
      hasNumber,
    };
  };

  const passwordUpdate = (newPassword) => {
    const user = auth.currentUser;
    if (user) {
      updatePassword(user, newPassword).then(() => {
        showMessage({
          message: "Exito",
          description: "Tu contraseña fue actualizada correctamente.",
          type: "success",
          titleStyle: { fontSize: 18, fontFamily: 'Montserrat-Bold' }, // Estilo del título
          textStyle: { fontSize: 18, fontFamily: 'Montserrat-Regular' }, // Estilo del texto
          icon: "success",
          duration: 2000,
          position: "top",
        });
       setTimeout(() => {
          navigation.replace('InitialSetupScreen');
        }, 2000); // Espera a que el mensaje de éxito desaparezca antes de navegar
      }).catch((error) => {
        console.log('Error al actualizar la contraseña:', error);
        let mensajeError;
      switch (error.code) {
        case 'auth/requires-recent-login':
          mensajeError = 'Has excedido el tiempo para cambiar tu contraseña, por favor vuelve a iniciar sesión e inténtalo nuevamente.';
          break;
        default:
          mensajeError = 'Lo sentimos, no se ha podido actualizar tu contraseña. Por favor, intenta nuevamente.';
      }
      showMessage({
        message: "Error",
        description: mensajeError,
        type: "danger",
        titleStyle: { fontSize: 18, fontFamily: 'Montserrat-Bold' }, // Estilo del título
        textStyle: { fontSize: 18, fontFamily: 'Montserrat-Regular' }, // Estilo del texto
        position: "top",
        icon: "danger",
        duration: 4000,
      });
      });
    } else {
      console.error('No hay usuario autenticado');
    }
  };
  const { hasMinLength, hasUpperCase, hasNumber } = validatePassword();
  const passwordsMatch = password === confirmPassword;
  
  return (
  
    <ImageBackground source={require('../assets/fondoinicio.jpg')} style={styles.backgroundImage}>
    <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    keyboardVerticalOffset={0} // Ajusta este valor si es necesario
  > 
    <ScrollView style={styles.container}>
    <Animated.View style={animatedStyle}>
        <View style={styles.icon}> 
          <MaterialCommunityIcons name="security" size={120} color="#132F20" />
        </View>
      <Text style={[styles.title, isSmallScreen && styles.titleSmall]}>Por tu seguridad es momento de cambiar la contraseña de tu cuenta.</Text>
      </Animated.View>
      <Animated.View style={animatedStyle2}>
      <Text style={styles.text}>Digite la nueva Contraseña: </Text>
      <View style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        placeholder="Nueva contraseña"
        secureTextEntry={secureTextEntry}
        value={password}
        onChangeText={setPassword}
        
      />
      <TouchableOpacity style={styles.iconContainer} onPress={passwordVisibility}>
            <Ionicons
              name={secureTextEntry ? 'eye-off' : 'eye'} // Cambia el nombre según los íconos que prefieras
              size={20}
              color="#132F20"
            />
          </TouchableOpacity>
          </View>
      {/* Mostrar validationContainer1 solo si se está escribiendo en el primer input */}
      {password.length > 0 && (
        <View style={styles.validationContainer1}>
          <ValidationItem
            isValid={hasMinLength}
            text="Como minimo 8 caracteres"
          />
          <ValidationItem
            isValid={hasUpperCase}
            text="Al menos una letra mayúscula"
          />
          <ValidationItem
            isValid={hasNumber}
            text="Debe incluir un número"
          />
        </View>
      )}
       <View style={styles.inputContainer}>
      <TextInput
          style={[
            styles.input,
            isFocused && password.length > 0 && !passwordsMatch && styles.inputFocusedFalse, // Si las contraseñas no coinciden
            isFocused && password.length > 0 && passwordsMatch && styles.inputFocusedTrue // Si las contraseñas coinciden
          ]}
          placeholder="Confirmar nueva contraseña"
          secureTextEntry={secureTextEntry}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        <TouchableOpacity style={styles.iconContainer} onPress={passwordVisibility}>
            <Ionicons
              name={secureTextEntry ? 'eye-off' : 'eye'} // Cambia el nombre según los íconos que prefieras
              size={20}
              color="#132F20"
            />
          </TouchableOpacity>
          </View>
      {/* Mostrar validationContainer2 solo si se está escribiendo en el segundo input */}
      {confirmPassword.length > 0 && (
        <View style={styles.validationContainer2}>
          <ValidationItem
            isValid={passwordsMatch}
            text={passwordsMatch ? "Las contraseñas coinciden" : "Las contraseñas no coinciden"}
          />
        </View>
      )}

      <TouchableOpacity 
        style={[styles.button, (hasMinLength && hasUpperCase && hasNumber && passwordsMatch) ? styles.buttonEnabled : styles.buttonDisabled]}
        disabled={!(hasMinLength && hasUpperCase && hasNumber && passwordsMatch)}
        onPress={() => passwordUpdate(password)}
      >
        <Text style={styles.buttonText}>Actualizar Contraseña</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.buttonOmitir}
        onPress={() => navigation.replace('InitialSetupScreen')} 
      >
        <Text style={styles.buttonTextOmitir}>Omitir</Text>
      </TouchableOpacity>
      </Animated.View>
    </ScrollView>
    </KeyboardAvoidingView>
    </ImageBackground>
   
  );
};

const ValidationItem = ({ isValid, text }) => (
  <View style={styles.validationItem}>
    <Feather
      name={isValid ? "check-circle" : "x-circle"}
      size={20}
      color={isValid ? "green" : "red"}
    />
    <Text style={[styles.validationText, isValid ? styles.valid : styles.invalid]}>
      {text}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    padding: 30,
  },
  title: {
    fontSize: 30,
    textAlign:'center',
    fontFamily: 'Montserrat-Bold',
    marginTop:10,
    color: '#C3D730',
  },
  titleSmall: { 
    fontSize: 35,
    marginTop:0,
  }, // Texto más pequeño en pantallas pequeñas
  input: {
    height: 50,
    width:'100%',
    borderColor: '#132F20',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 10,
    fontFamily:'Montserrat-Medium',
    fontSize:15,
    backgroundColor:'white'
  },
  validationContainer1: {
    // Añadir estilos adicionales si es necesario
  },
  validationContainer2: {
    // Añadir estilos adicionales si es necesario
  },
  validationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  validationText: {
    marginLeft: 8,
    fontSize: 16,
    fontFamily:'Montserrat'
  },
  valid: {
    color: 'green',
  },
  invalid: {
    color: 'red',
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonOmitir: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:'#132F20',
    marginTop:10
  
  },
  buttonEnabled: {
    backgroundColor: '#4CAF50',
  },
  buttonDisabled: {
    backgroundColor: '#B3B3B3',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily:'Montserrat-Bold',
  },
  buttonTextOmitir: {
    color: '#fff',
    fontSize: 18,
    fontFamily:'Montserrat-Bold',
  },
  icon:{
    alignItems:"center",
    marginTop:30
  },
  text:{
    marginTop:30,
    fontFamily:'Montserrat-Bold',
    fontSize:17,
    color:'#132F20',
    marginBottom:5,
  },
  inputFocusedFalse: {
    borderColor: 'red',
    shadowColor: 'red',
    shadowOpacity: 0.8,
    shadowOffset: { width: 0, height: 0},
    shadowRadius: 6,
    elevation: 5,
  },
  inputFocusedTrue: {
    borderColor: 'green',
    shadowColor: 'green',
    shadowOpacity: 0.8,
    shadowOffset: { width: 0, height: 0},
    shadowRadius: 6,
    elevation: 5,
  },
  iconContainer: {
   position: 'absolute',
   right: 20,
   top:15
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 5,
    
  },
});

export default PasswordChangeScreen;
