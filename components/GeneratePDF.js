import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform, StyleSheet, View, Button } from 'react-native';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';

// Función para generar el PDF
export const generatePDF = async (dataArray, programa) => {
  // Carga de activos
  const logoAsset = Asset.fromModule(require('../assets/siredelogo.png'));
  const watermarkAsset = Asset.fromModule(require('../assets/utslogo.png'));
  await Promise.all([logoAsset.downloadAsync(), watermarkAsset.downloadAsync()]);

  // Conversión de URI a Base64
  const [logoURI, watermarkURI] = await Promise.all([
    FileSystem.readAsStringAsync(logoAsset.localUri, { encoding: FileSystem.EncodingType.Base64 }),
    FileSystem.readAsStringAsync(watermarkAsset.localUri, { encoding: FileSystem.EncodingType.Base64 }),
  ]);

  // Creación de URLs para imágenes
  const logoURL = `data:image/png;base64,${logoURI}`;
  const watermarkURL = `data:image/png;base64,${watermarkURI}`;

  // Contenido HTML para el PDF
  const htmlContent = `
    <html>
      <head>
        <style>
          /* Estilos generales */
          @page { size: A4; margin: 20mm; }
          body { font-family: Arial, sans-serif; padding: 20mm; position: relative; }
          .header { text-align: center; position: fixed; top: 20mm; left: 20mm; right: 20mm; }
          .header img { width: 150px; } /* Tamaño del logo ajustado */
          .header h1 { font-size: 24px; }
          .header h2 { font-size: 18px; }
          .content { margin-top: 100px; } /* Espacio para el encabezado */
          .table-container { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
          .table-container th, .table-container td { border: 1px solid black; padding: 8px; text-align: left; }
          .table-container th { background-color: #4CAF50; color: white; }
          .table-container tr:nth-child(even) { background-color: #f2f2f2; }
          .footer { text-align: center; position: fixed; bottom: 20mm; left: 20mm; right: 20mm; font-weight: bold; }
          .page-number { position: absolute; bottom: 10px; right: 20px; font-size: 12px; }
          /* Marca de agua ajustada */
          .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: A4; height: A4; background-image: url('${watermarkURL}'); background-size: contain; background-repeat: no-repeat; opacity: 0.5; z-index: -1; }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="${logoURL}" alt="Logo"/>
          <h1>Informe Estudiantes Programa</h1>
          <h2>TECNOLOGIA EN TOPOGRAFIA</h2>
        </div>
        <div class="content">
          <!-- Tabla de datos -->
          <table class="table-container">
            <thead>
              <tr>
                <th>Nro. Documento</th>
                <th>Apellidos</th>
                <th>Nombres</th>
              </tr>
            </thead>
            <tbody>
              ${dataArray.map(dato => `
                <tr>
                  <td>${dato.documento}</td>
                  <td>${dato.apellidos}</td>
                  <td>${dato.nombres}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        <div class="footer">
          Universidad Tecnológica de Santander - UTS
        </div>
        <div class="watermark"></div>
        <div class="page-number">Página 1/2</div> <!-- Número de página dinámico -->
      </body>
    </html>
  `;

  // Generación y compartición del PDF
  try {
    const { uri } = await Print.printToFileAsync({ html: htmlContent });
    console.log('PDF generado en:', uri);
    await Sharing.shareAsync(uri);
  } catch (error) {
    console.error('Error al generar el PDF:', error);
  }
};

// Componente para generar el PDF
const GeneratePDF = ({ route }) => {
  const { dataArray, programa } = route.params;
  return (
    <View style={styles.container}>
      <Button title="Generar PDF" onPress={() => generatePDF(dataArray, programa)} />
    </View>
  );
};

// Estilos del componente
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});

export default GeneratePDF;
