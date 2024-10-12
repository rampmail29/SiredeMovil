import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, ScrollView } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { useNavigation } from '@react-navigation/native';

const GraficarMatriculas = ({ route }) => {
    const { selectedCorteInicial, selectedCorteFinal, programaSeleccionado, datosBackend } = route.params;
    const navigation = useNavigation();

    // Función para transformar los datos del backend en un formato adecuado para los gráficos
    const transformarDatos = (datosBackend) => {
        const dataDesercion = [];

        Object.keys(datosBackend).forEach(periodo => {
            const { Desertores } = datosBackend[periodo];
            dataDesercion.push({ label: periodo, value: Desertores });
        });

        return { dataDesercion };
    };

    const { dataDesercion } = transformarDatos(datosBackend);

    const capitalizeFirstLetter = (string) => {
        return string
          .toLowerCase()
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
            <ImageBackground source={require('../assets/fondoinicio.jpg')} style={styles.backgroundImage}>
                <View style={styles.container}>
                    <Text style={styles.title}>Resultados del análisis</Text>

                    <Text style={styles.subtitle}>
                        Este
                        <Text style={{ fontFamily: 'Montserrat-Bold' }}> análisis estadístico </Text> 
                        se enfoca en la comparación de las frecuencias del estado académico del estudiante en la carrera de 
                        <Text style={{ fontFamily: 'Montserrat-Bold' }}> {capitalizeFirstLetter(programaSeleccionado)}</Text>.
                        Los datos aquí presentados permiten visualizar el progreso y las transiciones de los estudiantes a lo largo del tiempo, desde el 
                        <Text style={{ fontFamily: 'Montserrat-Bold' }}> {selectedCorteInicial} </Text> hasta el 
                        <Text style={{ fontFamily: 'Montserrat-Bold' }}> {selectedCorteFinal} </Text>.
                    </Text>     

                    <View style={styles.chartContainer}> 
                        <Text style={styles.chartTitle}>Tasa de Deserción</Text>
                        <BarChart
                            horizontal
                            data={dataDesercion}
                            barWidth={30}
                            height={350}
                            spacing={20}
                            initialSpacing={10}
                            barBorderRadius={10}
                            yAxisThickness={0}
                            xAxisThickness={-10}
                            isAnimated
                            frontColor="#ff6361"  // Color de las barras
                            backgroundColor="#fff"
                            width={300}
                          
                           
                            // Para las etiquetas del eje X:
                            xAxisLabelTextStyle={{
                                color: '#132F20',
                                fontSize: 15,
                                fontFamily: 'Montserrat-Bold',
                               // marginRight:15
                            }}
                            // Para las etiquetas del eje Y:
                            yAxisLabelTextStyle={{
                                color: '#132F20',
                                fontSize: 16,
                                fontFamily: 'Montserrat-Medium',
                            }}
                        />
                    </View>
                </View>
            </ImageBackground>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollViewContent: {
        flexGrow: 1,
      
    },
    backgroundImage: {
        flex: 1,
        resizeMode: 'cover',
    },
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: 30,
        width: '100%',
    },
    title: {
        fontSize: 40,
        fontFamily: 'Montserrat-Bold',
        alignSelf: 'flex-start',
        marginBottom: 20,
        color: '#C3D730',
        
    },
    subtitle: {
        fontSize: 20,
        fontFamily: 'Montserrat-Medium',
        textAlign: 'justify',
        color: '#132F20',
        marginBottom: 10,
    },
    chartTitle: {
        fontSize: 24,
        fontFamily: 'Montserrat-Bold',
        color: '#132F20',
        marginTop: 20,
        marginBottom: 20,
    },
    chartContainer: { // Nuevo estilo para el contenedor del gráfico
        alignContent:'center',
        alignItems:'center',
        justifyContent:'center',
        marginBottom: 500, // Agregar margen inferior aquí
    },
});

export default GraficarMatriculas;
