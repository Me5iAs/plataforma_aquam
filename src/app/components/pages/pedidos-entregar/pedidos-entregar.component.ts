import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { gAuthService } from 'src/app/services/g-auth.service';
import { gTableComponent } from '../../shared/g-table/g-table.component';
import { gMapaComponent } from '../../shared/g-mapa/g-mapa.component';
import { gConstantesService } from 'src/app/services/g-constantes.service';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from "../../format-datepicker";
import { gInputDialogComponent } from '../../shared/g-inputDialog/g-input-dialog.component';
import { gQueryService } from 'src/app/services/g-query.service';
import { popup } from 'leaflet';
import { FormGroup } from '@angular/forms';

// interfaces de productos 
interface Producto {
  Id: any;
  Producto: string;
  Cantidad: number;
  Bono: number;
  Precio: number;
  Total: number;
}

interface iVenta {
  Productos: Producto[];
  Bruto: number;
  Impuesto: number;
  Total: number;
}

//interfaces de medios de pago
interface Medio {
  Id: any;
  Medio: string,
  Monto: number
}

interface iPagos {
  Medios: Medio[],
  Total: number
}

interface GeolocationPosition {
  coords: {
      latitude: number;
      longitude: number;
      altitude?: number;
      accuracy: number;
      altitudeAccuracy?: number | null;
      heading?: number | null;
      speed?: number | null;
  };
  timestamp: number;
}


const url_api = gConstantesService.gImagenesClientes;

@Component({
  selector: 'app-pedidos-entregar',
  templateUrl: './pedidos-entregar.component.html',
  styleUrls: ['./pedidos-entregar.component.css']
})
export class PedidosEntregarComponent implements OnInit {

  User: any;
  @ViewChild('gInputs') gInputs: gInputDialogComponent
  @ViewChild('gMapaClientes') gMapaClientes: gMapaComponent;

  lstProductosPago: any[] = [];
  lstMediosCajas = [];
  
  Venta: iVenta;
  Pagos: iPagos;

  public lat;
  public lng;

  public IdTipoOperacion = 1;

  lstPedidosPend=[];
  lstProductos=[];
  // DataPedidosEntregar: any;

  constructor(private gAuth:gAuthService, private gQuery:gQueryService, private router:Router,private dialog: MatDialog) { }
  
  ngOnInit(): void {
    (window as any).mostrarImagen = this.mostrarImagen.bind(this);

    this.gAuth.userData().subscribe((data:any) =>{
      this.User = data;
      
      this.gQuery.sql("sp_operaciones_enviados_devolver", this.User.Id).subscribe((dataenvios:any) => {
        if(dataenvios){
          dataenvios.forEach(envios => {
            //obtener los productos 
            this.gQuery.sql("sp_operaciones_productos_estado_devolver", "1").subscribe((dataproductos:any) => {
              const productos = dataproductos.filter(item => item.IdOperacion == envios.Id ) 
              
              this.lstProductos =[];
              let TotalPedido = 0; 
              productos.forEach(prod => {
                TotalPedido += parseFloat(prod.Total);

                if(prod.CantidadBono ==0){
                  this.lstProductos.push({
                    Producto : prod.Cantidad + " " + prod.Abreviatura,
                    Precio : "s/ " +  prod.Total
               
                  })
                }else{
                  this.lstProductos.push({
                    Producto : prod.Cantidad + " " + prod.Abreviatura + " + " + prod.CantidadBono + " bono",
                    Precio : "s/ " +  prod.Total
                  })
                }
                
              });

              let glosa = ""
  
              
              if(envios.Direccion.trim() !="" && envios.Direccion.trim() != "-"){
                glosa = envios.Direccion;
              } 
              if(envios.Referencia.trim() != "" && envios.Referencia.trim() != "-"){
                glosa +=" - " + envios.Referencia
              }
              
              if(envios.Glosa){
                glosa += "("+ envios.Glosa + ")";
              }
              
              this.lstPedidosPend.push({
                Nombre: envios.NombreCliente,
                Id: envios.IdCliente,
                LatCliente: envios.LatCliente,
                LngCliente: envios.LngCliente,
                Productos: this.lstProductos,
                Glosa: glosa,
                Total : TotalPedido,
                IdPedido: envios.Id,

              })
            })
           
          });
          // console.log(this.lstPedidosPend)
        }
      })
      
    });

    this.gQuery.cargarLista(this.lstMediosCajas, "sp_medio_cajas_tipoop_devolver",  this.IdTipoOperacion );
 
    this.Venta = {
      Productos: [], // Inicializar como un array vacío de productos
      Bruto: 0,
      Impuesto: 0,
      Total: 0
    };

    this.Pagos = {
      Medios : [],
      Total: 0
    } 

  }
  ngAfterViewInit(): void {}

  async verMapaCliente(dataCliente:any){
    // icono home
    const coordenadas = await this.actualizarGPS(); 
    console.log(this.lat)
    const IconCliente = this.gMapaClientes.CrearIcono('../../../assets/marker_cliente.png')
    const PopUpCliente = this.gMapaClientes.createPopup(dataCliente.Nombre ,dataCliente.Direccion,
      [{
        Icono :   { Imagen: "foto_icon.png", Ancho: "20px", Alto: "20px" },
        onclick: (item)=> {
          this.mostrarImagen(dataCliente.Id);
        }
        
      }]
    );
    const IconVehiculo = this.gMapaClientes.CrearIcono('../../../assets/marker_vehiculo.png')
    const PopUpVehiculo = this.gMapaClientes.createPopup("Vehiculo","", );
  
    this.gMapaClientes.dataMap = {
      Tipo          : "Icono",
      AgregarPlanta : false,
      MostrarDetalles: true,
      MostrarPopUp: false,
      Rutas         : true,
      // Icono         : {Icono: "map", Estilo: {color:"#a02200"}},
    
      Marcadores: [
        {Latitud: coordenadas.lat, Longitud:coordenadas.lng, Icono:IconVehiculo, Popup: PopUpVehiculo }, 
        {Latitud: dataCliente.LatCliente, Longitud:dataCliente.LngCliente, Icono: IconCliente, Popup:PopUpCliente },
      ]
    }
    console.log(this.gMapaClientes.dataMap);
    this.gMapaClientes.VerMapaModal()
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

  async verMapaCompleto(){
    const coordenadas = await this.actualizarGPS(); 
    
    const IconVehiculo = this.gMapaClientes.CrearIcono('../../../assets/marker_vehiculo.png')
    const PopUpVehiculo = this.gMapaClientes.createPopup("Vehiculo","", );


    let Marcadores: any[] = [];
    if(coordenadas.lat != 0 && coordenadas.lng!=0){
      
      Marcadores.push({Latitud: coordenadas.lat, Longitud:coordenadas.lng, Icono:IconVehiculo, Popup: PopUpVehiculo } );     
    }
    const IconCliente = this.gMapaClientes.CrearIcono('../../../assets/marker_cliente.png')
 

    this.lstPedidosPend.forEach(item => {
      const PopUpCliente = this.gMapaClientes.createPopup(item.Nombre ,item.Direccion,
        [{Icono :   { Imagen: "foto_icon.png", Ancho: "20px", Alto: "20px" },
          onclick: (item)=> {this.mostrarImagen(item.Id);}
        }]
      );

      Marcadores.push(
      {Latitud: item.LatCliente, Longitud:item.LngCliente, Icono: IconCliente, Popup:PopUpCliente },
    )
    })
    
    this.gMapaClientes.dataMap = {
      Tipo          : "Icono",
      AgregarPlanta : false,
      MostrarDetalles: true,
      MostrarPopUp: false,
      Rutas         : true,
      // Icono         : {Icono: "map", Estilo: {color:"#a02200"}},
    
      Marcadores: Marcadores
    }
    this.gMapaClientes.VerMapaModal()
  }

  async ReprogramarPedido(row){
   const coordenadas = await this.actualizarGPS()
    this.gInputs.data = {
      titulo: 'Reprogramra pedido ',
      tipo: 'icono',
      icono: 'edit',
      formulario: [
        { nombre: 'Fecha',   tipo: 'fecha', requerido: true, valorDefecto: new Date(), FechaMinima:new Date() },
        { nombre: 'Hora',   tipo: 'hora', requerido: true, MinHora: "08:00", MaxHora:"18:00" },
        { nombre: 'Glosa',   tipo: 'texto', requerido: true, valorDefecto: ""}, 
        { nombre: 'IdPedido',  tipo: 'invisible', requerido: false, valorDefecto: row.IdPedido}
      ],
      ok: (result) => {
        console.log(result);

        let parametros = 
        result.IdPedido + "|" + 
        this?.User?.Id + "|" +
        result.Fecha + "|" + 
        result.Hora + "|" + 
        result.Glosa + "|" + 
        coordenadas.lat + "|" + 
        coordenadas.lng;
        // console.log(parametros)
        // return;
        this.gQuery.sql("sp_operaciones_reprogramar", parametros ).subscribe((data:any)=>{
          if(data[0].Resultado =="1"){
            alert("Reprogramación configurada")
            this.lstPedidosPend = this.lstPedidosPend.filter(pedido => pedido.IdPedido !==  result.IdPedido);
          }
        })
        
        
      }
    };
    this.gInputs.openDialog();
  }

  async RechazarPedido(item){
    const coordenadas = await this.actualizarGPS()
    this.gInputs.data = {
      titulo: 'Rechazar pedido ',
      tipo: 'icono',
      icono: 'edit',
      formulario: [
        { nombre: 'Motivo',   Etiqueta: "Motivo", tipo: 'select', requerido: true,
          opciones: [
            {Id: "0", valor: "Ya compró en otro lugar"},
            {Id: "1", valor: "Ya no tiene negocio"},
            {Id: "2", valor: "Está inconforme con el servicio"},
            {Id: "3", valor: "Está inconforme con el producto"},
            {Id: "4", valor: "No cuenta con dinero"},
            {Id: "5", valor: "Otro (especificar)"},
          ]
        }, 
        { nombre: 'Glosa',    Etiqueta: "Comentario",  tipo: 'texto', requerido: true, valorDefecto: ""}, 
        { nombre: 'IdPedido',  tipo: 'invisible', requerido: false, valorDefecto: item.IdPedido}
      ],
      FnValidacion: (result)=> {
        if(result.Motivo == "5" && result.Glosa ==""){
          alert("Error: \n\n En caso de seleccionar 'Otro', el campo comentario es obliatorio.")
          return false;
        }
        return true;
      },
      ok: (result) => {
        console.log(result);

       
        let parametros = 
        result.IdPedido + "|" + 
        this?.User?.Id + "|" +
        result.Motivo + "|" + 
        result.Glosa + "|" + 
        coordenadas.lat + "|" + 
        coordenadas.lng;
        this.gQuery.sql("sp_operaciones_rechazar", parametros ).subscribe((data:any)=>{
          if(data[0].Resultado =="1"){
            alert("Rechazo registrado")
            this.lstPedidosPend = this.lstPedidosPend.filter(pedido => pedido.IdPedido !==  result.IdPedido);
          }
        })
        
        
      }
    };
    this.gInputs.openDialog();
  }

  EntregarPedido(item){
    this.router.navigate(['/entregar/' + item.IdPedido + "/" + item.Id])
  }

  async actualizarGPS(): Promise<{ lat: number; lng: number }> {
    if ("geolocation" in navigator) {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            console.log("Latitud y longitud obtenidas:", lat, lng);
            resolve({ lat, lng }); // Devuelve el objeto con las coordenadas
          },
          (error) => {
            const lat = 0;
            const lng = 0;
            resolve({ lat, lng });
            // console.error("Error al obtener la posición:", error.message);
            // reject(error); // Lanza el error en caso de problemas
          }
        );
      });
    } else {
      console.error("Geolocalización no está soportada en este navegador.");
      throw new Error("Geolocalización no soportada");
    }
  }
  
}


@Component({
  selector: 'dialog-imagen',
  templateUrl: 'dialog-imagen.html',
  styleUrls: ['./pedidos-entregar.component.css'],
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
// @Component({
//   selector: 'dialog-imagen',
//   templateUrl: 'dialog-imagen.html',
//   styleUrls: ['./pedidos-entregar.component.css'],
//   providers: [
//     { provide: DateAdapter, useClass: AppDateAdapter },
//     { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS }
//   ]
// })

// export class DialogUsuario implements OnInit {

//   constructor(
//     public dialogRef: MatDialogRef<DialogUsuario>,
//     @Inject(MAT_DIALOG_DATA) public imageUrl: string
//   ) { }

//   ngOnInit(): void { }

//   onCancel(): void {

//     this.dialogRef.close();
//   }
// }