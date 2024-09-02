import React, { useState } from 'react';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { 
    ScrollView, 
    StyleSheet, 
    View, 
    Text, 
    TouchableOpacity, 
    TextInput, 
    KeyboardAvoidingView,
    Platform,
    useWindowDimensions
   } from 'react-native';
import { Feather } from '@expo/vector-icons';

const PasswordChangeScreen = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const isSmallScreen = windowHeight < 750; // Por ejemplo, iPhone 8 Plus tiene un ancho de 375px

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

  const { hasMinLength, hasUpperCase, hasNumber } = validatePassword();
  const passwordsMatch = password === confirmPassword;
  
  return (
    <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    keyboardVerticalOffset={0} // Ajusta este valor si es necesario
  > 
    <ScrollView style={styles.container}>
       
        <View style={styles.icon}> 
          <MaterialCommunityIcons name="security" size={120} color="#132F20" />
        </View>
      <Text style={[styles.title, isSmallScreen && styles.titleSmall]}>Por tu seguridad es momento de cambiar la contraseña de tu cuenta.</Text>

      <Text style={styles.text}>Digite la nueva Contraseña: </Text>
      <TextInput
        style={styles.input}
        placeholder="Nueva contraseña"
        secureTextEntry={true}
        value={password}
        onChangeText={setPassword}
      />
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

      <TextInput
          style={[
            styles.input,
            isFocused && password.length > 0 && !passwordsMatch && styles.inputFocusedFalse, // Si las contraseñas no coinciden
            isFocused && password.length > 0 && passwordsMatch && styles.inputFocusedTrue // Si las contraseñas coinciden
          ]}
          placeholder="Confirmar nueva contraseña"
          secureTextEntry={true}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      
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
        onPress={() => handlePasswordUpdate(password)}
      >
        <Text style={styles.buttonText}>Actualizar Contraseña</Text>
      </TouchableOpacity>
     
    </ScrollView>
    </KeyboardAvoidingView>
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
  buttonEnabled: {
    backgroundColor: '#4CAF50',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
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
});

export default PasswordChangeScreen;
