import { Component, OnInit, ViewChild } from '@angular/core';
import { gTableComponent } from '../../shared/g-table/g-table.component';
import { gQueryService } from 'src/app/services/g-query.service';
import { gAuthService } from 'src/app/services/g-auth.service';

@Component({
  selector: 'app-vehiculos',
  templateUrl: './vehiculos.component.html',
  styleUrls: ['./vehiculos.component.css']
})
export class VehiculosComponent implements OnInit {
    @ViewChild('gTableVehiculos') gTableVehiculos: gTableComponent;
    DataVehiculos: any;
    User:any;
    constructor(private gQuery:gQueryService, private gAuth: gAuthService) { }

    ngOnInit(): void {
      this.gAuth.userData().subscribe((data:any) =>{
        this.User = data;
      });
      this.DataVehiculos = {
        Titulo    :   "Vehiculos", 
        Datos     :{
          Store           : "sp_vehiculos_devolver",
          
          ColumnasOcultas : ["Id"],
  
        },
        Opciones: {
          Checkbox          : false,
          DeleteSelectCheck : false,
          Filtro            : false,
        },
        Acciones: {
  
          Agregar: {
            Color       :   "green",
            Titulo      :   "Registrar Nuevo Vehiculo",
            FnAgregar: (result:any)=> {
                let parametros = 
                  result.Descripcion + "|" +
                  result.Placa        + "|" +
                  result.FechaAlta
                
                this.gQuery.sql("sp_vehiculo_registrar", parametros).subscribe((data:any)=> {
                if(data){
                  if(data[0].Resultado =="1"){
                    alert("vehiculo registrado");
                    this.gTableVehiculos.cargarData();
                  }else{
                    alert("Error al registrar el Vehiculo: " + data[0].Resultado);
                  }
                }
              })
              
              
            },
            
            Parametros: [
              { Nombre      : "Descripcion", 
                Valor       : "",
                Etiqueta    : "Descripcion", 
                Tipo        : "Texto",
                placeholder : "Descripcion", 
                Error       : "La Descripcion es requerido", 
                Patron      : "Debe ingresar al menos un caracter",
                Requerido   : true
              },
              { Nombre      : "Placa", 
                Valor       : "",
                Etiqueta    : "Placa", 
                Tipo        : "Texto", 
                placeholder : "Placa", 
                Error       : "La Placa es requerida", 
                Patron      : "Debe ingresar al menos un caracter",
                Requerido   : true
              },
              { Nombre      : "FechaAlta",
                Valor       : (new Date()).toISOString().slice(0, 10),
                Etiqueta    : "Fecha Alta",
                Tipo        : "Fecha",
                placeholder : "Seleccione la fecha de alta",
                Error       : "La fecha es requerida",
                
              },
            ],
          },
      
          Editar : {
            Color        : '#FFC107',
            Titulo       :  "Editar Vehiculo",
            FnValidacion : (result)=>{
               return true;
    
            },
            FnEditar     : (result)=>{    
              let parametros = 
                result.Id + "|" +
                result.Descripcion + "|" +
                result.Placa+ "|" + 
                result.FechaAlta;  
  
              this.gQuery.sql("sp_vehiculo_actualizar", parametros).subscribe((data:any)=> {
                if(data){
                  if(data[0].Resultado =="1"){
                    alert("Vehiculo atualizado");
                    this.gTableVehiculos.cargarData();
                  }else{
                    alert("Error al editar el Vehiculo");
                  } 
                }
              }) 
            },
  
            
            Parametros: [
              { Nombre    : "Id",
                Valor     : "",
                Tipo      : "Oculto"
              },
              { Nombre      : "Descripcion", 
                Valor       : "",
                Etiqueta    : "Descripcion", 
                Tipo        : "Texto", 
                placeholder : "Descripcion", 
                Error       : "La Descripcion es requerido", 
                Patron      : "Debe ingresar al menos un caracter",
                Requerido   : true
              }, 
              { Nombre      : "Placa", 
                Valor       : "",
                Etiqueta    : "Placa", 
                Tipo        : "Texto", 
                placeholder : "Placa", 
                Error       : "La Placa es requerida", 
                Patron      : "Debe ingresar al menos un caracter",
                Requerido   : true
              },

              { Nombre      : "FechaAlta",
                Valor       : (new Date()).toISOString().slice(0, 10),
                Etiqueta    : "Fecha Alta",
                Tipo        : "Fecha",
                placeholder : "Seleccione la fecha de alta",
                Error       : "La fecha es requerida",
                Patron      : "Debe ingresar al menos un caracter",
                Requerido   : true
                
              }
            ],
          },
    
          Eliminar: {
            Color: "#f44336",
            Store: "sp_vehiculo_baja",
            Tooltip: "Dar de baja",
            Mensaje: "¿Esta seguro de que quiere dar de baja a este vehiculo?",
            Icono: "no_transfer",
            Parametros: ["Id"],
           
            Respuestas: [
              {Resultado: "1", Mensaje: "el Vehiculo fue dado de baja" },
              {Resultado: "-1", Mensaje: "Error: El Vehiculo no pudo darse de baja" },
            ]
          },
  

        }
      }
   
  
    
  
    }
  
    ngAfterViewInit(): void {
      console.log(this.DataVehiculos);
      this.gTableVehiculos.cargarData();
    }
}
