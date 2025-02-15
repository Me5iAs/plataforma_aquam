import { Component, Inject, OnInit, ViewChild, ApplicationRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { gAuthService } from 'src/app/services/g-auth.service';
import { gQueryService } from 'src/app/services/g-query.service';
import { gFormComponent } from '../../shared/g-form/g-form.component';
import { ActivatedRoute, Router } from '@angular/router';
import { gInputDialogComponent } from '../../shared/g-inputDialog/g-input-dialog.component';
import { gConstantesService } from 'src/app/services/g-constantes.service';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { APP_DATE_FORMATS, AppDateAdapter } from '../../format-datepicker';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { gAuxService } from 'src/app/services/g-aux.services';
import { gSubirService } from 'src/app/services/g-subir.service';

// interfaces de productos 
interface Producto {
  Id: any;
  Producto: string;
  Cantidad: number;
  CantidadInicial?: number,
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

const url_api = gConstantesService.gImagenesArchvos;

@Component({
  selector: 'app-entregar',
  templateUrl: './entregar.component.html',
  styleUrls: ['./entregar.component.css']
})
export class EntregarComponent implements OnInit {
  
  @ViewChild('gVentaForm') gVentaForm: gFormComponent;
  @ViewChild('gInputs') gInputs: gInputDialogComponent
  
  public IdTipoOperacion = 1; //el parametro 1 está en duro por ser el tipo de operación
  DataVenta: any;
  User: any;
  lstProductos: any[] = [];
  lstMediosCajas = [];
  
  lstCliente = [];
  TotalEntero;
  TotalDecimal;
  Venta: iVenta;
  Pagos: iPagos;

  IdOperacion: 0;
  IdCliente: 0;

  public lat;
  public lng;
 
  constructor(
    private router:Router, 
    private gAux:gAuxService, 
    private gAuth:gAuthService, 
    private gQuery:gQueryService, 
    private route:ActivatedRoute, 
    private dialog: MatDialog,
    private gSubir: gSubirService,
  ) { }


  ngOnInit(): void {
    this.gAuth.userData().subscribe((data: any) => {
      this.User = data;
    });

    this.lat=0;
    this.lng=0;
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.lat = position.coords.latitude;
          this.lng = position.coords.longitude;
        },
        (error) => {
          // console.error("Error al obtener la posición:", error.message);
        }
      );
    } else {
      // console.error("Geolocalización no está soportada en este navegador.");
    }
    this.IdOperacion = this.route.snapshot.params.IdPedido;
    this.IdCliente = this.route.snapshot.params.IdCliente;


    this.gQuery.cargarLista(this.lstMediosCajas, "sp_medio_cajas_tipoop_devolver",  this.IdTipoOperacion );
    
    this.gQuery.sql("sp_cliente_id_devolver", this.IdCliente).subscribe((data:any)=>{
      this.lstCliente = data[0];
      console.log(this.lstCliente);  
    });

    this.gQuery.sql("sp_operaciones_productos_pedido_devolver", this.IdOperacion).subscribe((data:any)=>{
      let total = 0;
      data.forEach(element => {
        total = total + parseFloat(element.Total);
      });
      this.TotalEntero = this.gAux.parte_entero(total);
      this.TotalDecimal = this.gAux.parte_decimal(total);
      // console.log(this.lstCliente);  
    });


   
    
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

 
    
    // preparacion preliminar
    this.DataVenta = {
       FnValidacion: (result: any) => {  
 

        //verificar si hay pago por app debe haberse subido la imagen
        if(Object.values(result.Medios).some(item=> item["Medio"] =="App" && item["Monto"] >0) && result.ImgApp==null){
          alert("Si se registra pagos por app es necesario subir la foto del pago");
          return false;
        }

        // Sumar el "Total" de "Productos"
        const sumaTotalProductos = Object.values(result.Productos).reduce((acc:number, item: any) => {
          return acc + parseFloat(item.Total);
        }, 0);

        // Sumar el "Monto" de "Medios"
        const sumaTotalMedios = Object.values(result.Medios).reduce((acc:number, item: any) => {
          return acc + parseFloat(item.Monto);
        }, 0);

        // Validar cantidades de productos
        for (const item of this.Venta.Productos) {
          const producto = Object.values(result.Productos).find(prod => prod["Producto"] == item.Producto);
          if (producto && producto["Cantidad"] > item.CantidadInicial) {
              alert("La Cantidad del producto '" + item.Producto + "' es superior a lo que se registró como envío. \n\n Corríjalo e inténtelo de nuevo");
              return false; // Esto ahora detendrá la ejecución de FnValidacion
          }
        }

        // validar que no se cobre más de lo que valen los productos
        if(sumaTotalProductos < sumaTotalMedios){
          alert("El monto de pago es superior al valor de la venta. \n\n Corríjalo e inténtelo de nuevo");
          return false;
        }

        // validar que se venda algun producto
        if(sumaTotalProductos == 0){
          alert("No se puede registrar la venta con valor 0");
          return false;
        }

        // verificar creditos
        if(sumaTotalProductos != sumaTotalMedios){
          if(confirm("El total de medios de pago es menor que el monto de los productos otorgados. \n\n ¿Desea registrar la diferencia como crédito?")){
            return true;
          }else{
            return false;
          }
        }

        return true;
       },
      
      FnOk: (result: any) => {
       
        let pProductos = "";
        let productosArray: any[] = [];

        for (let key in result.Productos) {
          let producto = result.Productos[key];
          if(parseInt(producto.Cantidad) > 0){
            productosArray.push({
              IdProducto: key, // La clave es el ID del producto
              Cantidad: parseInt(producto.Cantidad), // Convertir a número
              PrecioUnitario: parseFloat(producto.Precio), // Convertir a número decimal
              CantidadBono: parseInt(producto.Bono) // Convertir a número
            });
          }
        }

        pProductos = JSON.stringify(productosArray); 



        //parametros de pagos 
        let pPagos = "";
        let pagosArray: any[] = [];

        let MedioFormulario = []
        for (let key in result.Medios) {
          let medio = result.Medios[key];
          let monto = parseFloat(medio.Monto); // Convertir el monto a número decimal

          if (monto > 0) { // Solo incluir medios con montos mayores a 0

            let Cant = this.lstMediosCajas.filter(item => item.IdMedioPago == key).length;
            
            if(Cant ==1){
              pagosArray.push({
                IdMedio: key, // La clave es el ID del medio de pago
                Monto: monto, // Monto del pago
                IdCaja: this.lstMediosCajas.find(item => item.IdMedioPago == key).IdCaja // En tu caso, esta información puede ser completada por la lógica del backend
              });
            }else{
              let opciones = []
              this.lstMediosCajas.filter(item => item.IdMedioPago == key).forEach(item => {
                opciones.push({
                  Id: item.IdCaja, 
                  valor: item.Caja
                })  
              });
              // console.log(medio)
              MedioFormulario.push({
                nombre: key,
                Etiqueta: "Medio de Pago: " +  medio.Medio,
                tipo: "select",
                opciones: opciones,
                // valorDefecto: ,
                Requerido: true
              })
            }  
          }
        }

        if(MedioFormulario.length > 0){
                   
          this.gInputs.data = {
            titulo: 'Seleccione Destino',
            tipo: 'icono',
            ancho: '300px',
            icono: 'edit',
            formulario: MedioFormulario,
            ok: (datainput) => {
              Object.keys(datainput).forEach( item => {  
                pagosArray.push({
                  IdMedio: item, // La clave es el ID del medio de pago
                  Monto: result.Medios[item].Monto, // Monto del pago
                  IdCaja: datainput[item] // En tu caso, esta información puede ser completada por la lógica del backend
                });
              })
              // console.log(pProductos);
              pPagos = JSON.stringify(pagosArray);
              // console.log(pProductos);

              let Parametros = 
              this.IdOperacion + "|" + 
              this.User?.Id + "|" + 
              "1" + "|" + // Facturado siempre es 1
              pPagos + "|" + 
              pProductos;

              this.RegistrarVenta("sp_operaciones_entrega_registrar", Parametros, result.ImgApp)
            }
          };
          this.gInputs.openDialog();
        }else{
          // console.log(pProductos);

          let Parametros = 
          this.IdOperacion + "|" + 
          this.User?.Id + "|" + 
          "1" + "|" + // Facturado siempre es 1
          JSON.stringify(pagosArray) + "|" + 
          pProductos;
          this.RegistrarVenta("sp_operaciones_entrega_registrar", Parametros, result.ImgApp)
        }
        
      },
      Campos: [],
    }

    this.cargarProductos();
    // this.cargarMediosPago();

  }

  // cargar los medios de pagos de manera dinamica 
  cargarMediosPago(){

    this.gQuery.sql("sp_tipo_operacion_medio_pago_devolver", this.IdTipoOperacion).subscribe((data: any) => { 

      if (data) {
        // cargar los medios de pago
        this.DataVenta.Campos.push({
          Nombre        : "Medios",
          Etiqueta      : "Medios de Pago",
          Tipo          : "GrupoControles",
          Ancho         : {Celular: "100", Mediana: "50", Grande: "40", Enorme: "40"}, //el valor en porcentajes sin el simbolo
          lstColumnas   : ["Medio", "Monto"],
          FilasSubTotal : [
                            {
                              ColumnaEtiqueta : "Medio", //La columna donde irá la etiqueta
                              Etiqueta        : "Total", //La etiqueta
                              EstiloEtiqueta  : { 'text-align': 'center'}, //el estilo de la etiqueta
                              ColumnaTotal    :  "Monto", //la columna que se sumará para sacar el total
                              Valor           : function(SumColumna: any) { return SumColumna;},
                              Formato         : "0.00", //formato del subtotal
                              EstiloFila      : { "background": "#28A745", "font-size":"16px", color:"white" },
                              EstiloTotal     : { 'justify-content': 'right', 'text-align':'right', "padding-right":"30px" } 
                            }
                          ],
          ColumnaTotal : "Monto",
          Filas: [],
        });
  
        // tiene medio app
        let HayApp: boolean;
        data.forEach((item: any) => {
          if(item.Asignado =="1"){
            if(item.Etiqueta =='App'){
              HayApp = true;
            }
            const fila = {
              Id: item.Id,  // Identificador único
              Celdas: [ { Nombre: "Medio", Tipo: "Texto",   SoloLectura : true,   Valor: item.Etiqueta, Estilo :{} },
                        { Nombre: "Monto", Tipo: "Decimal", SoloLectura : false,  Valor: "0", Estilo :{'text-align':'right'}, },
              ]
            };
            this.DataVenta.Campos.find(campo => campo.Nombre === "Medios")?.Filas.push(fila);
          }
        });
        if (HayApp === true) {
          this.DataVenta.Campos.push({
            Tipo: 'Imagen',
            Nombre: 'ImgApp',
            Etiqueta: 'Foto de pago por App (si aplica)'
          })
        }
        
        
        this.gVentaForm.buildForm();  
      }
    });
  }

  //cargar los productos en la tabla 
  cargarProductos() {
    this.gQuery.sql("sp_operaciones_productos_pedido_devolver", this.IdOperacion).subscribe((data: any) => {
      
      if (data) {        
        this.lstProductos = data;
        this.DataVenta.Campos.push({
          Nombre          : "Productos",
          Etiqueta        : "Productos",
          ColumnaTotal     : "Total",
          Tipo            : "GrupoControles",
          Ancho           : {Celular: "100", Mediana: "50", Grande: "60", Enorme: "60"},
          lstColumnas     : ["Producto", "Cantidad", "Bono", "Precio", "Total"],
          FilasSubTotal   : [],
          Requerido       : false,
          AnchoTabla      : "100%", 
          Filas           : [],          
        });
  
        // recorrer todos los productos y agregarlo fila x fila
        data.forEach((item: any) => {
          const fila = { 
            Id    : item.IdProducto,  // Identificador único
            Celdas: [
              { Nombre: "Producto", Tipo: "Texto",  SoloLectura:true,   Valor: item.Producto },
              { Nombre: "Cantidad", Tipo: "Numero", SoloLectura:false,  Min: 0, Max: item.Cantidad, Valor: item.Cantidad, Requerido: false, Estilo:{'text-align':'center'}, FnChange: (event:any, item?:any) => { this.AumentarCantidadProducto(event,item)   } },
              { Nombre: "Bono",     Tipo: "Texto",  SoloLectura:true,   Valor: item.CantidadBono, Estilo:{'text-align':'center'}, Requerido: false, },
              { Nombre: "Precio",   Tipo: "Texto",  SoloLectura:true,   Valor: item.PrecioUnitario, Estilo:{'text-align':'right'},  },
              { Nombre: "Total",    Tipo: "Texto",  SoloLectura:true,   Valor: item.Total, Estilo:{'text-align':'right'}, Requerido: false, }
            ]
          };
          this.Venta.Productos.push({
            Id: item.IdProducto,
            Producto: item.Producto,
            Cantidad: item.Cantidad,
            CantidadInicial: item.Cantidad,
            Bono : item.CantidadBono,
            Precio: item.PrecioUnitario,
            Total: item.Total
          })
          this.DataVenta.Campos.find(campo => campo.Nombre === "Productos")?.Filas.push(fila);
        });

        // cargar impuestos en subfilas
       

        
        this.gQuery.sql("sp_tipo_operacion_impuestos_devolver", this.IdTipoOperacion).subscribe((data:any)=>{

          if(data){
            // solo habrá un registro
            const Reversivo = data[0].Metodo =="1"? true:false;
            const Formula = parseFloat(data[0].Formula);

            // Agregar la primera fila (bruto)
            let FilaBruto=
            { ColumnaEtiqueta : "Producto", 
              Etiqueta        : "Bruto", 
              ColumnaTotal    : "Total",  
              Valor           : (SumColumna: any)=>{
                                  let Bruto = Reversivo? SumColumna/(1+(Formula)):  SumColumna;                                  
                                  this.Venta.Bruto = Bruto;
                                  return Bruto;        
                                },
              Formato         : "S/ 0.00", //formato del subtotal
              EstiloFila      : { "font-size":"14px",  "background":"#f3f3f3" },
              EstiloEtiqueta  : {'justify-content': 'left', 'text-align':'left', "padding-left":"15px" }, 
              EstiloTotal     : { 'justify-content': 'right', "font-weight":"bold",'text-align':'right', "padding-right":"10px" } 
            };
            this.DataVenta.Campos.find(campo => campo.Nombre === "Productos")?.FilasSubTotal.push(FilaBruto);
            
            

            // Agregar la fila de impuestos
            let FilaImpuesto=
            { ColumnaEtiqueta : "Producto", 
              Etiqueta        : data[0].Abreviatura, 
              ColumnaTotal    : "Total",  
              Valor           : (SumColumna: any)=> {
                                  let Impuesto = Reversivo? (SumColumna/(1+Formula)) * Formula:  SumColumna * Formula;                                  
                                  this.Venta.Impuesto = Impuesto;
                                  return Impuesto;             
                                },
              Formato         : "S/ 0.00", //formato del subtotal
              EstiloFila      : { "font-size":"14px", },
              EstiloEtiqueta  : {'justify-content': 'left', 'text-align':'left', "padding-left":"15px" }, 
              EstiloTotal     : { 'justify-content': 'right', "font-weight":"bold", 'text-align':'right', "padding-right":"10px" } 
            }
            this.DataVenta.Campos.find(campo => campo.Nombre === "Productos")?.FilasSubTotal.push(FilaImpuesto);
          
            // Agregar la fila de totales
            let FilaTotal=
            { ColumnaEtiqueta : "Producto", 
              Etiqueta        : "Total", 
              ColumnaTotal    : "Total",  
              Valor           : (SumColumna: any)=> {
                                  let total = Reversivo? SumColumna:  SumColumna + (SumColumna * Formula);                             
                                  this.Venta.Total = total;
                                  return total;
                                },
              // Formato         : "S/ 0.00", //formato del subtotal
              EstiloFila      : { "font-size":"14px",  "background":"rgb(40, 167, 69)", "color":"white" },
              EstiloEtiqueta  : {'justify-content': 'left', 'text-align':'left', "padding-left":"15px" }, 
              EstiloTotal     : { 'justify-content': 'right', "font-size":"16px", 'text-align':'right', "padding-right":"10px" }
            }
            this.DataVenta.Campos.find(campo => campo.Nombre === "Productos")?.FilasSubTotal.push(FilaTotal);
          }else{

            // si no hay impuesto, directamente el total
            let FilaTotal=
            { ColumnaEtiqueta : "Producto", 
              Etiqueta        : "Total", 
              ColumnaTotal    : "Total",  
              Valor           : (SumColumna: any)=> {
                                 
                                  this.Venta.Bruto = SumColumna;
                                  this.Venta.Impuesto = 0;                  
                                  this.Venta.Total = SumColumna;
                                  return SumColumna;     
                                  
                                        
                                },
              // Formato         : "S/ 0.00", //formato del subtotal
              EstiloFila      : { "font-size":"14px",  "background":"rgb(40, 167, 69)", "color":"white" },
              EstiloEtiqueta  : {'justify-content': 'left', 'text-align':'left', "padding-left":"15px" }, 
              EstiloTotal     : { 'justify-content': 'right', "font-size":"16px", 'text-align':'right', "padding-right":"10px" }

            }
            this.DataVenta.Campos.find(campo => campo.Nombre === "Productos")?.FilasSubTotal.push(FilaTotal);
          }
  
      
   
          
        })
        this.cargarMediosPago();
        this.gVentaForm.buildForm();  // Reconstruir el formulario con los nuevos datos
      }
    });
  }
   
  AumentarCantidadProducto(event, item){

    const IdProducto = item;
    const Cantidad = event.target.value;

    const productosFormGroup = this.gVentaForm.gForm.get("Productos") as FormGroup;
    
    if(Cantidad == 0){
      productosFormGroup.controls[IdProducto].get("Total")?.setValue(0);

      // actualizar la variable de ventas
      this.Venta.Productos.find(item => item.Id ==IdProducto).Cantidad = Cantidad;
      this.Venta.Productos.find(item => item.Id ==IdProducto).Total = this.Venta.Productos.find(item => item.Id ==IdProducto).Precio * Cantidad;
    }else{
      // console.log(this.Venta.Productos)
      productosFormGroup.controls[IdProducto].get("Total")?.setValue(
        (this.Venta.Productos.find(item => item.Id ==IdProducto).Precio * Cantidad).toFixed(2)
      );
      this.Venta.Productos.find(item => item.Id ==IdProducto).Total = this.Venta.Productos.find(item => item.Id ==IdProducto).Precio * Cantidad
    }

    let total =  this.Venta.Productos.reduce((suma, producto: Producto) => suma + Number(producto.Total), 0);
    this.TotalEntero = this.gAux.parte_entero(total);
    this.TotalDecimal = this.gAux.parte_decimal(total);
    // recorrer todo ventas 

  }

  async RegistrarVenta(store:any, parametros:any, ImgApp:any){
    
    const coordenadas = await this.actualizarGPS(); 
    this.gQuery.sql(store, parametros + "|" + coordenadas.lat + "|" + coordenadas.lng).subscribe((data:any) => {
      if(data && data[0].Resultado == "1"){
        
        if(ImgApp != null){
          this.gSubir.subirImagen(ImgApp, this.IdOperacion.toString(), "Pagos").subscribe();
        }


        alert("Entrega Registrada");
        this.router.navigate(['/pedidos_entregar'])
      }
    });

  }

  verQR(){
     const imageUrl = url_api + "QR.jpg";
 
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
           alert("el QR no ha sido configurado")
         }
       });
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
    styleUrls: ['./entregar.component.css'],
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