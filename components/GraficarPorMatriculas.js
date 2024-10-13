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
        const dataGraduados = [];
        const dataRetenidos = [];
        const dataInactivos = [];

        Object.keys(datosBackend).forEach(periodo => {
            const { Desertores, Graduados, Retenidos, Inactivos } = datosBackend[periodo];

            dataDesercion.push({ periodo, desertores: Desertores });
            dataGraduados.push({ periodo, graduados: Graduados });
            dataRetenidos.push({ periodo, retenidos: Retenidos });
            dataInactivos.push({ periodo, inactivos: Inactivos });
        });

        return { dataDesercion, dataGraduados, dataRetenidos, dataInactivos };
    };

    const { dataDesercion, dataGraduados, dataRetenidos, dataInactivos } = transformarDatos(datosBackend);

    const capitalizeFirstLetter = (string) => {
        return string
          .toLowerCase()
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
    };

    const analizarTendencias = (data, nombreEstado) => {
        let tendencia = '';
        let incremento = 0;

        for (let i = 1; i < data.length; i++) {
            if (data[i][nombreEstado] > data[i - 1][nombreEstado]) {
                incremento++;
            } else if (data[i][nombreEstado] < data[i - 1][nombreEstado]) {
                incremento--;
            }
        }

        const maxEstado = Math.max(...data.map(d => d[nombreEstado]));
        const minEstado = Math.min(...data.map(d => d[nombreEstado]));
        const periodoMax = data.find(d => d[nombreEstado] === maxEstado).periodo;
        const periodoMin = data.find(d => d[nombreEstado] === minEstado).periodo;

        const rango = maxEstado - minEstado;
        const umbralSimilitud = 1;
        const nombreCarrera = capitalizeFirstLetter(programaSeleccionado);

        if (rango <= umbralSimilitud) {
            tendencia = `los ${nombreEstado} han permanecido bastante constante, con un mínimo de ${minEstado} en el periodo ${periodoMin} y un máximo de ${maxEstado} ${nombreEstado} en el periodo ${periodoMax}.`;
        } else if (incremento === data.length - 1) {
            tendencia = `los ${nombreEstado} han ido en aumento constante, alcanzando un máximo de ${maxEstado} ${nombreEstado} en el periodo ${periodoMax}.`;
        } else if (incremento === -(data.length - 1)) {
            tendencia = `los ${nombreEstado} han ido en disminución constante, con un mínimo de ${minEstado} ${nombreEstado} en el periodo ${periodoMin}.`;
        } else if (incremento > 0) {
            tendencia = `los ${nombreEstado} han tenido un aumento general, con un máximo de ${maxEstado} ${nombreEstado} en el periodo ${periodoMax} y en este caso un minimo de ${minEstado} ${nombreEstado} en el periodo ${periodoMin}, aunque con algunas fluctuaciones adicionales.`;
        } else if (incremento < 0) {
            tendencia = `los ${nombreEstado} han mostrado una tendencia a la baja, alcanzando un mínimo de ${minEstado} en el periodo ${periodoMin}, con algunas subidas en ciertos periodos.`;
        } else {
            tendencia = `los datos muestran una gran variabilidad en los ${nombreEstado}, con picos y caídas en diferentes periodos, alcanzando un máximo de ${maxEstado} ${nombreEstado} en el periodo ${periodoMax} y un mínimo de ${minEstado} ${nombreEstado} en el periodo ${periodoMin}.`;
        }

        return tendencia;
    };

    const mensajeTendenciaDesercion = analizarTendencias(dataDesercion, 'desertores');
    const mensajeTendenciaGraduados = analizarTendencias(dataGraduados, 'graduados');
    const mensajeTendenciaRetenidos = analizarTendencias(dataRetenidos, 'retenidos');
    const mensajeTendenciaInactivos = analizarTendencias(dataInactivos, 'inactivos');

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

                    {/* Gráfico de Deserción */}
                    <View style={styles.chartContainer}>
                        <Text style={styles.chartTitleD}>Frecuencia de Deserción</Text>
                        <VictoryChart
                            theme={VictoryTheme.material}
                            domainPadding={{ x: dataDesercion.length > 3 ? 50 : 100 }} // Ajusta el espaciado en el eje X
                        >
                            <VictoryAxis
                                tickFormat={dataDesercion.map(d => d.periodo)} // Muestra los periodos en el eje X
                                style={{
                                    tickLabels: {
                                        fontSize: dataDesercion.length > 5 ? 9 : (dataDesercion.length > 4 ? 10 : 15), // Ajusta el tamaño del texto
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
                                            if (datum.desertores === Math.max(...dataDesercion.map(d => d.desertores))) {
                                                return '#ff0000'; // Color para el mayor número de desertores
                                            } else if (datum.desertores === Math.min(...dataDesercion.map(d => d.desertores))) {
                                                return '#6D100A'; // Color para el menor número de desertores
                                            } else {
                                                return '#a81b11'; // Color estándar
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
                            Observamos que {mensajeTendenciaDesercion}
                        </Text>
                    </View>

                    {/* Gráfico de Graduados */}
                    <View style={styles.chartContainer}>
                        <Text style={styles.chartTitleG}>Frecuencia de Graduados</Text>
                        <VictoryChart
                            theme={VictoryTheme.material}
                            domainPadding={{ x: dataGraduados.length > 3 ? 50 : 100 }} // Ajusta el espaciado en el eje X
                        >
                            <VictoryAxis
                                tickFormat={dataGraduados.map(g => g.periodo)} // Muestra los periodos en el eje X
                                style={{
                                    tickLabels: {
                                        fontSize: dataGraduados.length > 5 ? 9 : (dataGraduados.length > 4 ? 10 : 15), // Ajusta el tamaño del texto
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
                                data={dataGraduados}
                                x="periodo"
                                y="graduados"
                                cornerRadius={{ topRight: 20 }}
                                style={{
                                    data: {
                                        fill: ({ datum }) => {
                                            if (datum.graduados === Math.max(...dataGraduados.map(g => g.graduados))) {
                                                return '#C3D730'; // Color para el mayor número de desertores
                                            } else if (datum.graduados === Math.min(...dataGraduados.map(d => d.graduados))) {
                                                return '#132F20'; // Color para el menor número de desertores
                                            } else {
                                                return '#34531F'; // Color estándar
                                            }
                                        },
                                        width: dataGraduados.length > 4 ? 39 : 60,  // Ajusta el ancho de las barras
                                    },
                                }}
                                labels={({ datum }) => `${datum.graduados}`} // Etiqueta que muestra el valor de desertores
                                labelComponent={
                                    <VictoryLabel
                                        dy={30} // Ajusta la posición vertical de la etiqueta
                                        style={{ fill: '#F8E9D4', fontSize: 15, fontFamily: 'Montserrat-Bold' }} // Estilo de la etiqueta
                                    />
                                }
                                animate={{ duration: 500 }}
                            />
                        </VictoryChart>
                        <Text style={styles.statisticalText}>En este rango de periodos {mensajeTendenciaGraduados}</Text>
                    </View>

                    {/* Gráfico de Retenidos */}
                    <View style={styles.chartContainer}>
                        <Text style={styles.chartTitleR}>Frecuencia de Retenidos</Text>
                        <VictoryChart
                            theme={VictoryTheme.material}
                            domainPadding={{ x: dataRetenidos.length > 3 ? 50 : 100 }} // Ajusta el espaciado en el eje X
                        >
                            <VictoryAxis
                                tickFormat={dataRetenidos.map(r => r.periodo)} // Muestra los periodos en el eje X
                                style={{
                                    tickLabels: {
                                        fontSize: dataRetenidos.length > 5 ? 9 : (dataRetenidos.length > 4 ? 10 : 15), // Ajusta el tamaño del texto
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
                                data={dataRetenidos}
                                x="periodo"
                                y="retenidos"
                                cornerRadius={{ topLeft: 20 }}
                                style={{
                                    data: {
                                        fill: ({ datum }) => {
                                            if (datum.retenidos === Math.max(...dataRetenidos.map(r => r.retenidos))) {
                                                return '#FF5733'; // Color para el mayor número de retenidos
                                            } else if (datum.retenidos === Math.min(...dataRetenidos.map(r => r.retenidos))) {
                                                return '#7d4301'; // Color para el menor número de retenidos
                                            } else {
                                                return '#da6f26'; // Color estándar
                                            }
                                        },
                                        width: dataDesercion.length > 4 ? 39 : 60,  // Ajusta el ancho de las barras
                                    },
                                }}
                                labels={({ datum }) => `${datum.retenidos}`} // Etiqueta que muestra el valor de retenidos
                                labelComponent={
                                    <VictoryLabel
                                        dy={30} // Ajusta la posición vertical de la etiqueta
                                        style={{ fill: '#F8E9D4', fontSize: 15, fontFamily: 'Montserrat-Bold' }} // Estilo de la etiqueta
                                    />
                                }
                                animate={{ duration: 500 }}
                            />
                        </VictoryChart>
                        <Text style={styles.statisticalText}>En este estudio de caso {mensajeTendenciaRetenidos}</Text>
                    </View>

                    {/* Gráfico de Inactivos */}
                    <View style={styles.chartContainer}>
                        <Text style={styles.chartTitleI}>Frecuencia de Inactivos</Text>
                        <VictoryChart
                            theme={VictoryTheme.material}
                            domainPadding={{ x: dataInactivos.length > 3 ? 50 : 100 }} // Ajusta el espaciado en el eje X
                        >
                            <VictoryAxis
                                tickFormat={dataInactivos.map(i => i.periodo)} // Muestra los periodos en el eje X
                                style={{
                                    tickLabels: {
                                        fontSize: dataInactivos.length > 5 ? 9 : (dataInactivos.length > 4 ? 10 : 15), // Ajusta el tamaño del texto
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
                                data={dataInactivos}
                                x="periodo"
                                y="inactivos"
                                cornerRadius={{ topRight: 20 }}
                                style={{
                                    data: {
                                        fill: ({ datum }) => {
                                            if (datum.inactivos === Math.max(...dataInactivos.map(i => i.inactivos))) {
                                                return '#575756'; // Color para el mayor número de inactivos
                                            } else if (datum.inactivos === Math.min(...dataInactivos.map(i => i.inactivos))) {
                                                return '#B3B3B3'; // Color para el menor número de inactivos
                                            } else {
                                                return '#878787'; // Color estándar
                                            }
                                        },
                                        width: dataDesercion.length > 4 ? 39 : 60,  // Ajusta el ancho de las barras
                                    },
                                }}
                                labels={({ datum }) => `${datum.inactivos}`} // Etiqueta que muestra el valor de inactivos
                                labelComponent={
                                    <VictoryLabel
                                        dy={30} // Ajusta la posición vertical de la etiqueta
                                        style={{ fill: '#F8E9D4', fontSize: 15, fontFamily: 'Montserrat-Bold' }} // Estilo de la etiqueta
                                    />
                                }
                                animate={{ duration: 500 }}
                            />
                        </VictoryChart>
                        <Text style={styles.statisticalText}>Podemos ver que {mensajeTendenciaInactivos}</Text>
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
    chartTitleD: {
        fontSize: 20,
        fontFamily: 'Montserrat-Bold',
        color: '#a81b11',
        marginTop: 20,
        marginBottom: -25,
    },
    chartTitleG: {
        fontSize: 20,
        fontFamily: 'Montserrat-Bold',
        color: '#34531F',
        marginTop: 20,
        marginBottom: -25,
    },
    chartTitleR: {
        fontSize: 20,
        fontFamily: 'Montserrat-Bold',
        color: '#132F20',
        marginTop: 20,
        marginBottom: -25,
    },
    chartTitleI: {
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
