import { Component, OnInit, ViewChild } from '@angular/core';
import { gTableComponent } from '../../shared/g-table/g-table.component';
import { gQueryService } from 'src/app/services/g-query.service';
import { gAuthService } from 'src/app/services/g-auth.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from "../../format-datepicker";
import { gInputDialogComponent } from '../../shared/g-inputDialog/g-input-dialog.component';
@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css'],
  providers: [
    { provide: DateAdapter, useClass: AppDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS }
  ]
})
export class ProductosComponent implements OnInit {

  @ViewChild('gTableProducts') gTableProducts: gTableComponent;
  @ViewChild('gTableGeneral') gTableGeneral: gTableComponent;
  @ViewChild('gTableEspecial') gTableEspecial: gTableComponent;
  
  @ViewChild('gInputs') gInputs: gInputDialogComponent

  DataProducts: any;
  DataGeneral: any;
  DataEspecial: any;
  User: any;

  lstTarifarios = [];
  lstTarifariosEspecial = [];
  lstProductos = [];
  lstOperaciones = [];
  lstClientes = [];
  // tarifario

  // formulario para seleccionar el producto
  TarifarioGeneralForm = new FormGroup({ IdTarifario: new FormControl(null, Validators.required) });
  TarifarioEspecialForm= new FormGroup({ IdTarifario: new FormControl(null, Validators.required) });

  TarifarioGeneralProductoSel = false;
  TarifarioEspecialProductoSel =false;

  constructor(private gQuery: gQueryService, private gAuth: gAuthService) { }

  ngOnInit(): void {

    // cargar dato del usuario
    this.gAuth.userData().subscribe((data: any) => {
      this.User = data;
    });

    // cargar configuracion de productos
    this.DataProducts = {
      Titulo: "Productos",
      Datos: {
        Store: "sp_productos_devolver",

        ColumnasOcultas: ["Id"],

      },
      Opciones: {
        Checkbox: false,
        DeleteSelectCheck: false,
        Filtro: false,
      },
      Acciones: {

        Agregar: {
          Color: "green",
          Titulo: "Registrar Nuevo Producto",
          FnAgregar: (result: any) => {
            let parametros =
              result.Producto + "|" +
              result.Abreviatura + "|" +
              result.Descripcion

            this.gQuery.sql("sp_producto_registrar", parametros).subscribe((data: any) => {
              if (data) {
                if (data[0].Resultado == "1") {
                  alert("Producto registrado");
                  this.gTableProducts.cargarData();
                  this.cargarListaTarifarios();
                } else {
                  alert("Error al registrar el Producto: " + data[0].Resultado);
                }
              }
            })


          },

          Parametros: [
            {
              Nombre: "Producto",
              Valor: "",
              Etiqueta: "Producto",
              Tipo: "Texto",
              placeholder: "Producto",
              Error: "El Nombre del Producto es requerido",
              Patron: "Debe ingresar al menos un caracter",
              Requerido: true
            },
            {
              Nombre: "Abreviatura",
              Valor: "",
              Etiqueta: "Abreviatura",
              Tipo: "Texto",
              placeholder: "Abreviatura",
              Error: "La Abreviatura es requerida",
              Patron: "Debe ingresar al menos un caracter",
              Requerido: true
            },
            {
              Nombre: "Descripcion",
              Valor: "",
              Etiqueta: "Descripción",
              Tipo: "Texto",
              placeholder: "Descripción",
              Error: "La Descripción es requerida",
              Patron: "Debe ingresar al menos un caracter",
              Requerido: true
            }
          ],
        },

        Editar: {
          Color: '#FFC107',
          Titulo: "Editar Producto",
          FnValidacion: (result) => {
            return true;

          },
          FnEditar: (result) => {
            let parametros =
              result.Id + "|" +
              result.Producto + "|" +
              result.Abreviatura + "|" +
              result.Descripcion;

            this.gQuery.sql("sp_producto_actualizar", parametros).subscribe((data: any) => {
              if (data) {
                if (data[0].Resultado == "1") {
                  alert("Producto atualizado");
                  this.gTableProducts.cargarData();
                  this.cargarListaTarifarios();
                } else {
                  alert("Error al editar el Producto");
                }
              }
            })
          },


          Parametros: [
            {
              Nombre: "Id",
              Valor: "",
              Tipo: "Oculto"
            },
            {
              Nombre: "Producto",
              Valor: "",
              Etiqueta: "Producto",
              Tipo: "Texto",
              placeholder: "Producto",
              Error: "El Producto es requerido",
              Patron: "Debe ingresar al menos un caracter",
              Requerido: true
            },
            {
              Nombre: "Abreviatura",
              Valor: "",
              Etiqueta: "Abreviatura",
              Tipo: "Texto",
              placeholder: "Abreviatura",
              Error: "La Abreviatura es requerida",
              Patron: "Debe ingresar al menos un caracter",
              Requerido: true
            },
            {
              Nombre: "Descripcion",
              Valor: "",
              Etiqueta: "Descripcion",
              Tipo: "Texto",
              placeholder: "Descripcion",
              Error: "La Descripcion es requerida",
              Patron: "Debe ingresar al menos un caracter",
              Requerido: true
            }
          ],
        },

        Eliminar: {
          Color: "#f44336",
          Store: "sp_producto_baja",
          Tooltip: "Dar de baja",
          Mensaje: "¿Esta seguro de que quiere dar de baja a este producto?",
          Icono: "delete_forever",
          Parametros: ["Id"],

          Respuestas: [
            { Resultado: "1", Mensaje: "el Producto fue dado de baja" },
            { Resultado: "-1", Mensaje: "Error: El producto no pudo darse de baja" },
          ]
        },


      }
    }

    // tarifario general
    this.DataGeneral = {
      Titulo: "Tarifario General",
      Datos: {
        Store: "sp_tarifario_detalle_devolver",
        Parametros: "100",
        ColumnasOcultas: ["Id", "IdTarifario"],
      },
      Opciones: {
        Checkbox: false,
        DeleteSelectCheck: false,
        Filtro: true,
      },
      Acciones: {

        Agregar: {
          Color: "green",
          Titulo: "Nuevo Rango",
          FnAgregar: (result: any) => {
            let parametros =
            this.TarifarioGeneralForm.value.IdTarifario + "|" + 
              result.Desde + "|" +
              result.Hasta + "|" +
              result.Precio + "|" + 
              result.Bono

            this.gQuery.sql("sp_tarifario_detalle_registrar", parametros).subscribe((data: any) => {
              if (data) {
                if (data[0].Resultado == "1") {
                  alert("rango registrado");
                  this.gTableGeneral.cargarData();
                } else {
                  alert("Error al registrar el Rango: " + data[0].Resultado);
                }
              }
            })
          },

          Parametros: [
            { Nombre: "Desde",
              Valor: "",
              Etiqueta: "Desde",
              Tipo: "Numero",
              placeholder: "Desde",
              Error: "El campo es requerido",
              Patron: "Debe ingresar un valor",
              Requerido: true,
              Estilo: {width: 'calc(50% - 5px)', 'display':'inline-block', 'margin-right':'10px' }  
            },
            { Nombre: "Hasta",
              Valor: "",
              Etiqueta: "Hasta",
              Tipo: "Numero",
              placeholder: "Hasta",
              Error: "El campo hasta es requerido",
              Patron: "Debe ingresar el valor hasta",
              Requerido: true,
              Estilo: {width: 'calc(50% - 5px)', 'display':'inline-block'}  
            },
            { Nombre: "Precio",
              Valor: "",
              Etiqueta: "Precio",
              Tipo: "Decimal",
              placeholder: "Precio",
              Error: "El Precio es requerido",
              Patron: "Debe ingresar el precio",
              Requerido: true,
              Estilo: {width: 'calc(50% - 5px)', 'display':'inline-block', 'margin-right':'10px' }  
              
            },
            { Nombre: "Bono",
              Valor: "",
              Etiqueta: "Bono",
              Tipo: "Numero",
              placeholder: "Bono",
              Error: "El Bono es requerido",
              Patron: "Debe ingresar el Bono",
              Requerido: true,
              Estilo: {width: 'calc(50% - 5px)', 'display':'inline-block'}  
            }
          ],
        },

        Eliminar: {
          Color: "#f44336",
          Store: "sp_tarifario_detalle_eliminar",
          Tooltip: "Eliminar Rango",
          Mensaje: "¿Esta seguro de que quiere dar de baja a este rango? \n Nota: sólo se puede eliminar el último registro ",
          Icono: "delete_forever",
          Parametros: ["Id"],

          Respuestas: [
            { Resultado: "1", Mensaje: "el Rango fue eliminado" },
            { Resultado: "-1", Mensaje: "Error: El detalle no existe o está inactivo."  },
            { Resultado: "-2", Mensaje: "Error: El Solo se puede eliminar el último rango."  },
            
          ]
        },

        Otros: [
          { Nombre      : 'ActualizarUltimo', 
            Color       : "#FFC107",
            Tooltip     : "Actualizar Rango máximo",
            Icono       : "last_page",
            Tipo        : 'Accion', 
            Funcion      : (row)=> { 
              this.gInputs.data = {
                titulo: 'Hasta',
                tipo: 'icono',
                ancho: '250px',
                icono: 'edit',
                formulario: [
                  { nombre: 'Hasta',   tipo: 'numero', requerido: true, valorDefecto: row.Hasta}
                ],
                ok: (result) => {
                  if(result.Hasta < 0){
                    alert("Error: El valor no puede ser negativo");
                    return;
                  }

                  this.gQuery.sql("sp_tarifario_detalle_hasta", row.Id + "|" + result.Hasta).subscribe((data:any)=>{
                    if(data[0].Resultado =="1"){
                      this.gTableGeneral.cargarData();
                    }else{
                      alert("error al actualiar el valor hasta. error" +  data[0].Resultado)
                    }
                  })
                }
              };
              this.gInputs.openDialog();
            },
          
          },
          { Nombre      : 'ActualizarPrecio', 
            Color       : "#28A745",
            Tooltip     : "Actualizar Precio",
            Icono       : "attach_money",
            Tipo        : 'Accion', 
            Funcion      : (row)=> {    
              this.gInputs.data = {
                titulo: 'Actualizar Precio',
                tipo: 'icono',
                icono: 'edit',
                formulario: [
                  { nombre: 'Precio',   tipo: 'decimal', requerido: true, valorDefecto: row.Precio}
                ],
                ok: (result) => {
                  if(result.Precio < 0){
                    alert("Error: El precio no puede ser negativo");
                    return;
                  }

                  this.gQuery.sql("sp_tarifario_detalle_actualizar_precio", row.Id + "|" + result.Precio).subscribe((data:any)=>{
                    if(data[0].Resultado =="1"){
                      this.gTableGeneral.cargarData();
                    }else{
                      alert("error al actualiar el precio")
                    }
                  })
                }
              };
              this.gInputs.openDialog();
            },
          
          },
          { Nombre      : 'ActualizarBono', 
            Color       : "#0084b5",
            Tooltip     : "Actualizar Bono",
            Icono       : "redeem",
            Tipo        : 'Accion', 
            Funcion      : (row)=> {    
              this.gInputs.data = {
                titulo: 'Actualizar Bono',
                tipo: 'icono',
                icono: 'edit',
                formulario: [
                  { nombre: 'Bono',   tipo: 'numero', requerido: true, valorDefecto: row.Bono}
                ],
                ok: (result) => {
                  if(result.Bono < 0){
                    alert("Error: El Bono no puede ser negativo");
                    return;
                  }
                  this.gQuery.sql("sp_tarifario_detalle_actualizar_bono", row.Id + "|" + result.Bono).subscribe((data:any)=>{
                    if(data[0].Resultado =="1"){
                      this.gTableGeneral.cargarData();
                    }else{
                      alert("error al actualiar el bono")
                    }
                  })
                }
              };
              this.gInputs.openDialog();
            },
          
          },
        ],


      }
    }

    //tarifario especial x clientes 
    this.DataEspecial = {
      Titulo: "Tarifario Especial por Cliente",
      Datos: {
        Store: "sp_tarifario_detalle_devolver",
        Parametros: "100",
        ColumnasOcultas: ["Id", "IdTarifario"],
      },
      Opciones: {
        Checkbox: false,
        DeleteSelectCheck: false,
        Filtro: true,
      },
      Acciones: {

        Agregar: {
          Color: "green",
          Titulo: "Nuevo Rango",
          FnAgregar: (result: any) => {
            let parametros =
            this.TarifarioEspecialForm.value.IdTarifario + "|" + 
              result.Desde + "|" +
              result.Hasta + "|" +
              result.Precio + "|" + 
              result.Bono

            this.gQuery.sql("sp_tarifario_detalle_registrar", parametros).subscribe((data: any) => {
              if (data) {
                if (data[0].Resultado == "1") {
                  alert("rango registrado");
                  this.gTableEspecial.cargarData();
                } else {
                  alert("Error al registrar el Rango: " + data[0].Resultado);
                }
              }
            })
          },

          Parametros: [
            { Nombre: "Desde",
              Valor: "",
              Etiqueta: "Desde",
              Tipo: "Numero",
              placeholder: "Desde",
              Error: "El campo es requerido",
              Patron: "Debe ingresar un valor",
              Requerido: true,
              Estilo: {width: 'calc(50% - 5px)', 'display':'inline-block', 'margin-right':'10px' }  
            },
            { Nombre: "Hasta",
              Valor: "",
              Etiqueta: "Hasta",
              Tipo: "Numero",
              placeholder: "Hasta",
              Error: "El campo hasta es requerido",
              Patron: "Debe ingresar el valor hasta",
              Requerido: true,
              Estilo: {width: 'calc(50% - 5px)', 'display':'inline-block'}  
            },
            { Nombre: "Precio",
              Valor: "",
              Etiqueta: "Precio",
              Tipo: "Decimal",
              placeholder: "Precio",
              Error: "El Precio es requerido",
              Patron: "Debe ingresar el precio",
              Requerido: true,
              Estilo: {width: 'calc(50% - 5px)', 'display':'inline-block', 'margin-right':'10px' }  
              
            },
            { Nombre: "Bono",
              Valor: "",
              Etiqueta: "Bono",
              Tipo: "Numero",
              placeholder: "Bono",
              Error: "El Bono es requerido",
              Patron: "Debe ingresar el Bono",
              Requerido: true,
              Estilo: {width: 'calc(50% - 5px)', 'display':'inline-block'}  
            }
          ],
        },

        Eliminar: {
          Color: "#f44336",
          Store: "sp_tarifario_detalle_eliminar",
          Tooltip: "Eliminar Rango",
          Mensaje: "¿Esta seguro de que quiere dar de baja a este rango? \n Nota: sólo se puede eliminar el último registro ",
          Icono: "delete_forever",
          Parametros: ["Id"],

          Respuestas: [
            { Resultado: "1", Mensaje: "el Rango fue eliminado" },
            { Resultado: "-1", Mensaje: "Error: El detalle no existe o está inactivo."  },
            { Resultado: "-2", Mensaje: "Error: El Solo se puede eliminar el último rango."  },
            
          ]
        },

        Otros: [
          { Nombre      : 'ActualizarUltimo', 
            Color       : "#FFC107",
            Tooltip     : "Actualizar Rango máximo",
            Icono       : "last_page",
            Tipo        : 'Accion', 
            Funcion      : (row)=> { 
              this.gInputs.data = {
                titulo: 'Hasta',
                tipo: 'icono',
                ancho: '250px',
                icono: 'edit',
                formulario: [
                  { nombre: 'Hasta',   tipo: 'numero', requerido: true, valorDefecto: row.Hasta}
                ],
                ok: (result) => {
                  if(result.Hasta < 0){
                    alert("Error: El valor no puede ser negativo");
                    return;
                  }

                  this.gQuery.sql("sp_tarifario_detalle_hasta", row.Id + "|" + result.Hasta).subscribe((data:any)=>{
                    if(data[0].Resultado =="1"){
                      this.gTableEspecial.cargarData();
                    }else{
                      alert("error al actualiar el valor hasta. error" +  data[0].Resultado)
                    }
                  })
                }
              };
              this.gInputs.openDialog();
            },
          
          },
          { Nombre      : 'ActualizarPrecio', 
            Color       : "#28A745",
            Tooltip     : "Actualizar Precio",
            Icono       : "attach_money",
            Tipo        : 'Accion', 
            Funcion      : (row)=> {    
              this.gInputs.data = {
                titulo: 'Actualizar Precio',
                tipo: 'icono',
                icono: 'edit',
                formulario: [
                  { nombre: 'Precio',   tipo: 'decimal', requerido: true, valorDefecto: row.Precio}
                ],
                ok: (result) => {
                  if(result.Precio < 0){
                    alert("Error: El precio no puede ser negativo");
                    return;
                  }

                  this.gQuery.sql("sp_tarifario_detalle_actualizar_precio", row.Id + "|" + result.Precio).subscribe((data:any)=>{
                    if(data[0].Resultado =="1"){
                      this.gTableEspecial.cargarData();
                    }else{
                      alert("error al actualiar el precio")
                    }
                  })
                }
              };
              this.gInputs.openDialog();
            },
          
          },
          { Nombre      : 'ActualizarBono', 
            Color       : "#0084b5",
            Tooltip     : "Actualizar Bono",
            Icono       : "redeem",
            Tipo        : 'Accion', 
            Funcion      : (row)=> {    
              this.gInputs.data = {
                titulo: 'Actualizar Bono',
                tipo: 'icono',
                icono: 'edit',
                formulario: [
                  { nombre: 'Bono',   tipo: 'numero', requerido: true, valorDefecto: row.Bono}
                ],
                ok: (result) => {
                  if(result.Bono < 0){
                    alert("Error: El Bono no puede ser negativo");
                    return;
                  }
                  this.gQuery.sql("sp_tarifario_detalle_actualizar_bono", row.Id + "|" + result.Bono).subscribe((data:any)=>{
                    if(data[0].Resultado =="1"){
                      this.gTableEspecial.cargarData();
                    }else{
                      alert("error al actualiar el bono")
                    }
                  })
                }
              };
              this.gInputs.openDialog();
            },
          
          },
        ],


      }
    }

    // cargar datos en la variable de productos
    this.cargarListaTarifarios();
    this.cargarListaProductos();
    this.CargarListaOperaciones();
    this.cargarListaTarifariosEspeciales();
    this.cargarListaClientes()
  }

  ngAfterViewInit(): void {
    this.gTableProducts.cargarData();

  }


  // generales
  // =========
  cargarListaProductos() {
    this.gQuery.sql("sp_productos_devolver").subscribe((data: any) => {
      if (data) {
        data.forEach(item => {
          this.lstProductos.push({
            Id: item.Id,
            valor: item.Producto
          })
        })
      }
    })
  }

  CargarListaOperaciones(){
    // (solo la soperaciones marcadas de ingresos )
    this.gQuery.sql("sp_tipo_operacion_devolver").subscribe((data: any) => {
      if (data) {
        data.forEach(item => {
          if(item.Naturaleza  =="1"){
            this.lstOperaciones.push({
              Id: item.Id,
              valor: item.TipoOperacion
            })
  
          }
        })
      }
    })
  }

  cargarListaClientes() {
    this.gQuery.sql("sp_clientes_devolver", "1").subscribe((data: any) => {
      if (data) {
        data.forEach(item => {
          this.lstClientes.push({
            Id: item.Id,
            valor: item.Nombre
          })
        })
      }
    })
  }



  // tarifarios generales
  // =====================
  cargarTarifarioGeneral() {
    this.TarifarioGeneralProductoSel = true;
    this.DataGeneral.Datos.Parametros = this.TarifarioGeneralForm.value.IdTarifario;
    setTimeout(() => {
      this.gTableGeneral.cargarData();
    }, 500);
  }

  cargarListaTarifarios() {
    this.gQuery.cargarLista(this.lstTarifarios, "sp_tarifarios_devolver", "0");
  }
  
  nuevoTarifario(tipo: number) {
    return {
      titulo: 'Registrar Nuevo Tarifario',
      nombre: "Nuevo Tarifario", // para boton
      tipo: 'icono',
      icono: 'add_circle',      
      colorIcono:"#28A745",
      toolTip: 'Agregar nuevo tarifario',
      formulario: [
        { nombre: 'Producto', tipo: 'select', requerido: true, opciones: this.lstProductos},
        { nombre: 'Desde',    tipo: 'fecha',  requerido: true },
        { nombre: 'Hasta',    tipo: 'fecha',  requerido: true },
        { nombre: 'Operacion',tipo: 'select', requerido: true, opciones: this.lstOperaciones},
      ],
      ok: (result) => {
        this.gQuery.sql("sp_tarifario_registrar_general", result.Producto+ "|" + result.Desde + "|" + result.Hasta + "|" + result.Operacion).subscribe((data:any) => {
          if(data[0].Resultado ==1){
            this.cargarListaTarifarios();
            alert("Tarifario registrado; para poder continuar debe registrar el detalle del tarifario");
          }else{
            alert("Error "+ data[0].Resultado + "\n\n" + data[0].Mensaje);
          }
        })

      }
    }
  }

  editarTarifarioGeneral(){
    const item = this.lstTarifarios.find(item => item.Id === this.TarifarioGeneralForm.value.IdTarifario);
    
    this.gInputs.data = {
      titulo: 'Ampliar plazo de tarifario',
      tipo: 'icono',
      icono: 'edit',
      formulario: [
        { nombre: 'Plazo',   tipo: 'fecha', requerido: true, valorDefecto: item.FechaFin}
      ],
      ok: (result) => {

        this.gQuery.sql("sp_tarifario_actualizar_hasta", this.TarifarioGeneralForm.value.IdTarifario + "|" + result.Plazo).subscribe((data:any)=>{
          if(data[0].Resultado =="1"){
            this.cargarListaTarifarios();
          }else{
            alert("error al actualiar el bono")
          }
        })
      }
    };
    this.gInputs.openDialog();
  }

  eliminarTarifarioGeneral(){
    if(confirm("Esto eliminará el tarifario. \n\n ¿desea continuar?")){
      this.gQuery.sql("sp_tarifario_eliminar", this.TarifarioGeneralForm.value.IdTarifario).subscribe((data:any)=>{
        if(data[0].Resultado =="1"){
          alert("El Tarifario se ha eliminado"),
          this.TarifarioGeneralProductoSel = false;
          this.TarifarioGeneralForm.value.IdTarifario = null;
          this.cargarListaTarifarios();
        }else{
          alert("error al eliminar el tarifario")
        }
      })
    }
  }




  // Tarifario especial x cliente
  // =============================
  cargarTarifarioEspecial(){
    this.TarifarioEspecialProductoSel = true;
    this.DataEspecial.Datos.Parametros = this.TarifarioEspecialForm.value.IdTarifario;
    setTimeout(() => {
      this.gTableEspecial.cargarData();
    }, 500);
  }
    
  cargarListaTarifariosEspeciales(){
    this.gQuery.cargarLista(this.lstTarifariosEspecial, "sp_tarifarios_devolver", "1");
    
  }

  nuevoTarifarioEspecial() {
    return {
      titulo: 'Registrar Nuevo Tarifario',
      nombre: "Nuevo Tarifario", // para boton
      tipo: 'icono',
      icono: 'add_circle',      
      colorIcono:"#28A745",
      toolTip: 'Agregar nuevo tarifario',
      formulario: [
        { nombre: 'Producto',  tipo: 'select', requerido: true, opciones: this.lstProductos},
        { nombre: 'Cliente',   tipo: 'select', requerido: true, opciones: this.lstClientes},
        { nombre: 'Desde',     tipo: 'fecha',  requerido: true },
        { nombre: 'Hasta',     tipo: 'fecha',  requerido: true },
        { nombre: 'Operación', tipo: 'select', requerido: true, opciones: this.lstOperaciones}
      ],
      ok: (result) => {
        this.gQuery.sql("sp_tarifario_registrar_especial", 
          result.Cliente + "|" + 
          result.Producto+ "|" + 
          result.Desde + "|" + 
          result.Hasta + "|" + 
          result.Operación)
          
          .subscribe((data:any) => {
          if(data[0].Resultado ==1){
            this.cargarListaTarifariosEspeciales();
            alert("Tarifario registrado; para poder continuar debe registrar el detalle del tarifario");
          }else{
            alert("Error "+ data[0].Resultado);
          }
        })

      }
    }
  }

  editarTarifarioEspecial(){
    const item = this.lstTarifariosEspecial.find(item => item.Id === this.TarifarioEspecialForm.value.IdTarifario);
    
    this.gInputs.data = {
      titulo: 'Ampliar plazo de tarifario',
      tipo: 'icono',
      icono: 'edit',
      formulario: [
        { nombre: 'Plazo',   tipo: 'fecha', requerido: true, valorDefecto: item.FechaFin}
      ],
      ok: (result) => {

        this.gQuery.sql("sp_tarifario_actualizar_hasta", this.TarifarioEspecialForm.value.IdTarifario + "|" + result.Plazo).subscribe((data:any)=>{
          if(data[0].Resultado =="1"){
            this.cargarListaTarifariosEspeciales();
          }else{
            alert("error al actualiar el bono")
          }
        })
      }
    };
    this.gInputs.openDialog();
  
  }

  eliminarTarifarioEspecial(){
    if(confirm("Esto eliminará el tarifario. \n\n ¿desea continuar?")){
      this.gQuery.sql("sp_tarifario_eliminar", this.TarifarioEspecialForm.value.IdTarifario).subscribe((data:any)=>{
        if(data[0].Resultado =="1"){
          alert("El Tarifario se ha eliminado"),
          this.TarifarioEspecialProductoSel = false;
          this.TarifarioEspecialForm.value.IdTarifario = null;
          this.cargarListaTarifariosEspeciales();
        }else{
          alert("error al eliminar el tarifario")
        }
      })
    }
  }
}
