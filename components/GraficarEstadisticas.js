import React from 'react';
import { View, Text, StyleSheet,ImageBackground, ScrollView } from 'react-native';
import { PieChart } from "react-native-gifted-charts";

const Graficar = ({ route }) => {
  const { selectedCorteInicial, selectedCorteFinal, programaSeleccionado, datosBackend } = route.params;
  const porcentajeGraduados = ((datosBackend.totalGra * 100) / datosBackend.totalEstp).toFixed(2);
  const porcentajeDesertados = ((datosBackend.totalDes * 100) / datosBackend.totalEstp).toFixed(2);
  const porcentajeRetirados = ((datosBackend.totalRet * 100) / datosBackend.totalEstp).toFixed(2);

  const pieData = [
    {value: datosBackend.totalGra, color: '#C3D730', gradientCenterColor: '#A2B929', focused: true,},
    { value: datosBackend.totalRet, color: '#FF9F33', gradientCenterColor: '#FF9F33'},
    { value: datosBackend.totalDes, color: '#6D100A', gradientCenterColor: '#5A0D08'},
  ];

  const renderDot = color => {
    return (
      <View
        style={{
          height: 10,
          width: 10,
          borderRadius: 10,
          backgroundColor: color,
          marginRight: 10,
        }}
      />
    );
  };

  const renderLegendComponent = () => {
    return (
      <>
      <View  style={styles.legendGeneral}> 
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            {renderDot('#C3D730')}
            <Text style={{ color: '#34531F', fontFamily: 'Montserrat-Medium', }}>Graduados: {datosBackend.totalGra}</Text>
          </View>
          <View style={styles.legendItem}>
            {renderDot('#FF9F33')}
            <Text style={{ color: '#34531F', fontFamily: 'Montserrat-Medium', }}>Retenidos: {datosBackend.totalRet}</Text>
          </View>
        </View>
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            {renderDot('#6D100A')}
            <Text style={{ color: '#34531F', fontFamily: 'Montserrat-Medium', }}>Desertados: {datosBackend.totalDes}</Text>
          </View>
        </View>
      </View>
      </>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <ImageBackground source={require('../assets/fondoinicio.jpg')} style={styles.backgroundImage}>
        <View style={styles.container}>
          <Text style={styles.title}>Resultados del análisis</Text>
          <View style={styles.pieChartContainer}>
            <PieChart
              data={pieData}
              donut
              showGradient
              focusOnPress
              toggleFocusOnPress={false}
              radius={100}
              innerRadius={70}
              innerCircleColor={'#132F20'}
              centerLabelComponent={() => {
                return (
                  <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ fontSize: 22, color: 'white', fontWeight: 'bold' }}>
                      {porcentajeGraduados}%
                    </Text>
                    <Text style={{ fontSize: 14, color: 'white' }}>Graduados</Text>
                  </View>
                );
              }}
            />
            {renderLegendComponent()}
          </View>
          <View style={styles.resultadosContainer}>
            <Text style={styles.resultadosText}>Total de Estudiantes: {datosBackend.totalEstp}</Text>
            <Text style={styles.notaText1}>
              <Text style={styles.generalText}>
                En el rango analizado se evidencia que desde el corte inicial
              </Text>
              <Text style={styles.keywordText}>
                {` ${selectedCorteInicial} `}
              </Text>
              <Text style={styles.generalText}>
                hasta el corte final
              </Text>
              <Text style={styles.keywordText}>
                {` ${selectedCorteFinal} `}
              </Text>
              <Text style={styles.generalText}>
                del programa académico
              </Text>
              <Text style={styles.keywordText}>
                {` ${programaSeleccionado}, `}
              </Text>
              <Text style={styles.generalText}>
                el
              </Text>
              <Text style={styles.keywordText}>
                {` ${porcentajeGraduados}% `}
              </Text>
              <Text style={styles.generalText}>
                de los estudiantes logró obtener su título profesional, el
              </Text>
              <Text style={styles.keywordText}>
                {` ${porcentajeRetirados}% `}
              </Text>
              <Text style={styles.generalText}>
                de estudiantes se retiró de la universidad y el
              </Text>
              <Text style={styles.keywordText}>
                {` ${porcentajeDesertados}% `}
              </Text>
              <Text style={styles.generalText}>
                de estudiantes desertó.
              </Text>{'\n'}
            </Text>
           
              <Text style={styles.notaText1}> 
              <Text style={styles.keywordText}>Nota:</Text>{' '}
                  <Text style={styles.generalText}>
                    La diferencia entre estudiantes "
                    <Text style={styles.keywordText}>retenidos</Text>", 
                    "<Text style={styles.keywordText}>desertores</Text>" y 
                    "<Text style={styles.keywordText}>graduados</Text>" se refiere a su estado académico o situación en la institución educativa:
                  </Text>
              </Text>

                <View style={styles.notaContainer}>
                  <Text style={styles.notaText}>
                      <Text style={styles.generalText}>
                        <Text style={styles.keywordText}>Graduados:</Text> Son los estudiantes que han completado satisfactoriamente todos los Se refiere a los estudiantes que continúan matriculados en la institución pero que no han logrado avanzar satisfactoriamente en su proceso educativo. Esto puede deberse a un rendimiento académico deficiente, la repetición de cursos o cualquier otra razón que haya impedido su progreso normal. 
                      </Text>
                  </Text>
                </View>

                <View style={styles.notaContainer1}>
                  <Text style={styles.notaText}>
                      <Text style={styles.generalText}>
                        <Text style={styles.keywordText}>Retenidos:</Text> Se refiere a los estudiantes que continúan matriculados en la institución pero que no han logrado avanzar satisfactoriamente en su proceso educativo. Esto puede deberse a un rendimiento académico deficiente, la repetición de cursos o cualquier otra razón que haya impedido su progreso normal.
                      </Text>
                  </Text>
                </View>

                <View style={styles.notaContainer2}>
                  <Text style={styles.notaText}>
                      <Text style={styles.generalText}>
                        <Text style={styles.keywordText}>Desertores:</Text> Son aquellos estudiantes que abandonan la institución educativa antes de completar su programa de estudios. Pueden hacerlo por diversas razones, como problemas personales, dificultades académicas, falta de interés, entre otros.
                      </Text>
                  </Text>
                </View>

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
  },
  title: {
    fontSize: 40,
    fontFamily: 'Montserrat-Bold',
    alignSelf: 'flex-start',
    marginBottom: 20,
    color: '#C3D730',
  },
  pieChartContainer: {
    margin: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#F0FFF2',
    borderColor:"#34531F",
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 10,
    borderRadius:20,
    borderWidth: 3,          // Ancho del borde
    borderColor: '#34531F',     // Color del borde 
    justifyContent:"center"
  },
  legendGeneral: {
    justifyContent: 'center',
    marginTop: 20,
    justifyContent:"center"
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    justifyContent:"center"
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 180,
    justifyContent:"center"
    
  },
  resultadosContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  resultadosText: {
    fontSize: 18,
    fontFamily: 'Montserrat-Bold',
    marginBottom: 10,
  },
  analisisText: {
    fontSize: 18,
    textAlign: 'justify',
    fontFamily: 'Montserrat-Medium',
  },
  notaText1: {
    fontSize: 20,
    textAlign: 'justify',
    fontFamily: 'Montserrat-Medium',
  },
  notaText: {
    fontSize: 20,
    padding: 20,
    textAlign: 'justify',
    fontFamily: 'Montserrat-Medium',
  },
  notaContainer: {
    marginTop: 30,
    marginBottom: 20,
    backgroundColor: '#F8E9D4',
    borderRadius: 40,
    borderWidth: 5,
    borderColor: '#C3D730',
  },
  notaContainer1: {
    marginBottom: 20,
    backgroundColor: '#F8E9D4',
    borderRadius: 40,
    borderWidth: 5,
    borderColor: '#C3D730',
  },
  notaContainer2: {
    marginBottom: 100,
    backgroundColor: '#F8E9D4',
    borderRadius: 40,
    borderWidth: 5,
    borderColor: '#C3D730',
  },
  keywordText: {
    fontFamily: 'Montserrat-Bold',
  },
  generalText: {
    fontFamily: 'Montserrat-Medium',
  },
});

export default Graficar;
