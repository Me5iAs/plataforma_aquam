import { Component, OnInit, ViewChild } from '@angular/core';
import { gTableComponent } from '../../shared/g-table/g-table.component';
import { gQueryService } from 'src/app/services/g-query.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { gInputDialogComponent } from '../../shared/g-inputDialog/g-input-dialog.component';

@Component({
  selector: 'app-conf-operaciones',
  templateUrl: './conf-operaciones.component.html',
  styleUrls: ['./conf-operaciones.component.css']
})
export class ConfOperacionesComponent implements OnInit {
  

  @ViewChild('gTableTipoOperacion') gTableTipoOperacion: gTableComponent;
  @ViewChild('gTableCajas') gTableCajas: gTableComponent;
  @ViewChild('gTableImpuestos') gTableImpuestos: gTableComponent;
  @ViewChild('gTableMedios') gTableMedios: gTableComponent;
  @ViewChild('gInputs') gInputs: gInputDialogComponent
  
  DataTipoOperacion: any;
  DataCajas:any; 
  DataImpuestos:any
  DataMedios:any

  OperacionSel = false;
  lstOperaciones = [];
  OperacionForm = new FormGroup({ IdTipoOperacion: new FormControl(null, Validators.required) });
  constructor(private gQuery:gQueryService) { }

  ngOnInit(): void {

    // this.lstOperaciones = this.lstOperaciones.find(item => item.Naturaleza=='2');
    this.CargarOperaciones()


    this.DataTipoOperacion = {
      Titulo  : "Tipos de Operación",
      Datos   : {
        Store : "sp_tipo_operacion_devolver",
        ColumnasOcultas   : ["Id", "Impuesto", "IdImpuesto", "Formula", "Metodo", "Estado"],
        ColumnasEtiquetas : [{Columna: "Abreviatura", Etiqueta: "Impuesto"},],   
        ColumnasEstilos   : [ {Columna  : "Naturaleza",   Estilo  : {"text-align": "center"}},
                              {Columna  : "Abreviatura",  Estilo  : {"text-align": "center"}}],
        ColumnasIcono     : [
          { Columna : "Naturaleza",
            Icono   : [ 
                        {Valor: "0", Etiqueta: "Egresos",   Icono: "logout",                Estilo: {color:"#f44336", cursor:"help" }},
                        {Valor: "1", Etiqueta: "Ingresos",  Icono: "login",                 Estilo: {color:"#28A745", cursor:"help"}},
                        {Valor: "2", Etiqueta: "Neutro",    Icono: "radio_button_checked",  Estilo: {color:"#FFC107", cursor:"help"}},
                      ], },
        ]
      },
      Opciones: {
        Checkbox          : false,
        DeleteSelectCheck : false,
        Filtro            : true,
        // Paginacion: {Op: [20,30,50, 100, 200],Size: 20},
      },
      Acciones: {
        // Agregar: {
        //   Color: "green",
        //   Titulo: "Registrar Nuevo Tipo de Operación",
        //   FnAgregar: (result: any) => {
        //     let parametros = 
        //       result.TipoOperacion + "|" + 
        //       result.Descripcion + "|" + 
        //       result.Naturaleza;
    
        //     this.gQuery.sql("sp_tipo_operacion_registrar", parametros).subscribe((data: any) => {
        //       if (data && data[0].Resultado == "1") {
        //         // this.CargarListaOperaciones();
        //         this.gTableTipoOperacion.cargarData();
        //       } else {
        //         alert("Error: " + data[0]?.Mensaje);
        //       }
        //     });
        //   },
        //   Parametros: [
        //     { Nombre: "TipoOperacion",
        //       Valor: "",
        //       Etiqueta: "Tipo de Operación",
        //       Tipo: "Texto",
        //       placeholder: "Ingrese el Tipo de Operación",
        //       Error: "El Tipo de Movimiento es requerido",
        //       Patron: "ingrese el Tipo de Operación",
        //       Requerido: true
        //     },
        //     { Nombre: "Descripcion",
        //       Valor: "",
        //       Etiqueta: "Tipo de Descripción",
        //       Tipo: "Texto",
        //       placeholder: "Ingrese la Descripción",
        //       Error: "El Tipo de Descripción es obligatorio",
        //       Patron: "Ingrese la Descripción",
        //       Requerido: true
        //     },
        //     { Nombre: "Naturaleza",
        //       Valor: "",
        //       Etiqueta: "Naturaleza",
        //       Tipo: "Lista",
        //       Lista: [
        //         { Id: "0", Valor: "Egresos" },
        //         { Id: "1", Valor: "Ingresos" },
        //         { Id: "2", Valor: "Neutro" }
        //       ],
        //       placeholder: "Seleccione la Naturaleza del Tipo de Movimiento",
        //       Requerido: true
        //     }
       
        //   ]
        // },
        
        Editar: {
          Color: "#FFC107",
          Titulo: "Editar Tipo de Operación",
          FnValidacion: (result: any) => true,
          FnEditar: (result: any) => {
            let parametros =
              result.Id + "|" +
              result.TipoOperacion + "|" + 
              result.Descripcion + "|" + 
              result.Naturaleza + "|" + 
              result.IdImpuesto;
    
            this.gQuery.sql("sp_tipo_operacion_actualizar", parametros).subscribe((data: any) => {
              if (data && data[0].Resultado == "1") {
                alert("Tipo de operación actualizado con éxito");
                this.gTableTipoOperacion.cargarData();
                this.CargarOperaciones()
                // this.CargarListaOperaciones();
               }else{
                alert("Error: " + data[0]?.Mensaje);
              }
            });
          },
          Parametros: [
            { Nombre: "Id",
              Valor: "",
              Tipo: "Oculto"
            },
            { Nombre: "TipoOperacion",
              Valor: "",
              Etiqueta: "Tipo de Operación",
              Tipo: "Texto",
              placeholder: "Ingrese el Tipo de Operación",
              Error: "El Tipo de Operación es requerido",
              Patron: "ingrese el Tipo de Operación",
              Requerido: true,
              // IniciaDeshabilitado: true
            },
            { Nombre: "Descripcion",
              Valor: "",
              Etiqueta: "Tipo de Descripción",
              Tipo: "Texto",
              placeholder: "Ingrese la Descripción",
              Error: "El Tipo de Descripción es obligatorio",
              Patron: "Ingrese la Descripción",
              Requerido: true
            },
            { Nombre: "Naturaleza",
              Valor: "",
              Etiqueta: "Naturaleza",
              Tipo: "Lista",
              Lista: [
                { Id: "0", Valor: "Egresos" },
                { Id: "1", Valor: "Ingresos" },
                { Id: "2", Valor: "Neutro" }
              ],
              placeholder: "Seleccione la Naturaleza del Tipo de Operación",
              Requerido: true
            },
            { Nombre: "IdImpuesto",
              // Valor: { Id: this.User?.Id, Valor: this.User?.Usuario },
              Etiqueta: "Impuesto",
              Tipo: "ListaDinamica",
              Store: "sp_impuestos_devolver",
              Parametros: "1",
              Resultado: { Id: "Id", Valor: "Abreviatura" },
              Error: "Seleccione el Impuesto",
              Requerido: false,

            },
          ]
        },

        // Eliminar: {
          
        //   Color: "#f44336",
        //   Store: "sp_tipo_operacion_eliminar",
        //   Tooltip: "Eliminar Tipo de Opeación",
        //   Mensaje: "¿Está seguro de que quiere eliminar este Tipo de Opeación?",
        //   Icono: "delete_forever",
        //   Parametros: ["Id"],
        //   Respuestas: [
        //     { Resultado: "1", Mensaje: "El Tipo de Opeación fue eliminado correctamente" },
        //     { Resultado: "-1", Mensaje: "El Tipo de Opeación no existe o ya está inactivo." }
        //   ]
        // },

        Otros: [
          // { Nombre: 'AsignarMetodo',
          //   Color: "rgb(40, 167, 69)",
          //   Tooltip: "Medio de Pago",
          //   Icono: "price_change",
          //   Tipo: 'Accion',
          //   Funcion: (row) => {
          //     if(row.Naturaleza =="2"){
          //       alert("no se puede asignar un medio de pago a una operación neutra")
          //       return;
          //     }

          //     this.gQuery.sql("sp_tipo_operacion_medio_pago_devolver", row.Id).subscribe((data: any) => {
          //       if(data){
          //         this.gInputs.data = {
          //           titulo: 'Medios de Pago Asignados',
          //           tipo: 'icono',
          //           ancho: '400px',
          //           icono: 'edit',
          //           formulario: [],
          //           ok: (result) => {
          //           console.log(result);
          //           const resultado =  JSON.stringify(result).replace(/\\"/g, '"').replace(/^"|"$|\\/g, '');
          //           const parametros = 
          //             row.Id + '|' + resultado;
          //             this.gQuery.sql("sp_tipo_operacion_medio_pago_registrar",parametros).subscribe((data: any) => {
          //               if (data && data[0]?.Resultado == "1") {
          //                 alert("los Medios de pago fueron asignados exitosamente");
          //                 // this.gTableImpuestos.cargarData();
          //               } else {
          //                 alert("Error al asignar los medios de pago");
          //               }
          //             });
          //           }
          //         };
  
          //         data.forEach((element: any) => {
          //           this.gInputs.data.formulario.push({
          //             nombre: element.Etiqueta,
          //             Etiqueta: element.Etiqueta,
                      
          //             tipo: "select",
          //             opciones: [{ Id: "1", valor: "Asignado" }, { Id: "0", valor: "No Asignado" }],
          //             valorDefecto: element.Asignado,
          //             Requerido: true
          //           });
          //         });
          //         this.gInputs.openDialog();
          //       }
          //     })
          
           
          //   },
          // },
          // { Nombre: 'AsignarCajas',
          //   Color: "#048979",
          //   Tooltip: "Cajas Asignadas",
          //   Icono: "savings",
          //   Tipo: 'Accion',
          //   Funcion: (row) => {
          //     if(row.Naturaleza =="2"){
          //       alert("no se puede asignar una caja a una operación neutra")
          //       return;
          //     }

          //     this.gQuery.sql("sp_tipo_operacion_cajas_devolver", row.Id).subscribe((data: any) => {
          //       if(data){
          //         this.gInputs.data = {
          //           titulo: 'Cajas Asignadas',
          //           tipo: 'icono',
          //           ancho: '300px',
          //           icono: 'edit',
          //           formulario: [],
          //           ok: (result) => {
          //           console.log(result);
          //           const resultado =  JSON.stringify(result).replace(/\\"/g, '"').replace(/^"|"$|\\/g, '');
          //           const parametros = 
          //             row.Id + '|' + resultado;
                     
                      
          //             console.log(parametros);
          //             this.gQuery.sql("sp_tipo_operacion_cajas_registrar",parametros).subscribe((data: any) => {
          //               if (data && data[0]?.Resultado == "1") {
          //                 alert("Las cajas fueeron asignadas exitosamente");
          //                 this.gTableImpuestos.cargarData();
          //               } else {
          //                 alert("Error al asignar las cajas");
          //               }
          //             });
          //           }
          //         };

              
                
          //         data.forEach((element: any) => {
          //           this.gInputs.data.formulario.push({
          //             nombre: element.Caja,
          //             Etiqueta: element.Caja,
                      
          //             tipo: "select",
          //             opciones: [{ Id: "1", valor: "Asignado" }, { Id: "0", valor: "No Asignado" }],
          //             valorDefecto: element.Asignado,
          //             Requerido: true
          //           });
          //         });
          //         this.gInputs.openDialog();
          //       }
          //     })
          
           
          //   },
          // },
          // { Nombre: 'AsignarImpuestos',
          //   Color: "#0084b5",
          //   Tooltip: "Impuestos Asignados",
          //   Icono: "gavel",
          //   Tipo: 'Accion',
          //   Funcion: (row) => {

          //     this.gQuery.sql("sp_tipo_operacion_impuestos_devolver", row.Id).subscribe((data: any) => {
          //       if(data){
          //         this.gInputs.data = {
          //           titulo: 'Impuestos Asignados',
          //           tipo: 'icono',
          //           ancho: '300px',
          //           icono: 'edit',
          //           formulario: [],
          //           ok: (result) => {
          //           console.log(result);
          //           const resultado =  JSON.stringify(result).replace(/\\"/g, '"').replace(/^"|"$|\\/g, '');
          //           const parametros = 
          //             row.Id + '|' + resultado;
                     
                      
          //             console.log(parametros);
          //             this.gQuery.sql("sp_tipo_operacion_impuestos_registrar",parametros).subscribe((data: any) => {
          //               if (data && data[0]?.Resultado == "1") {
          //                 alert("Los impuestos fueeron regitrados/actualizados exitosamente");
          //                 this.gTableImpuestos.cargarData();
          //               } else {
          //                 alert("Error al asignar los impuestos");
          //               }
          //             });
          //           }
          //         };

              
                
          //         data.forEach((element: any) => {
          //           this.gInputs.data.formulario.push({
          //             nombre: element.Abreviatura,
          //             Etiqueta: element.Abreviatura,
                      
          //             tipo: "select",
          //             opciones: [{ Id: "1", valor: "Asignado" }, { Id: "0", valor: "No Asignado" }],
          //             valorDefecto: element.Asignado,
          //             Requerido: true
          //           });
          //         });
          //         this.gInputs.openDialog();
          //       }
          //     })
          
           
          //   },
          // },
          // {
          //   Nombre: "SeleccionarImpuestos",
          //   Color: "#4CAF50",
          //   Tooltip: "Asignar Impuestos a la operación",
          //   Icono: "e90e",
          //   Tipo: "Accion",
          //   Funcion: (row: any) => {
          //     this.gQuery.sql("sp_impuestos_activar", row.Id).subscribe((data: any) => {
          //       if (data && data[0].Resultado == "1") {
          //         alert("El impuesto fue activado con éxito");
          //         this.gTableImpuestos.cargarData();
          //       } else {
          //         alert("Error: " + data[0].Mensaje);
          //       }
          //     });
          //   }
          // }
        ]
      }
    };

    this.DataImpuestos = {
      Titulo: "Impuestos",
      Datos: {
        Store: "sp_impuestos_devolver",
        Parametros: "2",
        ColumnasOcultas: ["Id", "Met"],
        ColumnasIcono: [
          { Columna : "Estado",
            Icono   : [ 
                        {Valor: "0", Etiqueta: "Inactivo",    Icono: "highlight_off",         Estilo: {color:"#f44336", cursor:"help" }},
                        {Valor: "1", Etiqueta: "Activo", Icono: "check_circle_outline",  Estilo: {color:"#28A745", cursor:"help"}},
                      ], 
          }
        ],
        ColumnasEstilos: [
          { Columna: "Abreviatura", Estilo  : {"text-align": "left"}},
          { Columna: "Estado",      Estilo  : {"text-align": "center"}},
          { Columna: "Formula",     Estilo  : {"text-align": "right", "padding-right": "10px"}}
        ],
      },
      Opciones: {
        Checkbox: false,
        DeleteSelectCheck: false,
        Filtro: true,
        Paginacion: {Op: [20,30,50, 100, 200],Size: 20},
      },
      Acciones: {
        Agregar: {
          Color: "green",
          Titulo: "Registrar Nuevo Impuesto",
          FnValidacion: (result: any) => {

            const porcentajeRegex = /^\d+(\.\d{1,2})?%$/;
            if (porcentajeRegex.test(result.Formula) == false){
              alert("La fórmula debe ser un porcentaje válido (ej. 18%)");
              return false;
            }           
            return true;

          },
          FnAgregar: (result: any) => {
            let parametros = 
              result.Nombre + "|" +  
              result.Abreviatura + "|" + 
              result.Formula + "|" + 
              result.Metodo;
    
            this.gQuery.sql("sp_impuestos_registrar", parametros).subscribe((data: any) => {
              if (data && data[0].Resultado == "1") {
                // alert("Cuenta contable registrada con éxito");
                this.gTableImpuestos.cargarData();
              } else {
                alert("Error: " + data[0]?.Mensaje);
              }
            });
          },
          Parametros: [
            { Nombre: "Nombre",
              Valor: "",
              Etiqueta: "Nombre",
              Tipo: "Texto",
              placeholder: "Ingrese el Nombre",
              Error: "El Nombre del impuesto es requerido",
              Patron: "ingrese el Nombre",
              Requerido: true
            },
            { Nombre: "Abreviatura",
              Valor: "",
              Etiqueta: "Abreviatura",
              Tipo: "Texto",
              placeholder: "Abreviatura",
              Error: "La Abreviatura es requerida",
              Patron: "ingrese la Abreviatura",
              Requerido: true
            },
            { Nombre: "Formula",
              Valor: "",
              Etiqueta: "Ingrese Formula (ej. 18%)",
              Tipo: "Texto",
              placeholder: "Ingrese el Etiqueta",
              Patron: "Sólo es requerido si el concepto es calculado",
              Requerido: false
            },   
            { Nombre: "Metodo",
              Valor: "",
              Etiqueta: "Metodo",
              Tipo: "Lista",
              Lista: [
                { Id: "1", Valor: "Reversible" },
                { Id: "0", Valor: "Directo" }
              ],
              placeholder: "Seleccione el Metodo del cálculo del Impuesto",
              Requerido: true
            }   
          ]
        },
        
        Editar: {
          Color: "#FFC107",
          Titulo: "Editar impuesto contable",
          FnValidacion: (result: any) => {
            const porcentajeRegex = /^\d+(\.\d{1,2})?%$/;
            if (porcentajeRegex.test(result.Formula) == false){
              alert("La fórmula debe ser un porcentaje válido (ej. 18%)");
              return false;
            }
            return true;
          },
          FnEditar: (result: any) => {

            let parametros =
              result.Id + "|" +
              result.Nombre + "|" +  
              result.Abreviatura + "|" + 
              result.Formula + "|" + 
              result.Met;
    
            this.gQuery.sql("sp_impuestos_actualizar", parametros).subscribe((data: any) => {
              if (data && data[0].Resultado == "1") {
                alert("impuesto actualizado con éxito");
                this.gTableImpuestos.cargarData();
              }  else {
                alert("Error: " + data[0]?.Mensaje);
              }
            });
          },
          Parametros: [
            {
              Nombre: "Id",
              Valor: "",
              Tipo: "Oculto"
            },
            { Nombre: "Nombre",
              Valor: "",
              Etiqueta: "Nombre",
              Tipo: "Texto",
              placeholder: "Ingrese el Nombre",
              Error: "El Nombre del impuesto es requerido",
              Patron: "ingrese el Nombre",
              Requerido: true
            },
            { Nombre: "Abreviatura",
              Valor: "",
              Etiqueta: "Abreviatura",
              Tipo: "Texto",
              placeholder: "Abreviatura",
              Error: "La Abreviatura es requerida",
              Patron: "ingrese la Abreviatura",
              Requerido: true
            },
            { Nombre: "Formula",
              Valor: "",
              Etiqueta: "Ingrese Formula (ej. 18%)",
              Tipo: "Texto",
              placeholder: "Ingrese el Etiqueta",
              Patron: "Sólo es requerido si el concepto es calculado",
              Requerido: false
            }, 
            { Nombre: "Met",
              Valor: "",
              Etiqueta: "Metodo",
              Tipo: "Lista",
              Lista: [
                { Id: "1", Valor: "Reversible" },
                { Id: "0", Valor: "Directo" }
              ],
              placeholder: "Seleccione el Metodo del cálculo del Impuesto",
              Requerido: true
            }   
          ]
        },

        Eliminar: {
          Color: "#f44336",
          Store: "sp_impuestos_eliminar",
          Tooltip: "Deactivar impuesto",
          Mensaje: "¿Está seguro de que quiere desactivar este impuesto?",
          Icono: "delete_forever",
          Reactivar: {
            Store: "sp_impuestos_activar",
            Color: "#4CAF50",
            Tooltip: "Reactivar Impuesto",
            Mensaje: "¿Está seguro de que quiere reactivar este Impuesto?",
            Icono: "  restore_from_trash",
            Estado: { Columna: "Estado"},
            Respuestas: [
              { Resultado: "1", Mensaje: "El Impuesto fue reactivado correctamente" },
              { Resultado: "-1", Mensaje: "El Impuesto fue no existe o ya está activo." }
            ]
          },
          Parametros: ["Id"],
          Respuestas: [
            { Resultado: "1", Mensaje: "El impuesto fue desactivado correctamente" },
            { Resultado: "-1", Mensaje: "El impuesto no existe o ya está inactivo." }
          ]
        },

        // Otros: [
        //   {
        //     Nombre: "ActivarImpuesto",
        //     Color: "#4CAF50",
        //     Tooltip: "Reactivar Impuesto",
        //     Icono: "autorenew",
        //     Tipo: "Accion",
        //     Funcion: (row: any) => {
        //       this.gQuery.sql("sp_impuestos_activar", row.Id).subscribe((data: any) => {
        //         if (data && data[0].Resultado == "1") {
        //           alert("El impuesto fue activado con éxito");
        //           this.gTableImpuestos.cargarData();
        //         } else {
        //           alert("Error: " + data[0].Mensaje);
        //         }
        //       });
        //     }
        //   }
        // ]
      }
    };
 
    this.DataCajas = {
      Titulo: "Cajas",
      Datos: {
        Store: "sp_cajas_devolver",
        Parametros:"2",
        ColumnasOcultas: ["Id"],
        ColumnasEstilos: [
          {Estado : {"text-align": "center"}},
          {Tipo : {"text-align": "center"}},

      ],
        ColumnasIcono: [
          { Columna : "Estado",
            Icono   : [   
                        {Valor: "0", Etiqueta: "Caja Inactiva", Icono: "highlight_off",         Estilo: {color:"#f44336", cursor:"help" }},
                        {Valor: "1", Etiqueta: "Caja Activa",   Icono: "check_circle_outline",  Estilo: {color:"#0084b5", cursor:"help"}},
                      ], 
          },
          { Columna : "Tipo",
            Icono   : [ 
                        {Valor: "1", Etiqueta: "Dinero en Efectivo",  Icono: "request_quote",      Estilo: {color:"#28A745", cursor:"help" }},
                        {Valor: "2", Etiqueta: "Dinero en Banco",     Icono: "account_balance",   Estilo: {color:"#28A745", cursor:"help"}},
                      ], 
          }
        ],
      },
      Opciones: {
        Checkbox: false,
        DeleteSelectCheck: false,
        Filtro: true,
        // Paginacion: {Op: [20,30,50, 100, 200],Size: 20},
      },
      Acciones: {
        Agregar: {
          Color: "green",
          Titulo: "Registrar Nueva Caja",
          FnValidacion: (result: any) => {       
            return true;

          },
          FnAgregar: (result: any) => {
            let parametros = 
              result.Caja + "|" +  
              result.Descripcion + "|" + 
              result.Tipo;
    
            this.gQuery.sql("sp_cajas_registrar", parametros).subscribe((data: any) => {
              if (data && data[0].Resultado == "1") {
                // alert("Cuenta contable registrada con éxito");
                this.gTableCajas.cargarData();
              } else {
                alert("Error: " + data[0]?.Mensaje);
              }
            });
          },
          Parametros: [
            { Nombre: "Caja",
              Valor: "",
              Etiqueta: "Caja",
              Tipo: "Texto",
              placeholder: "Ingrese el Caja",
              Error: "El Nombre de la Caja es requerido",
              Patron: "ingrese el Caja",
              Requerido: true
            },
            { Nombre: "Descripcion",
              Valor: "",
              Etiqueta: "Descripción",
              Tipo: "Texto",
              placeholder: "Ingrese la Descripción",
              Error: "La Descripción es requerida",
              Patron: "ingrese la Descripción",
              Requerido: true
            },  
            { Nombre: "Tipo",
              Valor: "",
              Etiqueta: "Tipo de Pago",
              Tipo: "Lista",
              Lista: [
                { Id: "1", Valor: "Dinero en Efecitvo" },
                { Id: "2", Valor: "Dinero en el Banco" }
              ],
              placeholder: "Seleccione el Tipo de pago",
              Requerido: true
            }       
          ]
        },
        
        Editar: {
          Color: "#FFC107",
          Titulo: "Editar Caja",
          FnValidacion: (result: any) => {
           
            return true;
          },
          FnEditar: (result: any) => {

            let parametros =
              result.Id + "|" +
              result.Caja + "|" +  
              result.Descripcion + "|" + 
              result.Tipo;
    
            this.gQuery.sql("sp_cajas_actualizar", parametros).subscribe((data: any) => {
              if (data && data[0].Resultado == "1") {
                alert("Caja actualizada con éxito");
                this.gTableCajas.cargarData();
              }  else {
                alert("Error: " + data[0]?.Mensaje);
              }
            });
          },
          Parametros: [
            {
              Nombre: "Id",
              Valor: "",
              Tipo: "Oculto"
            },
            { Nombre: "Caja",
              Valor: "",
              Etiqueta: "Caja",
              Tipo: "Texto",
              placeholder: "Ingrese el Caja",
              Error: "El Nombre de la Caja es requerido",
              Patron: "ingrese el Caja",
              Requerido: true
            },
            { Nombre: "Descripcion",
              Valor: "",
              Etiqueta: "Descripción",
              Tipo: "Texto",
              placeholder: "Ingrese la Descripción",
              Error: "La Descripción es requerida",
              Patron: "ingrese la Descripción",
              Requerido: true
            },  
            { Nombre: "Tipo",
              Valor: "",
              Etiqueta: "Tipo de Pago",
              Tipo: "Lista",
              Lista: [
                { Id: "1", Valor: "Dinero en Efecitvo" },
                { Id: "2", Valor: "Dinero en el Banco" }
              ],
              placeholder: "Seleccione el Tipo de pago",
              Requerido: true
            }                
          ]
        },

        Eliminar: {
          Color: "#f44336",
          Store: "sp_cajas_eliminar", 
          Tooltip: "Desactivar Caja",
          Mensaje: "¿Está seguro de que quiere desactivar esta Caja?",
          Icono: "delete_forever",
          Reactivar: {
            Store: "sp_cajas_activar",
            Color: "#4CAF50",
            Tooltip: "Reactivar Caja",
            Mensaje: "¿Está seguro de que quiere reactivar esta Caja?",
            Icono: "  restore_from_trash",
            Estado: { Columna: "Estado"},
            Respuestas: [
              { Resultado: "1", Mensaje: "La Caja fue reactivada correctamente" },
              { Resultado: "-1", Mensaje: "La Caja fue no existe o ya está activa." }
            ]
          },
          Parametros: ["Id"],
          Respuestas: [
            { Resultado: "1", Mensaje: "La Caja fue desactivada correctamente" },
            { Resultado: "-1", Mensaje: "La Caja fue no existe o ya está inactiva." }
          ]
        },

        // Otros: [
        //   {
        //     Nombre: "ActivarCaja",
        //     Color: "#4CAF50",
        //     Tooltip: "Activar Caja",
        //     Icono: "autorenew",
        //     Tipo: "Accion",
        //     Funcion: (row: any) => {
        //       if(row.Estado =="1"){
        //        alert("Esta caja ya está activada");
        //       }else{
        //         this.gQuery.sql("sp_cajas_activar", row.Id).subscribe((data: any) => {
        //           if (data && data[0].Resultado == "1") {
        //             alert("La Caja fue activada con éxito");
        //             this.gTableCajas.cargarData();
        //           } else {
        //             alert("Error: " + data[0].Mensaje);
        //           }
        //         });
        //       }

        //     }
        //   }
        // ]
      }
    };

    this.DataMedios = {
      Titulo  : "Medios de Pago",
      Datos   : {
        Store : "sp_tipo_operacion_medio_pago_devolver",
        Parametros: "2000",
        // Descripcion: {
        //   Estilo: { "width":"90%", "font-size": "12px", "margin-top": "10px","padding": "10px",
        //             "box-sizing": "border-box",
        //             "text-align": "justify",
        //             "border-radius": "5px;",
        //             "box-shadow": "1px 1px 3px 3px rgba(0, 0, 0, 0.12)",
        //             "color": "rgba(0, 0, 0, .54)"},
        //   Mensaje: "En esta opción se muestran todos los Medios de Pago soportados por el sistema. desde aquí podrá asignar Cajas personalizadas a cada medio de pago, así como desactivar aquellos medios de pago que su empresa no requieran."
        // },
        ColumnasOcultas   : ["Id", "Tipo", "Estado"],
        ColumnasEtiquetas : [
                              { Columna: "MedioPago", Etiqueta: "Medio de Pago"},
                              { Columna: "Etiqueta",  Etiqueta: "Abreviatura"},
                              { Columna: "Asignado",  Etiqueta: "Activado"},
                            ],   
        ColumnasEstilos   : [ {Columna  : "Asignado",   Estilo  : {"text-align": "center"}}],
        ColumnasClick     : [
                              {Columna: "Asignado", Accion: (result)=>{
                                let Estado = 0
                                if(result.Estado =="0"){
                                Estado = 1;
                                }
                                this.gQuery.sql("sp_tipo_operacion_medio_pago_actualizar", 
                                  this.OperacionForm.value.IdTipoOperacion + "|" + result.Id 
                                ).subscribe(()=> {
                                  this.gTableMedios.cargarData();
                                })
                              }}
                            ],
        ColumnasIcono     : [
          { Columna : "Asignado",
            Icono   : [ 
                        {Valor: "0", Etiqueta: "No Asignado", Icono: "check_box_outline_blank", Estilo: {color:"#f44336", cursor:"pointer" }},
                        {Valor: "1", Etiqueta: "Asignado",    Icono: "check_box",               Estilo: {color:"#28A745", cursor:"pointer" }},
                      ], },
        ]
      },
      Opciones: {
        Checkbox          : false,
        DeleteSelectCheck : false,
        Filtro            : true,
        // Paginacion: {Op: [20,30,50, 100, 200],Size: 20},
      },
      Acciones: {
     
        // Eliminar: {
        //   Reactivar: {
        //     Store: "sp_medios_pago_reactivar",
        //     Color: "#4CAF50",
        //     Tooltip: "Reactivar Medio de Pago",
        //     Mensaje: "¿Está seguro de que quiere reactivar este Medio de Pago?",
        //     Icono: "  restore_from_trash",
        //     Estado: { Columna: "Estado"},
        //     Respuestas: [
        //       { Resultado: "1", Mensaje: "El Medio de pago fue reactivado correctamente" },
        //       { Resultado: "-1", Mensaje: "El Medio de Pago no existe o ya está activo." }
        //     ]
        //   },
        //   Color: "#f44336",
        //   Store: "sp_medios_pago_desactivar",
        //   Tooltip: "Desactivar Medio de Pago",
        //   Mensaje: "¿Está seguro de que quiere desactivar este medio de pago?",
        //   Icono: "delete_forever",
        //   Parametros: ["Id"],
        //   Respuestas: [
        //     { Resultado: "1", Mensaje: "El Medio de Pago fue desactivado correctamente" },
        //     { Resultado: "-1", Mensaje: "El Medio de Pago existe o ya está inactivo." }
        //   ]
        // },

        Otros: [

          { Nombre: 'AsignarCajas',
            Color: "#048979",
            Tooltip: "Cajas Asignadas",
            Icono: "savings",
            Tipo: 'Accion',
            Funcion: (row) => {
        
              if(row.Asignado =="0"){
                alert("No se pueden asignar cajas a medios de pagos que no han sido activados para esta operacion");
                return false;
              }

              this.gQuery.sql("sp_tipo_operacion_medio_cajas_devolver", this.OperacionForm.value.IdTipoOperacion + "|" + row.Id).subscribe((data: any) => {
                if(data){
                  this.gInputs.data = {
                    titulo: 'Cajas Asignadas',
                    tipo: 'icono',
                    ancho: '300px',
                    icono: 'edit',
                    formulario: [],
                    ok: (result) => {
                    console.log(result);
                    const resultado =  JSON.stringify(result).replace(/\\"/g, '"').replace(/^"|"$|\\/g, '');
                    const parametros = 
                      this.OperacionForm.value.IdTipoOperacion + "|" + 
                      row.Id + '|' + resultado;
                     
                      
                      // console.log(parametros);
                      // return;
                      this.gQuery.sql("sp_tipo_operacion_medio_cajas_registrar",parametros).subscribe((data: any) => {
                        if (data && data[0]?.Resultado == "1") {
                          alert("Las cajas fueeron asignadas exitosamente");
                          this.gTableImpuestos.cargarData();
                        } else {
                          alert("Error al asignar las cajas");
                        }
                      });
                    }
                  };

              
                
                  data.forEach((element: any) => {
                    this.gInputs.data.formulario.push({
                      nombre: element.Caja,
                      Etiqueta: element.Caja,
                      
                      tipo: "select",
                      opciones: [{ Id: "1", valor: "Asignado" }, { Id: "0", valor: "No Asignado" }],
                      valorDefecto: element.Asignado,
                      Requerido: true
                    });
                  });
                  this.gInputs.openDialog();
                }
              })
          
           
            },
          },
          // { Nombre: 'AsignarImpuestos',
          //   Color: "#0084b5",
          //   Tooltip: "Impuestos Asignados",
          //   Icono: "gavel",
          //   Tipo: 'Accion',
          //   Funcion: (row) => {

          //     this.gQuery.sql("sp_tipo_operacion_impuestos_devolver", row.Id).subscribe((data: any) => {
          //       if(data){
          //         this.gInputs.data = {
          //           titulo: 'Impuestos Asignados',
          //           tipo: 'icono',
          //           ancho: '300px',
          //           icono: 'edit',
          //           formulario: [],
          //           ok: (result) => {
          //           console.log(result);
          //           const resultado =  JSON.stringify(result).replace(/\\"/g, '"').replace(/^"|"$|\\/g, '');
          //           const parametros = 
          //             row.Id + '|' + resultado;
                     
                      
          //             console.log(parametros);
          //             this.gQuery.sql("sp_tipo_operacion_impuestos_registrar",parametros).subscribe((data: any) => {
          //               if (data && data[0]?.Resultado == "1") {
          //                 alert("Los impuestos fueeron regitrados/actualizados exitosamente");
          //                 this.gTableImpuestos.cargarData();
          //               } else {
          //                 alert("Error al asignar los impuestos");
          //               }
          //             });
          //           }
          //         };

              
                
          //         data.forEach((element: any) => {
          //           this.gInputs.data.formulario.push({
          //             nombre: element.Abreviatura,
          //             Etiqueta: element.Abreviatura,
                      
          //             tipo: "select",
          //             opciones: [{ Id: "1", valor: "Asignado" }, { Id: "0", valor: "No Asignado" }],
          //             valorDefecto: element.Asignado,
          //             Requerido: true
          //           });
          //         });
          //         this.gInputs.openDialog();
          //       }
          //     })
          
           
          //   },
          // },
          // {
          //   Nombre: "SeleccionarImpuestos",
          //   Color: "#4CAF50",
          //   Tooltip: "Asignar Impuestos a la operación",
          //   Icono: "e90e",
          //   Tipo: "Accion",
          //   Funcion: (row: any) => {
          //     this.gQuery.sql("sp_impuestos_activar", row.Id).subscribe((data: any) => {
          //       if (data && data[0].Resultado == "1") {
          //         alert("El impuesto fue activado con éxito");
          //         this.gTableImpuestos.cargarData();
          //       } else {
          //         alert("Error: " + data[0].Mensaje);
          //       }
          //     });
          //   }
          // }
        ]
      }
    };
  }



 ngAfterViewInit(): void {
    this.gTableTipoOperacion.cargarData();
    this.gTableCajas.cargarData();
    this.gTableImpuestos.cargarData();
    // this.gTableMedios.cargarData();
  }

  CargarOperaciones(){
    this.gQuery.sql("sp_tipo_operacion_devolver").subscribe((data:any) => {
      if(data){
        this.lstOperaciones = data.filter((item)=> item.Naturaleza !="2");
      }
    })
  }
  CargarMedios(){
    this.OperacionSel = true;
    this.DataMedios.Datos.Parametros = this.OperacionForm.value.IdTipoOperacion;
    console.log(this.DataMedios.Datos.Parametros);
    
    setTimeout(() => {
      this.gTableMedios.cargarData();
    }, 500);
  }

}
