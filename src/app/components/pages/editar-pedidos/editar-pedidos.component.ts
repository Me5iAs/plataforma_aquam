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
  
  @ViewChild('gTablePedidosPendientes') gTablePedidosPendientes: gTableComponent;
  @ViewChild('gInputs') gInputs: gInputDialogComponent
  DataPedidosPendientes: any;
  User:any;
  lstProductos =[];

  constructor(private gQuery:gQueryService, private gAuth: gAuthService, private gAux:gAuxService) { }

  ngOnInit(): void {
    this.gAuth.userData().subscribe((data:any) =>{
      this.User = data;
    });

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
        Checkbox          : true,
        DeleteSelectCheck : false,
        Filtro            : false,
      },
      Acciones: {

        Otros: [
          { Nombre: 'Editar',
            Color: "#048979",
            Tooltip: "Editar",
            Icono: "app_registration",
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

                  this.gQuery.sql("sp_operaciones_producto_idoperacion_actualizar", row.IdPedido + "|"+ productos + "|" + this.User?.Id).subscribe();
                  // alert("Aprobación Registrada");
                  // this.gTablePedidosPendientes.cargarData()
                }
              };

              // console.log(row);
              
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
        ]
      }
    }

  }
  ngAfterViewInit(): void {
    this.gTablePedidosPendientes.cargarData();
  }

  cargarProductos() {
 
  }
}
