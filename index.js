const { app, BrowserWindow, ipcMain ,dialog} = require('electron');
const path = require('path');
const PDFDocument = require('pdfkit');
const fs=require('fs-extra')


if (process.env.NODE_ENV!=='production'){
require('electron-reload')(__dirname,{

})
}
let win
//var sql = require("mssql");
let camino=path.join(__dirname,'/js/database.js')
let db=require(camino)
let  iconPath= path.join(__dirname,'/build/icons/icon.png');

const createWindow = () => {

    win = new BrowserWindow({
     width: 800,
     height: 600,
     autoHideMenuBar: true,
     icon:iconPath,
     webPreferences: {
      preload: path.join(__dirname, '/js/preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    }
   });
  
   win.loadFile('./src/index.html');
   win.maximize();
  };
  
  app.whenReady().then(() => {
  
   createWindow();
  
   app.on('activate', () => {
  
     if (BrowserWindow.getAllWindows().length === 0) {
  
       createWindow();
  
     }
  
   });
  
  });
  
  app.on('window-all-closed', () => {
  
   if (process.platform !== 'darwin') {
  
     app.quit();
  
   }
  
  });
  ipcMain.on("faltanDatos",function(event){
    console.log("Faltan datos...");
    dialog.showMessageBox(win,
      {
        type: 'warning',
        buttons: ['De acuerdo'],
        title: 'Faltan datos',
        cancelId: 99,
        message:
          'Hay que especificar tanto la asignatura como la observación que se desea registrar'
      });
  })
  ipcMain.on("dameGrupos",()=>{
    let grupos=db.dameDatos("SELECT DISTINCT GRUPO FROM alumnos ORDER BY GRUPO").then((datos)=>{

win.webContents.send("tomaGrupos",(datos))
    })
  })
  ipcMain.on("dameAlumnos",function(event,grupo){

        let grupos=db.dameDatos("SELECT * FROM alumnos WHERE GRUPO =? ORDER BY APELLIDOS",[grupo.grupo]).then((datos)=>{
    win.webContents.send("tomaAlumnos",(datos))
        })
      })

ipcMain.on('grabaImpresiones',function(event,alumno){
  db.dameDatos("INSERT INTO impresiones (fecha,alumno,asignatura,impresion,profesor) VALUES (?)",[alumno.fecha,alumno.alumno,alumno.asignatura,alumno.impresion,alumno.profesor]).then(()=>{
    win.webContents.send("impresionGrabada",alumno.alumno);
  })
})
ipcMain.on('dameImpresiones',function(event,alumno){
db.dameDatos("SELECT * FROM impresiones WHERE alumno=?",alumno).then((impresiones)=>{
win.webContents.send("tomaImpresiones",impresiones)
})
})
ipcMain.on('identificaProfe',function(event,profe){
  console.log(profe.nombre+", "+profe.NIF);
  db.dameDatos("SELECT * FROM profesores WHERE profesor='"+profe.nombre+"' AND clave='"+profe.NIF+"'").then((datos)=>{
if (datos.length==0){
  win.webContents.send("identificacionInvalida");
}else{
win.webContents.send("identificacionValida",profe);
}
  })
})

ipcMain.on("pdfAlumno", async (event, impresiones) => {
    try {
    
        // Seleccionar carpeta de destino
        const resultado = await dialog.showOpenDialog({
            title: "¿Dónde lo guardamos?",
            defaultPath: __dirname,
            buttonLabel: "Guardar",
            properties: ["openDirectory"]
        });

        if (resultado.canceled) {
            console.log("Operación cancelada por el usuario.");
            return;
        }

        const ruta = resultado.filePaths[0];
  

        // Obtener datos del alumno
        const datos = await db.dameDatos(
            "SELECT * FROM alumnos WHERE alumno='" +
            impresiones[0].alumno +
            "'"
        );

        if (!datos || datos.length === 0) {
            console.log("Alumno no encontrado.");
            return;
        }

        const nombreAlumno = datos[0].NOMBRE;
        const apellidosAlumno = datos[0].APELLIDOS;

        console.log("Nombre: " + nombreAlumno);
        console.log("Apellidos: " + apellidosAlumno);

        // Nombre del archivo
        const nombrePDF = path.join(
            ruta,
            `informacion ${apellidosAlumno} ${nombreAlumno}.pdf`
        );

        console.log("Creando PDF: " + nombrePDF);

        const doc = new PDFDocument();

        const stream = fs.createWriteStream(nombrePDF);

        doc.pipe(stream);

        // Contenido
        const imprimeCabecera = () => {
            const rutaImagen = app.isPackaged
    ? path.join(process.resourcesPath, "images", "oficio.png")
    : path.join(__dirname, "images", "oficio.png");

            doc.image(
                rutaImagen,
                50,
                15,
                { width: 400 }
            );

            doc
                .font("Times-Bold")
                .fontSize(14)
                .text("ALUMNO:", 50, 100, { continued: true })
                .font("Times-Roman")
                .text(` ${apellidosAlumno}, ${nombreAlumno}`);

            doc.moveDown(2);
        };

        imprimeCabecera();

        doc.on("pageAdded", imprimeCabecera);
        for (let i=0;i<impresiones.length;i++){
          let fecha=new Date(impresiones[i].fecha)
const fechaPDF = fecha.toLocaleDateString("es-ES");          doc
          .fontSize(12)
          .font('Times-Bold')
          .text("Fecha: ",{continued:true})
          .font('Times-Roman')
          .text (fechaPDF)
          .moveDown(1);
          doc
          .font('Times-Bold')
          .text("Profesora o profesor: ",{continued:true})
          .font('Times-Roman')
          .text(impresiones[i].asignatura)
          .moveDown(1);
          doc
          .font('Times-Bold')
          .text("Aporte: ",{continued:true})
          .font('Times-Roman')
          .text(impresiones[i].impresion)
          .moveDown(2);
       
        }
        // Cerrar el documento
        doc.end();

        stream.on("finish", () => {
            console.log("PDF generado correctamente.");
        });

        stream.on("error", (err) => {
            console.error("Error al escribir el PDF:", err);
        });

    } catch (err) {
        console.error("Error generando el PDF:", err);
    }
});

ipcMain.on("pdfGrupo", async (event, grupo) => {

    try {

        //===========================
        // Selección de carpeta
        //===========================

        const { canceled, filePaths } = await dialog.showOpenDialog({
            title: "¿Dónde lo guardamos?",
            defaultPath: __dirname,
            buttonLabel: "Guardar",
            properties: ["openDirectory"]
        });

        if (canceled) return;

        const ruta = filePaths[0];

        //===========================
        // Obtener alumnos
        //===========================

        const alumnos = await db.dameDatos(
            `SELECT * FROM alumnos WHERE GRUPO='${grupo.grupo}' ORDER BY APELLIDOS,NOMBRE`
        );

        if (alumnos.length === 0) {
            console.log("No hay alumnos.");
            return;
        }

        //===========================
        // Crear PDF
        //===========================

        const nombrePDF = path.join(
            ruta,
            `informacionGrupo ${grupo.grupo}.pdf`
        );

        const doc = new PDFDocument({
            margin: 50
        });

        doc.pipe(fs.createWriteStream(nombrePDF));
        const rutaImagen = app.isPackaged
    ? path.join(process.resourcesPath, "images", "oficio.png")
    : path.join(__dirname, "images", "oficio.png");

                              doc.image(
                rutaImagen,
                50,
                15,
                { width: 400 }
            );
            doc.y=100;
        doc.on("pageAdded",()=>{
                      doc.image(
                rutaImagen,
                50,
                15,
                { width: 400 }
            );
            doc.y=100;
        })
        //===========================
        // Recorrer alumnos
        //===========================

        for (let n = 0; n < alumnos.length; n++) {

            const alumno = alumnos[n];

    

            //---------------------------------------------------
            // Cabecera
            //---------------------------------------------------



            doc
                .font("Times-Bold")
                .fontSize(14)
                .text("ALUMNO:",{ continued: true })
                .font("Times-Roman")
                .text(` ${alumno.APELLIDOS}, ${alumno.NOMBRE}`);

            doc.moveDown(2);

            //---------------------------------------------------
            // Impresiones del alumno
            //---------------------------------------------------

            const impresiones = await db.dameDatos(
                `SELECT * FROM impresiones
                 WHERE alumno='${alumno.ALUMNO}'
                 ORDER BY fecha`
            );

            //---------------------------------------------------
            // Escribir impresiones
            //---------------------------------------------------
            if (impresiones.length==0){
                    doc
        .font("Times-Italic")
        .fontSize(12)
        .text("No hay información sobre este alumno.");

    doc.moveDown(2);
            }else{
            for (const impresion of impresiones) {

                const fecha = new Date(impresion.fecha);

          const fechaPDF = fecha.toLocaleDateString("es-ES");

                doc
                    .font("Times-Bold")
                    .fontSize(12)
                    .text("Fecha: ", { continued: true })
                    .font("Times-Roman")
                    .text(fechaPDF);

                doc
                    .font("Times-Bold")
                    .text("Profesora o profesor: ", { continued: true })
                    .font("Times-Roman")
                    .text(impresion.asignatura);

                doc
                    .font("Times-Bold")
                    .text("Aporte: ", { continued: true })
                    .font("Times-Roman")
                    .text(impresion.impresion);

                doc.moveDown(2);

            }
        }
        }

        doc.end();


    }
    catch (err) {
        console.error(err);
    }

});