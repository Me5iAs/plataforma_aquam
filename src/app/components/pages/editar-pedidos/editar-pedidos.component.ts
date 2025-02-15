import { Component, OnInit, ViewChild } from '@angular/core';
import { gAuthService } from 'src/app/services/g-auth.service';
import { gQueryService } from 'src/app/services/g-query.service';
import { gTableComponent } from '../../shared/g-table/g-table.component';
import { gAuxService } from 'src/app/services/g-aux.services';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { gInputDialogComponent } from '../../shared/g-inputDialog/g-input-dialog.component';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { APP_DATE_FORMATS, AppDateAdapter } from '../../format-datepicker';

@Component({
  selector: 'app-editar-pedidos',
  templateUrl: './editar-pedidos.component.html',
  styleUrls: ['./editar-pedidos.component.css'],
  providers: [
    {provide: DateAdapter, useClass: AppDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
  ]
})
export class EditarPedidosComponent implements OnInit {
  
  @ViewChild('gTablePedidosPendientes')   gTablePedidosPendientes: gTableComponent;
  @ViewChild('gTablePedidosEnviados')     gTablePedidosEnviados: gTableComponent;
  @ViewChild('gTablePedidosReprogramado') gTablePedidosReprogramado: gTableComponent;
  @ViewChild('gTablePedidosRechazado')    gTablePedidosRechazado: gTableComponent;
  @ViewChild('gTablePedidosEntregado')    gTablePedidosEntregado: gTableComponent;
  @ViewChild('gTablePedidosRendidos')     gTablePedidosRendidos: gTableComponent;
  
  
  @ViewChild('gInputs') gInputs: gInputDialogComponent

  DataPedidosPendientes   : any;
  DataPedidosEnviados     : any;
  DataPedidosReprogramados: any;
  DataPedidosRechazado    : any;
  DataPedidosEntregado    : any;
  DataPedidosRendidos     : any;

  rendidosForm = new FormGroup({
    pDesde: new FormControl( new Date(), Validators.required),
    pHasta: new FormControl(new Date(), Validators.required)
  });
  User:any;
  lstProductos =[];

  constructor(private gQuery:gQueryService, private gAuth: gAuthService, private gAux:gAuxService) { }

  ngOnInit(): void {
    this.gAuth.userData().subscribe((data:any) =>{
      this.User = data;
    });

    
    // pendientes
    this.DataPedidosPendientes = {
      Titulo    :   "PedidosPendientes", 
      Datos     : {
          Store: "sp_operaciones_pendiente_devolver",
          ColumnasOcultas   : ["Id", "NombreCliente", "Glosa", "Referencia", "UsuarioRegistro",  "Productos", "IdCliente", "IdPedido", "Direccion", "FechaPideEntregar", "HoraPideEntregar", "PosicionGPS", "IdUsuarioRegistra", "FechaRegistro", "HoraRegistro"],
          
          ColumnasEtiquetas : [
            {Columna : "NombreCliente", Etiqueta: "Cliente"}
            ],

          ColumnasFusionadas: [
            {
              Columna: "Cliente",
              Titulo: "<span>$NombreCliente</span>",
              Cuerpo: "$Direccion ($Referencia)",
              EstiloTitulo: { display:"block", "font-size":"16px", "font-weight":"500" },
              EstiloCuerpo: { display:"block", "font-size":"12px", color: "#212529"},
            },
            {
              Columna: "Pedido",
              Titulo: "<span>$Productos</span>",
              Cuerpo: "Entrega Pedida: [$FechaPideEntregar] $HoraPideEntregar ",
              EstiloTitulo: { display:"block", "font-weight":"500" },
              EstiloCuerpo: { display:"block", "font-size":"12px", color: "#212529"},
            },
            { Columna: "Usuario", 
              Titulo: "$UsuarioRegistro"},
            { Columna: "Fecha Registro", 
              Titulo: "$FechaRegistro", 
              Cuerpo: "$HoraRegistro",
              EstiloCuerpo: { display:"block", "font-size":"12px", color: "#212529"},}
          ],

          ColumnasEstilos: [
            {Columna: "Usuario", Estilo : {"text-align": "center"}},
            {Columna: "Fecha Registro", Estilo : {"text-align": "center"}
          }],

          ColumnasOcultarPantallas: [
            {Columna: "Usuario", Celular: true, Mediano: true, Grande : false, Enorme : false }
          ]

      },

      Opciones: {
        Checkbox          : false,
        DeleteSelectCheck : false,
        Filtro            : false,
      },
      Acciones: {

        Otros: [
          { Nombre: 'Editar',
            Color: "#FFC107",
            Tooltip: "Editar pedido",
            Icono: "edit_note",
            Tipo: 'Accion',
            Funcion: (row) => {
              this.gInputs.data = {
                titulo: "Editar Pedido",
                tipo: 'icono',
                BtnAceptar: "Aprobar",
                ancho: '300px',
                icono: 'edit',
                formulario: [],
                FnValidacion: (result) => { return true },
                ok: (result) => {
                  delete result["ArchivosImagenes"];
                  // console.log(result);
                  const productos = JSON.stringify(result);

                  this.gAux.getGPS().then(posision=>{
                    this.gQuery.sql("sp_operaciones_producto_idoperacion_actualizar", row.IdPedido + "|"+ productos + "|" + this.User?.Id + "|" + posision).subscribe((data:any)=>{
                      if(data && data[0].Resultado =='1'){
                        alert(data[0].Mensaje)
                        this.gTablePedidosPendientes.cargarData();
                      }else{
                        alert(data[0].Mensaje)
                      }
  
                    });
                  })

            
                }
              };

              this.gQuery.sql("sp_operaciones_productos_todo_pedido_devolver", row.IdPedido).subscribe((data: any) => {
      
                if (data) {
                  data.forEach(prod => {
                    this.gInputs.data.formulario.push({
                      nombre: prod.Producto,
                      valorDefecto: prod.Cantidad,
                      
                      tipo: "numero",
                      Requerido: true,    
                    });  
                  });
                  this.gInputs.openDialog()
                }
              });
            },
          },
          { Nombre: 'Eliminar',
            Color: "#f44336",
            Tooltip: "Eliminar pedido",
            Icono: "delete_forever",
            Tipo: 'Accion',
            Funcion: (row) => {
        
              if(confirm("Advertencia \n\n Esta acción eliminará el pedido, ¿Desea continuar?")){

                this.gAux.getGPS().then(posicion => {
                  
                  this.gQuery.sql("sp_operaciones_eliminar", row.IdPedido + "|" + this.User.Id + "|" + posicion).subscribe((data: any) => {
        
                    if (data && data[0].Resultado ==1) {
                      this.gTablePedidosPendientes.cargarData();
                      alert(data[0].Mensaje)
                    }else{
                      alert(data[0].Mensaje)
                    }
                  });
                });

              }

            },
          },
        ]
      }
    }

    // enviados
    this.DataPedidosEnviados = {
      Titulo    :   "PedidosPendientes", 
      Datos     : {
          Store             : "sp_operaciones_todosenviados_devolver",
          ColumnasOcultas   : ["Id", "Repartidor", "FechaEnvio", "HoraEnvio", "NombreCliente", "Glosa", "Referencia", "UsuarioRegistro",  "Productos", "IdCliente", "IdPedido", "Direccion", "FechaPideEntregar", "HoraPideEntregar", "PosicionGPS", "IdUsuarioRegistra", "FechaRegistro", "HoraRegistro"],
          ColumnasEtiquetas : [
            {Columna : "NombreCliente", Etiqueta: "Cliente"}
            ],

          ColumnasFusionadas: [
            { Columna: "Cliente",
              Titulo: "<span>$NombreCliente</span>",
              Cuerpo: "$Direccion ($Referencia)",
              EstiloTitulo: { display:"block", "font-size":"16px", "font-weight":"500" },
              EstiloCuerpo: { display:"block", "font-size":"12px", color: "#212529"},
            },
            { Columna: "Pedido",
              Titulo: "<span>$Productos</span>",
              Cuerpo: "Entrega Pedida: [$FechaPideEntregar] $HoraPideEntregar ",
              EstiloTitulo: { display:"block", "font-weight":"500" },
              EstiloCuerpo: { display:"block", "font-size":"12px", color: "#212529"},
            },
            { Columna: "Repartidor", 
              Titulo: "$Repartidor"
            },
            { Columna: "Fecha Envio", 
              Titulo: "$FechaEnvio", 
              Cuerpo: "$HoraEnvio",
              EstiloCuerpo: { display:"block", "font-size":"12px", color: "#212529"},}
          ],

          ColumnasEstilos: [
            {Columna: "Repartidor", Estilo : {"text-align": "center"}},
            {Columna: "Fecha Envio", Estilo : {"text-align": "center"}
          }],

          ColumnasOcultarPantallas: [
            {Columna: "Usuario", Celular: true, Mediano: true, Grande : false, Enorme : false }
          ]

      },

      Opciones: {
        Checkbox          : false,
        DeleteSelectCheck : false,
        Filtro            : false,
      },
      Acciones: {

        Otros: [
          { Nombre: 'Editar',
            Color: "#ed7c31",
            Tooltip: "Revertir",
            Icono: "restart_alt",
            Tipo: 'Accion',
            Funcion: (row) => {
              if(confirm("¡Alerta! \n\n ¿Confirma que quiere revertir el envío?")){
                this.gAux.getGPS().then(posicion=> {
                  this.gQuery.sql("sp_operaciones_enviar_revertir", row.IdPedido + "|" + this.User.Id + "|" + posicion).subscribe((data:any)=>{
                    if(data && data[0].Resultado =='1'){
                      alert(data[0].Mensaje);
                      this.gTablePedidosEnviados.cargarData();
                      this.gTablePedidosPendientes.cargarData();
  
                    }else{
                      alert(data[0].Mensaje);
                    }
                  });
                })
            
                
              }
            },
          },
        ]
      }
    }

    // Reprogramados
    this.DataPedidosReprogramados = {
      Titulo    :   "PedidosPendientes", 
      Datos     : {
          Store             : "sp_operaciones_reprogramados_devolver",
          ColumnasOcultas   : ["Id", "FechaReprogramada", "HoraReprogramada", "FechaEntrega", "HoraEntrega", "Repartidor", "FechaEnvio", "HoraEnvio", "NombreCliente", "Glosa", "Referencia", "UsuarioRegistro",  "Productos", "IdCliente", "IdPedido", "Direccion", "FechaPideEntregar", "HoraPideEntregar", "PosicionGPS", "IdUsuarioRegistra", "FechaRegistro", "HoraRegistro"],
          
          ColumnasEtiquetas : [
            {Columna : "NombreCliente", Etiqueta: "Cliente"}
          ],

          ColumnasFusionadas: [
            { Columna: "Cliente",
              Titulo: "<span>$NombreCliente</span>",
              Cuerpo: "$Direccion ($Referencia) <br> $Glosa",
              EstiloTitulo: { display:"block", "font-size":"16px", "font-weight":"500" },
              EstiloCuerpo: { display:"block", "font-size":"12px", color: "#212529"},
            },
            { Columna: "Pedido",
              Titulo: "<span>$Productos</span>",
              Cuerpo: "Entrega Pedida: [$FechaPideEntregar] $HoraPideEntregar ",
              EstiloTitulo: { display:"block", "font-weight":"500" },
              EstiloCuerpo: { display:"block", "font-size":"12px", color: "#212529"},
            },
            { Columna: "Repartidor", 
              Titulo: "$Repartidor"
            },
            { Columna: "Fecha Repro", 
              Titulo: "$FechaReprogramada", 
              Cuerpo: "$HoraReprogramada",
              EstiloCuerpo: { display:"block", "font-size":"12px", color: "#212529"}
            }
          ],

          ColumnasEstilos: [
            {Columna: "Repartidor", Estilo : {"text-align": "center"}},
            {Columna: "Fecha Repro", Estilo : {"text-align": "center"}
          }],

          ColumnasOcultarPantallas: [
            {Columna: "Usuario", Celular: true, Mediano: true, Grande : false, Enorme : false }
          ]

      },

      Opciones: {
        Checkbox          : false,
        DeleteSelectCheck : false,
        Filtro            : false,
      },
      Acciones: {

        Otros: [
          { Nombre: 'RevertirReprogramacion',
            Color: "#FF2377",
            Tooltip: "Revertir Reprogramación",
            Icono: "restart_alt",
            Tipo: 'Accion',
            Funcion: (row) => {
              if(confirm("¡Alerta! \n\n ¿Confirma que quiere revertir la reprogramacion?")){
                this.gAux.getGPS().then(posicion => {
                  this.gQuery.sql("sp_operaciones_reprogramaciones_revertir", row.IdPedido + "|" + this.User.Id + "|" + posicion).subscribe((data:any)=>{
                    if(data && data[0].Resultado =='1'){
                      alert(data[0].Mensaje);
                      this.gTablePedidosEnviados.cargarData();
                      this.gTablePedidosReprogramado.cargarData()
  
                    }else{
                      alert(data[0].Mensaje);
                    }
                  });
                })
              }
            },
          },
        ]
      }
    }

    // rechazado
    this.DataPedidosRechazado = {
      Titulo    :   "PedidosRechazados", 
      Datos     : {
          Store             : "sp_operaciones_rechazados_devolver",
          ColumnasOcultas   : ["Id", "FechaRechazo", "HoraRechazo", "Repartidor", "NombreCliente", "Glosa", "Referencia", "Productos", "IdCliente", "IdPedido", "Direccion"],
          
          ColumnasEtiquetas : [
            {Columna : "NombreCliente", Etiqueta: "Cliente"}
          ],

          ColumnasFusionadas: [
            { Columna: "Cliente",
              Titulo: "<span>$NombreCliente</span>",
              Cuerpo: "$Direccion ($Referencia) <br> $Glosa",
              EstiloTitulo: { display:"block", "font-size":"16px", "font-weight":"500" },
              EstiloCuerpo: { display:"block", "font-size":"12px", color: "#212529"},
            },
            { Columna: "Pedido",
              Titulo: "<span>$Productos</span>",
              Cuerpo: "Entrega Pedida: [$FechaPideEntregar] $HoraPideEntregar ",
              EstiloTitulo: { display:"block", "font-weight":"500" },
              EstiloCuerpo: { display:"block", "font-size":"12px", color: "#212529"},
            },
            { Columna: "Repartidor", 
              Titulo: "$Repartidor"
            },
            { Columna: "Fecha Rechazo", 
              Titulo: "$FechaRechazo", 
              Cuerpo: "$HoraRechazo",
              EstiloCuerpo: { display:"block", "font-size":"12px", color: "#212529"}
            }
          ],

          ColumnasEstilos: [
            {Columna: "Repartidor", Estilo : {"text-align": "center"}},
            {Columna: "Fecha Rechazo", Estilo : {"text-align": "center"}
          }],

          ColumnasOcultarPantallas: [
            {Columna: "Usuario", Celular: true, Mediano: true, Grande : false, Enorme : false }
          ]

      },
      Opciones: {
        Checkbox          : false,
        DeleteSelectCheck : false,
        Filtro            : false,
      },
      Acciones: {

        Otros: [
          { Nombre: 'RevertirRechazo',
            Color: "#ff2c16",
            Tooltip: "Revertir Rechazo",
            Icono: "restart_alt",
            Tipo: 'Accion',
            Funcion: (row) => {
              if(confirm("¡Alerta! \n\n ¿Confirma que quiere revertir el rechazo?")){
                this.gAux.getGPS().then(posicion => {
                  this.gQuery.sql("sp_operaciones_rechazo_revertir", row.IdPedido + "|" + this.User.Id + "|" + posicion).subscribe((data:any)=>{
                    if(data && data[0].Resultado =='1'){
                      alert(data[0].Mensaje);
                      // this.gTablePedidosEnviados.cargarData();
                      this.gTablePedidosEnviados.cargarData();
                      this.gTablePedidosRechazado.cargarData()
  
                    }else{
                      alert(data[0].Mensaje);
                    }
                  });
                })
 
                
              }
            },
          },
        ]
      }
    }

    // entregado
    this.DataPedidosEntregado = {
      Titulo    :   "Pedidos Entregados", 
      Datos     : {
          Store             : "sp_operaciones_entregados_devolver",
          OrdenColumnas: [
            "Cliente", "Entrega", "Pago", "MontoEfectivo", "MontoTransferencia", "MontoCredito", "Repartidor", "Fecha Entrega"
          ],
          ColumnasOcultas   : [
            "IdPedido",
            "IdCliente",
            "NombreCliente",
            "Direccion",
            "Referencia",
            "PosicionGPS",
            "Repartidor",
            "FechaEntrega",
            "HoraEntrega",
            "Glosa",
          ],
          
          ColumnasEtiquetas : [
            {Columna : "NombreCliente", Etiqueta: "Cliente"},
            // {Columna : "Productos", Etiqueta: "Entrega"},
            {Columna : "MontoEfectivo", Etiqueta: "Efectivo"},
            {Columna : "MontoTransferencia", Etiqueta: "Banco"},
            {Columna : "MontoCredito", Etiqueta: "Cred."},

          ],

          ColumnasFusionadas: [
            { Columna: "Cliente",
              Titulo: "<span>$NombreCliente</span>",
              Cuerpo: "$Direccion ($Referencia) <br> $Glosa",
              EstiloTitulo: { display:"block", "font-size":"16px", "font-weight":"500" },
              EstiloCuerpo: { display:"block", "font-size":"12px", color: "#212529"},
            },
            { Columna: "Repartidor", 
              Titulo: "$Repartidor"
            },
            { Columna: "Fecha Entrega", 
              Titulo: "$FechaEntrega", 
              Cuerpo: "$HoraEntrega",
              EstiloCuerpo: { display:"block", "font-size":"12px", color: "#212529"}
            },
            { Columna: "Entrega", 
              Titulo: "$Productos", 
              EstiloTitulo: { display:"block", "max-width":"200px", "font-size":"12px"},
             
            },
            { Columna: "Pago", 
              Titulo: "Efec: $MontoEfectivo", 
              Cuerpo: "Bco: $MontoTransferencia <br> Cred: $MontoCredito",
              EstiloTitulo: { display:"block", textAlign:'right', "min-width":"80px", "font-size":"12px"},
              EstiloCuerpo: { display:"block", textAlign:'right', "min-width":"80px", "font-size":"12px"}
            }
          ],
          

          ColumnasEstilos: [
            {Columna: "Repartidor",         Estilo : {"text-align": "center"}},
            {Columna: "Fecha Entrega",      Estilo : {"text-align": "center", fontSize:"12px"}},
            {Columna: "MontoEfectivo",      Estilo : {"text-align": "right", paddingRight:'5px'}},
            {Columna: "MontoTransferencia", Estilo : {"text-align": "right", paddingRight:'5px'}},
            {Columna: "MontoCredito",       Estilo : {"text-align": "right", paddingRight:'5px'}},
            
            
          ],

          ColumnasOcultarPantallas: [
            {Columna: "Repartidor",         Celular: true, Mediano: true, Grande : false, Enorme : false },
            {Columna: "Pago",               Celular: false,Mediano: false,Grande : true,  Enorme : true },
            {Columna: "MontoEfectivo",      Celular: true, Mediano: true, Grande : false, Enorme : false },
            {Columna: "MontoTransferencia", Celular: true, Mediano: true, Grande : false, Enorme : false },
            {Columna: "MontoCredito",       Celular: true, Mediano: true, Grande : false, Enorme : false },
            {Columna: "Entrega",            Celular: true, Mediano: false, Grande : false, Enorme : false },

          ]

      },
      Opciones: {
        Checkbox          : false,
        DeleteSelectCheck : false,
        Filtro            : false,
      },
      Acciones: {

        Otros: [
          { Nombre: 'Revertir Entrega',
            Color: "#0084b5",
            Tooltip: "Revertir Entrega",
            Icono: "restart_alt",
            Tipo: 'Accion',
            Funcion: (row) => {
              if(confirm("¡Alerta! \n\n ¿Confirma que quiere revertir la entrega?")){
                this.gAux.getGPS().then(posicion => {
                  this.gQuery.sql("sp_operaciones_entrega_revertir", row.IdPedido + "|" + this.User.Id + "|" + posicion).subscribe((data:any)=>{
                    if(data && data[0].Resultado =='1'){
                      alert(data[0].Mensaje);
                      // this.gTablePedidosEnviados.cargarData();
                      this.gTablePedidosEnviados.cargarData();
                      this.gTablePedidosEntregado.cargarData()
  
                    }else{
                      alert(data[0].Mensaje);
                    }
                  });
                })
  
                
              }
            },
          },
        ]
      }
    }

    // Rendidos
    this.DataPedidosRendidos = {
    Titulo    :   "Pedidos Rendidos", 
    Datos     : {
        Store         : "sp_operaciones_rendidos_devolver",
        Parametros    : this.gAux.fecha_2b(this.rendidosForm.value.pDesde) + "|" + this.gAux.fecha_2b(this.rendidosForm.value.pHasta),
        OrdenColumnas : ["Cliente", "Entrega", "Pago", "MontoEfectivo", "MontoTransferencia", "MontoCredito", "Repartidor", "Fecha"],
        ColumnasOcultas: [
          "IdPedido",
          "IdCliente",
          "NombreCliente",
          "Direccion",
          "Referencia",
          "Repartidor",
          "FechaRinde",
          "HoraRinde",
          "Productos",
          "Glosa",
          "Estadooperacion",
          "MontoEfectivo",
          "MontoTransferencia",
          "MontoCredito"
        ],
        ColumnasEtiquetas : [
          {Columna : "NombreCliente", Etiqueta: "Cliente"},
          // {Columna : "Productos", Etiqueta: "Entrega"},
          {Columna : "MontoEfectivo", Etiqueta: "Efectivo"},
          {Columna : "MontoTransferencia", Etiqueta: "Banco"},
          {Columna : "MontoCredito", Etiqueta: "Cred."},

        ],
        ColumnasFusionadas: [
          { Columna: "Cliente",
            Titulo: "<span>$NombreCliente</span>",
            Cuerpo: "$Direccion ($Referencia) <br> $Glosa",
            EstiloTitulo: { display:"block", "font-size":"16px", "font-weight":"500" },
            EstiloCuerpo: { display:"block", "font-size":"12px", color: "#212529"},
          },
          { Columna: "Repartidor", 
            Titulo: "$Repartidor"
          },
          { Columna: "Fecha", 
            Titulo: "$FechaRinde", 
            Cuerpo: "$HoraRinde",
            EstiloCuerpo: { display:"block", "font-size":"12px", color: "#212529"}
          },
          { Columna: "Entrega", 
            Titulo: "$Productos", 
            EstiloTitulo: { display:"block", "max-width":"200px", "font-size":"12px"},
            
          },
          { Columna: "Pago", 
            Titulo: "Efec: $MontoEfectivo", 
            Cuerpo: "Bco: $MontoTransferencia <br> Cred: $MontoCredito",
            EstiloTitulo: { display:"block", textAlign:'right', "min-width":"80px", "font-size":"12px"},
            EstiloCuerpo: { display:"block", textAlign:'right', "min-width":"80px", "font-size":"12px"}
          }
        ],
        ColumnasEstilos: [
          {Columna: "Repartidor",         Estilo : {"text-align": "center"}},
          {Columna: "Fecha",              Estilo : {"text-align": "center", fontSize:"12px", paddingLeft:"5px"}},
          {Columna: "MontoEfectivo",      Estilo : {"text-align": "right", paddingRight:'5px'}},
          {Columna: "MontoTransferencia", Estilo : {"text-align": "right", paddingRight:'5px'}},
          {Columna: "MontoCredito",       Estilo : {"text-align": "right", paddingRight:'5px'}},
          
          
        ],
        ColumnasOcultarPantallas: [
          {Columna: "Repartidor",         Celular: true, Mediano: true, Grande : false, Enorme : false },
          {Columna: "Pago",               Celular: false,Mediano: false,Grande : true,  Enorme : true },
          {Columna: "MontoEfectivo",      Celular: true, Mediano: true, Grande : false, Enorme : false },
          {Columna: "MontoTransferencia", Celular: true, Mediano: true, Grande : false, Enorme : false },
          {Columna: "MontoCredito",       Celular: true, Mediano: true, Grande : false, Enorme : false },
          {Columna: "Entrega",            Celular: true, Mediano: false, Grande : false, Enorme : false },

        ]

    },
    Opciones: {
      Checkbox          : false,
      DeleteSelectCheck : false,
      Filtro            : false,
    },
    Acciones: {

      Otros: [
        { Nombre: 'Revertir Entrega',
          Color: "#0084b5",
          Tooltip: "Revertir Entrega",
          Icono: "restart_alt",
          Tipo: 'Accion',
          Funcion: (row) => {
            
            if(row.FechaRinde !=  this.gAux.getAhora("fecha_corta") ){
              alert("Error: \n\n No se puede revertir los pedidos rendidos en días anteriores")
              return false;
            }
            
            if(confirm("¡Alerta! \n\n ¿Confirma que quiere revertir la rendición?")){
              this.gAux.getGPS().then(posicion => {
                this.gQuery.sql("sp_operaciones_rendicion_revertir", row.IdPedido + "|" + this.User.Id + "|" + posicion).subscribe((data:any)=>{
                  if(data && data[0].Resultado =='1'){
                    alert(data[0].Mensaje);
                    this.gTablePedidosEntregado.cargarData()
                    this.gTablePedidosRendidos.cargarData();

                  }else{
                    alert(data[0].Mensaje);
                  }
                });
              })

              
            }
          },
        },
      ]
    }
    }

  }
  ngAfterViewInit(): void {
    this.gTablePedidosPendientes.cargarData();
    this.gTablePedidosEnviados.cargarData();
    this.gTablePedidosReprogramado.cargarData();
    this.gTablePedidosRechazado.cargarData();
    this.gTablePedidosEntregado.cargarData();
    this.gTablePedidosRendidos.cargarData()
  }

  cargarRendidos() {  
    let parameros = this.gAux.fecha_2b(this.rendidosForm.value.pDesde) + "|" + this.gAux.fecha_2b(this.rendidosForm.value.pHasta);
    console.log(parameros);
    this.DataPedidosRendidos.Datos.Parametros = parameros;
    this.gTablePedidosRendidos.cargarData()
  }
}
