import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

// Función para generar el PDF
export const generatePDF = async (dataArray) => {
  // Contenido HTML para el PDF
  const htmlContent = `
    <html>
      <head>
        <style>
          @page { size: A4; margin: 20mm; }
          body { font-family: Arial, sans-serif; padding: 1em; }
          .header { text-align: center; margin-bottom: 2em; }
          .header h1 { font-size: 1.5em; margin: 0; }
          .header h2 { font-size: 1.2em; margin: 0; }
          .content { margin-top: 2em; }
          .table-container { width: 100%; border-collapse: collapse; font-size: 0.9em; }
          .table-container th, .table-container td { border: 1px solid black; padding: 0.5em; text-align: left; }
          .table-container th { background-color: #4CAF50; color: white; }
          .table-container tr:nth-child(even) { background-color: #f2f2f2; }
          .footer { text-align: center; margin-top: 2em; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Informe Estudiantes Programa</h1>
          <h2>TECNOLOGIA EN TOPOGRAFIA</h2>
        </div>
        <div class="content">
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
      </body>
    </html>
  `;

  // Generación y compartición del PDF
  try {
    const { uri } = await Print.printToFileAsync({ html: htmlContent });
    console.log('PDF generado en:', uri);

    // Guardar el PDF en el sistema de archivos del dispositivo
    const fileUri = `${FileSystem.documentDirectory}myDocument.pdf`;
    await FileSystem.moveAsync({
      from: uri,
      to: fileUri,
    });
    console.log('PDF guardado en:', fileUri);

    // Opcionalmente, puedes compartir el PDF usando expo-sharing
    await Sharing.shareAsync(fileUri);
  } catch (error) {
    console.error('Error al generar el PDF:', error);
  }
};
