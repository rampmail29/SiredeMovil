import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, ScrollView, TouchableOpacity } from 'react-native';
import { VictoryBar, VictoryChart, VictoryAxis, VictoryTheme, VictoryLabel } from 'victory-native';
import { useNavigation } from '@react-navigation/native';


const GraficarMatriculas = ({ route }) => {
    const { fromScreen, selectedCorteInicial, selectedCorteFinal, programaSeleccionado, datosBackend } = route.params;
    const navigation = useNavigation();

    // Función para transformar los datos del backend en un formato adecuado para los gráficos
    const transformarDatos = (datosBackend) => {
        const dataDesercion = [];

        Object.keys(datosBackend).forEach(periodo => {
            const { Desertores } = datosBackend[periodo];
            dataDesercion.push({ periodo, desertores: Desertores });
        });

        return dataDesercion;
    };

    const dataDesercion = transformarDatos(datosBackend);

    const capitalizeFirstLetter = (string) => {
        return string
          .toLowerCase()
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
    };



        // Encuentra el máximo y el mínimo de desertores
        const maxDesertores = Math.max(...dataDesercion.map(d => d.desertores));
        const minDesertores = Math.min(...dataDesercion.map(d => d.desertores));

        // Encuentra los periodos correspondientes a los máximos y mínimos de desertores
        const periodoMaxDesertores = dataDesercion.find(d => d.desertores === maxDesertores).periodo;
        const periodoMinDesertores = dataDesercion.find(d => d.desertores === minDesertores).periodo;

    const analizarTendencias = (data) => {
        let tendencia = '';
        let incremento = 0;
    
        for (let i = 1; i < data.length; i++) {
            if (data[i].desertores > data[i - 1].desertores) {
                incremento++;
            } else if (data[i].desertores < data[i - 1].desertores) {
                incremento--;
            }
        }
    
        const rangoDesertores = maxDesertores - minDesertores;

        // Definir un umbral para considerar que los números son "similares"
        const umbralSimilitud = 1; // Este valor puedes ajustarlo según sea necesario
                
            // Suponiendo que `programaSeleccionado` contiene el nombre de la carrera
            const nombreCarrera = capitalizeFirstLetter(programaSeleccionado); // Capitalizar la primera letra de la carrera

           
                if (rangoDesertores <= umbralSimilitud) {
                    tendencia = `en la carrera de ${nombreCarrera}, la deserción ha permanecido bastante constante a lo largo del tiempo, con un mínimo de ${minDesertores} desertores en el periodo ${periodoMinDesertores} y un máximo de ${maxDesertores} desertores en el periodo ${periodoMaxDesertores}.`;
                } else if (incremento === data.length - 1) {
                    tendencia = `en la carrera de ${nombreCarrera}, la deserción ha ido en aumento constante, alcanzando un máximo de ${maxDesertores} desertores en el periodo ${periodoMaxDesertores}.`;
                } else if (incremento === -(data.length - 1)) {
                    tendencia = `en la carrera de ${nombreCarrera}, la deserción ha ido en disminución constante, con un mínimo de ${minDesertores} desertores en el periodo ${periodoMinDesertores}.`;
                } else if (incremento > 0) {
                    tendencia = `en la carrera de ${nombreCarrera}, la deserción ha tenido un aumento general, con un máximo de ${maxDesertores} desertores en el periodo ${periodoMaxDesertores} y en este caso un minimo de ${minDesertores} desortes en el periodo ${periodoMinDesertores}, aunque con algunas fluctuaciones adicionales.`;
                } else if (incremento < 0) {
                    tendencia = `en la carrera de ${nombreCarrera}, la deserción ha mostrado una tendencia a la baja, alcanzando un mínimo de ${minDesertores} desertores en el periodo ${periodoMinDesertores}, con algunas subidas en ciertos periodos.`;
                } else {
                    tendencia = `en la carrera de ${nombreCarrera}, los datos muestran una gran variabilidad, con picos y caídas en diferentes periodos, alcanzando un máximo de ${maxDesertores} desertores en el periodo ${periodoMaxDesertores} y un mínimo de ${minDesertores} desertores en el periodo ${periodoMinDesertores}.`;
                }
                    return tendencia;
                };
    
    const mensajeTendencia = analizarTendencias(dataDesercion);

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

                        <Text style={styles.chartTitle}>Frecuencia de Deserción</Text>

                        <VictoryChart
                                theme={VictoryTheme.material}
                                domainPadding={{ x: dataDesercion.length > 3 ? 50 : 100}} // Ajusta el espaciado en el eje X, más estrecho si hay pocos datos
                            >
                                <VictoryAxis
                                    tickFormat={dataDesercion.map(d => d.periodo)} // Muestra los periodos en el eje X
                                    style={{
                                        tickLabels: { 
                                            fontSize: dataDesercion.length > 5 ? 9: (dataDesercion.length > 4 ? 10 : 15), // Ajusta el tamaño del texto
                                            fill: '#132F20', 
                                            fontFamily: 'Montserrat-Bold' 
                                        },
                                    }}
                                />
                                <VictoryAxis
                                    dependentAxis
                                    tickFormat={(x) => (`${x}`)} // Valores en el eje Y
                                    style={{
                                        tickLabels: { fontSize: 14, fill: '#132F20', fontFamily: 'Montserrat-Medium' },
                                        
                                    }}
                                />
                                <VictoryBar
                                    data={dataDesercion}
                                    x="periodo"
                                    y="desertores"
                                    cornerRadius={{ topLeft: 15 }}
                                    style={{
                                        data: {
                                            fill: ({ datum }) => {
                                                if (datum.desertores === maxDesertores) {
                                                    return '#FF5733'; // Color para el mayor número de desertores
                                                } else if (datum.desertores === minDesertores) {
                                                    return '#da6f26'; // Color para el menor número de desertores
                                                } else {
                                                    return '#6D100A'; // Color estándar
                                                }
                                            },
                                            width: dataDesercion.length > 4 ? 39 : 60,  // Ajusta el ancho de las barras
                                        },
                                    }}
                                    labels={({ datum }) => `${datum.desertores}`} // Etiqueta que muestra el valor de desertores
                                    labelComponent={
                                        <VictoryLabel 
                                            dy={30} // Ajusta la posición vertical de la etiqueta
                                            style={{ fill: '#F8E9D4', fontSize: 15, fontFamily: 'Montserrat-Bold' }} // Estilo de la etiqueta
                                        />
                                    }
                                    animate={{ duration: 500 }}
                                />
                            </VictoryChart>

                            <Text style={styles.statisticalText}>
                                Observamos que {mensajeTendencia}
                            </Text>


                    </View>
                    
                    <TouchableOpacity 
                            style={styles.button} 
                            onPress={() => {
                              navigation.navigate(fromScreen);                         
                            }}
                          >
                          <Text style={styles.buttonText}>Volver</Text>
                        </TouchableOpacity>
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
        fontSize: 20,
        fontFamily: 'Montserrat-Bold',
        color: '#132F20',
        marginTop: 20,
        marginBottom: -25,
    },
    chartContainer: { // Nuevo estilo para el contenedor del gráfico
        alignItems: 'center',
        justifyContent: 'center',
    },
    button: {
        backgroundColor: '#6D100A',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 80,
        width:120,
        justifyContent:'center',
        marginTop:20,
      },
      buttonText: {
        fontSize: 16,
        fontFamily: 'Montserrat-Bold',
        color: '#fff',
      },
      statisticalText: {
        fontSize: 20,
        fontFamily: 'Montserrat-Medium',
        color: '#132F20',
        textAlign: 'justify',
        marginBottom: 20,
    },
});

export default GraficarMatriculas;
