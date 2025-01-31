import { Component, OnInit, ViewChild } from '@angular/core';
import { gTableComponent } from '../../shared/g-table/g-table.component';
import { gQueryService } from 'src/app/services/g-query.service';
import { gAuthService } from 'src/app/services/g-auth.service';


@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements OnInit {
  
  @ViewChild('gTableUsers') gTableUsers: gTableComponent;
  DataUsers: any;
  User:any;
  constructor(private gQuery:gQueryService, private gAuth: gAuthService) { }

  ngOnInit(): void {
    this.gAuth.userData().subscribe((data:any) =>{
      this.User = data;
    });
    this.DataUsers = {
      Titulo    :   "Usuarios", 
      Datos     :{
        Store           : "sp_usuarios_devolver",
        OrdenColumnas   : ["Usuario","Nombre", "Tipo", "Sueldo"],
        ColumnasOcultas : ["Id", "IdTipoUsuario","Direccion", "Referencia", "posicionGPS", "FechaAlta", "Telefono", "Fecha Nacimiento"],

      },
      Opciones: {
        Checkbox          : false,
        DeleteSelectCheck : false,
        Filtro            : true,
      },
 
      Acciones: {

        Agregar: {
          Color       :   "green",
          Titulo      :   "Registrar Usuario",
          FnAgregar: (result:any)=> {
              let parametros = 
                result.Nombre           + "|" +
                result.PosicionGPS      + "|" +
                result.Direccion        + "|" +
                result.Referencia       + "|" +
                result.Telefono         + "|" +
                result.FechaNacimiento  + "|" + 
                result.pIdTipoUsuario   + "|" +
                result.Sueldo
              
              this.gQuery.sql("sp_usuario_registrar", parametros).subscribe((data:any)=> {
              if(data){
                if(data[0].Resultado =="1"){
                  alert("Usuario registrado");
                  this.gTableUsers.cargarData();
                }else{
                  alert("Error al registrar el usuario: " + data[0].Resultado);
                }
              }
            })
            
            
          },
          
          Parametros: [
            { Nombre    : "pIdTipoUsuario",
              Valor     : {Id:'0', Valor:'Anónimo'},
              Etiqueta  : "Tipo de Usuario",
              Tipo      : "ListaDinamica",
              Store     : "sp_tipousuario_devolver",  
              Resultado : { Id: "Id", Valor: "Tipo" },
              Error     : "Seleccione el Tipo Usuario",
              Requerido : true,
              
            },
            { Nombre      : "Nombre", 
              Valor       : "",
              Etiqueta    : "Nombre", 
              Tipo        : "Texto", 
              placeholder : "Nombre", 
              Error       : "El Nombre es requerido", 
              Patron      : "Debe ingresar al menos un caracter",
              Requerido   : true
            },
            { Nombre      : "PosicionGPS", 
              Valor       : "-3.7722102000000004, -73.26553229999999",
              Etiqueta    : "Mapa", 
              Tipo        : "Mapa", 
              placeholder : "Seleccione un punto en el mapa", 
              Error       : "la posicion GPS es requerida", 
              Patron      : "Debe ingresar al menos un caracter",
              Requerido   : false
            },  
            { Nombre      : "Direccion", 
              Valor       : "",
              Etiqueta    : "Direccion", 
              Tipo        : "Texto", 
              placeholder : "Direccion", 
              Error       : "La Direccion es requerida", 
              Patron      : "Debe ingresar al menos un caracter",
              Requerido   : true
            },
            { Nombre      : "Referencia", 
              Valor       : "",
              Etiqueta    : "Referencia", 
              Tipo        : "Texto", 
              placeholder : "Referencia", 
              Error       : "La Referencia es requerida", 
              Patron      : "Debe ingresar al menos un caracter",
              Requerido   : true
            },
            { Nombre      : "Telefono", 
              Valor       : "",
              Etiqueta    : "Telefono", 
              Tipo        : "Numero", 
              placeholder : "Telefono", 
              Error       : "El Teléfono es requerido", 
              Patron      : "Debe ingresar al menos un caracter",
              Requerido   : true
            },
            { Nombre      : "FechaNacimiento",
              Valor       : (new Date()).toISOString().slice(0, 10),
              Etiqueta    : "Fecha Nacimiento",
              Tipo        : "Fecha",
              placeholder : "Seleccione una fecha",
              Error       : "La fecha es requerida",
              Estilo: {width: 'calc(50% - 5px)', 'display':'inline-block', 'margin-right':'10px' }  
            },
            { Nombre      : "Sueldo", 
              Valor       : "",
              Etiqueta    : "Sueldo", 
              Tipo        : "Decimal", 
              placeholder : "Sueldo", 
              Error       : "El Sueldo es requerido", 
              Patron      : "Debe ingresar el Sueldo",
              Requerido   : true,
              Estilo: {width: 'calc(50% - 5px)', 'display':'inline-block', }  
            },
          ],
        },

        Info : {
          Color   : "#0084B5",
          Titulo  : "Información del usuario",
          Tooltip : "Información",
          Icono   : 'info',
          Parametros: [ //los "Nombre" deben estar tal cual vienen de la BD 
            { Nombre: "Tipo",             Etiqueta: "Tipo de Usuario",  Tipo: "Texto", },
            { Nombre: "Nombre",           Etiqueta: "Nombre",           Tipo: "Texto", },
            { Nombre: "posicionGPS",      Etiqueta: "Mapa",             Tipo: "Mapa", },  
            { Nombre: "Direccion",        Etiqueta: "Direccion",        Tipo: "Texto" },
            { Nombre: "Referencia",       Etiqueta: "Referencia",       Tipo: "Texto" },
            { Nombre: "Telefono",         Etiqueta: "Telefono",         Tipo: "Numero", Estilo: {width: 'calc(50% - 5px)', 'display':'inline-block', 'margin-right':'10px' }    },
            { Nombre: "Sueldo",           Etiqueta: "Sueldo",           Tipo: "Numero", Estilo: {width: 'calc(50% - 5px)', 'display':'inline-block' } },
            { Nombre: "Fecha Nacimiento", Etiqueta: "Fecha Nacimiento", Tipo: "Fecha", Estilo: {width: 'calc(50% - 5px)', 'display':'inline-block', 'margin-right':'10px' }    },
            { Nombre: "FechaAlta",        Etiqueta: "Fecha Alta",       Tipo: "Fecha",   Estilo: {width: 'calc(50% - 5px)', 'display':'inline-block' } },
          ],
        },

        
        Editar : {
          Color        : '#FFC107',
          Titulo       :  "Editar Usuario",
          FnValidacion : (result)=>{
             return true;
  
          },
          FnEditar     : (result)=>{    
            let parametros = 
              result.Id + "|" +
              result.Nombre + "|" +
              result.PosicionGPS+ "|" + 
              result.Direccion + "|" + 
              result.Referencia + "|" + 
              result.Telefono + "|" + 
              result["Fecha Nacimiento"] + "|" +
              result.IdTipoUsuario + "|" + 
              result.Sueldo;  

            this.gQuery.sql("sp_usuario_actualizar", parametros).subscribe((data:any)=> {
              if(data){
                if(data[0].Resultado =="1"){
                  alert("Usuario atualizado");
                  this.gTableUsers.cargarData();
                }else{
                  alert("Error al editar el Usuario");
                } 
              }
            }) 
          },

          // Parametros   : [ //el orden de los parámetros debe ser el mismo orden en el que se esperan en el store
          //   { Nombre    : "IdPedido",
          //     Valor     : "",
          //     Tipo      : "Oculto"
          //   },
          //   { Nombre    : "IdCliente",
          //     Valor     : {Id:'0', Valor:'Anónimo'},
          //     Etiqueta  : "Cliente",
          //     Tipo      : "ListaDinamica",
          //     Store     : "sp_clientes_devolver",  // Simulando una consulta para obtener los clientes
          //     Parametros: { "Estado": "1" },  // Puedes ajustar estos parámetros según tus necesidades
          //     Resultado : { Id: "Id", Valor: "Nombre" },
          //     Error     : "Seleccione un cliente",
          //     Requerido : true,
          //     ActualizarOtroCampo: {Campo_a_actualizar: "PosicionGPS", item_con_data: "GPS" } //al seleccionar un item del desplegable, se toma uno de los valores de este desplegable para ponerlo en un campo
          //   },
          //   { Nombre      : "Glosa", 
          //     Valor       : "",
          //     Etiqueta    : "Comentario", 
          //     Tipo        : "Texto", 
          //     placeholder : "Ingrese una Glosa", 
          //     Error       : "la Descripción es requerida", 
          //     Patron      : "Debe ingresar al menos un caracter",
          //     Requerido   : false
          //   },
          //   { Nombre      : "PosicionGPS", 
          //     Valor       : "-3.7722102000000004, -73.26553229999999",
          //     Etiqueta    : "Mapa", 
          //     Tipo        : "Mapa", 
          //     placeholder : "Seleccione un punto en el mapa", 
          //     Error       : "la posicion GPS es requerida", 
          //     Patron      : "Debe ingresar al menos un caracter",
          //     Requerido   : false
          //   },    
          //   { Nombre      : "FechaSolEntrega",
          //     // Valor       : (new Date()).toISOString().slice(0, 10),
          //     Etiqueta    : "Fecha Entrega",
          //     Tipo        : "Fecha",
          //     placeholder : "Seleccione una fecha",
          //     Error       : "La fecha es requerida",
          //     FechaMinima : new Date(),
          //     // "FechaMaxima": "2022-12-31"
          //     Estilo      : {"width": "calc(60% - 10px)" }
          //   },
          //   { Nombre      : "HoraSolEntrega",
          //     Valor       : "16:00",
          //     Etiqueta    : "Hora de Entrega",
          //     Tipo        : "Hora",
          //     MinHora     : "09:00",  // Hora mínima
          //     MaxHora     : "17:00",  // Hora máxima
          //     Error       : "Seleccione una hora válida",
          //     Requerido   : true,
          //     Estilo      : {  "width": "calc(40% - 10px)", "padding-left": "10px" }
          //   },
          // ],
          Parametros: [
            { Nombre    : "Id",
              Valor     : "",
              Tipo      : "Oculto"
            },
            { Nombre    : "IdTipoUsuario",
              Valor     : {Id:'0', Valor:'Anónimo'},
              Etiqueta  : "Tipo de Usuario",
              Tipo      : "ListaDinamica",
              Store     : "sp_tipousuario_devolver",  
              Resultado : { Id: "Id", Valor: "Tipo" },
              Error     : "Seleccione el Tipo Usuario",
              Requerido : true,
              
            },
            { Nombre      : "Nombre", 
              Valor       : "",
              Etiqueta    : "Nombre", 
              Tipo        : "Texto", 
              placeholder : "Nombre", 
              Error       : "El Nombre es requerido", 
              Patron      : "Debe ingresar al menos un caracter",
              Requerido   : true
            },
            { Nombre      : "PosicionGPS", 
              Valor       : "-3.7722102000000004, -73.26553229999999",
              Etiqueta    : "Mapa", 
              Tipo        : "Mapa", 
              placeholder : "Seleccione un punto en el mapa", 
              Error       : "la posicion GPS es requerida", 
              Patron      : "Debe ingresar al menos un caracter",
              Requerido   : false
            },  
            { Nombre      : "Direccion", 
              Valor       : "",
              Etiqueta    : "Direccion", 
              Tipo        : "Texto", 
              placeholder : "Direccion", 
              Error       : "La Direccion es requerida", 
              Patron      : "Debe ingresar al menos un caracter",
              Requerido   : true
            },
            { Nombre      : "Referencia", 
              Valor       : "",
              Etiqueta    : "Referencia", 
              Tipo        : "Texto", 
              placeholder : "Referencia", 
              Error       : "La Referencia es requerida", 
              Patron      : "Debe ingresar al menos un caracter",
              Requerido   : true
            },
            { Nombre      : "Telefono", 
              Valor       : "",
              Etiqueta    : "Telefono", 
              Tipo        : "Numero", 
              placeholder : "Telefono", 
              Error       : "El Teléfono es requerido", 
              Patron      : "Debe ingresar al menos un caracter",
              Requerido   : true,
              
            },
            { Nombre      : "Fecha Nacimiento",
              Valor       : "",
              Etiqueta    : "Fecha Nacimiento",
              Tipo        : "Fecha",
              placeholder : "Seleccione una fecha",
              Error       : "La fecha es requerida",
              Estilo: {width: 'calc(50% - 5px)', 'display':'inline-block', 'margin-right':'10px' }    
                
            },
            { Nombre      : "Sueldo", 
              Valor       : "",
              Etiqueta    : "Sueldo S/", 
              Tipo        : "Decimal", 
              placeholder : "Sueldo", 
              Error       : "El Sueldo es requerido", 
              Patron      : "Debe ingresar el sueldo",
              Requerido   : true,
              Estilo: {width: 'calc(50% - 5px)', 'display':'inline-block',  }  
               
            },
          ],
        },
  
       
        Eliminar: {
          Color: "#f44336",
          Store: "sp_usuario_baja",
          Tooltip: "Dar de baja",
          Mensaje: "¿Esta seguro de que quiere dar de baja a este usuario?",
          Icono: "person_off",
          Parametros: ["Id"],
         
          Respuestas: [
            {Resultado: "1", Mensaje: "el Usuario fue dado de baja" },
            {Resultado: "-1", Mensaje: "Error: El usuario no pudo darse de baja" },
          ]
        },

        Otros: [
          {
            Nombre      : 'RestaurarClave', //identificador unico
            Color       : "#28a745",
            Tooltip     : "Resetear clave del usuario",
            Icono       : "lock_reset",
            Tipo        : 'Accion', //Info o Accion
            Funcion     : (result)=>{
              // this.gTableUsers.cargarData();
              if(confirm("Esta acción reseteará la contraseña del usuario, ¿Desea continuar?")){
                this.gQuery.sql("sp_usuario_resetpass", result.Id).subscribe((data:any)=> {
                  if(data){
                    if(data[0].Resultado =="1"){
                      alert("Clave restaurada");
                      // this.gTableUsers.cargarData();
                    }else{
                      alert("Error al restaurar clave del Usuario");
                    } 
                  }
                }) 
              }
          
  
  
            },   
        
          }
        ],
      }
    }
 

  

  }

  ngAfterViewInit(): void {
    this.gTableUsers.cargarData();

}


}
