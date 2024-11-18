import React, {useState, useRef, useEffect} from 'react';
import { View, Text, StyleSheet,ImageBackground, ScrollView, TouchableOpacity, Animated} from 'react-native';
import { PieChart } from "react-native-gifted-charts";
import Collapsible from 'react-native-collapsible';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const GraficarCohorte = ({ route }) => {
    const { fromScreen, selectedCorteInicial, corteFinal, programaSeleccionado,tipoProgramaSeleccionado, datosBackend } = route.params;
    const navigation = useNavigation();
 
    const obtenerPeriodoActual = () => {
      const hoy = new Date();
      const año = hoy.getFullYear();
      const mes = hoy.getMonth() + 1; // getMonth() retorna 0-11, así que sumamos 1 para obtener el mes correcto
  
      // Determinar el semestre
      const semestre = mes <= 6 ? 1 : 2;
  
      return `${año}-${semestre}`;
  };
  
  // Ejemplo de uso
  const periodoActual = obtenerPeriodoActual();
 
  const compararPeriodos = (corteFinal, periodoActual) => {
    // Extraer año y semestre del periodo final
    const [añoFinal, semestreFinal] = corteFinal.split('-').map(Number);

    // Extraer año y semestre del periodo actual
    const [añoActual, semestreActual] = periodoActual.split('-').map(Number);

    // Comparar años
    if (añoFinal > añoActual || (añoFinal === añoActual && semestreFinal > semestreActual)) {
          return "Periodo en curso";
    } else if (añoFinal === añoActual && semestreFinal === semestreActual) {
          return "Periodo en curso";
    } else {
      return "Periodo finalizado";
    }
};

   compararPeriodos(corteFinal, periodoActual);
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

    function periodoMaxGraduacionOportunaTec(corteFinal) {
      let [año, periodo] = corteFinal.split('-').map(Number);
  
      // Sumar dos periodos
      for (let i = 0; i < 2; i++) {
          if (periodo === 1) {
              periodo = 2;
          } else {
              año += 1;
              periodo = 1;
          }
      }
  
      return `${año}-${periodo}`;
  }
   const maxGraduacionTec= periodoMaxGraduacionOportunaTec(corteFinal)
    console.log(graduados);
    console.log('Periodo Tope para terminar materias: '+ corteFinal);
    console.log('Periodo maximo para graduarse oportanamete: '+ maxGraduacionTec);

    // La función que compara periodos académicos
      function esMenorOIgualPeriodo(periodo1, periodo2) {
        const [año1, periodo1Num] = periodo1.split('-').map(Number);
        const [año2, periodo2Num] = periodo2.split('-').map(Number);

        // Compara primero los años
        if (año1 < año2) return true;
        if (año1 > año2) return false;

        // Si los años son iguales, compara el periodo
        return periodo1Num <= periodo2Num;
      }

      // Función para obtener los graduados oportunos
      function obtenerGraduadosOportunos(graduados, maxGraduacionTec) {
        return graduados.filter(estudiante => 
            esMenorOIgualPeriodo(estudiante.periodo_graduacion, maxGraduacionTec)
        );
      }

      const graduadosOportunos = obtenerGraduadosOportunos(graduados, maxGraduacionTec);
      console.log('Estudiantes Graduados Oportunamente: '+ graduadosOportunos.length);
        
    // Numero total de estuidantes en el cohorte
    const totalCohorte = graduados.length + retenidos.length + desertados.length + activos.length + inactivos.length;

    console.log('Total estudiantes en la cohorte: '+ totalCohorte)

    function calcularTasaGraduacionOportuna(totalCohorte, graduadosOportunos) {
      const tasaGraduacionOportuna = (graduadosOportunos.length / totalCohorte) * 100;
      return tasaGraduacionOportuna.toFixed(2); // Redondea a dos decimales
  }
  const graduacionOportuna= calcularTasaGraduacionOportuna(totalCohorte, graduadosOportunos);
  

   console.log(`Tasa de Graduación Oportuna: ${graduacionOportuna}%`);
  

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
        { value: graduados.length , color: '#C3D730', gradientCenterColor: '#728200',},
        { value: desertados.length, color: '#6D100A', gradientCenterColor: 'black'},
        { value: retenidos.length, color: '#FF9F33', gradientCenterColor: '#81501a'},
        { value: activos.length, color: '#6998fd', gradientCenterColor: '#012e8e'},
        { value: inactivos.length, color: '#878787', gradientCenterColor: 'black'},
      ];

      // Estado del gráfico
      const [focusedValue, setFocusedValue] = useState(null);
      const [centerLabel, setCenterLabel] = useState({ value: '', label: '' });

      useEffect(() => {
          // Calcula el índice con el valor máximo sólo cuando cambian los datos
          const maxValue = Math.max(graduados.length, desertados.length, retenidos.length, activos.length, inactivos.length);
          const initialFocusedIndex = pieData.findIndex(item => item.value === maxValue);

          // Actualiza enfoque y etiqueta si los datos cambian
          if (initialFocusedIndex !== focusedValue) {
              setFocusedValue(initialFocusedIndex);
              updateCenterLabel(initialFocusedIndex);
          }
      }, [graduados, desertados, retenidos, activos, inactivos]);

    
      // Función de actualización del centro
      const updateCenterLabel = (index) => {
        switch (index) {
            case 0:
                setCenterLabel({ value: porcentajeGraduados, label: 'Graduados' });
                break;
            case 1:
                setCenterLabel({ value: porcentajeDesertados, label: 'Desertados' });
                break;
            case 2:
                setCenterLabel({ value: porcentajeRetenidos, label: 'Retenidos' });
                break;
            case 3:
                setCenterLabel({ value: porcentajeActivos, label: 'Activos' });
                break;
            case 4:
                setCenterLabel({ value: porcentajeInactivos, label: 'Inactivos' });
                break;
            default:
                setCenterLabel({ value: '', label: '' });
        }
      };

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
      return `En este grupo de estudiantes que empezo su formacion academica en el periodo ${selectedCorteInicial}, se destaca que ${graduados.length} estudiantes completaron su formación con éxito, Sin embargo, también se evidencia que ${desertados.length} han desertado y ${retenidos.length} permanecen retenidos. Podremos ver mas detalles de estos estudiantes a continuación:`;
    }
  
    if (hayGraduados && hayDesertados && !hayRetenidos && !hayActivos && !hayInactivos) {
      const comparacion = graduados.length > desertados.length  ? "un mayor" : graduados.length < desertados.length  ? "un menor"  : "igual";
      return `En esta cohorte, ${graduados.length} estudiantes lograron graduarse, lo cual es un gran éxito. Sin embargo, también se observa que ${desertados.length} han desertado, con ${comparacion} número de graduados que de desertados. Podremos ver mas detalles de estos estudiantes a continuación:`;
    }
  
    if (hayGraduados && !hayDesertados && !hayRetenidos && !hayActivos && !hayInactivos) {
      return `¡Felicitaciones! Todos los estudiantes han completado con éxito sus estudios y se han graduado. Podremos ver mas detalles de estos estudiantes a continuación: `;

    }
  
    if (!hayGraduados && hayDesertados && !hayRetenidos && !hayActivos && !hayInactivos) {
      return `Es preocupante que todos los estudiantes hayan desertado de sus estudios. No se registra ningún estudiante que haya completado su formación. Es crucial tomar medidas para reducir el índice de deserción y mejorar el acompañamiento a los estudiantes. Podremos ver mas detalles de estos estudiantes a continuación:`;

    }
  
    if (hayGraduados && hayDesertados && hayRetenidos && hayInactivos && !hayActivos) {
      return `En este análisis detallado, se observa que ${graduados.length} estudiantes han logrado completar con éxito su formación académica y se han graduado. Sin embargo, ${desertados.length} estudiantes han desertado, interrumpiendo su proceso educativo. Además, ${retenidos.length} estudiantes se encuentran retenidos, aún sin haber finalizado sus estudios, mientras que ${inactivos.length} han cesado toda actividad académica. Podremos ver mas detalles de estos estudiantes a continuación:`;

    }
  
    if (hayGraduados && hayDesertados && hayActivos && !hayRetenidos && !hayInactivos) {
      return `En este análisis, se destaca que el ${porcentajeGraduados}% de los estudiantes han completado sus estudios y se han graduado, ${porcentajeDesertados}% han desertado, y ${activos.length} continúan activos en su formación. Podremos ver mas detalles de estos estudiantes a continuación:`;

    }
  
    if (hayActivos && hayInactivos && hayDesertados && !hayGraduados && !hayRetenidos) {
      return `El ${porcentajeActivos}% de los estudiantes está actualmente activo, mientras que el ${porcentajeInactivos}% está inactivo y el ${porcentajeDesertados}% ha desertado. Podremos ver mas detalles de estos estudiantes a continuación:`;
    }
  
    if (hayActivos && !hayInactivos && !hayGraduados && !hayDesertados && !hayRetenidos) {
      return `Afortunadamente, todos los estudiantes se encuentran activos hasta la fecha actual lo que es un indicador positivo del compromiso en su proceso académico. Podremos ver mas detalles de estos estudiantes a continuación:`;

    }
  
    if (hayActivos && hayInactivos && !hayGraduados && !hayDesertados && !hayRetenidos) {
      return `Este análisis muestra que el ${porcentajeActivos}% de los estudiantes sigue activo y el ${porcentajeInactivos}% está inactivo.Podremos ver mas detalles de estos estudiantes a continuación:`;
    }
  
    return "No hay suficientes datos para generar un análisis significativo.";
  };
   // Obtener mensaje basado en la comparación de los periodos
   const mensajePeriodo = compararPeriodos(corteFinal, periodoActual);

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <ImageBackground source={require('../assets/fondoinicio.jpg')} style={styles.backgroundImage}>
        <View style={styles.container}>
          <Text style={styles.title}>Resultados del análisis</Text>

          {/* Mostrar el mensaje de periodo a la derecha debajo del título */}
               <View style={styles.mensajeContainer}>
                    <Text style={styles.mensajePeriodo}>{mensajePeriodo}</Text>
                </View>
          <Text style={styles.subtitle}>
            Este
            <Text style={{ fontFamily:'Montserrat-Bold'}}> análisis estadístico </Text>             
             se enfoca en los estudiantes que comenzaron su formación en la carrera de
            <Text style={{ fontFamily:'Montserrat-Bold'}}> {capitalizeFirstLetter(programaSeleccionado)} </Text> 
            durante el periodo
            <Text style= {{ fontFamily:'Montserrat-Bold' }}> {selectedCorteInicial}</Text>.
            Aquí se muestra cómo han progresado a lo largo del tiempo.
          </Text>
          <View style={styles.pieChartContainer}>
          <PieChart
            data={pieData.map((item, index) => ({
                ...item,
                focused: index === focusedValue, // Control manual de enfoque
            }))}
            donut
            showGradient
            radius={100}
            innerRadius={70}
            innerCircleColor={'#ffffff'}
            onPress={(item, index) => {
                setFocusedValue(index);  // Actualiza el valor seleccionado
                updateCenterLabel(index); // Actualiza el centro
            }}
            centerLabelComponent={() => (
                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ fontSize: 22, color: '#132F20', fontWeight: 'bold', fontFamily: 'Montserrat-Medium' }}>
                        {centerLabel.value}%
                    </Text>
                    <Text style={{ fontSize: 14, color: '#132F20', fontFamily: 'Montserrat-Medium' }}>
                        {centerLabel.label}
                    </Text>
                </View>
            )}
        />

          {renderLegendComponent()}
          </View>

          <Text style={styles.resultadosText}>Total de Estudiantes: {totalCohorte}</Text>
          <View style={styles.separator} />

          {mensajePeriodo === 'Periodo finalizado' && (
          <View style={styles.pieChartContainer2}>
            {parseFloat(graduacionOportuna) === 0 ? (
              <Text style={styles.graduacionOportuna}>
                <Text style={{ fontFamily:'Montserrat-Bold', color:'red'}}>*</Text> Desafortunadamente, ningún estudiante de esta cohorte logro graduarse oportunamente.
              </Text>
            ) : (
              <Text style={styles.graduacionOportuna}>
                <Text style={{ fontFamily:'Montserrat-Bold', color:'red'}}>*</Text> La tasa de <Text style={{ fontFamily:'Montserrat-Bold'}}>graduación oportuna</Text> para esta cohorte fue de
                <Text style={{ fontFamily:'Montserrat-Bold'}}> {graduacionOportuna}%</Text> con un total de {graduadosOportunos.length} graduados.
              </Text>
            )}
          </View>
        )}


          <Text style={styles.analisisText}>{generarTextoDinamico()}</Text>

                           
          {/* Acordiones solo se mostrarán si hay datos */}
          {renderAccordion("Estudiantes Graduados", graduados, isGraduadosCollapsed, () => toggleAccordion(isGraduadosCollapsed, setGraduadosCollapsed, rotationGraduados),rotationGraduados)}
          {renderAccordion("Estudiantes Desertados", desertados, isDesertadosCollapsed,  () => toggleAccordion(isDesertadosCollapsed, setDesertadosCollapsed, rotationDesertados),rotationDesertados)}
          {renderAccordion("Estudiantes Retenidos", retenidos, isRetenidosCollapsed, () => toggleAccordion(isRetenidosCollapsed, setRetenidosCollapsed, rotationRetenidos),rotationRetenidos)}
          {renderAccordion("Estudiantes Activos", activos, isActivosCollapsed, () => toggleAccordion(isActivosCollapsed, setActivosCollapsed, rotationActivos),rotationActivos)}
          {renderAccordion("Estudiantes Inactivos", inactivos, isInactivosCollapsed, () => toggleAccordion(isInactivosCollapsed, setInactivosCollapsed, rotationInactivos),rotationInactivos)}

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
    textAlign:'justify',
    color: '#132F20',
    marginBottom:10
  },
  pieChartContainer: {
    margin: 10,
    padding: 10,
    backgroundColor: '#F0FFF2',
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
  pieChartContainer2: {
    width:"100%",
    margin: 10,
    padding: 15,
    backgroundColor: '#F0FFF2',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 10,
    borderRadius:10,
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
    marginTop:10,
    marginBottom: 10,
    color:'#132F20'
  },
  graduacionOportuna: {
    padding:10,
    fontSize: 18,
    fontFamily: 'Montserrat-Medium',
    color:'#132F20',
    textAlign:'justify'
  },
  analisisText: {
    fontSize: 19,
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
  separator: {
    height: 2,
    width: '50%',
    backgroundColor: '#6D100A',
    marginVertical: 10,
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
  mensajeContainer: {
    marginTop: -10,
    marginBottom:15,
    alignSelf: 'flex-end',
    backgroundColor:'#C3D730',
    padding: 10,
    borderBottomLeftRadius:15,
    borderTopLeftRadius:15,
},
mensajePeriodo: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#132F20',
    fontFamily:'Montserrat'
},
  
});

export default GraficarCohorte;
