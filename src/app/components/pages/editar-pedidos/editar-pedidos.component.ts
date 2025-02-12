import { Component, OnInit, ViewChild } from '@angular/core';
import { gAuthService } from 'src/app/services/g-auth.service';
import { gQueryService } from 'src/app/services/g-query.service';
import { gTableComponent } from '../../shared/g-table/g-table.component';
import { gAuxService } from 'src/app/services/g-aux.services';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { gInputDialogComponent } from '../../shared/g-inputDialog/g-input-dialog.component';

@Component({
  selector: 'app-editar-pedidos',
  templateUrl: './editar-pedidos.component.html',
  styleUrls: ['./editar-pedidos.component.css']
})
export class EditarPedidosComponent implements OnInit {
  
  @ViewChild('gTablePedidosPendientes')   gTablePedidosPendientes: gTableComponent;
  @ViewChild('gTablePedidosEnviados')     gTablePedidosEnviados: gTableComponent;
  @ViewChild('gTablePedidosReprogramado') gTablePedidosReprogramado: gTableComponent;
  
  @ViewChild('gInputs') gInputs: gInputDialogComponent
  DataPedidosPendientes: any;
  DataPedidosEnviados: any;
  DataPedidosReprogramados:any;
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

                  this.gQuery.sql("sp_operaciones_producto_idoperacion_actualizar", row.IdPedido + "|"+ productos + "|" + this.User?.Id).subscribe((data:any)=>{
                    if(data && data[0].Resultado =='1'){
                      alert(data[0].Mensaje)
                      this.gTablePedidosPendientes.cargarData();
                    }else{
                      alert(data[0].Mensaje)
                    }

                  });
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
                this.gQuery.sql("sp_operaciones_enviar_revertir", row.IdPedido + "|" + this.User.Id).subscribe((data:any)=>{
                  if(data && data[0].Resultado =='1'){
                    alert(data[0].Mensaje);
                    this.gTablePedidosEnviados.cargarData();
                    this.gTablePedidosPendientes.cargarData();

                  }else{
                    alert(data[0].Mensaje);
                  }
                });
                
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
                this.gQuery.sql("sp_operaciones_reprogramaciones_revertir", row.IdPedido + "|" + this.User.Id).subscribe((data:any)=>{
                  if(data && data[0].Resultado =='1'){
                    alert(data[0].Mensaje);
                    // this.gTablePedidosEnviados.cargarData();
                    this.gTablePedidosEnviados.cargarData();
                    this.gTablePedidosReprogramado.cargarData()

                  }else{
                    alert(data[0].Mensaje);
                  }
                });
                
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
  }

  cargarProductos() {
 
  }
}
