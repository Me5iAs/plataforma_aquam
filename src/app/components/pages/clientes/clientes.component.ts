import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { gTableComponent } from '../../shared/g-table/g-table.component';
import { gAuthService } from 'src/app/services/g-auth.service';
import { gQueryService } from 'src/app/services/g-query.service';
import { gSubirService } from "src/app/services/g-subir.service"
import { gInputDialogComponent } from '../../shared/g-inputDialog/g-input-dialog.component';
import { Router } from '@angular/router';
import { gMapaComponent } from '../../shared/g-mapa/g-mapa.component';

import { gConstantesService } from 'src/app/services/g-constantes.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from "../../format-datepicker";

const url_api = gConstantesService.gImagenesClientes;

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css']
})
export class ClientesComponent implements OnInit {

  @ViewChild('gTableClientes') gTableClientes: gTableComponent;
  @ViewChild('gInputs') gInputs: gInputDialogComponent

  @ViewChild('gMapaClientes') gMapaClientes: gMapaComponent;
  DataClientes: any;
  lstUsuarios  = [];
  User: any;
  public File;

  constructor(
    private gAuth: gAuthService,
    private gQuery: gQueryService,
    private router:Router,
    private gImagen: gSubirService,
    private dialog: MatDialog) { }

  ngOnInit(): void {
    
    (window as any).mostrarImagen = this.mostrarImagen.bind(this);

    
    this.gAuth.userData().subscribe((data: any) => {
      this.User = data;
    });

    this.cargarListaUsuarios();

    this.DataClientes = {
      Titulo: "Clientes",
      Datos: {
        Store: "sp_clientes_devolver",
        Parametros: "1",
        // OrdenColumnas   : ["Id","Nombre", "Tipo", "Sueldo"],
        ColumnasOcultas: ["Id", "DNI", "Latitud", "Longitud", "Direccion", "Referencia", "FechaBaja", "IdUsuario", "Glosa", "PosicionGPS", "FechaAlta"],
        ColumnasFusionadas: [
          { Columna: "Dirección",
            Titulo: "$Direccion",
            Cuerpo: "<span>$Referencia</span>",
            EstiloTitulo: { display:"block", },
            EstiloCuerpo: { display:"block", "font-size":"12px", color: "#212529"},
          },
        ],
        ColumnasEstilos: [{
          Columna: "Usuario", Estilo : {"text-align": "center"}
        }
        ],

      },
      Opciones: {
        Checkbox: true,
        DeleteSelectCheck: false,
        Filtro: true,
        FiltroFechas: {
          campo: "FechaAlta",
        },
        Paginacion: {Op: [20,30,50, 100, 200],Size: 20},
        AccionesGenerales: [
          { 
            Accion: "Ver Mapa",  // Nombre de la acción personalizada
            Icono: "pin_drop",  // Nombre del ícono de Material Design para la acción
            Color: "#004998",  // Color del botón de la acción personalizada
            Funcion: ()=>{
              this.gMapaClientes.dataMap = {
                Tipo          : "Icono",
                AgregarPlanta : true,
                MostrarDetalles: true,
                Rutas         : false,
                Icono         : {Icono: "map", Estilo: {color:"#a02200"}},
                CargaDinamica : {
                  Store:"sp_clientes_devolver", 
                  Parametros:"1",
                  Latitud: "Latitud",
                  Longitud: "Longitud",
                  Rutas: false,
                  IconoEstatico:{
                    Imagen:"assets/pin_ch.png",
                    parametros: {
                      iconSize: [15,15]
                    } 
                  } 
                  , //si noicono no hay icono dinamico
                  // IconoDinamico : [
                  //   {Campo: "EstadoPedido", Valor: "1", Icono: "assets/marker_env.png"},
                  //   {Campo: "EstadoPedido", Valor: "2", Icono: "assets/marker_ok.png"},
                  //   {Campo: "EstadoPedido", Valor: "3", Icono: "assets/marker_error.png"},
                  //   {Campo: "EstadoPedido", Valor: "4", Icono: "assets/marker_rep.png"},
                  // ],
                  // Popup: "Cliente" //el campo
                  PopupDinamico: {
                    Titulo : "Nombre", 
                    Cuerpo: ["Direccion", "Referencia"], 
                    botones:  [
                      {
                        Icono :   { Imagen: "foto_icon.png", Ancho: "20px", Alto: "20px" },
                        onclick: (item)=> {
                          console.log(item);
                          this.mostrarImagen(item.IdCliente);
                        }
                        
                      }
                    ]
                  }
                },
                Marcadores: []
              }
              this.gMapaClientes.VerMapaModal()
            } 
           
          },
          { 
            Accion: "Reasignar cartera",  // Nombre de la acción personalizada
            Icono: "flip_camera_ios",  // Nombre del ícono de Material Design para la acción
            Color: "#048979",  // Color del botón de la acción personalizada
            Funcion: ()=>{

              if(this.gTableClientes.ItemsSeleccionados.length == 0){
                alert("Debe seleccionar los clientes que serán reasignados al nuevo vendedor");
                return false;
              }

              this.gInputs.data = {
                titulo: 'Actualizar Vendedor',
                tipo: 'icono',
                ancho: '300px',
                icono: 'edit',
                formulario: [
                  {
                    nombre: 'Usuario',
                    tipo: 'select',
                    requerido: true,
                    opciones: this.lstUsuarios,
                    valorDefecto: this?.User?.Id
                  }
                ],
                ok: (result) => {
                  if (!result.Usuario) {
                    alert("Error: Debe seleccionar un usuario válido");
                    return;
                  }

                  confirm("Con esta acción se reasignaran los "+ this.gTableClientes.ItemsSeleccionados.length + " clientes seleccionados al nuevo Representante de Ventas \n\n ¿Desea continuar?")

                  const ids = this.gTableClientes.ItemsSeleccionados.map(cliente => cliente.Id).join(",");
                  this.gQuery.sql("sp_cartera_asignar", result.Usuario + "|" + ids).subscribe((data: any) => {
                    if (data[0].Resultado == "1") {
                      alert("La cartera fue reasignada al nuevo vendedor con éxito. \n\n " + data[0].CantidadReasignados + " clientes reasignados." );
                      this.gTableClientes.cargarData();
                    } else {
                      alert("Error al asignar la cartera al vendedor. \n\n Código de error: " + data[0].Resultado);
                    }
                  });
                }
              };
              this.gInputs.openDialog();
            }  
          }
        ]
      },
      Acciones: {
        Exportar: {
          Separador: ",",
          Color: "#0084b5"

        },
        Agregar: {
          Color: "green",
          Titulo: "Registrar Cliente",
          FnValidacion: (result) => {

            // validar DNI / RUC
            if (!(/^\d{8}$|^\d{11}$/.test(result.DNI))) {
              alert("el DNI debe tener 8 dígitos, si es RUC debe tenerr 11")
              return false;
            }

            // validar telefono
            if (!(/^\d{6}$|^\d{9}$/.test(result.Telefono))) {
              alert("el Telefono debe tener 6 u 9 dígitos")
              return false;
            }

            return true;

          },
          FnAgregar: (result: any) => {
            let parametros =
              result.IdUsuario    + "|" + 
              result.Nombre       + "|" +
              result.DNI          + "|" +
              result.Telefono     + "|" + 
              result.Direccion    + "|" + 
              result.Referencia   + "|" + 
              result.PosicionGPS  + "|" + 
              result.Glosa;

            this.gQuery.sql("sp_cliente_registrar", parametros).subscribe((data: any) => {
              console.log(data);
              
              if (data) {
                if(result.Foto){
                  this.gImagen.subirImagen(result.Foto, data[0].Id, "Clientes").subscribe();
                }
                if (data[0].Resultado == "1") {
                  alert("Cliente registrado");
                  this.gTableClientes.cargarData();
                } else {
                  alert("Error al registrar el Cliente: " + data[0].Resultado);
                }
              }
            })
          },

          Parametros: [
            {
              Nombre: "Nombre",
              Valor: "",
              Etiqueta: "Nombre",
              Tipo: "Texto",
              placeholder: "Nombre",
              Error: "El Nombre es requerido",
              Patron: "Debe ingresar al menos un caracter",
              Requerido: true
            },
            {
              Nombre: "DNI",
              Valor: "",
              Etiqueta: "DNI",
              Tipo: "Numero",
              placeholder: "DNI",
              Error: "El DNI es requerido",
              Patron: "Debe ingresar al menos 8 numeros",
              Requerido: true
            },
            {
              Nombre: "Telefono",
              Valor: "",
              Etiqueta: "Telefono",
              Tipo: "Numero",
              placeholder: "Telefono",
              Error: "El Teléfono es requerido",
              Patron: "Debe ingresar al menos un caracter",
              Requerido: true
            },
            {
              Nombre: "Direccion",
              Valor: "",
              Etiqueta: "Direccion",
              Tipo: "Texto",
              placeholder: "Direccion",
              Error: "La Direccion es requerida",
              Patron: "Debe ingresar al menos un caracter",
              Requerido: true
            },
            {
              Nombre: "Referencia",
              Valor: "",
              Etiqueta: "Referencia",
              Tipo: "Texto",
              placeholder: "Referencia",
              Error: "La Referencia es requerida",
              Patron: "Debe ingresar al menos un caracter",
              Requerido: true
            },
            { Nombre: "PosicionGPS",
              Valor: "-3.7722102000000004, -73.26553229999999",
              Etiqueta: "Mapa",
              Tipo: "Mapa",
              placeholder: "Seleccione un punto en el mapa",
              Error: "la posicion GPS es requerida",
              Patron: "Debe ingresar al menos un caracter",
              Requerido: false
            },
            { Nombre: "Foto",
              Etiqueta: "Foto de fachada del cliente",
              Tipo: "Imagen",
              Requerido: false
            },
            {
              Nombre: "Glosa",
              Valor: "",
              Etiqueta: "Glosa",
              Tipo: "Texto",
              placeholder: "Glosa",
              // Error       : "La Glosa es requerida", 
              // Patron      : "Debe ingresar al menos un caracter",
              Requerido: false
            },
            { Nombre: "IdUsuario",
              Valor: { Id: this.User?.Id, Valor: this.User?.Usuario },
              Etiqueta: "Usuario",
              Tipo: "ListaDinamica",
              Store: "sp_usuarios_devolver",
              Resultado: { Id: "Id", Valor: "Usuario" },
              Error: "Seleccione el Usuario",
              Requerido: true,

            },
          ],
        },

        Info: {
          Color: "#0084B5",
          Titulo: "Información del Cliente",
          Tooltip: "Información",
          Icono: 'info',
          Parametros: [ //los "Nombre" deben estar tal cual vienen de la BD 

            { Nombre: "Nombre",       Etiqueta: "Nombre", Tipo: "Texto" },
            { Nombre: "Direccion",    Etiqueta: "Dirección", Tipo: "Texto" },
            { Nombre: "Referencia",   Etiqueta: "Referencia", Tipo: "Texto" },
            { Nombre: "PosicionGPS",  Etiqueta: "Mapa", Tipo: "Mapa" },
            { Nombre: "Id",           Etiqueta: "Fachada",  Tipo: "Imagen", Carpeta: "Clientes" },
            { Nombre: "DNI",          Etiqueta: "DNI", Tipo: "Texto", Estilo: { width: 'calc(50% - 5px)', 'display': 'inline-block', 'margin-right': '10px' } },
            { Nombre: "Telefono",     Etiqueta: "Teléfono", Tipo: "Texto", Estilo: { width: 'calc(50% - 5px)', 'display': 'inline-block' } },
            { Nombre: "FechaAlta",    Etiqueta: "Fecha de Alta", Tipo: "Fecha", Estilo: { width: 'calc(50% - 5px)', 'display': 'inline-block', 'margin-right': '10px' } },
            { Nombre: "Usuario",      Etiqueta: "Usuario Asignado", Tipo: "Texto", Estilo: { width: 'calc(50% - 5px)', 'display': 'inline-block' } },
            { Nombre: "Glosa",        Etiqueta: "Notas/Comentarios", Tipo: "Texto" },
          ],
        },

        Editar: {
          Color: '#FFC107',
          Titulo: "Editar Cliente",
          Icono: "edit_square",
          FnValidacion: (result) => {
            return true;
          },
          FnEditar: (result) => {
            let parametros =
              result.Id + "|" +
              result.Nombre + "|" +
              result.DNI + "|" +
              result.Telefono + "|" +
              result.Direccion + "|" +
              result.Referencia + "|" +
              result.PosicionGPS + "|" +
              result.Glosa + "|" +
              result.IdUsuario; // Nuevo usuario asignado

            this.gQuery.sql("sp_cliente_editar", parametros).subscribe((data: any) => {
              if (data) {
                if (data[0].Resultado == "1") {
                  if(result.Foto){
                    this.gImagen.subirImagen(result.Foto, result.Id, "Clientes").subscribe();
                  }
                  


                  alert("Cliente actualizado");
                  this.gTableClientes.cargarData();  // Cargar datos de clientes
                } else {
                  alert("Error al editar el Cliente");
                }
              }
            });
          },
          Parametros: [
            { Nombre: "Id",
              Valor: "",
              Tipo: "Oculto"
            },
            { Nombre: "Nombre",
              Valor: "",
              Etiqueta: "Nombre",
              Tipo: "Texto",
              placeholder: "Nombre",
              Error: "El Nombre es requerido",
              Patron: "Debe ingresar al menos un caracter",
              Requerido: true
            },
            { Nombre: "Direccion",
              Valor: "",
              Etiqueta: "Dirección",
              Tipo: "Texto",
              placeholder: "Dirección",
              Error: "La Dirección es requerida",
              Patron: "Debe ingresar al menos un caracter",
              Requerido: true
            },
            { Nombre: "Referencia",
              Valor: "",
              Etiqueta: "Referencia",
              Tipo: "Texto",
              placeholder: "Referencia",
              Error: "La Referencia es requerida",
              Patron: "Debe ingresar al menos un caracter",
              Requerido: true
            },
            { Nombre: "PosicionGPS",
              Valor: "-3.7722102000000004, -73.26553229999999",
              Etiqueta: "Mapa",
              Tipo: "Mapa",
              placeholder: "Seleccione un punto en el mapa",
              Error: "La posición GPS es requerida",
              Patron: "Debe ingresar al menos un caracter",
              Requerido: false
            },
            { Nombre: "DNI",
              Valor: "",
              Etiqueta: "DNI",
              Tipo: "Numero",
              placeholder: "Ingrese el DNI",
              Error: "El DNI es requerido",
              Patron: "Debe ingresar 8 o 11 dígitos",
              Requerido: true,
              Estilo: { width: 'calc(50% - 5px)', 'display': 'inline-block', 'margin-right': '10px' } 
            },
            { Nombre: "Telefono",
              Valor: "",
              Etiqueta: "Teléfono",
              Tipo: "Numero",
              placeholder: "Teléfono",
              Error: "El Teléfono es requerido",
              Patron: "Debe ingresar un número de 6 o 9 dígitos",
              Requerido: true,
              Estilo: { width: 'calc(50% - 5px)', 'display': 'inline-block'} 
            },
            { Nombre: "Glosa",
              Valor: "",
              Etiqueta: "Notas/Comentarios",
              Tipo: "Texto",
              placeholder: "Comentarios",
              Error: "Ingrese comentarios",
              Patron: "Debe ingresar al menos un caracter",
              Requerido: false
            },
            { Nombre: "IdUsuario",
              Valor: { Id: '0', Valor: 'Sin asignar' },
              Etiqueta: "Representante de Ventas Asignado",
              Tipo: "ListaDinamica",
              Store: "sp_usuarios_devolver",
              Resultado: { Id: "Id", Valor: "Usuario" },
              Error: "Seleccione un Usuario",
              Requerido: true
            },
            { Nombre: "Foto",
              CampoNombreImagen: "Id",
              Etiqueta: "Foto de fachada del cliente",
              Tipo: "Imagen",
              Carpeta: "Clientes",
              Requerido: false
            },
          ],
        },

        Eliminar: {
          Color: "#f44336",
          Store: "sp_cliente_baja",  // Procedimiento para dar de baja al cliente
          Tooltip: "Dar de baja",
          Mensaje: "¿Está seguro de que quiere dar de baja a este cliente?",
          Icono: "person_off",
          Parametros: ["Id"],  // Se pasa el ID del cliente

          Respuestas: [
            { Resultado: "1", Mensaje: "El cliente fue dado de baja exitosamente" },
            { Resultado: "-1", Mensaje: "Error: El cliente no pudo darse de baja o ya estaba inactivo" },
          ]
        },

        Otros: [
          { Nombre: 'ActualizarVendedor',
            Color: "#048979",
            Tooltip: "Actualizar Vendedor Asignado",
            Icono: "next_week",
            Tipo: 'Accion',
            Funcion: (row) => {
              this.gInputs.data = {
                titulo: 'Actualizar Vendedor',
                tipo: 'icono',
                ancho: '300px',
                icono: 'edit',
                formulario: [
                  {
                    nombre: 'Usuario',
                    tipo: 'select',
                    requerido: true,
                    opciones: this.lstUsuarios,
                    valorDefecto: row.IdUsuario
                  }
                ],
                ok: (result) => {
                  if (!result.Usuario) {
                    alert("Error: Debe seleccionar un usuario válido");
                    return;
                  }

                  this.gQuery.sql("sp_cliente_asignar_usuario", row.Id + "|" + result.Usuario).subscribe((data: any) => {
                    if (data[0].Resultado == "1") {
                      alert("El vendedor fue actualizado exitosamente");
                      this.gTableClientes.cargarData();
                    } else {
                      alert("Error al actualizar el vendedor. Código de error: " + data[0].Resultado);
                    }
                  });
                }
              };
              this.gInputs.openDialog();
            },
          },
          {
            Nombre      : 'VerRecordDeCompras', //identificador unico
            Color       : "#28a745",
            Tooltip     : "Compras del cliente",
            Icono       : "person_search",
            Tipo        : 'Accion', //Info o Accion
            Funcion      : (row)=> { this.router.navigate(['/record_cliente/' + row.Id])
            },
        
          }
        ]

      }
    }
  }

  ngAfterViewInit(): void {
    this.gTableClientes.cargarData();

  }

  cargarListaUsuarios() {
    this.gQuery.sql("sp_usuarios_devolver").subscribe((data: any) => {
      if (data) {
        data.forEach(item => {
          this.lstUsuarios.push({
            Id: item.Id,
            valor: item.Usuario
          })
        })
      }
    })
  }

  mostrarImagen(IdCliente) {
    const imageUrl = url_api + IdCliente + ".jpg";

    fetch(imageUrl, { method: 'HEAD' })
      .then(response => {
        if (response.ok) {
          const dialogRef = this.dialog.open(DialogUsuario, {
            data: imageUrl,
            disableClose: false,
            panelClass: 'image-dialog'
          });

          dialogRef.afterClosed().subscribe(result => { });
        }
        else {
          alert("este cliente no tiene foto registrada")
        }
      });
  }

}


@Component({
  selector: 'dialog-imagen',
  templateUrl: 'dialog-imagen.html',
  styleUrls: ['./clientes.component.css'],
  providers: [
    { provide: DateAdapter, useClass: AppDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS }
  ]
})
export class DialogUsuario implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<DialogUsuario>,
    @Inject(MAT_DIALOG_DATA) public imageUrl: string
  ) { }

  ngOnInit(): void { }

  onCancel(): void {

    this.dialogRef.close();
  }
}
