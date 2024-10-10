import React, {useState, useRef} from 'react';
import { View, Text, StyleSheet,ImageBackground, ScrollView, TouchableOpacity, Animated} from 'react-native';
import { PieChart } from "react-native-gifted-charts";
import Collapsible from 'react-native-collapsible';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const GraficarCohorte = ({ route }) => {
    const { selectedCorteInicial, corteFinal, programaSeleccionado, datosBackend } = route.params;
    const navigation = useNavigation();

    const [isGraduadosCollapsed, setGraduadosCollapsed] = useState(true);
    const [isDesertadosCollapsed, setDesertadosCollapsed] = useState(true);
    const [isRetenidosCollapsed, setRetenidosCollapsed] = useState(true);
    const [isActivosCollapsed, setActivosCollapsed] = useState(true);
    const [isInactivosCollapsed, setInactivosCollapsed] = useState(true);


    // Animaciones de rotación
    const rotationGraduados = useRef(new Animated.Value(0)).current; // Para el acordeón de graduados
    const rotationDesertados = useRef(new Animated.Value(0)).current;
    const rotationRetenidos = useRef(new Animated.Value(0)).current;
    const rotationActivos = useRef(new Animated.Value(0)).current;
    const rotationInactivos = useRef(new Animated.Value(0)).current;

    const toggleAccordion = (isCollapsed, setCollapsed, rotation) => {
        Animated.timing(rotation, {
            toValue: isCollapsed ? 1 : 0, // 1 si está colapsado, 0 si está abierto
            duration: 300,
            useNativeDriver: true,
        }).start();
        setCollapsed(!isCollapsed);
    };

    const getRotation = (rotation) => {
        return rotation.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '90deg'], // Cambia de 0 a 90 grados
        });
    };
    
    // Asegúrate de que los arrays estén definidos
    const graduados = datosBackend.graduados || [];
    const retenidos = datosBackend.retenidos || [];
    const desertados = datosBackend.desertados || [];
    const activos = datosBackend.activos || [];
    const inactivos = datosBackend.inactivos || [];
    
    // Corrige el uso de la propiedad .length
    const totalCohorte = graduados.length + retenidos.length + desertados.length + activos.length + inactivos.length;
    
    // Calcula los porcentajes solo si totalCohorte no es 0 para evitar divisiones por 0
    const formatearPorcentaje = (valor) => {
      return Number.isInteger(valor) ? valor : valor.toFixed(1);
    };
    
    const porcentajeGraduados = totalCohorte > 0 ? formatearPorcentaje((graduados.length * 100) / totalCohorte) : 0;
    const porcentajeDesertados = totalCohorte > 0 ? formatearPorcentaje((desertados.length * 100) / totalCohorte) : 0;
    const porcentajeRetenidos = totalCohorte > 0 ? formatearPorcentaje((retenidos.length * 100) / totalCohorte) : 0;
    const porcentajeActivos = totalCohorte > 0 ? formatearPorcentaje((activos.length * 100) / totalCohorte) : 0;
    const porcentajeInactivos = totalCohorte > 0 ? formatearPorcentaje((inactivos.length * 100) / totalCohorte) : 0;
    
    const capitalizeFirstLetter = (string) => {
        return string
          .toLowerCase()
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      };

  
      const pieData = [
        { value: graduados.length , color: '#C3D730', gradientCenterColor: 'black', focused: true,},
        { value: desertados.length, color: '#6D100A', gradientCenterColor: 'black'},
        { value: retenidos.length, color: '#FF9F33', gradientCenterColor: 'black'},
        { value: activos.length, color: '#6998fd', gradientCenterColor: 'black'},
        { value: inactivos.length, color: '#878787', gradientCenterColor: 'black'},
      ];

      const renderEstudiantes = (estudiantes) => {
        return estudiantes.map((estudiante, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.estudianteContainer}
            onPress={() => navigation.navigate('StudentDetail', { 
                id: estudiante.id_estudiante, 
                fromScreen: 'GraficarCohorte',
                selectedCorteInicial, // Asegúrate de que estas variables existan
                corteFinal,
                programaSeleccionado,
                datosBackend
              })}
          >
            <View style={styles.headerContent}>
                    <View style={styles.textContainer}>
                        <Text style={styles.nombreText}>
                        {capitalizeFirstLetter(estudiante.nombre)}
                        </Text>
                        <Text style={styles.apellidoText}>
                        {`${capitalizeFirstLetter(estudiante.apellido)}`}
                        </Text>
                    </View>
                    <FontAwesome name="info-circle" size={24} color="#6D100A" />
            </View>
          </TouchableOpacity>
        ));
      };
            
      const renderAccordion = (title, estudiantes, isCollapsed, toggleCollapse, rotation) => {
        // Solo mostrar si hay estudiantes
        if (estudiantes.length === 0) return null;
    
        return (
            <View style={styles.accordionContainer}>
                <TouchableOpacity onPress={toggleCollapse} style={styles.accordionHeader}>
                    <View style={styles.headerContent}>
                    <Text style={styles.accordionTitle}>{`${title} (${estudiantes.length})`}</Text>
                        <Animated.View style={{ transform: [{ rotate: getRotation(rotation) }] }}>
                            <FontAwesome name="caret-right" size={24} color="#F0FFF2" />
                        </Animated.View>
                    </View>
                </TouchableOpacity>
                <Collapsible collapsed={isCollapsed}>
                    {renderEstudiantes(estudiantes)}
                </Collapsible>
            </View>
        );
    };

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
            <Text style={{ color: '#34531F', fontFamily: 'Montserrat-Medium', }}>Graduados: {graduados.length}</Text>
          </View>
          <View style={styles.legendItem}>
            {renderDot('#FF9F33')}
            <Text style={{ color: '#34531F', fontFamily: 'Montserrat-Medium', }}>Retenidos: {retenidos.length}</Text>
          </View>
        </View>
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            {renderDot('#6D100A')}
            <Text style={{ color: '#34531F', fontFamily: 'Montserrat-Medium', }}>Desertados: {desertados.length}</Text>
          </View>
          <View style={styles.legendItem}>
            {renderDot('#6998fd')}
            <Text style={{ color: '#34531F', fontFamily: 'Montserrat-Medium', }}>Activos: {activos.length}</Text>
          </View>
          
        </View>
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            {renderDot('#878787')}
            <Text style={{ color: '#34531F', fontFamily: 'Montserrat-Medium', }}>Inactivos: {inactivos.length}</Text>
          </View>
        
        </View>
      </View>
      </>
    );
  };

  const generarTextoDinamico = () => {
    const hayGraduados = graduados.length > 0;
    const hayDesertados = desertados.length > 0;
    const hayRetenidos = retenidos.length > 0;
    const hayActivos = activos.length > 0;
    const hayInactivos = inactivos.length > 0;
  
    if (hayGraduados && hayDesertados && hayRetenidos && !hayActivos && !hayInactivos) {
      return `En este análisis, se observa que del total de estudiantes, el ${porcentajeGraduados}% se graduó, el ${porcentajeDesertados}% desertó y el ${porcentajeRetenidos}% está retenido. No hay estudiantes activos ni inactivos en el rango seleccionado.`;
    }
  
    if (hayGraduados && hayDesertados && !hayRetenidos && !hayActivos && !hayInactivos) {
      const comparacion = graduados.length > desertados.length ? "más" : "menos";
      return `En este análisis, se observa que del total de estudiantes, el ${porcentajeGraduados}% se graduó y el ${porcentajeDesertados}% desertó, siendo los graduados ${comparacion} que los desertados. No hay estudiantes activos, retenidos ni inactivos en el rango seleccionado.`;
    }
  
    if (hayGraduados && !hayDesertados && !hayRetenidos && !hayActivos && !hayInactivos) {
      return `El ${porcentajeGraduados}% de los estudiantes ha completado sus estudios y se ha graduado. No hay estudiantes desertados, retenidos, activos ni inactivos.`;
    }
  
    if (!hayGraduados && hayDesertados && !hayRetenidos && !hayActivos && !hayInactivos) {
      return `El ${porcentajeDesertados}% de los estudiantes ha desertado. No hay estudiantes graduados, retenidos, activos ni inactivos.`;
    }
  
    if (hayGraduados && hayDesertados && hayRetenidos && hayInactivos && !hayActivos) {
      return `Este análisis muestra que el ${porcentajeGraduados}% se graduó, el ${porcentajeDesertados}% desertó, el ${porcentajeRetenidos}% está retenido y el ${porcentajeInactivos}% está inactivo. No hay estudiantes activos en este grupo.`;
    }
  
    if (hayGraduados && hayDesertados && hayActivos && !hayRetenidos && !hayInactivos) {
      return `En este análisis, el ${porcentajeGraduados}% de los estudiantes se ha graduado, el ${porcentajeDesertados}% ha desertado y el ${porcentajeActivos}% sigue activo. No hay estudiantes retenidos ni inactivos.`;
    }
  
    if (hayActivos && hayInactivos && hayDesertados && !hayGraduados && !hayRetenidos) {
      return `El ${porcentajeActivos}% de los estudiantes está actualmente activo, mientras que el ${porcentajeInactivos}% está inactivo y el ${porcentajeDesertados}% ha desertado. No hay estudiantes graduados ni retenidos en este grupo.`;
    }
  
    if (hayActivos && !hayInactivos && !hayGraduados && !hayDesertados && !hayRetenidos) {
      return `Actualmente, el ${porcentajeActivos}% de los estudiantes sigue activo. No hay estudiantes graduados, desertados, retenidos ni inactivos.`;
    }
  
    if (hayActivos && hayInactivos && !hayGraduados && !hayDesertados && !hayRetenidos) {
      return `Este análisis muestra que el ${porcentajeActivos}% de los estudiantes sigue activo y el ${porcentajeInactivos}% está inactivo. No hay estudiantes graduados, desertados ni retenidos.`;
    }
  
    return "No hay suficientes datos para generar un análisis significativo.";
  };
  

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <ImageBackground source={require('../assets/fondoinicio.jpg')} style={styles.backgroundImage}>
        <View style={styles.container}>
          <Text style={styles.title}>Resultados del análisis</Text>
          <Text style={styles.subtitle}>Estadistica General</Text>
          <View style={styles.pieChartContainer}>
            <PieChart
              data={pieData}
              donut
              showGradient
              focusOnPress
              toggleFocusOnPress={false}
              radius={100}
              innerRadius={70}
              innerCircleColor={'#ffffff'}
              centerLabelComponent={() => {
                return (
                  <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ fontSize: 22, color: '#132F20', fontWeight: 'bold', fontFamily: 'Montserrat-Medium', }}>
                      {porcentajeGraduados}%
                    </Text>
                    <Text style={{ fontSize: 14, color: '#132F20', fontFamily: 'Montserrat-Medium', }}>Graduados</Text>
                  </View>
                );
              }}
            />
            {renderLegendComponent()}
          </View>
          <Text style={styles.resultadosText}>Total de Estudiantes: {totalCohorte}</Text>

          <Text style={styles.analisisText}>{generarTextoDinamico()}</Text>

           
                  
          {/* Acordiones solo se mostrarán si hay datos */}
          {renderAccordion("Estudiantes Graduados", graduados, isGraduadosCollapsed, () => toggleAccordion(isGraduadosCollapsed, setGraduadosCollapsed, rotationGraduados),rotationGraduados)}
          {renderAccordion("Estudiantes Desertados", desertados, isDesertadosCollapsed,  () => toggleAccordion(isDesertadosCollapsed, setDesertadosCollapsed, rotationDesertados),rotationDesertados)}
          {renderAccordion("Estudiantes Retenidos", retenidos, isRetenidosCollapsed, () => toggleAccordion(isRetenidosCollapsed, setRetenidosCollapsed, rotationRetenidos),rotationRetenidos)}
          {renderAccordion("Estudiantes Activos", activos, isActivosCollapsed, () => toggleAccordion(isActivosCollapsed, setActivosCollapsed, rotationActivos),rotationActivos)}
          {renderAccordion("Estudiantes Inactivos", inactivos, isInactivosCollapsed, () => toggleAccordion(isInactivosCollapsed, setInactivosCollapsed, rotationInactivos),rotationInactivos)}




          <View style={styles.resultadosContainer}>
                     
           
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
  subtitle: {
    fontSize: 20,
    fontFamily: 'Montserrat-Bold',
    color: '#132F20',
    marginBottom:10
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
    fontSize: 15,
    fontFamily: 'Montserrat-Medium',
    marginTop:10,
    marginBottom: 10,
    color:'#132F20'
  },
  analisisText: {
    fontSize: 18,
    textAlign: 'justify',
    fontFamily: 'Montserrat-Medium',
  },
  notaText1: {
    fontSize: 18,
    textAlign: 'justify',
    fontFamily: 'Montserrat-Medium',
  },
  notaText2: {
    fontSize: 18,
    textAlign: 'justify',
    fontFamily: 'Montserrat-Medium',
    marginBottom:10
  },
  
  notaText: {
    fontSize: 18,
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
    color:'#132F20'
  },
  generalText: {
    fontFamily: 'Montserrat-Medium',
    color:'#132F20'
  },
  barChartContainer: {
    width: '100%',
    margin: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#F0FFF2',
    borderColor: "#34531F",
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 10,
    borderWidth: 3,
  },
  accordionContainer: {
    marginTop: 10,
    width: '100%',
    backgroundColor: '#132F20',
    padding: 20,
    borderRadius: 10,
  },
  estudianteContainer: {
    backgroundColor: '#ffffff',
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#C3D730',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
 nombreText: {
    fontSize: 18,
    fontFamily: 'Montserrat-Bold',
    color: '#132F20', 
  },
  apellidoText: {
    fontSize: 16,
    fontFamily: 'Montserrat-Medium',
    color: '#132F20', 
  },
  accordionTitle: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 17,
    color: '#F0FFF2',
    textAlign:'center',
   
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
},
textContainer: {
    flexDirection: 'column',
    flexShrink: 1, // Esto permite que el texto se ajuste sin empujar el icono
  },
  
});

export default GraficarCohorte;
