import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, ScrollView, TouchableOpacity } from 'react-native';
import { VictoryBar, VictoryChart, VictoryAxis, VictoryTheme, VictoryLabel } from 'victory-native';
import { API_BASE_URL } from './Config';
import { useNavigation } from '@react-navigation/native';

const GraficarMatriculas = ({ route }) => {
    const { fromScreen, selectedCorteInicial, selectedCorteFinal, programaSeleccionado, idSeleccionado, datosBackend } = route.params;
    const [resultadosTransformados, setResultadosTransformados] = useState([]);
    const navigation = useNavigation();

    console.log(datosBackend);

    // Función para transformar los datos del backend en un formato adecuado para los gráficos
    const transformarDatos = (datosBackend) => {
        const dataDesercion = [];
        const dataGraduados = [];
        const dataRetenidos = [];
        const dataInactivos = [];

        if (!datosBackend) return { dataDesercion, dataGraduados, dataRetenidos, dataInactivos };

        Object.keys(datosBackend).forEach(periodo => {
            const { Desertores, Graduados, Retenidos, Inactivos } = datosBackend[periodo] || {};

            // Asegurarse de que los valores no son undefined antes de agregarlos
            if (Desertores !== undefined) dataDesercion.push({ periodo, desertores: Desertores });
            if (Graduados !== undefined) dataGraduados.push({ periodo, graduados: Graduados });
            if (Retenidos !== undefined) dataRetenidos.push({ periodo, retenidos: Retenidos });
            if (Inactivos !== undefined) dataInactivos.push({ periodo, inactivos: Inactivos });
        });

        return { dataDesercion, dataGraduados, dataRetenidos, dataInactivos };
    };

    // Llama a transformarDatos solo si datosBackend no es undefined
    const { dataDesercion = [], dataGraduados = [], dataRetenidos = [], dataInactivos = [] } = transformarDatos(datosBackend);

    // Función para obtener el segundo periodo anterior
    function obtenerSegundoPeriodoAnterior(periodo) {
        const [anio, semestre] = periodo.split('-');
        let anioAnterior = parseInt(anio);
        let semestreAnterior = parseInt(semestre);

        semestreAnterior -= 2;

        if (semestreAnterior <= 0) {
            semestreAnterior += 2;
            anioAnterior -= 1;
        }

        return `${anioAnterior}-${semestreAnterior}`;
    }

    // Procesa periodos y verifica que dataDesercion esté definido
    function procesarPeriodos(dataDesercion) {
        if (!dataDesercion) return [];

        const resultados = dataDesercion.map(item => {
            if (!item || !item.periodo) return {}; // Verificación adicional
            const segundoPeriodoAnterior = obtenerSegundoPeriodoAnterior(item.periodo);
            return {
                periodo: item.periodo,
                desertores: item.desertores,
                segundoPeriodoAnterior
            };
        });

        return resultados;
    }

    const periodosFinales = procesarPeriodos(dataDesercion);

    // Resto del código, incluyendo analizarTendencias
    const analizarTendencias = (data, nombreEstado) => {
        if (!data || data.length === 0) return ''; // Verificación adicional para evitar errores

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
        const periodoMax = data.find(d => d[nombreEstado] === maxEstado)?.periodo || 'Desconocido';
        const periodoMin = data.find(d => d[nombreEstado] === minEstado)?.periodo || 'Desconocido';

        const rango = maxEstado - minEstado;
        const umbralSimilitud = 1;

        const minValue = nombreEstado === "desertores" ? `${minEstado}%` : minEstado;
        const maxValue = nombreEstado === "desertores" ? `${maxEstado}%` : maxEstado;

        if (rango <= umbralSimilitud) {
            tendencia = `Los ${nombreEstado} han permanecido bastante constantes, con un mínimo de ${minValue} en el periodo ${periodoMin} y un máximo de ${maxValue} en el periodo ${periodoMax}.`;
        } else if (incremento === data.length - 1) {
            tendencia = `Los ${nombreEstado} han ido en aumento constante, alcanzando un máximo de ${maxValue} en el periodo ${periodoMax}.`;
        } else if (incremento === -(data.length - 1)) {
            tendencia = `Los ${nombreEstado} han ido en disminución constante, con un mínimo de ${minValue} en el periodo ${periodoMin}.`;
        } else if (incremento > 0) {
            tendencia = `Los ${nombreEstado} han tenido un aumento general, con un máximo de ${maxValue} en el periodo ${periodoMax} y un mínimo de ${minValue} en el periodo ${periodoMin}, aunque con algunas fluctuaciones adicionales.`;
        } else if (incremento < 0) {
            tendencia = `Los ${nombreEstado} han mostrado una tendencia a la baja, alcanzando un mínimo de ${minValue} en el periodo ${periodoMin}, con algunas subidas en ciertos periodos.`;
        } else {
            tendencia = `Los datos muestran una gran variabilidad en los ${nombreEstado}, con picos y caídas en diferentes periodos, alcanzando un máximo de ${maxValue} en el periodo ${periodoMax} y un mínimo de ${minValue} en el periodo ${periodoMin}.`;
        }

        return tendencia;
    };

    // Llama a analizarTendencias solo si resultadosTransformados no está vacío
    const mensajeTendenciaDesercion = resultadosTransformados.length > 0 ? analizarTendencias(resultadosTransformados, 'desertores') : '';
    const mensajeTendenciaGraduados = dataGraduados.length > 0 ? analizarTendencias(dataGraduados, 'graduados') : '';
    const mensajeTendenciaRetenidos = dataRetenidos.length > 0 ? analizarTendencias(dataRetenidos, 'retenidos') : '';
    const mensajeTendenciaInactivos = dataInactivos.length > 0 ? analizarTendencias(dataInactivos, 'inactivos') : '';
    
    useEffect(() => {
        const obtenerMatriculadosPorPeriodos = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/matriculados-por-periodos`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ idSeleccionado, periodosFinales }),
                });

                const data = await response.json();
                const resultadosTransformados = data.map(item => {
                    const porcentajeDesertores = item.matriculados > 0
                        ? (item.desertores / item.matriculados) * 100
                        : 0;

                    return {
                        desertores: parseFloat(porcentajeDesertores.toFixed(1)),
                        periodo: item.periodo,
                    };
                });

                setResultadosTransformados(resultadosTransformados); 
                console.log(resultadosTransformados);
            } catch (error) {
                showMessage({
                    message: "Error",
                    description: "No se pudo conectar con la base de datos. Por favor, revisa tu conexión e inténtalo de nuevo.",
                    type: "danger",
                    icon: "danger",
                    titleStyle: { fontSize: 18, fontFamily: 'Montserrat-Bold' },
                    textStyle: { fontSize: 18, fontFamily: 'Montserrat-Regular' },
                    duration: 3000,
                });
            }
        };

        obtenerMatriculadosPorPeriodos();
    }, []); 

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

                    {/* Gráfico de Deserción */}
                    <View style={styles.chartContainer}>
                        <Text style={styles.chartTitleD}>Tasa de Deserción Anual</Text>
                        <VictoryChart
                            theme={VictoryTheme.material}
                            domainPadding={{ x: dataDesercion.length > 3 ? 50 : 100 }} // Ajusta el espaciado en el eje X
                        >
                            <VictoryAxis
                                tickFormat={dataDesercion.map(d => d.periodo)} // Muestra los periodos en el eje X
                                style={{
                                    tickLabels: {
                                        fontSize: resultadosTransformados.length > 5 ? 9 : (resultadosTransformados.length > 4 ? 10 : 15), // Ajusta el tamaño del texto
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
                                data={resultadosTransformados}
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
                        <Text style={styles.chartTitleG}>Histograma de Graduados</Text>
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
                        <Text style={styles.chartTitleR}>Histograma de Retenidos</Text>
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
                        <Text style={styles.chartTitleI}>Histograma de Inactivos</Text>
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
