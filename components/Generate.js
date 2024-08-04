import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

// Función para generar el PDF
export const generatePDF = async (dataArray, programa, tipoInforme) => {
  const { cod_snies, programa: nombre_programa } = programa;
  console.log(tipoInforme);

  // Contenido HTML específico para Android
  const htmlAndroid = `
     <html>
      <head>
        <style>
              @page { size: A4; margin: 15mm; }
              body { font-family: Arial, sans-serif; padding: 1em; }
              .header { text-align: center; margin-bottom: 2em; }
              .header-table { border-collapse: collapse; margin: 0 auto; display: inline-table; }
              .header-table th, .header-table td { border: 1px solid black; padding: 0.5em; text-align: center; }
              .header-table th { background-color: #4CAF50; color: white; }
              .header h1 { font-size: 1.5em; margin: 0; text-transform: uppercase; }
              .header h2 { font-size: 0.8em; margin: 0; text-transform: uppercase; }
              .content { 
                margin-top: 0.8em; 
                margin-bottom: 80px; /* Aumentar margen inferior */
              }
              .table-container { 
                width: 100%; 
                border-collapse: collapse; 
                font-size: 0.9em; 
                page-break-inside: auto; /* Intento de control de salto de página */
              }
              .table-container th, .table-container td { border: 1px solid black; padding: 0.4em; text-align: left; }
              .table-container th { background-color: #4CAF50; color: white; }
              .table-container tr:nth-child(even) { background-color: #f2f2f2; }
              .table-container tbody tr { page-break-inside: avoid; } /* Intento de control de salto de página */
              .summary-table { 
                width: auto; 
                margin-left: auto; 
                margin-right: 0; 
                border-collapse: collapse; 
                margin-top: 1em; 
                font-weight: bold; 
                page-break-inside: avoid; /* Intento de control de salto de página */
              }
              .summary-table th, .summary-table td { 
                border: 1px solid black; 
                padding: 0.5em; 
                text-align: right; 
              }
              .summary-table th { background-color: #4CAF50; color: white; }
              .summary-table.graduados { background-color: #dff0d8; }
              .summary-table.desertados { background-color: #f2dede; }
              .summary-table.retenidos { background-color: #fcf8e3; }
              .footer { 
                position: fixed; 
                bottom: 0; 
                width: calc(100% - 40px); 
                text-align: center; 
                font-weight: bold; 
                background-color: white; 
                padding: 10px 0;
              }
        </style>
      </head>
      <body>
        <div class="header">
          <table class="header-table">
            <tr>
              <td><h1>Informe de estudiantes ${tipoInforme}</h1></td>
            </tr>
            <tr>
              <td><h2>${cod_snies} - ${nombre_programa}</h2></td>
            </tr>
          </table>
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
          <table class="summary-table ${tipoInforme}">
            <tr>
              <td>Total de estudiantes ${tipoInforme}: ${dataArray.length}
            </tr>
          </table>
        </div>
        <div class="footer">
          Unidades Tecnológicas de Santander - UTS
        </div>
      </body>
    </html>
  `;

  // Contenido HTML específico para iOS
  const htmlIOS = `
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
          <h1>Informe de estudiantes ${tipoInforme}.</h1>
          <h2>${cod_snies} - ${nombre_programa}</h2>
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

  // Selección del contenido HTML según la plataforma
  const htmlContent = Platform.OS === 'ios' ? htmlIOS : htmlAndroid;

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