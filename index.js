const { app, BrowserWindow, ipcMain ,dialog} = require('electron');
const path = require('path');


if (process.env.NODE_ENV!=='production'){
require('electron-reload')(__dirname,{

})
}
let win
//var sql = require("mssql");
let camino=path.join(__dirname,'/js/database.js')
let db=require(camino)
let  iconPath= path.join(__dirname,'/build/icon.png');

const createWindow = () => {

    win = new BrowserWindow({
     width: 800,
     height: 600,
     autoHideMenuBar: true,
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