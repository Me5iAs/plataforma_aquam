import { Component, OnInit, ViewChild } from '@angular/core';
import { gFormComponent } from '../../shared/g-form/g-form.component';
import { gInputDialogComponent } from '../../shared/g-inputDialog/g-input-dialog.component';
import { gAuthService } from 'src/app/services/g-auth.service';
import { gQueryService } from 'src/app/services/g-query.service';
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

@Component({
  selector: 'app-nuevo-pedido',
  templateUrl: './nuevo-pedido.component.html',
  styleUrls: ['./nuevo-pedido.component.css']
})
export class NuevoPedidoComponent implements OnInit {

  @ViewChild('gNuevoPedidoForm') gVentaDirectaForm: gFormComponent;
  @ViewChild('gInputs') gInputs: gInputDialogComponent
  
  public IdTipoOperacion = 1; //el parametro 1 está en duro por ser el tipo de venta directa

  Hoy: any;
  Ahora: any;
  Venta: iVenta;
  DataNuevoPedido: any;
  User: any;
  lstProductos: any[] = [];

  constructor(private gAuth: gAuthService, private gQuery:gQueryService) { }

  ngOnInit(): void {
    this.gAuth.userData().subscribe((data: any) => {
      this.User = data;
    });


    // fecha actual:
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0'); // Los meses van de 0 a 11
    const día = String(hoy.getDate()).padStart(2, '0');
    this.Hoy =   `${año}-${mes}-${día}`;

    // hora actual
      const ahora = new Date();
      const horas = String(ahora.getHours()).padStart(2, '0'); // Horas (00-23)
      const minutos = String(ahora.getMinutes()).padStart(2, '0'); // Minutos (00-59)
      this.Ahora = `${horas}:${minutos}`;
  

    this.Venta = {
      Productos: [], // Inicializar como un array vacío de productos
      Bruto: 0,
      Impuesto: 0,
      Total: 0
    };

    this.DataNuevoPedido = {
      Titulo: "Nuevo Pedido", //titulo del formulario
      FnLimpiar: () => { this.limpiarFormulario(); },
      FnValidacion: (result: any) => { 

        
        if(result?.Idcliente?.Id ==null || result?.IdCliente?.Id == "0" ){
          if(result.Glosa ==""){
            alert("La Glosa es obligatoria para los clientes anónimos");
            return false;
          }
        }

        if(this.Venta.Total == 0){
          alert("Se requiere agregar algun producto para proceder la venta");
          return false;
        }

        return true;

      },
      FnOk: (result: any) => {
        console.log(result);

        // IdCliente, 
        let IdCliente =0; 
        if(result?.Idcliente?.Id ==null){
          IdCliente = 0;
        }else{
          IdCliente = result?.Idcliente?.Id;
        }

        

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

        pProductos = JSON.stringify(productosArray); // Convertir el array a JSON
        const [latitud, longitud] = result.PosicionGPS.split(', ');

        let Parametros = 
        IdCliente     + "|" + 
        this.User?.Id + "|" + 
        result.Glosa  + "|" + 
        result.Fecha  + "|" + 
        result.Hora   + "|" + 
        latitud       + "|" + 
        longitud      + "|" + 
        pProductos;

        
        this.RegistrarPedido("sp_operaciones_pedido_registrar", Parametros);

      },
        
      Campos: [
        { Nombre    : "Idcliente",
          Etiqueta  : "Cliente",
          Tipo      : "ListaDinamica",
          Store     : "sp_clientes_devolver",
          Parametros: "1",
          FnChange  : (event:any, item: any) => { this.SeleccionarCliente(); },
          Resultado : { Id: "Id", Valor: "Nombre" },
          Error     : "Seleccione el Cliente",
          Requerido : false,
          Ancho         : {Celular: "100", Mediana: "50", Grande: "50", Enorme: "50"}, //el valor en porcentajes sin el simbolo
          // Columnas  : {Celular: 1, Mediana: 2, Grande: 2, Enorme: 2}, 
          ActualizarOtroCampo: [{Campo_a_actualizar: "PosicionGPS", item_con_data: "PosicionGPS" }] //al seleccionar un item del desplegable, se toma uno de los valores de este desplegable para ponerlo en un campo
        },
        { Nombre: "PosicionGPS",
          Valor: "-3.7722102000000004, -73.26553229999999",
          Etiqueta: "Mapa",
          Tipo: "Mapa",
          placeholder: "Seleccione un punto en el mapa",
          Error: "la posicion GPS es requerida",
          Patron: "Debe ingresar al menos un caracter",
          Requerido: false,
          Ancho     : {Celular: "100", Mediana: "50", Grande: "50", Enorme: "50"},
        },
        { Nombre      : "Glosa", 
          Valor       : "",
          Etiqueta    : "Comentario", 
          Tipo        : "Texto", 
          placeholder : "Ingrese una Glosa", 
          Error       : "la Descripción es requerida", 
          Patron      : "Debe ingresar al menos un caracter",
          Requerido   : false,
          Ancho     : {Celular: "100", Mediana: "50", Grande: "60", Enorme: "60"},
        },
        { Nombre      : "Fecha", 
          Valor       : this.Hoy,
          Etiqueta    : "Fecha solicita entregar", 
          Tipo        : "Fecha", 
          placeholder : "Ingrese una Glosa", 
          FechaMinima:  this.Hoy,
          Error       : "la Descripción es requerida", 
          Patron      : "Debe ingresar al menos un caracter",
          Requerido   : false,
          Ancho     : {Celular: "100", Mediana: "25", Grande: "20", Enorme: "20"},
        },
        { Nombre      : "Hora", 
          Valor       : this.Ahora,
          Etiqueta    : "Hora solicita entregar", 
          Tipo        : "Hora", 
          placeholder : "Ingrese Hora", 
          Error       : "la Descripción es requerida", 
          Patron      : "Debe ingresar al menos un caracter",
          Requerido   : false,
          Ancho     : {Celular: "100", Mediana: "25", Grande: "20", Enorme: "20"},
        },
      
      ],
    }

    this.cargarProductos();
  }

  //cargar los productos en la tabla 
  cargarProductos() {
    this.gQuery.sql("sp_productos_devolver").subscribe((data: any) => {
      
      if (data) {
        this.lstProductos = data;
        this.DataNuevoPedido.Campos.push({
          Nombre          : "Productos",
          Etiqueta        : "Productos",
          ColumnaTotal     : "Total",
          Tipo            : "GrupoControles",
          Ancho           : {Celular: "100", Mediana: "100", Grande: "100", Enorme: "100"},
          lstColumnas     : ["Producto", "Cantidad", "Bono", "Precio", "Total"],
          FilasSubTotal   : [],
          AnchoTabla      : "100%", 
          Filas           : [],          
        });
  
        // recorrer todos los productos y agregarlo fila x fila
        data.forEach((item: any) => {
          const fila = { 
            Id    : item.Id,  // Identificador único
            Celdas: [
              { Nombre: "Producto", Tipo: "Texto",  SoloLectura:true,   Valor: item.Producto },
              { Nombre: "Cantidad", Tipo: "Numero", SoloLectura:false,  Estilo:{'text-align':'center'}, Valor: "0", FnChange: (event:any, item?:any) => { this.AumentarCantidadProducto(event, item)  } },
              { Nombre: "Bono",     Tipo: "Texto",  SoloLectura:true,   Estilo:{'text-align':'center'}, },
              { Nombre: "Precio",   Tipo: "Texto",  SoloLectura:true,   Estilo:{'text-align':'right'},  },
              { Nombre: "Total",    Tipo: "Texto",  SoloLectura:true,   Estilo:{'text-align':'right'},  }
            ]
          };
          this.Venta.Productos.push({
            Id: item.Id,
            Producto: item.Producto,
            Cantidad: 0,
            Bono : 0,
            Precio: 0,
            Total: 0
          })
          this.DataNuevoPedido.Campos.find(campo => campo.Nombre === "Productos")?.Filas.push(fila);
        });

        // cargar impuestos en subfilas
        
        this.gQuery.sql("sp_tipo_operacion_impuestos_devolver", this.IdTipoOperacion).subscribe((data:any)=>{

          if(data){
            // solo habrá un registro
            const Reversivo = data[0].Metodo =="1"? true:false;
            const Formula = parseFloat(data[0].Formula);

            // Agregar la primera fila (bruto)
            let FilaBruto=
            { ColumnaEtiqueta : "Precio", 
              Etiqueta        : "Bruto", 
              EstiloEtiqueta  : {'justify-content': 'right', "padding-right":"10px" }, 
              ColumnaTotal    : "Total",  
              Valor           : (SumColumna: any)=>{
                                  let Bruto = Reversivo? SumColumna/(1+(Formula)):  SumColumna;                                  
                                  this.Venta.Bruto = Bruto;
                                  return Bruto;        
                                },
              Formato         : "S/ 0.00", //formato del subtotal
              EstiloFila      : { "font-size":"14px",  "background":"#f3f3f3" },
              EstiloTotal     : { 'justify-content': 'right', "font-weight":"bold",'text-align':'right', "padding-right":"10px" } 
            };
            this.DataNuevoPedido.Campos.find(campo => campo.Nombre === "Productos")?.FilasSubTotal.push(FilaBruto);
            
            // Agregar la fila de impuestos
            let FilaImpuesto=
            { ColumnaEtiqueta : "Precio", 
              Etiqueta        : data[0].Abreviatura, 
              EstiloEtiqueta  : {'justify-content': 'right', "padding-right":"10px" }, 
              ColumnaTotal    : "Total",  
              Valor           : (SumColumna: any)=> {
                                  let Impuesto = Reversivo? (SumColumna/(1+Formula)) * Formula:  SumColumna * Formula;                                  
                                  this.Venta.Impuesto = Impuesto;
                                  return Impuesto;             
                                },
              Formato         : "S/ 0.00", //formato del subtotal
              EstiloFila      : { "font-size":"14px", },
              EstiloTotal     : { 'justify-content': 'right', "font-weight":"bold", 'text-align':'right', "padding-right":"10px" } 
            }
            this.DataNuevoPedido.Campos.find(campo => campo.Nombre === "Productos")?.FilasSubTotal.push(FilaImpuesto);
          
            // Agregar la fila de totales
            let FilaTotal=
            { ColumnaEtiqueta : "Precio", 
              Etiqueta        : "Total", 
              EstiloEtiqueta  : {'justify-content': 'right', "padding-right":"10px" }, 
              ColumnaTotal    : "Total",  
              Valor           : (SumColumna: any)=> {
                                  let total = Reversivo? SumColumna:  SumColumna + (SumColumna * Formula);                             
                                  this.Venta.Total = total;
                                  return total;
                                },
              // Formato         : "S/ 0.00", //formato del subtotal
              EstiloFila      : { "font-size":"14px",  "background":"rgb(40, 167, 69)", "color":"white" },
              EstiloTotal     : { 'justify-content': 'right', "font-size":"16px", 'text-align':'right', "padding-right":"10px" }
            }
            this.DataNuevoPedido.Campos.find(campo => campo.Nombre === "Productos")?.FilasSubTotal.push(FilaTotal);
          }else{

            // si no hay impuesto, directamente el total
            let FilaTotal=
            { ColumnaEtiqueta : "Precio", 
              Etiqueta        : "Total", 
              EstiloEtiqueta  : {'justify-content': 'right', "padding-right":"10px" }, 
              ColumnaTotal    : "Total",  
              Valor           : (SumColumna: any)=> {
                                  
                                  this.Venta.Bruto = SumColumna;
                                  this.Venta.Impuesto = 0;                  
                                  this.Venta.Total = SumColumna;
                                  return SumColumna;     
                                  
                                        
                                },
              // Formato         : "S/ 0.00", //formato del subtotal
              EstiloFila      : { "font-size":"14px" },
              EstiloTotal     : { 'justify-content': 'right', "font-size":"16px", 'text-align':'right', "padding-right":"10px" }

            }
            this.DataNuevoPedido.Campos.find(campo => campo.Nombre === "Productos")?.FilasSubTotal.push(FilaTotal);
          }
    
        })
  
        this.gVentaDirectaForm.buildForm();  // Reconstruir el formulario con los nuevos datos
      }
    });
  }

  SeleccionarCliente(){

    // declarar los formularios
    const productosFormGroup = this.gVentaDirectaForm.gForm.get("Productos") as FormGroup;
    
    // obtener el idcliente
    const IdCliente = this.gVentaDirectaForm.gForm.get("Idcliente")?.value?.Id || 0;

    // Recorrer cada fila de productos, obtener la cantidad y consultar los valores de cada punto 
    Object.keys(productosFormGroup.controls).forEach(filaKey => {
      const filaFormGroup = productosFormGroup.get(filaKey) as FormGroup;
      const IdProducto = filaKey;
      const Cantidad = filaFormGroup.get("Cantidad")?.value;

      if (Cantidad == 0){

      }else{
        let Parametros = IdCliente + "|" + this.IdTipoOperacion + "|" + IdProducto + "|" + Cantidad;

        // obtener el nuevo tarifario
        this.gQuery.sql("sp_tarifario_detalle_precio_y_bono", Parametros).subscribe((data: any) => {
          if(data && data[0].Resultado=="1"){
            // establecer los valores
            filaFormGroup.get("Precio")?.setValue(data[0].Precio);
            filaFormGroup.get("Bono")?.setValue(data[0].Bono);
            filaFormGroup.get("Total")?.setValue(data[0].Total);
  
            // actualiar la variable de ventas
            // actualizar la variable de ventas
            this.Venta.Productos.find(item => item.Id ==IdProducto).Cantidad = Cantidad;
            this.Venta.Productos.find(item => item.Id ==IdProducto).Precio = data[0].Precio;
            this.Venta.Productos.find(item => item.Id ==IdProducto).Bono = data[0].Bono;
            this.Venta.Productos.find(item => item.Id ==IdProducto).Total = data[0].Total;
  
          }else{
            this.gVentaDirectaForm.gForm.get("Idcliente").setValue("");
            // filaFormGroup.get("Cantidad")?.setValue(this.Venta.Productos.find(item => item.Id ==IdProducto).Cantidad = Cantidad);
              alert("Error: \n\n El Producto " + filaFormGroup.get("Producto")?.value + " no tiene un tarifario asignado para este cliente.");
              
              // poner todo en cero
              filaFormGroup.get("Cantidad")?.setValue(0.00);
              filaFormGroup.get("Precio")?.setValue(0.00);
              filaFormGroup.get("Bono")?.setValue(0);
              filaFormGroup.get("Total")?.setValue(0.00);
    
              // actualiar la variable de ventas
              this.Venta.Productos.find(item => item.Id ==IdProducto).Cantidad = 0;
              this.Venta.Productos.find(item => item.Id ==IdProducto).Precio = 0.00;
              this.Venta.Productos.find(item => item.Id ==IdProducto).Bono = 0;
              this.Venta.Productos.find(item => item.Id ==IdProducto).Total = 0.00;
  
              // alert(this.Venta)
              return false;
          }
        })
      }
    
    })
  }

  AumentarCantidadProducto(event, item){

    const IdCliente = this.gVentaDirectaForm.gForm.get("Idcliente")?.value?.Id || 0;
    const IdTipoOperacion = this.IdTipoOperacion;
    const IdProducto = item;
    const Cantidad = event.target.value;

    let Parametros = IdCliente + "|" + IdTipoOperacion + "|" + IdProducto + "|" + Cantidad;
    const productosFormGroup = this.gVentaDirectaForm.gForm.get("Productos") as FormGroup;
    
    if(Cantidad == 0){
      const mediosFormGroup = this.gVentaDirectaForm.gForm.get("Medios") as FormGroup;
      productosFormGroup.controls[IdProducto].get("Precio")?.setValue("");
      productosFormGroup.controls[IdProducto].get("Bono")?.setValue("");
      productosFormGroup.controls[IdProducto].get("Total")?.setValue("");

      // actualizar la variable de ventas
      this.Venta.Productos.find(item => item.Id ==IdProducto).Cantidad = Cantidad;
      this.Venta.Productos.find(item => item.Id ==IdProducto).Precio = 0.00;
      this.Venta.Productos.find(item => item.Id ==IdProducto).Bono = 0;
      this.Venta.Productos.find(item => item.Id ==IdProducto).Total = 0.00;

    }else{
      this.gQuery.sql("sp_tarifario_detalle_precio_y_bono", Parametros).subscribe((data: any) => {
        if(data && data[0].Resultado === "1"){
          // actualizar el formulario
  
          const mediosFormGroup = this.gVentaDirectaForm.gForm.get("Medios") as FormGroup;
          productosFormGroup.controls[IdProducto].get("Precio")?.setValue(data[0].Precio);
          productosFormGroup.controls[IdProducto].get("Bono")?.setValue(data[0].Bono);
          productosFormGroup.controls[IdProducto].get("Total")?.setValue(data[0].Total);
  
          // actualizar la variable de ventas
          this.Venta.Productos.find(item => item.Id ==IdProducto).Cantidad = Cantidad;
          this.Venta.Productos.find(item => item.Id ==IdProducto).Precio = data[0].Precio;
          this.Venta.Productos.find(item => item.Id ==IdProducto).Bono = data[0].Bono;
          this.Venta.Productos.find(item => item.Id ==IdProducto).Total = data[0].Total;
  
  
      
        }else{
          
          alert ("Error: \n\n No existe un tarifario configurado de el producto " + this.Venta.Productos.find(item => item.Id ==IdProducto).Producto + " para esta operación con este cliente en la cantidad ingresada");
          productosFormGroup.controls[IdProducto].get("Cantidad")?.setValue(this.Venta.Productos.find(item => item.Id ==IdProducto).Cantidad);
        }
      })
    }
  }

  limpiarFormulario(){
    this.gVentaDirectaForm.gForm.get("Idcliente").setValue("");
    this.gVentaDirectaForm.gForm.get("Glosa").setValue("");
    this.gVentaDirectaForm.gForm.get("Hora").setValue(this.Ahora);
    this.gVentaDirectaForm.gForm.get("Fecha").setValue(new Date());
    this.gVentaDirectaForm.gForm.get("PosicionGPS").setValue("-3.7722102000000004, -73.26553229999999");


    const productosFormGroup = this.gVentaDirectaForm.gForm.get("Productos") as FormGroup;

    Object.keys(productosFormGroup.controls).forEach(filaKey => {
      const filaFormGroup = productosFormGroup.get(filaKey) as FormGroup;
      filaFormGroup.get("Cantidad").setValue(0);
      filaFormGroup.get("Bono").setValue("");
      filaFormGroup.get("Precio").setValue("");
      filaFormGroup.get("Total").setValue("");
    })
    

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
  
  async RegistrarPedido(Store, Parametros){
    const coordenadas = await this.actualizarGPS(); 


    this.gQuery.sql(Store, Parametros + "|" + coordenadas.lat + "|" + coordenadas.lng).subscribe((data:any) => {
      if(data && data[0].Resultado == "1"){
        alert("Pedido registrado");
        this.limpiarFormulario();
      }
    });

  }
}
