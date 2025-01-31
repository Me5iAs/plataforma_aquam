import { Component, OnInit, ViewChild, OnDestroy  } from '@angular/core';
import { gQueryService } from 'src/app/services/g-query.service';
import { Router } from '@angular/router';
import { gTableComponent } from '../../shared/g-table/g-table.component';
import { gAuthService } from 'src/app/services/g-auth.service';
import { gAuxService } from 'src/app/services/g-aux.services';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { gMapaComponent } from '../../shared/g-mapa/g-mapa.component';


@Component({
  selector: 'app-pedidos',
  templateUrl: './pedidos.component.html',
  styleUrls: ['./pedidos.component.css']
})
export class PedidosComponent implements OnInit {
  
  @ViewChild('gTablePedidosPendientes') gTablePedidosPendientes: gTableComponent;
  @ViewChild('gTablePedidosEnviados') gTablePedidosEnviados: gTableComponent;

  @ViewChild('gMapRepartidores') gMapRepartidores: gMapaComponent;
  
  DataPedidosPendientes: any;
  DataPedidosEnviados: any;
  Productos:any = [];

  User:any;

  // ENVIOS

  // formulario
  enviarForm = new FormGroup({
    IdRepartidor: new FormControl(null, Validators.required),
    IdVehiculo: new FormControl(null, Validators.required)
  });

  mapaForm = new FormGroup({
    IdRepartidor: new FormControl(null, Validators.required)
  })

  // listas
  public repartidores = [];
  public vehiculos = [];
  public PedidosSel = [];
  dataMap:any;
  dataMap2: any;
  dataMapRepartidores: any;

  constructor(private gQuery:gQueryService, private router:Router, private gAuth:gAuthService, private gAux:gAuxService) {}

  ngOnInit(): void {
    this.dataMap = {
      Tipo: "Elemento",
      Boton: {
        Texto: "Boton de Mapa",
        Estilo: {with:"100px"}
      },
      Marcadores: [
        {
          Latitud: -3.7722102000000004,
          Longitud:-73.26553229999999,
          Icono: {Icono: "a", Popup:"", Estilo: {color:"aa", background:"bb"}}
        },
        {
          Latitud: -3.748777648636324,
          Longitud:-73.25437054722978,
          Icono: {Icono: "a", Popup:"", Estilo: {color:"aa", background:"bb"}}
        }
      ]
    }
    this.dataMapRepartidores = {Tipo: "Icono",};

    // this.dataMap2 = {
    //   Tipo: "Icono",
    //   Icono: {
    //     Icono: "home",
    //     Estilo: {color:"#a02200"}
    //   },
    //   Marcadores: [
    //     {
    //       Latitud: -3.7722102000000004,
    //       Longitud:-73.26553229999999,
    //       Icono: {Icono: "a", Popup:"", Estilo: {color:"aa", background:"bb"}}
    //     },
    //     {
    //       Latitud: -3.748777648636324,
    //       Longitud:-73.25437054722978,
    //       Icono: {Icono: "a", Popup:"", Estilo: {color:"aa", background:"bb"}}
    //     }
    //   ]
    // }

    this.gAuth.userData().subscribe((data:any) =>{
      this.User = data;
    })

    this.gQuery.cargarLista(this.repartidores, "sp_repartidores_devolver");
    this.gQuery.cargarLista(this.vehiculos, "sp_vehiculos_devolver")
    this.setupData();

    // Cargar productos 
    let ColumnasOscultasEnviados = [];
    let ColumnasFusionadasEnviados = [];
    
    this.gQuery.sql("sp_productos_devolver").subscribe((data:any)=>{
      if(data){
        data.forEach(item => {
          let MiLista:any = []

          // enviados
          ColumnasOscultasEnviados.push(item.Etiqueta);
          ColumnasOscultasEnviados.push("Precio_" + item.Etiqueta);
          ColumnasOscultasEnviados.push("Bono_" + item.Etiqueta);

          ColumnasFusionadasEnviados.push({
            Columna: item.Etiqueta,
            Titulo: "<span>$" + item.Etiqueta + " x S/ $Precio_" + item.Etiqueta + "</span>",
            Cuerpo: "<span> Bono: $Bono_" + item.Etiqueta + "</span>",
            EstiloTitulo: {"text-align":  "right", width:"85px", display: "block"},
            EstiloCuerpo: {"text-align":  "right", width:"85px", display: "block", "font-size": "10px"}
            
          })
          this.Productos.push({Id: item.Id, Nombre: item.Nombre, Etiqueta: item.Etiqueta  });
          MiLista.push({Id: "0", Valor: "Sin Producto" });

          for(let i=1;i<=500; i++){
            MiLista.push({Id: i.toString(), Valor: i +" " + item.Abrev})
          }
          
          item.Lista = MiLista;
          item.Estilo = {"width": "calc(50% - 10px)", "margin-right":"10px", "display":"inline-block" };
        })
      }
      
      this.DataPedidosPendientes.Acciones.Agregar.Parametros = [...this.DataPedidosPendientes.Acciones.Agregar.Parametros, ...data];
      this.DataPedidosPendientes.Acciones.Editar.Parametros = [...this.DataPedidosPendientes.Acciones.Editar.Parametros, ...data];
      this.DataPedidosPendientes.Acciones.Otros.find(item => item.Nombre =='info_pedido').Parametros = [...this.DataPedidosPendientes.Acciones.Otros.find(item => item.Tipo ='Info').Parametros,... data ]
    
      // actualizar las columnas ocultas de enviados
      this.DataPedidosEnviados.Datos.ColumnasOcultas = [...this.DataPedidosEnviados.Datos.ColumnasOcultas, ...ColumnasOscultasEnviados]
      this.DataPedidosEnviados.Datos.ColumnasFusionadas = [...this.DataPedidosEnviados.Datos.ColumnasFusionadas, ...ColumnasFusionadasEnviados]
     
      //columnas ocultas de enviados  
      this.DataPedidosEnviados.Acciones.Otros.find(item => item.Nombre=='Historial').Parametros[0].ColumnasOcultas = 
      [... this.DataPedidosEnviados.Acciones.Otros.find(item => item.Nombre=='Historial').Parametros[0].ColumnasOcultas, ...ColumnasOscultasEnviados];

      this.DataPedidosEnviados.Acciones.Otros.find(item => item.Nombre=='Historial').Parametros[0].ColumnasFusionadas = 
      [... this.DataPedidosEnviados.Acciones.Otros.find(item => item.Nombre=='Historial').Parametros[0].ColumnasFusionadas, ...ColumnasFusionadasEnviados];
    })
  }

  ngAfterViewInit(): void {

    // carga inicial
    this.gTablePedidosPendientes.cargarData();
    this.gTablePedidosEnviados.cargarData();
    // this.gMapRepartidores.VerMapaModal()
  }

  // Limpia el intervalo cuando se destruye el componente

  verMapaRepartidores(){
    console.log(this.mapaForm.controls["IdRepartidor"].value);

    let MapaData = {
      Tipo: "Icono",
      AgregarPlanta: true,
      Icono: {
        Icono: "home",
        Estilo: {color:"#a02200"}
      },
      Marcadores: []
    }
    this.gQuery.sql("sp_envios_devolver_x_repartidor", this.mapaForm.controls["IdRepartidor"].value).subscribe((data:any) => {
      if(data){
        data.forEach(row => {
          
          let IconoPin;
          if(row.EstadoPedido == 1){ IconoPin = "assets/marker_env.png" } 
          if(row.EstadoPedido == 2){ IconoPin = "assets/marker_ok.png" }
          if(row.EstadoPedido == 3){ IconoPin = "assets/marker_error.png" }
          if(row.EstadoPedido == 4){ IconoPin = "assets/marker_rep.png" }
          

          
          MapaData.Marcadores.push({
            Latitud : row.Latitud,
            Longitud: row.Longitud,
            Icono : this.gMapRepartidores.CrearIcono(IconoPin),
            Popup: this.gMapRepartidores.createPopup(row.Cliente, row.Direccion,[]) , 
            //  Estilo: {color:"aa", background:"bb"}
            
          })

        });
        this.gMapRepartidores.dataMap = MapaData;
        this.gMapRepartidores.VerMapaModal();
      }else{
        alert("El repartidor no tiene pedidospendientes de rendir");
      }
    })
    // this.gMapRepartidores = this.dataMap2;

    
  }

  SeleccionarPedidos($event){
    // this.PedidosSel = $event;
    this.PedidosSel = [];
    
    
    this.Productos.forEach(item => {this.PedidosSel.push({Id: item.Id, Producto: item.Nombre, Cantidad: 0})})

    this.gTablePedidosPendientes.ItemsSeleccionados.forEach(item => {
      this.PedidosSel.forEach(prod => {
        prod.Cantidad +=  parseInt(item[prod.Producto]);
      })
    })
  }

  setupData(): void {

    this.DataPedidosPendientes = {
      Titulo    :   "pedidos", 
      Datos     :{
        Store           : "sp_pedidos_devolver",
        Parametros      : "registrado",
        OrdenColumnas   : ["Cliente", "Fecha Entrega", "Usuario"],
        ColumnasOcultas : ["IdPedido", "FechaSolEntrega", "Glosa", "HoraSolEntrega", "Pedidos", "IdCliente", "Cliente", "Telefono", "Direccion", "Referencia", "Latitud", "Longitud"], //el sp_ devuelve varias columnas, aqui se establecen las columnas que no se desea mosrar
        ColumnasFusionadas: [
          { Columna: "Cliente",
            Titulo: "$Cliente ($Pedidos)",
            Cuerpo: "<span>$Direccion - $Referencia</span><span>$Glosa<span>",
            EstiloTitulo: { display:"block", color: "#1f1a17", "font-weight":"bold" },
            EstiloCuerpo: { display:"block", color: "#1f1a17", "font-weight":" 400"},
          },
          { Columna: "Fecha Entrega",
            Titulo: "<span>$FechaSolEntrega</span>",
            Cuerpo: "<span>$HoraSolEntrega</span>",         
            EstiloTitulo: {"text-align":  "center", display: "block"},
            EstiloCuerpo: {"text-align":  "center", display: "block", "font-size":"10px"}
          },
        ]
      },
      Opciones: {
        Checkbox          : true,
        DeleteSelectCheck : false,
        Filtro            : true,
        AccionesGenerales : [
        // Se pueden crear muchas acciones generales, estas aparecen en la parte superior derecha de la tabla 
          { 
          Accion: "Ver Mapa",  // Nombre de la acción personalizada
          Icono: "pin_drop",  // Nombre del ícono de Material Design para la acción
          Color: "#004998",  // Color del botón de la acción personalizada
          Funcion: ()=>{this.router.navigate(['/ver_pedidos_map/0']) }  // Función a ejecutar cuando se selecciona la acción
        }
      ],
      },
      Acciones: {
        Editar : {
          Color        : '#004998',
          Titulo       :  "Editar Pedido",
          FnValidacion : (result)=>{
            if(result.IdCliente.Id =="0" && result.Glosa==""){
              alert("Si es un pedido anónimo, debe ingresar un comentario con la direccion, telefono, etc.")
              return false;
            }

            const sum = Object.keys(result)
            .filter(key => key.startsWith("Cant")) // Filtrar claves que empiezan con "Cant"
            .reduce((total, key) => total + Number(result[key]), 0); // Sumar los valores como números
            if(sum==0){
              alert("No se puede registrar un pedido si no se ha pedido ningun producto");
              return false;
            }  
            return true;

          },
          FnEditar     : (result)=>{    
       
            // Cargar los  IDdetalle para el parametro
            let pDetalle = []
            this.DataPedidosPendientes.Acciones.Editar.Parametros
              .filter(key => key.Nombre.startsWith("Cant"))
              .forEach(item => {
                pDetalle.push({
                  IdProducto: item.Id,
                  Cantidad: result[item.Nombre]
                })               
            })

            // Establecer los parametros de SQL 
            let parametros = 
              result.IdPedido + "|" +
              result.IdCliente + "|" +
              result.PosicionGPS.split(",")[0] + "|" +
              result.PosicionGPS.split(",")[1] + "|" +
              this.User.Id + "|" +
              result.FechaSolEntrega + "|" +
              result.HoraSolEntrega + "|" +
              result.Glosa + "|" + 
              "registrado" + "|" + 
              JSON.stringify(pDetalle) ;
              
            // ejecutar 
            this.gQuery.sql("sp_pedido_actualizar", parametros).subscribe((data:any)=> {
              if(data){
                if(data[0].Resultado =="1"){
                  alert("Pedido atualizado");
                  this.gTablePedidosPendientes.cargarData();
                }else{
                  alert("Error al editar el pedido");
                } 
              }
            }) 
          },
          Parametros   : [ //el orden de los parámetros debe ser el mismo orden en el que se esperan en el store
            { Nombre    : "IdPedido",
              Valor     : "",
              Tipo      : "Oculto"
            },
            { Nombre    : "IdCliente",
              Valor     : {Id:'0', Valor:'Anónimo'},
              Etiqueta  : "Cliente",
              Tipo      : "ListaDinamica",
              Store     : "sp_clientes_devolver",  // Simulando una consulta para obtener los clientes
              Parametros: { "Estado": "1" },  // Puedes ajustar estos parámetros según tus necesidades
              Resultado : { Id: "Id", Valor: "Nombre" },
              Error     : "Seleccione un cliente",
              Requerido : true,
              ActualizarOtroCampo: [{Campo_a_actualizar: "PosicionGPS", item_con_data: "GPS" }] //al seleccionar un item del desplegable, se toma uno de los valores de este desplegable para ponerlo en un campo
            },
            { Nombre      : "Glosa", 
              Valor       : "",
              Etiqueta    : "Comentario", 
              Tipo        : "Texto", 
              placeholder : "Ingrese una Glosa", 
              Error       : "la Descripción es requerida", 
              Patron      : "Debe ingresar al menos un caracter",
              Requerido   : false
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
            { Nombre      : "FechaSolEntrega",
              // Valor       : (new Date()).toISOString().slice(0, 10),
              Etiqueta    : "Fecha Entrega",
              Tipo        : "Fecha",
              placeholder : "Seleccione una fecha",
              Error       : "La fecha es requerida",
              FechaMinima : new Date(),
              // "FechaMaxima": "2022-12-31"
              Estilo      : {"width": "calc(60% - 10px)" }
            },
            { Nombre      : "HoraSolEntrega",
              Valor       : "16:00",
              Etiqueta    : "Hora de Entrega",
              Tipo        : "Hora",
              MinHora     : "09:00",  // Hora mínima
              MaxHora     : "17:00",  // Hora máxima
              Error       : "Seleccione una hora válida",
              Requerido   : true,
              Estilo      : {  "width": "calc(40% - 10px)", "padding-left": "10px" }
            },
          ],
        },

        Agregar: {
          Color       :   "green",
          Titulo      :   "Agregar Pedido",
          FnValidacion:   (result)=> {
            if(result.IdCliente.Id =="0" && result.Comentario==""){
              alert("Si es un pedido anónimo, debe ingresar un comentario con la direccion, telefono, etc.")
              return false;
            }

            const sum = Object.keys(result)
            .filter(key => key.startsWith("Cant")) // Filtrar claves que empiezan con "Cant"
            .reduce((total, key) => total + Number(result[key]), 0); // Sumar los valores como números
            if(sum==0){
              alert("No se puede registrar un pedido si no se ha pedido ningun producto");
              return false;
            }  
            return true;
            
          },
          FnAgregar: (result:any)=> {
            let pDetalle = []
           
            this.DataPedidosPendientes.Acciones.Agregar.Parametros
              .filter(key => key.Nombre.startsWith("Cant"))
              .forEach(item => {
                pDetalle.push({
                  IdProducto: item.Id,
                  Cantidad: result[item.Nombre]
                })
                // if( result[item.Nombre]!="0"){

                // }
               
               })
              let parametros = 
                result.IdCliente +                  "|" +
                result.PosicionGPS.split(",")[0] +  "|" +
                result.PosicionGPS.split(",")[1] +  "|" +
                this.User.Id +                      "|" +
                result.FechaEntrega +               "|" +
                result.HoraEntrega +                "|" +
                result.Comentario +                 "|" + 
                JSON.stringify(pDetalle) ;
              
               
              this.gQuery.sql("sp_pedidos_registrar", parametros).subscribe((data:any)=> {
              if(data){
                
                
                if(data[0].Resultado =="1"){
                  alert("Pedido registrado");
                  this.gTablePedidosPendientes.cargarData();
                }else{
                  alert("Error al agregar el pedido");
                }
               
                
              }
            })
            
            
          },
          // Store       : "fn_cont_ConceptosContables_insertar",
          
          Parametros: [
            { Nombre    : "IdCliente",
              Valor     : {Id:'0', Valor:'Anónimo'},
              Etiqueta  : "Cliente",
              Tipo      : "ListaDinamica",
              Store     : "sp_clientes_devolver",  // Simulando una consulta para obtener los clientes
              Parametros: { "Estado": "1" },  // Puedes ajustar estos parámetros según tus necesidades
              Resultado : { Id: "Id", Valor: "Nombre" },
              Error     : "Seleccione un cliente",
              Requerido : true,
              ActualizarOtroCampo: {Campo_a_actualizar: "PosicionGPS", item_con_data: "GPS" } //al seleccionar un item del desplegable, se toma uno de los valores de este desplegable para ponerlo en un campo
            },
            { Nombre      : "Comentario", 
              Valor       : "",
              Etiqueta    : "Comentario", 
              Tipo        : "Texto", 
              placeholder : "Ingrese una Glosa", 
              Error       : "la Descripción es requerida", 
              Patron      : "Debe ingresar al menos un caracter",
              Requerido   : false
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
            { Nombre      : "FechaEntrega",
              Valor       : (new Date()).toISOString().slice(0, 10),
              Etiqueta    : "Fecha Entrega",
              Tipo        : "Fecha",
              placeholder : "Seleccione una fecha",
              Error       : "La fecha es requerida",
              FechaMinima : new Date(),
              // "FechaMaxima": "2022-12-31"
              Estilo      : {"width": "calc(60% - 10px)" }
            },
            { Nombre      : "HoraEntrega",
              Valor       : "16:00",
              Etiqueta    : "Hora de Entrega",
              Tipo        : "Hora",
              MinHora     : "09:00",  // Hora mínima
              MaxHora     : "17:00",  // Hora máxima
              Error       : "Seleccione una hora válida",
              Requerido   : true,
              Estilo      : {  "width": "calc(40% - 10px)", "padding-left": "10px" }
            },
          ],
        },

        Otros: [
          {
            Nombre       : 'info_pedido', //identificador unico
            Color        : '#004998',
            Tipo         : 'Info', //Info o Accion
            Titulo       : "Info del Pedido",
            Icono        : 'info',
            Parametros   : [ //el orden de los parámetros debe ser el mismo orden en el que se esperan en el store
              // { Nombre    : "IdCliente",
              //   Etiqueta  : "Cliente",
              //   Tipo      : "ListaDinamica",
              //   Resultado : { Id: "Id", Valor: "Nombre" },
              //   Store     : "sp_clientes_devolver",  // Simulando una consulta para obtener los clientes
              //   Parametros: { "Estado": "1" },  // Puedes ajustar estos parámetros según tus necesidades
              // },
              { Nombre      : "Cliente", 
                Etiqueta    : "Cliente", 
                Tipo        : "Texto", 

              },
              { Nombre      : "Glosa", 
                Etiqueta    : "Comentario", 
                Tipo        : "Texto", 
              },
              { Nombre      : "PosicionGPS", 
                Etiqueta    : "Mapa", 
                Tipo        : "Mapa", 
              },    
              { Nombre      : "FechaSolEntrega",
                Etiqueta    : "Fecha Entrega",
                Tipo        : "Fecha",
                Estilo      : {width: "calc(60% - 10px)", display:"inline-block" }
                // Estilo      : {width: "calc(60% - 10px)", display:"inline-block" }
              },
              { Nombre      : "HoraSolEntrega",
                Etiqueta    : "Hora de Entrega",
                Tipo        : "Hora",
                // Estilo      : {  width: "calc(40% - 42px)", display:"inline-block", "margin-left": "10px" }
                Estilo      : {  "width": "calc(40% - 10px)", "margin-left": "13px", display:"inline-block" }
              },
            ],
          }
        ],

       
        Eliminar: {
          Color: "red",
          Store: "sp_pedidos_eliminar",
          Parametros: ["IdPedido"],
          // parametrosAdicionales: [this.User.Id],
          Respuestas: [
            {Resultado: "1", Mensaje: "Eliminación exitosa" },
            {Resultado: "-1", Mensaje: "Error: El concepto no existe o ya está eliminado" },
          ]
        },
      }
    }

    this.DataPedidosEnviados = {
      Titulo    : "Pedidos enviados",
      Datos     :{
        Store               : "sp_envios_devolver",
        // OrdenColumnas   : ["Cliente", "Fecha Envio", "Hora Envio", "Repartidor", ""],
        ColumnasOcultas     : ["Id","IdCliente", "FechaEnvio", "HoraEnvio", "Vehiculo","Controlador"], //el sp_ devuelve varias columnas, aqui se establecen las columnas que no se desea mosrar
        ColumnasFusionadas  : [
          { Columna: "Fecha Envio",
            Titulo: "<span>$FechaEnvio</span>",
            Cuerpo: "<span>$HoraEnvio</span>",         
            EstiloTitulo: {"text-align":  "center", display: "block"},
            EstiloCuerpo: {"text-align":  "center", display: "block", "font-size":"10px"}
          },
        ],
        // si hay columnas que en lugar de texto quiere que se muestre icono
        ColumnasIcono       : [
          { Columna : "Estado",
            Icono   : [ 
                        {Valor: "enviado",                  Icono: "local_shipping",        Estilo: {color:"#2196F3", cursor:"help", "-webkit-filter":"drop-shadow(0px 0px 2px rgba(0,0,0,0.2))" }},
                        {Valor: "entregado no rendido",     Icono: "assignment_turned_in",  Estilo: {color:"#FFEB3B", cursor:"help", "-webkit-filter":"drop-shadow(0px 0px 1px rgba(0,0,0,01))" }},
                        {Valor: "rechazado no rendido",     Icono: "block",                 Estilo: {color:"#F44336", cursor:"help", "-webkit-filter":"drop-shadow(0px 0px 1px rgba(0,0,0,.5))" }},
                        {Valor: "reprogramado no rendido",  Icono: "update",                Estilo: {color:"#FF9800", cursor:"help", "-webkit-filter":"drop-shadow(0px 0px 1px rgba(0,0,0,0.2))" }},
                      ], 
          }
        ]
      },
      Opciones: {
        Checkbox          : false,
        DeleteSelectCheck : false,
        Filtro            : true,
        // Paginacion: {Op: [5,10,15],Size: 5},
      },
      Acciones: {
        Otros: [
          {
            Color        : '#004998',
            Tipo         : 'Info', //info o accion
            Nombre       : "Historial",
            Icono        : "checklist_rtl",
            Parametros   : [ 
              { Tipo            : "TablaDinamica",
                TituloTabla     :  "<span>Pedido de <b> $Cliente</b></span>",
                Store           : "sp_pedidos_historial_devolver", 
                Parametros      : ["Id"],
                ColumnasOcultas : ["Cliente","Fecha","Hora"],
                OrdenColumnas   : ["Fecha", "Estado", "Botellones", "Paquetes", "Usuario1", "Usuario2", "Comentario"],
                EstiloColumnas  : [
                  {Columnna: "Fecha",       Cabecera: {"text-align": "center"} },
                  {Columnna: "Estado",      Cabecera: {"text-align": "center"}, Cuerpo:  {"text-align": "center"}},
                  {Columnna: "Botellones",  Cabecera: {"text-align": "center"} },
                  {Columnna: "Paquetes",    Cabecera: {"text-align": "center"} },
                  {Columnna: "Usuario1",    Cabecera: {"text-align": "center"}, Cuerpo:  {"text-align": "center"},},
                  {Columnna: "Usuario2",    Cabecera: {"text-align": "center"}, Cuerpo:  {"text-align": "center"},},
                  {Columnna: "Comentario",  Cuerpo: {"padding-left": "10px" }},

                ],
                ColumnasFusionadas: [
                  { Columna     : "Fecha",
                    Titulo      : "<span>$Fecha</span>",
                    Cuerpo      : "<span>$Hora</span>",         
                    EstiloTitulo: {"text-align":  "center", display: "block"},
                    EstiloCuerpo: {"text-align":  "center", display: "block", "font-size":"10px"}
                  },
                ],
                ColumnasIcono       : [
                  { Columna : "Estado",
                    Icono   : [ 
                                {Valor: "Registrado",               Icono: "phone_callback",        Estilo: {color:"#42A5F5", cursor:"help", "-webkit-filter":"drop-shadow(0px 0px 2px rgba(0,0,0,0.2))" }},
                                {Valor: "Enviado",                  Icono: "local_shipping",        Estilo: {color:"#1E88E5", cursor:"help", "-webkit-filter":"drop-shadow(0px 0px 2px rgba(0,0,0,0.2))" }},
                                {Valor: "Entregado no Rendido",     Icono: "assignment_turned_in",  Estilo: {color:"#FFEB3B", cursor:"help", "-webkit-filter":"drop-shadow(0px 0px 1px rgba(0,0,0,01))" }},
                                {Valor: "Rechazado no Rendido",     Icono: "block",                 Estilo: {color:"#E53935", cursor:"help", "-webkit-filter":"drop-shadow(0px 0px 1px rgba(0,0,0,.5))" }},
                                {Valor: "Reprogramado no Rendido",  Icono: "update",                Estilo: {color:"#FB8C00", cursor:"help", "-webkit-filter":"drop-shadow(0px 0px 1px rgba(0,0,0,0.2))" }},
                                {Valor: "Entregado y Rendido",      Icono: "done_all",              Estilo: {color:"#43A047", cursor:"help", "-webkit-filter":"drop-shadow(0px 0px 1px rgba(0,0,0,0.2))" }},
                                {Valor: "Rechazado y Rendido",      Icono: "not_interested",        Estilo: {color:"#9E9E9E", cursor:"help", "-webkit-filter":"drop-shadow(0px 0px 1px rgba(0,0,0,0.2))" }},
                                {Valor: "Reprogramado y Rendido",   Icono: "restore",               Estilo: {color:"#8BC34A", cursor:"help", "-webkit-filter":"drop-shadow(0px 0px 1px rgba(0,0,0,0.2))" }},
                              ], 
                  }
                ]
              }
            ],
          },
  
        ],  
      }
    }
  }

  // Enviar pedido
  enviarPedido(){    
    const idsPedidos = this.gTablePedidosPendientes.ItemsSeleccionados.map(pedido => pedido.IdPedido);
    const parametros = 
      this.enviarForm.value.IdVehiculo + "|" + 
      this.User.Id + "|" +
      this.enviarForm.value.IdRepartidor + "|" + 
      JSON.stringify(idsPedidos)

    this.gQuery.sql("sp_envios_registrar", parametros).subscribe(()=> {
      alert("Pedidos enviados");
      this.PedidosSel = [];
      this.gTablePedidosPendientes.recargarData("IdPedido");
      this.gTablePedidosEnviados.recargarData("Id");
    }, 
    error =>{
      alert("error al registrar el envio")
    });
  } 
}