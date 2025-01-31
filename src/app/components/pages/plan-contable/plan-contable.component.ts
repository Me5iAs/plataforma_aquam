import { Component, OnInit, ViewChild } from '@angular/core';
import { gTableComponent } from '../../shared/g-table/g-table.component';
import { gQueryService } from 'src/app/services/g-query.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-plan-contable',
  templateUrl: './plan-contable.component.html',
  styleUrls: ['./plan-contable.component.css']
})
export class PlanContableComponent implements OnInit {
  

  @ViewChild('gTableCuentasContables') gTableCuentasContables: gTableComponent;
  @ViewChild('gTableConceptos') gTableConceptos: gTableComponent;
  @ViewChild('gTablePlantillas') gTablePlantillas: gTableComponent;
  // @ViewChild('gTableTipoOperacion') gTableTipoOperacion: gTableComponent;
  // @ViewChild('gTableCajas') gTableCajas: gTableComponent;
  
  DataCuentasContables: any;
  DataPlantillasContables: any;
  DataConceptosContables: any;
  // DataTipoOperacion: any;
  // DataCajas:any; 

  OperacionSel = false;
  lstOperaciones = [];
  OperacionForm = new FormGroup({ IdTipoOperacion: new FormControl(null, Validators.required) });

  constructor(private gQuery:gQueryService) { }

  ngOnInit(): void {
    
    this.CargarListaOperaciones();
   
    // this.DataTipoOperacion = {
    //   Titulo: "Tipos de Operación",
    //   Datos: {
    //     Store: "sp_tipo_operacion_devolver",
    //     ColumnasOcultas: ["Id"],
    //     ColumnasEstilos: [
    //       {Naturaleza : {"text-align": "center"}},
    //     ],
    //     ColumnasIcono       : [
    //       { Columna : "Naturaleza",
    //         Icono   : [ 
    //                     {Valor: "0", Etiqueta: "Egresos",   Icono: "logout",  Estilo: {color:"#f44336", cursor:"help" }},
    //                     {Valor: "1", Etiqueta: "Ingresos",  Icono: "login",   Estilo: {color:"#28A745", cursor:"help"}},
    //                   ], 
    //       }
    //     ]
    //   },
    //   Opciones: {
    //     Checkbox: false,
    //     DeleteSelectCheck: false,
    //     Filtro: true,
    //     // Paginacion: {Op: [20,30,50, 100, 200],Size: 20},
    //   },
    //   Acciones: {
    //     Agregar: {
    //       Color: "green",
    //       Titulo: "Registrar Nuevo Tipo de Operación",
    //       FnAgregar: (result: any) => {
    //         let parametros = 
    //           result.TipoOperacion + "|" + 
    //           result.Descripcion + "|" + 
    //           result.Naturaleza;
    
    //         this.gQuery.sql("sp_tipo_operacion_registrar", parametros).subscribe((data: any) => {
    //           if (data && data[0].Resultado == "1") {
    //             this.CargarListaOperaciones();
    //             this.gTableTipoOperacion.cargarData();
    //           } else {
    //             alert("Error: " + data[0]?.Mensaje);
    //           }
    //         });
    //       },
    //       Parametros: [
    //         { Nombre: "TipoOperacion",
    //           Valor: "",
    //           Etiqueta: "Tipo de Operación",
    //           Tipo: "Texto",
    //           placeholder: "Ingrese el Tipo de Operación",
    //           Error: "El Tipo de Movimiento es requerido",
    //           Patron: "ingrese el Tipo de Operación",
    //           Requerido: true
    //         },
    //         { Nombre: "Descripcion",
    //           Valor: "",
    //           Etiqueta: "Tipo de Descripción",
    //           Tipo: "Texto",
    //           placeholder: "Ingrese la Descripción",
    //           Error: "El Tipo de Descripción es obligatorio",
    //           Patron: "Ingrese la Descripción",
    //           Requerido: true
    //         },
    //         { Nombre: "Naturaleza",
    //           Valor: "",
    //           Etiqueta: "Naturaleza",
    //           Tipo: "Lista",
    //           Lista: [
    //             { Id: "0", Valor: "Egresos" },
    //             { Id: "1", Valor: "Ingresos" }
    //           ],
    //           placeholder: "Seleccione la Naturaleza del Tipo de Movimiento",
    //           Requerido: true
    //         }
       
    //       ]
    //     },
        
    //     Editar: {
    //       Color: "#FFC107",
    //       Titulo: "Editar Tipo de Operación",
    //       FnValidacion: (result: any) => true,
    //       FnEditar: (result: any) => {
    //         let parametros =
    //           result.Id + "|" +
    //           result.TipoOperacion + "|" + 
    //           result.Descripcion + "|" + 
    //           result.Naturaleza;
    
    //         this.gQuery.sql("sp_tipo_operacion_actualizar", parametros).subscribe((data: any) => {
    //           if (data && data[0].Resultado == "1") {
    //             alert("Tipo de operación actualizado con éxito");
    //             this.gTableTipoOperacion.cargarData();
    //             this.CargarListaOperaciones();
    //            }else{
    //             alert("Error: " + data[0]?.Mensaje);
    //           }
    //         });
    //       },
    //       Parametros: [
    //         { Nombre: "Id",
    //           Valor: "",
    //           Tipo: "Oculto"
    //         },
    //         { Nombre: "TipoOperacion",
    //           Valor: "",
    //           Etiqueta: "Tipo de Operación",
    //           Tipo: "Texto",
    //           placeholder: "Ingrese el Tipo de Operación",
    //           Error: "El Tipo de Operación es requerido",
    //           Patron: "ingrese el Tipo de Operación",
    //           Requerido: true
    //         },
    //         { Nombre: "Descripcion",
    //           Valor: "",
    //           Etiqueta: "Tipo de Descripción",
    //           Tipo: "Texto",
    //           placeholder: "Ingrese la Descripción",
    //           Error: "El Tipo de Descripción es obligatorio",
    //           Patron: "Ingrese la Descripción",
    //           Requerido: true
    //         },
    //         { Nombre: "Naturaleza",
    //           Valor: "",
    //           Etiqueta: "Naturaleza",
    //           Tipo: "Lista",
    //           Lista: [
    //             { Id: "0", Valor: "Egresos" },
    //             { Id: "1", Valor: "Ingresos" }
    //           ],
    //           placeholder: "Seleccione la Naturaleza del Tipo de Operación",
    //           Requerido: true
    //         }
    //       ]
    //     },

    //     Eliminar: {
    //       Color: "#f44336",
    //       Store: "sp_tipo_operacion_eliminar",
    //       Tooltip: "Eliminar Tipo de Opeación",
    //       Mensaje: "¿Está seguro de que quiere eliminar este Tipo de Opeación?",
    //       Icono: "delete_forever",
    //       Parametros: ["Id"],
    //       Respuestas: [
    //         { Resultado: "1", Mensaje: "El Tipo de Opeación fue eliminado correctamente" },
    //         { Resultado: "-1", Mensaje: "El Tipo de Opeación no existe o ya está inactivo." }
    //       ]
    //     }
    //   }
    // };

    this.DataPlantillasContables   = {
      Titulo: "plantillas Contables",
      Datos: {
        Store: "sp_plantilla_contable_devolver",
        Parametros: "100",
        ColumnasOcultas: ["Id", "Tipo Operación", "IdTipoOperacion", "IdConcepto", "IdCuentaDebe", "IdCuentaHaber"],
        ColumnasEstilos: [
          {Columna: "Debe",   Estilo : {"text-align": "left"}},
          {Columna: "Haber",  Estilo : {"text-align": "left"}},
          {Columna: "Estado", Estilo : {"text-align": "center"}}
        
        ],
        ColumnasIcono       : [
          { Columna : "Estado",
            Icono   : [ 
                        {Valor: "0", Etiqueta: "No Activa", Icono: "highlight_off",         Estilo: {color:"#f44336", cursor:"help" }},
                        {Valor: "1", Etiqueta: "Activa", Icono: "check_circle_outline",  Estilo: {color:"#28A745", cursor:"help"}},
                      ], 
          }
        ]
      },
      Opciones: {
        Checkbox: false,
        DeleteSelectCheck: false,
        Filtro: true,
      },
      Acciones: {
        Agregar: {
          Color: "green",
          Titulo: "Registrar Nueva Plantilla Contable",
          FnAgregar: (result: any) => {
            let parametros = 
              this.OperacionForm.value.IdTipoOperacion + "|" + 
              result.IdConcepto + "|" +
              result.IdCuentaDebe + "|" +
              result.IdCuentaHaber;
            
    
            this.gQuery.sql("sp_plantilla_contable_registrar", parametros).subscribe((data: any) => {
              if (data && data[0].Resultado == "1") {
                // alert("Cuenta contable registrada con éxito");
                this.gTablePlantillas.cargarData();
              } else {
                alert("Error al registrar la cuenta contable: " + data[0]?.Mensaje);
              }
            });
          },
          Parametros: [         
            { Nombre: "IdConcepto",
              Etiqueta: "Concepto",
              Tipo: "ListaDinamica",
              Store: "sp_conceptos_devolver",
              Parametros: "2",
              Resultado: { Id: "Id", Valor: "Concepto" },
              Error: "Seleccione el concepto",
              Requerido: true,
            },
            { Nombre: "IdCuentaDebe",
              Etiqueta: "Cuenta Contable Debe",
              Tipo: "ListaDinamica",
              Store: "sp_cuentas_contables_devolver",
              Parametros: "1",
              Resultado: { Id: "Id", Valor: "Cuenta" },
              Error: "Seleccione la cuenta del Debe",
              Requerido: true,
            },
            { Nombre: "IdCuentaHaber",
              Etiqueta: "Cuenta Contable Haber",
              Tipo: "ListaDinamica",
              Store: "sp_cuentas_contables_devolver",
              Parametros: "1",
              Resultado: { Id: "Id", Valor: "Cuenta" },
              Error: "Seleccione la cuenta del Haber",
              Requerido: true,
            },
          ]
        },
        
        Editar: {
          Color: "#FFC107",
          Titulo: "Editar plantilla Contable",
          FnValidacion: (result: any) => true,
          FnEditar: (result: any) => {
            let parametros =
              result.Id + "|" +
              this.OperacionForm.value.IdTipoOperacion + "|" + 
              result.IdConcepto + "|" +
              result.IdCuentaDebe  + "|" +
              result.IdCuentaHaber;
    
            this.gQuery.sql("sp_plantilla_contable_actualizar", parametros).subscribe((data: any) => {
              if (data && data[0].Resultado == "1") {
                alert("Plantilla contable actualizada con éxito");
                this.gTablePlantillas.cargarData();
              } else {
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
           
            { Nombre: "IdConcepto",
              Etiqueta: "Concepto",
              Tipo: "ListaDinamica",
              Store: "sp_conceptos_devolver",
              Parametros: "2",
              Resultado: { Id: "Id", Valor: "Concepto" },
              Error: "Seleccione el concepto",
              Requerido: true,
            },
            { Nombre: "IdCuentaDebe",
              Etiqueta: "Cuenta Contable Debe",
              Tipo: "ListaDinamica",
              Store: "sp_cuentas_contables_devolver",
              Parametros: "1",
              Resultado: { Id: "Id", Valor: "Cuenta" },
              Error: "Seleccione la cuenta del Debe",
              Requerido: true,
              // Estilo: {display: "inline-block", width: "calc(100% - 10px)", "margin-right": "10px"},
            },
            { Nombre: "IdCuentaHaber",
              Etiqueta: "Cuenta Contable",
              Tipo: "ListaDinamica",
              Store: "sp_cuentas_contables_devolver",
              Parametros: "1",
              Resultado: { Id: "Id", Valor: "Cuenta" },
              Error: "Seleccione la cuenta del Haber",
              Requerido: true,
              // Estilo: {display: "inline-block", width: "calc(100% - 10px)"},
            },
            // { Nombre: "TipoMovimiento",
            //   Valor: "",
            //   Etiqueta: "Tipo de Movimiento",
            //   Tipo: "Lista",
            //   Lista: [
            //     { Id: "0", Valor: "Debe" },
            //     { Id: "1", Valor: "haber" }
            //   ],
            //   placeholder: "Seleccione el tipo de movimiento",
            //   Requerido: true
            // }
          ]
        },

        Eliminar: {
          Color: "#f44336",
          Store: "sp_plantilla_contable_eliminar",
          Tooltip: "Desactivar item de la plantilla",
          Mensaje: "¿Está seguro de que quiere eliminar este item?",
          Icono: "delete_forever",
          Parametros: ["Id"],
          Respuestas: [
            { Resultado: "1", Mensaje: "El item fue eliminado correctamente" },
            { Resultado: "-1", Mensaje: "El item no existe o ya está inactivo." },
          ]
        },
        Otros: [
          {
            Nombre: "ActivarCuenta",
            Color: "#4CAF50",
            Tooltip: "Activar Item de Plantilla",
            Icono: "autorenew",
            Tipo: "Accion",
            Funcion: (row: any) => {
              this.gQuery.sql("sp_plantilla_contable_activar", row.Id).subscribe((data: any) => {
                if (data && data[0].Resultado == "1") {
                  alert("El item fue activado con éxito");
                  this.gTablePlantillas.cargarData();
                } else {
                  alert("Error: " + data[0].Mensaje);
                }
              });
            }
          }
        ]
      }
    };
    
    this.DataConceptosContables = {
      Titulo: "Conceptos Contables",
      Datos: {
        Store: "sp_conceptos_devolver",
        Parametros: "3",
        ColumnasOcultas: ["Id", "IdConceptoReferencia", "Estado"],
        CeldasValor: [
          {Columna: "TipoMovimiento", Valores:  [
            {Dato: "1", Valor: "Efectivo"},
            {Dato: "2", Valor: "Bancario"},
            {Dato: "3", Valor: "Crédito"},
            {Dato: "4", Valor: "No económico"},
          ]},
        ],
        ColumnasEtiquetas: [
          {Columna: "CampoCalculado", Etiqueta: "¿Impuesto?"},
          {Columna: "ConceptoReferencia", Etiqueta: "Referencia"},
          {Columna: "TipoMovimiento", Etiqueta: "Tipo"},
        ],
        ColumnasIcono: [
          { Columna : "CampoCalculado",
            Icono   : [ 
                        {Valor: "0", Etiqueta: "Campo Normal",    Icono: "highlight_off",         Estilo: {color:"#f44336", cursor:"help" }},
                        {Valor: "1", Etiqueta: "Campo Calculado", Icono: "check_circle_outline",  Estilo: {color:"#28A745", cursor:"help"}},
                      ], 
          }
        ],
        ColumnasEstilos: [
          {Columna  : "CampoCalculado",     Estilo: {"text-align": "center"}},
          {Columna  : "ConceptoReferencia", Estilo: {"padding-left": "10px"}}
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
          Titulo: "Registrar Nuevo Concepto",
          FnValidacion: (result: any) => {
            return true;
          },
          FnAgregar: (result: any) => {
            let parametros = 
              result.Concepto + "|" +  
              result.Etiqueta + "|" + 
              result.CampoCalculado + "|" +
              result.IdConceptoReferencia + "|" + 
              result.TipoMov
              ;
    
            this.gQuery.sql("sp_conceptos_registrar", parametros).subscribe((data: any) => {
              if (data && data[0].Resultado == "1") {
                // alert("Cuenta contable registrada con éxito");
                this.gTableConceptos.cargarData();
              } else {
                alert("Error: " + data[0]?.Mensaje);
              }
            });
          },
          Parametros: [
            { Nombre: "Concepto",
              Valor: "",
              Etiqueta: "Concepto",
              Tipo: "Texto",
              placeholder: "Ingrese el Concepto",
              Error: "El Conepto es requerido",
              Patron: "ingrese el concepto",
              Requerido: true
            },
            { Nombre: "Etiqueta",
              Valor: "",
              Etiqueta: "Etiqueta",
              Tipo: "Texto",
              placeholder: "Ingrese el Etiqueta",
              Error: "La Etiqueta es requerido",
              Patron: "ingrese el Etiqueta",
              Requerido: true
            },
            { Nombre: "TipoMov",
              Etiqueta: "Tipo de Movimiento",
              Tipo: "Lista",
              Lista: [
                { Id: "1", Valor: "Efectivo" },
                { Id: "2", Valor: "Bancario" },
                { Id: "3", Valor: "Crédito" },
                { Id: "4", Valor: "No económico" }
              ],
              Error: "Seleccione el concepto de Referencia para el cálculo",
              Requerido: true,
            },
            { Nombre: "CampoCalculado",
              Valor: "",
              Etiqueta: "¿Es un Impuesto?",
              Tipo: "Lista",
              Lista: [
                { Id: "1", Valor: "Sí" },
                { Id: "0", Valor: "No" }
              ],
              placeholder: "Seleccione el tipo de concepto",
              Requerido: true,
              HabilitarCampo: [
                { Campo: "IdConceptoReferencia", ValorCriterio: "1" },
              ],
              
            },
            { Nombre: "IdConceptoReferencia",
              Etiqueta: "Concepto Referencia",
              Tipo: "ListaDinamica",
              Store: "sp_conceptos_devolver",
              Parametros: "1",
              Resultado: { Id: "Id", Valor: "Concepto" },
              Error: "Seleccione el concepto de Referencia para el cálculo",
              Requerido: true,
              IniciaDeshabilitado: true,
            },
       
          ]
        },
        
        Editar: {
          Color: "#FFC107",
          Titulo: "Editar Concepto contable",
          FnValidacion: (result: any) => {

            return true;
          },
          FnEditar: (result: any) => {
    
            let parametros =
              result.Id + "|" +
              result.Concepto + "|" + 
              result.Etiqueta + "|" + 
              result.CampoCalculado + "|" + 
              result.IdConceptoReferencia + "|" + 
              result.TipoMovimiento
              ;
    
            this.gQuery.sql("sp_conceptos_actualizar", parametros).subscribe((data: any) => {
              if (data && data[0].Resultado == "1") {
                alert("Concepto contable actualizado con éxito");
                this.gTableConceptos.cargarData();
                if(this.OperacionSel == true){
                  this.gTablePlantillas.cargarData();  
                }
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
            { Nombre: "Concepto",
              Valor: "",
              Etiqueta: "Concepto",
              Tipo: "Texto",
              placeholder: "Ingrese el Concepto",
              Error: "El Conepto es requerido",
              Patron: "ingrese el concepto",
              Requerido: true
            },
            { Nombre: "Etiqueta",
              Valor: "",
              Etiqueta: "Etiqueta",
              Tipo: "Texto",
              placeholder: "Ingrese el Etiqueta",
              Error: "La Etiqueta es requerida",
              Patron: "ingrese el Etiqueta",
              Requerido: true
            },
            { Nombre: "TipoMovimiento",
              Etiqueta: "Tipo de Movimiento",
              Tipo: "Lista",
              Lista: [
                { Id: "1", Valor: "Efectivo" },
                { Id: "2", Valor: "Bancario" },
                { Id: "3", Valor: "Crédito" },
                { Id: "4", Valor: "No económico" }
              ],
              Error: "Seleccione el concepto de Referencia para el cálculo",
              Requerido: true,
            },
            { Nombre: "CampoCalculado",
              Valor: "",
              Etiqueta: "¿Es un concepto Calculado?",
              Tipo: "Lista",
              Lista: [
                { Id: "1", Valor: "Sí" },
                { Id: "0", Valor: "No" }
              ],
              placeholder: "Seleccione el tipo de concepto",
              Requerido: true,
              HabilitarCampo: [
                { Campo: "IdConceptoReferencia", ValorCriterio: "1" },
              ],
            },
            { Nombre: "IdConceptoReferencia",
              Etiqueta: "Concepto Referencia",
              Tipo: "ListaDinamica",
              Store: "sp_conceptos_devolver",
              Parametros: "1",
              Resultado: { Id: "Id", Valor: "Concepto" },
              Error: "Seleccione el concepto de Referencia para el cálculo",
              Requerido: true,
              IniciaDeshabilitado: true,
            },
          ]
        },

        Eliminar: {
          Reactivar: {
            Store: "sp_conceptos_activar",
            Color: "#4CAF50",
            Tooltip: "Reactivar Concepto",
            Mensaje: "¿Está seguro de que quiere reactivar este Concepto?",
            Icono: "  restore_from_trash",
            Estado: { Columna: "Estado"},
            Respuestas: [
              { Resultado: "1", Mensaje: "El Concepto fue reactivado correctamente" },
              { Resultado: "-1", Mensaje: "El Concepto fue no existe o ya está activo." }
            ]
          },
          Color: "#f44336",
          Store: "sp_conceptos_eliminar",
          Tooltip: "Desactivar Concepto",
          Mensaje: "¿Está seguro de que quiere desactivar este concepto?",
          Icono: "delete_forever",
          Parametros: ["Id"],
          Respuestas: [
            { Resultado: "1", Mensaje: "El Concepto fue desactiado correctamente" },
            { Resultado: "-1", Mensaje: "El concepto no existe o ya está inactivo." }
          ]
        }
      }
    };
    
    this.DataCuentasContables = {
      Titulo: "Cuentas Contables",
      Datos: {
       
        Store: "sp_cuentas_contables_devolver",
        Parametros: "0",
        ColumnasOcultas: ["Id", "Nat"],
        ColumnasEstilos: [
          {CuentaFinal : {"text-align": "center"}},
          {Naturaleza:{"text-align": "center"} }
        ],
        ColumnasIcono       : [
          { Columna : "CuentaFinal",
            Icono   : [ 
                        {Valor: "No", Etiqueta: "No", Icono: "highlight_off",         Estilo: {color:"#f44336", cursor:"help" }},
                        {Valor: "Si", Etiqueta: "Sí", Icono: "check_circle_outline",  Estilo: {color:"#28A745", cursor:"help"}},
                      ], 
          }
        ]
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
          Titulo: "Registrar Nueva Cuenta Contable",
          FnAgregar: (result: any) => {
            let parametros = 
              result.CodigoCuenta + "|" +
              result.NombreCuenta + "|" +
              result.Naturaleza;
    
            this.gQuery.sql("sp_cuentas_contables_registrar", parametros).subscribe((data: any) => {
              if (data && data[0].Resultado == "1") {
                // alert("Cuenta contable registrada con éxito");
                this.gTableCuentasContables.cargarData();
              } else {
                alert("Error al registrar la cuenta contable: " + data[0]?.Mensaje);
              }
            });
          },
          Parametros: [
            {
              Nombre: "CodigoCuenta",
              Valor: "",
              Etiqueta: "Código de Cuenta",
              Tipo: "Numero",
              placeholder: "Ingrese el código de la cuenta (ej. 1.1.1)",
              Error: "El código es requerido",
              Patron: "^\\d+(\\.\\d+)*$",
              Requerido: true
            },
            {
              Nombre: "NombreCuenta",
              Valor: "",
              Etiqueta: "Nombre de la Cuenta",
              Tipo: "Texto",
              placeholder: "Ingrese el nombre de la cuenta",
              Error: "El nombre es requerido",
              Patron: "Debe ingresar al menos un carácter",
              Requerido: true
            },
            {
              Nombre: "Naturaleza",
              Valor: "",
              Etiqueta: "Naturaleza",
              Tipo: "Lista",
              Lista: [
                { Id: 0, Valor: "Deudora" },
                { Id: 1, Valor: "Acreedora" }
              ],
              placeholder: "Seleccione la naturaleza",
              Requerido: true
            }
          ]
        },
        
        Editar: {
          Color: "#FFC107",
          Titulo: "Editar Cuenta Contable",
          FnValidacion: (result: any) => true,
          FnEditar: (result: any) => {
            let parametros =
              result.Id + "|" +
              result.Cuenta + "|" +
              result.Descripcion + "|" +
              result.Naturaleza;
    
            this.gQuery.sql("sp_cuentas_contables_actualizar", parametros).subscribe((data: any) => {
              if (data && data[0].Resultado == "1") {
                // alert("Cuenta contable actualizada con éxito");
                this.gTableCuentasContables.cargarData();
              } else if (data[0].Resultado == "-2") {
                alert("Error: No se puede actualizar el código de cuenta porque dejaría cuentas huérfanas.");
              } else {
                alert("Error al actualizar la cuenta contable: " + data[0]?.Mensaje);
              }
            });
          },
          Parametros: [
            {
              Nombre: "Id",
              Valor: "",
              Tipo: "Oculto"
            },
            {
              Nombre: "Cuenta",
              Valor: "",
              Etiqueta: "Código de Cuenta",
              Tipo: "Texto",
              placeholder: "Ingrese el nuevo código de la cuenta (ej. 1.1.2)",
              Error: "El código es requerido",
              Patron: "^\\d+(\\.\\d+)*$",
              Requerido: true
            },
            {
              Nombre: "Descripcion",
              Valor: "",
              Etiqueta: "Nombre de la Cuenta",
              Tipo: "Texto",
              placeholder: "Ingrese el nuevo nombre de la cuenta",
              Error: "El nombre es requerido",
              Patron: "Debe ingresar al menos un carácter",
              Requerido: true
            },
            {
              Nombre: "Nat",
              Valor: "",
              Etiqueta: "Naturaleza",
              Tipo: "Lista",
              Lista: [
                { Id: "0", Valor: "Deudora" },
                { Id: "1", Valor: "Acreedora" }
              ],
              Requerido: true
            }
          ]
        },
        Eliminar: {
          Color: "#f44336",
          Store: "sp_cuentas_contables_eliminar",
          Tooltip: "Eliminar Cuenta",
          Mensaje: "¿Está seguro de que quiere eliminar esta cuenta contable?",
          Icono: "delete_forever",
          Parametros: ["Id"],
          Respuestas: [
            { Resultado: "1", Mensaje: "La cuenta contable fue eliminada correctamente" },
            { Resultado: "-1", Mensaje: "El registro no existe o ya está inactivo." },
            { Resultado: "-2", Mensaje: "No se puede eliminar la cuenta porque tiene cuentas hijas activas." }
          ]
        }
      }
    };

  }

  CargarListaOperaciones(){
    this.gQuery.cargarLista(this.lstOperaciones, "sp_tipo_operacion_devolver");
  }

 ngAfterViewInit(): void {
    this.gTableCuentasContables.cargarData();
    this.gTableConceptos.cargarData();
    // this.gTableTipoOperacion.cargarData();
    // this.gTableCajas.cargarData();
  }


  cargarPlantilla(){
    this.OperacionSel = true;
    this.DataPlantillasContables.Datos.Parametros = this.OperacionForm.value.IdTipoOperacion;
    console.log(this.DataPlantillasContables.Datos.Parametros);
    
    setTimeout(() => {
      this.gTablePlantillas.cargarData();
    }, 500);
  }

}
