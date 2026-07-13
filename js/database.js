
'use strict';

const sql2 = require('mysql');
const path=require('path');
const fs = require('fs');

let rawdata = fs.readFileSync(path.join(__dirname,'/data.json'));
let datosConexion = JSON.parse(rawdata);
const connection = sql2.createConnection({
    host: datosConexion.host,
    user: datosConexion.user,
    password: datosConexion.password,
    database: datosConexion.database,
    timezone:datosConexion.timezone
  });
  connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to the remote database!');
  });


        function dameDatos(consulta,datos2){
          return new Promise((resolve,reject)=>{
             

              connection.query(consulta,[datos2],(err,results)=>{
                if (err) {
                  console.log(err)
                }
                      
                      resolve(results)
                      
              }
            
                  )
                
                
              })
   

  }
    
  module.exports={dameDatos}