const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld("api", {
  enviar: (datos,objeto)=>{
      ipcRenderer.send(datos,objeto);
  },
  recibir: (canal,datos)=>{
    console.log("Canal: ")
    console.log(canal)

    
    console.log("datos: ")
    console.log(datos)
      ipcRenderer.on(canal,(event,...args)=>datos(...args))
  }


  
});