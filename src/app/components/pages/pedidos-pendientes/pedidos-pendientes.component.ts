import { Component, OnInit, ViewChild } from '@angular/core';
import { gAuthService } from 'src/app/services/g-auth.service';
import { gQueryService } from 'src/app/services/g-query.service';
import { gTableComponent } from '../../shared/g-table/g-table.component';
import { gAuxService } from 'src/app/services/g-aux.services';
import { FormControl, FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'app-pedidos-pendientes',
  templateUrl: './pedidos-pendientes.component.html',
  styleUrls: ['./pedidos-pendientes.component.css']
})
export class PedidosPendientesComponent implements OnInit {
  
  @ViewChild('gTablePedidosPendientes') gTablePedidosPendientes: gTableComponent;
  DataPedidosPendientes: any;
  User:any;


    enviarForm = new FormGroup({
      IdRepartidor: new FormControl(null, Validators.required),
      IdVehiculo: new FormControl(null, Validators.required)
    });

    public repartidores = [];
    public vehiculos = [];
    public PedidosSel = [];

    Productos:any = [];
    ProductosPnd:any = [];
    
  constructor(private gQuery:gQueryService, private gAuth: gAuthService, private gAux:gAuxService) { }

  ngOnInit(): void {
    this.gAuth.userData().subscribe((data:any) =>{
      this.User = data;
    });

    this.gQuery.cargarLista(this.repartidores, "sp_usuarios_tipo_devolver", "4");
    this.gQuery.cargarLista(this.vehiculos, "sp_vehiculos_devolver")
    this.gQuery.cargarLista(this.Productos, "sp_productos_devolver")
    this.CargarProductosPendientes();
    // this.gQuery.cargarLista(this.ProductosPnd, "sp_operaciones_productos_estado_devolver", "0")


    this.DataPedidosPendientes = {
      Titulo    :   "Vehiculos", 
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

        Info: {
          Color: "#0084B5",
          Titulo: "Información del Cliente",
          Tooltip: "Información",
          Icono: 'info',
          Parametros: [ //los "Nombre" deben estar tal cual vienen de la BD 
            { Nombre: "NombreCliente",      Etiqueta: "Nombre",       Tipo: "Texto" },
            { Nombre: "Direccion",          Etiqueta: "Dirección",    Tipo: "Texto" },
            { Nombre: "Referencia",         Etiqueta: "Referencia",   Tipo: "Texto" },
            { Nombre: "PosicionGPS",        Etiqueta: "Mapa",         Tipo: "Mapa" },
            { Nombre: "IdCliente",          Etiqueta: "Fachada",      Tipo: "Imagen", Carpeta: "Clientes" },
            { Nombre: "Glosa",              Etiqueta: "Glosa",        Tipo: "Texto" },
            { Nombre: "FechaRegistro",      Etiqueta: "F. Registro",  Tipo: "Texto", Estilo: { width: 'calc(50% - 5px)', 'display': 'inline-block', 'margin-right': '10px' } },
            { Nombre: "HoraRegistro",       Etiqueta: "H. Registro",  Tipo: "Texto", Estilo: { width: 'calc(50% - 5px)', 'display': 'inline-block' } },
            { Nombre: "FechaPideEntregar",  Etiqueta: "F. Entrega",   Tipo: "Texto", Estilo: { width: 'calc(50% - 5px)', 'display': 'inline-block', 'margin-right': '10px' } },
            { Nombre: "HoraPideEntregar",   Etiqueta: "H. Entrega",   Tipo: "Texto", Estilo: { width: 'calc(50% - 5px)', 'display': 'inline-block' } },
            { Nombre      : "Pedidos",
              Tipo        : "TablaDinamica",
              TituloTabla : "Pedidos",
              // dataSource  : [],
              Store       : "sp_operaciones_productos_pedido_devolver",
              Parametros  : ["IdPedido"],
              // OrdenColumnas: ["Abreviatura", "Cantidad", "CantidadBono", "PrecioUnitario", "Total"],
              ColumnasOcultas: ["Id", "IdOperacion", "IdProducto", "Producto", "CantidadEntregada", "CantidadEntregadaBono", "Cliente", "TotalEntrega"],
              ColumnasEstilos: [
                ,
                {Columna: "Cantidad",       Estilo: {"text-align":"center"}},
                {Columna: "CantidadBono",   Estilo: {"text-align":"center"}},
                {Columna: "PrecioUnitario", Estilo: {"text-align":"right"}},
                {Columna: "Total",          Estilo: {"text-align":"right"}},

              ],
              ColumnasEtiquetas: [
                {Columna: "Abreviatura",    Etiqueta: "Prod" },
                {Columna: "Cantidad",       Etiqueta: "Cant" },
                {Columna: "CantidadBono",   Etiqueta: "Bono" },
                {Columna: "PrecioUnitario", Etiqueta: "P.U." },
                {Columna: "Total",          Etiqueta: "Total" },
              ]
            }
          ],
        },
  

      }
    }
  

  

  }

  ngAfterViewInit(): void {
    this.gTablePedidosPendientes.cargarData();
  }

  SeleccionarPedidos($event){
    // this.PedidosSel = $event;
    this.PedidosSel = [];
    
    // console.log($event)
    this.Productos.forEach(item => {
      this.PedidosSel.push(
        { Id: item.Id, 
          Producto: item.Abreviatura, 
          Cantidad: 0
        }
      )
    })


    this.gTablePedidosPendientes.ItemsSeleccionados.forEach(item => {
      

      this.PedidosSel.forEach(prod => {
              //buscar todos los 
      let Cant = this?.ProductosPnd?.find(fila => fila?.IdOperacion == item?.IdPedido && fila?.IdProducto ==prod?.Id)?.Cantidad || 0;
        prod.Cantidad +=  parseInt(Cant);
      })
    })
    // console.log(this.PedidosSel)
  }
  
  enviarPedido(){    
    const idsPedidos = this.gTablePedidosPendientes.ItemsSeleccionados.map(pedido => pedido.IdPedido);
    let IdsJSON = [];
    idsPedidos.forEach(item => {
      IdsJSON.push({
        Id: item
      })
    })

    const parametros = 
      this.User.Id + "|" +
      this.enviarForm.value.IdRepartidor + "|" + 
      this.enviarForm.value.IdVehiculo + "|" + 
      JSON.stringify(IdsJSON)

    this.gQuery.sql("sp_operaciones_enviar_registrar", parametros).subscribe((data)=> {
      if(data && data[0].Resultado =="1"){
        alert("Pedidos enviados");
        this.PedidosSel = [];
        this.gTablePedidosPendientes.cargarData();
        this.CargarProductosPendientes();
      }else{
        alert("Error \n\n No se ha podido registrar el pedido");
      }

    }, 
    error =>{
      alert("error al registrar el envio")
    });
  }

  TotalProducto(Id){
    return this.ProductosPnd
    .filter(item => item.IdProducto === Id) // Filtra los registros con el IdProducto dado
    .reduce((sum, item) => sum + parseInt(item.Cantidad), 0); // Suma las cantidades
  }

  CargarProductosPendientes(){
    this.gQuery.cargarLista(this.ProductosPnd, "sp_operaciones_productos_estado_devolver", "0")
  }
}
