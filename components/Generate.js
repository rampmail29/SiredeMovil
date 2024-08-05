import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

// Función para generar el PDF
export const generatePDF = async (dataArray, programa, tipoInforme) => {
  const { cod_snies, programa: nombre_programa } = programa;

  // Contenido HTML específico para Android
  const htmlAndroid = `
     <html>
      <head>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap" rel="stylesheet">
        <style>
              @page { 
              size: A4; 
              margin: 20mm; 
              }
              body { 
              font-family: 'Montserrat', sans-serif; 
              padding: 1em; }
              .header { text-align: center; margin-bottom: 2em; }
              .header-table { border-collapse: collapse; margin: 0 auto; display: inline-table; }
              .header-table th, .header-table td {
               border: 1px solid black; 
               padding: 0.5em; 
               text-align: center; 
               }
              .informe-header.graduados  { background-color: #4CAF50; color: white; }
              .informe-header.desertados  { background-color: #CD2222; color: white; }
              .informe-header.retenidos  { background-color: #FC8E01; color: white; }
              .info-head { background-color: #EAEAEA; }
              .header h1 { font-size: 1.5em; margin: 0; text-transform: uppercase; }
              .header h2 { font-size: 1.2em; margin: 0; text-transform: uppercase; }
              .header h3 { font-size: 1em; margin: 0; text-transform: uppercase; }
              .content { 
                margin-top: 0.8em; 
              }
              .table-container { 
                width: 100%; 
                border-collapse: collapse; 
                font-size: 0.9em; 
                page-break-inside: auto; /* Intento de control de salto de página */
              }
              .table-container th, .table-container td { border: 1px solid black; padding: 0.4em; text-align: left; }
              .table-container.graduados th { background-color: #4CAF50; color: white; }
              .table-container.desertados th { background-color: #CD2222; color: white; }
              .table-container.retenidos th { background-color: #FC8E01; color: white; }
              .table-container tr:nth-child(even) { background-color: #f2f2f2; }
              .table-container tbody tr { page-break-inside: avoid; page-break-after: auto; } /* Intento de control de salto de página */
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
              .summary-table.graduados { background-color: #4CAF50; color: white; }
              .summary-table.desertados { background-color: #CD2222; color: white; }
              .summary-table.retenidos { background-color: #FC8E01; color: white; }
        </style>
      </head>
      <body>
        <div class="header">
          <table class="header-table">
            <tr class="informe-header ${tipoInforme}" >
              <td ><h1>Informe de estudiantes ${tipoInforme}</h1></td>
            </tr>
             <tr class="info-head">
              <td><h2> Unidades Tecnológicas de Santander - UTS </h2></td>
            </tr>
            <tr class="info-head">
              <td><h3>${cod_snies} - ${nombre_programa}</h3></td>
            </tr>
          </table>
        </div>
        <div class="content">
          <table class="table-container ${tipoInforme}">
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
      </body>
    </html>
  `;

  // Contenido HTML específico para iOS
  const htmlIOS = `
 <html>
<head>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap" rel="stylesheet">
  <style>
    @media print {
    .table-container {
      page-break-inside: auto;
    }
    .page-break {
      page-break-before: always;
    }
  }
    @page { 
      size: A4; 
    }
    body { 
      font-family: 'Montserrat', sans-serif;
      -webkit-print-color-adjust: exact; /* Asegura la exactitud del color */ 
      padding: 1em;
      margin: 20mm; 
      
    }
    .header { text-align: center; margin-bottom: 2em; }
    .header-table { border-collapse: collapse; margin: 0 auto; display: inline-table; }
    .header-table th, .header-table td {
      border: 1px solid black; 
      padding: 0.5em; 
      text-align: center; 
    }
    .informe-header.graduados  { background-color: #4CAF50; color: white; }
    .informe-header.desertados  { background-color: #CD2222; color: white; }
    .informe-header.retenidos  { background-color: #FC8E01; color: white; }
    .info-head { background-color: #EAEAEA; }
    .header h1 { font-size: 1.5em; margin: 0; text-transform: uppercase; }
    .header h2 { font-size: 1.2em; margin: 0; text-transform: uppercase; }
    .header h3 { font-size: 1em; margin: 0; text-transform: uppercase; }
    .content { 
      margin-top: 1em; 
    }
    .table-container { 
      width: 100%; 
      border-collapse: collapse; 
      font-size: 0.9em; 
      page-break-inside: auto; /* Intento de control de salto de página */
    }
    .table-container th, .table-container td { border: 1px solid black; padding: 0.4em; text-align: left; }
    .table-container.graduados th { background-color: #4CAF50; color: white; }
    .table-container.desertados th { background-color: #CD2222; color: white; }
    .table-container.retenidos th { background-color: #FC8E01; color: white; }
    .table-container tr:nth-child(even) { background-color: #f2f2f2; }
    .table-container tbody tr { page-break-before: always; page-break-after: auto; } /* Intento de control de salto de página */
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
    .summary-table.graduados { background-color: #4CAF50; color: white; }
    .summary-table.desertados { background-color: #CD2222; color: white; }
    .summary-table.retenidos { background-color: #FC8E01; color: white; }
    
  </style>
</head>
<body>
  <div class="header">
    <table class="header-table">
      <tr class="informe-header ${tipoInforme}" >
        <td ><h1>Informe de estudiantes ${tipoInforme}</h1></td>
      </tr>
       <tr class="info-head">
        <td><h2> Unidades Tecnológicas de Santander - UTS </h2></td>
      </tr>
      <tr class="info-head">
        <td><h3>${cod_snies} - ${nombre_programa}</h3></td>
      </tr>
    </table>
  </div>
  <div class="content">
    <table class="table-container ${tipoInforme}">
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