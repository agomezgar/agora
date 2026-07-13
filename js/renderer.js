const pantallaPrincipal=document.getElementById('pantallaPrincipal');
const seleccionAlumno=document.getElementById('seleccionAlumno');
const nombreCurso=document.createElement("label");
let profesor;
nombreCurso.innerHTML="Curso: ";
seleccionAlumno.appendChild(nombreCurso);
const curso=document.createElement("select");
seleccionAlumno.appendChild(curso);
const etAlumno=document.createElement("label");
etAlumno.innerHTML="Alumna/-o: ";
seleccionAlumno.appendChild(etAlumno)
etAlumno.hidden=true;
const nombreAlumno=document.createElement("select");
const profe=document.getElementById('profe');
const NIF=document.getElementById('NIF');
const pantallaIdentificacion=document.getElementById('pantallaIdentificacion');
const identificame=document.getElementById('identificame');
const identificacion=document.getElementById('identificacion');
let identificado=false;
curso.disabled=true;
identificacion.innerHTML="Debe identificarse mediante sus iniciales y NIF";
seleccionAlumno.appendChild(nombreAlumno);
let etiquetaAsignatura=document.createElement("label");
etiquetaAsignatura.innerHTML="Asignatura: "
seleccionAlumno.appendChild(etiquetaAsignatura);
etiquetaAsignatura.hidden=true;
 let asignatura=document.createElement("input");
 seleccionAlumno.appendChild(asignatura);
 let etiquetaImpresion=document.createElement("label");
etiquetaImpresion.innerHTML="Observación: ";
seleccionAlumno.appendChild(etiquetaImpresion);
 let impresion=document.createElement("input");
seleccionAlumno.appendChild(impresion);
let boton=document.createElement("button");
seleccionAlumno.appendChild(boton);
boton.innerHTML='<i class="fa-solid fa-plus fa-beat-fade fa-lg"></i>'
boton.addEventListener('click',()=>{
    if (asignatura.value==''||impresion.value==''){
        window.api.enviar('faltanDatos');
    }else{
    let alumno={
        "fecha":new (Date),
        "alumno":nombreAlumno.value,
        "asignatura":asignatura.value,
        "impresion":impresion.value,
        "profesor":profesor.nombre
    }
    window.api.enviar("grabaImpresiones",alumno)
}
})
identificame.addEventListener('click',()=>{
    let prof={
        "nombre":profe.value,
        "NIF":NIF.value
    }
    window.api.enviar("identificaProfe",prof);
})
window.api.recibir("identificacionInvalida",()=>{
    identificacion.innerHTML="Las iniciales o el NIF proporcionados no constan como válidos"
})
window.api.recibir("identificacionValida",(profe)=>{
    pantallaIdentificacion.innerHTML="";
    curso.disabled=false;
    profesor=profe;
    console.log("Profesor identificado: "+profesor.nombre)
})
window.api.enviar("dameGrupos")
window.api.recibir("tomaGrupos",(datos)=>{
    pantallaPrincipal.hidden=true;
    nombreAlumno.hidden=true;
    etAlumno.hidden=true;
    etiquetaAsignatura.hidden=true;
    asignatura.hidden=true;
    etiquetaImpresion.hidden=true;
    impresion.hidden=true;
    boton.hidden=true;
    for (let i=0;i<datos.length;i++){
        let valor=datos[i].GRUPO;
        let opcion=document.createElement("option")
        opcion.value=valor
        opcion.text=valor
        curso.appendChild(opcion)
    }
})

curso.addEventListener('change',()=>{
    let datos={
        "grupo" : curso.options[curso.selectedIndex].value,
        "valor": curso.selectedIndex

    }
    nombreAlumno.innerHTML="";
    etAlumno.hidden=false;
    nombreAlumno.hidden=false;
    pantallaPrincipal.innerHTML="";


    window.api.enviar("dameAlumnos",datos);
})

window.api.recibir("tomaAlumnos",(datos)=>{
    let opcion=document.createElement("option");
    opcion.value="";
    opcion.text="";
    
    nombreAlumno.appendChild(opcion);
for (let i=0;i<datos.length;i++){
    let matricula=datos[i].ALUMNO;
    let nombre=datos[i].APELLIDOS+", "+datos[i].NOMBRE;
    let opcion=document.createElement("option");
    opcion.value=matricula;
    opcion.text=nombre;
    nombreAlumno.appendChild(opcion);
}
}) 

nombreAlumno.addEventListener('change',()=>{
    etiquetaAsignatura.hidden=false;
    asignatura.hidden=false;
    etiquetaImpresion.hidden=false;
    impresion.hidden=false;
    boton.hidden=false;
    asignatura.value="";
    impresion.value='';
window.api.enviar("dameImpresiones",nombreAlumno.value);
pantallaPrincipal.hidden=false; 
pantallaPrincipal.innerHTML="";  


})
window.api.recibir("impresionGrabada",(alumno)=>{
    asignatura.value="";
    impresion.value="";
    window.api.enviar("dameImpresiones",alumno);
})
window.api.recibir("tomaImpresiones",(impresiones)=>{
pantallaPrincipal.innerHTML="";
    if (impresiones.length!=0){
        pantallaPrincipal.appendChild(document.createTextNode("Número de observaciones registradas: "+impresiones.length))
        let tablaImpresiones=document.createElement("table");
        tablaImpresiones.style.border="1px solid";
        pantallaPrincipal.appendChild(tablaImpresiones);
        let filaDescripcion=document.createElement("tr")
        filaDescripcion.style.border="1px solid";
        tablaImpresiones.appendChild(filaDescripcion);
        let tituloFecha=document.createElement("td");
        tituloFecha.style.border="1px solid";
        tituloFecha.innerHTML="Fecha"
        filaDescripcion.appendChild(tituloFecha);
        let tituloAsignatura=document.createElement("td");
        tituloAsignatura.style.border="1px solid";
        tituloAsignatura.innerHTML="Asignatura";
        filaDescripcion.appendChild(tituloAsignatura);
        let tituloDescripción=document.createElement("td");
        tituloDescripción.style.border="1px solid";
        tituloDescripción.innerHTML="Observación";
        filaDescripcion.appendChild(tituloDescripción);
        for (let i=0;i<impresiones.length;i++){
            let fila=document.createElement("tr");
            tablaImpresiones.appendChild(fila)
            let fecha=document.createElement("td");
            fecha.style.border="1px solid";
            let mes=impresiones[i].fecha.getMonth()+1
            fecha.innerHTML=impresiones[i].fecha.getDate()+"/"+mes+"/"+impresiones[i].fecha.getFullYear();;
            fila.appendChild(fecha);
            let asignatura=document.createElement("td");
            asignatura.style.border="1px solid";
            asignatura.innerHTML=impresiones[i].asignatura;
            fila.appendChild(asignatura);
            let impresionR=document.createElement("td");
            impresionR.style.border="1px solid";
            impresionR.innerHTML=impresiones[i].impresion;
            fila.appendChild(impresionR);

        }
        
    }else{
        pantallaPrincipal.innerHTML="No hay observaciones registradas para la alumna o alumno"
    }
})
