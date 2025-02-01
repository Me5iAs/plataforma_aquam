import { Component, OnInit, ViewChild,Renderer2  } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators,AbstractControl, FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { gQueryService } from 'src/app/services/g-query.service';
import { gFormComponent } from '../../shared/g-form/g-form.component';
import { gAuthService } from 'src/app/services/g-auth.service';
import { gInputDialogComponent } from '../../shared/g-inputDialog/g-input-dialog.component';

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

@Component({
  selector: 'app-venta-planta',
  templateUrl: './venta-planta.component.html',
  styleUrls: ['./venta-planta.component.css']
})

export class VentaPlantaComponent implements OnInit {

  @ViewChild('gVentaDirectaForm') gVentaDirectaForm: gFormComponent;
  @ViewChild('gInputs') gInputs: gInputDialogComponent
  
  public IdTipoOperacion = 2; //el parametro 2 está en duro por ser el tipo de operación
  DataVentaDirecta: any;
  User: any;
  lstProductos: any[] = [];
  lstMediosCajas = [];
  
  Venta: iVenta;
  Pagos: iPagos;

  constructor(private gAuth: gAuthService, private gQuery: gQueryService, private renderer: Renderer2) {}

  ngOnInit(): void {
    this.gAuth.userData().subscribe((data: any) => {
      this.User = data;
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
    
    // preparacion preliminar
    this.DataVentaDirecta = {
      Titulo: "Venta Directa en la Planta de Agua", //titulo del formulario
      FnLimpiar: () => {
        this.limpiarFormulario();
      },
      FnValidacion: (result: any) => { 

        // console.log(result);

        // Validaciones:
        // - si no se ha seleccionado un cliente se puede registrar como anónimo, siempre que tenga glosa
        if((result.Idcliente ==null || result.IdCliente =="0") && result.Glosa ==""){
            alert("Los clientes anónimos requieren tener un comentario para poder indentificarlos");
            this.gVentaDirectaForm.setFocus("Glosa")
            return false;
        }
        
        // - si no se tiene ventas registradas 
        if(this.Venta.Total == 0){
          alert("Se requiere agregar algun producto para proceder la venta");
          return false;
        }

        //validar si el total cuadra con la suma de los medios de pago, si no cuadra
        let TotalMedioPago: number = 0
        
        let medio = "" 
        Object.keys(result.Medios).forEach(key => {
          const item = result.Medios[key];
          medio += "- " + item.Medio + ": " + parseFloat(item.Monto).toFixed(2) + "\n";

          TotalMedioPago += parseFloat(item.Monto); 
        });

        let Diferencia:number = this.Venta.Total - TotalMedioPago;

        if(Diferencia > 0 ){
          if((result.Idcliente ==null || result.IdCliente =="0")){
            alert("Error: No se puede dar crédito a clientes anónimos");
            return false;
          }else{
            medio += "- Crédito: " + Diferencia.toFixed(2).toString();
            if(!confirm("La suma de los medios de pago no cuadran con el costo total de los productos seleccionados. \n\n ¿desea registrar la diferencia como crédito? \n\n " + medio)){
              return false
            }
          }
          
          
        }else if (Diferencia < 0){
          alert("El Total pago es superior al valor de los productos seleccionados, corríjalo e inténtelo nuevamente.");
          return false;
        }

        // validar que si es cliente anónimo no puede registrarse créditos

        return true;

      },
      
      FnOk: (result: any) => {

        // console.log(result);
        let IdCliente =0;
        if(result.Idcliente ==null){
          IdCliente = 0;
        }else{
          IdCliente = result.Idcliente;
        }
        // Construir el string JSON para los productos
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
              IdCliente + "|" + 
              this.User?.Id + "|" + 
              result.Glosa + "|" + 
              "1" + "|" + // Facturado siempre es 1
              pPagos + "|" + 
              pProductos;

              this.RegistrarVenta("sp_operaciones_ventadirecta_registrar", Parametros)
            }
          };
          this.gInputs.openDialog();
        }else{
          // console.log(pProductos);

          let Parametros = 
          IdCliente + "|" + 
          this.User?.Id + "|" + 
          result.Glosa + "|" + 
          "1" + "|" + // Facturado siempre es 1
          JSON.stringify(pagosArray) + "|" + 
          pProductos;
          this.RegistrarVenta("sp_operaciones_ventadirecta_registrar", Parametros)
        }

      },
      Campos: [
        {
          Nombre    : "Idcliente",
          Etiqueta  : "Cliente",
          Tipo      : "ListaDinamica",
          Store     : "sp_clientes_devolver",
          Parametros: "1",
          // Valor     : {Id:0},
          FnChange  : (event:any, item: any) => { this.SeleccionarCliente(); },
          Resultado : { Id: "Id", Valor: "Nombre" },
          Error     : "Seleccione el Cliente",
          Requerido : false,
          Columnas  : {Celular: 1, Mediana: 2, Grande: 2, Enorme: 2}, 
        },
        { Nombre      : "Glosa", 
          Valor       : "",
          Etiqueta    : "Comentario", 
          Tipo        : "Texto", 
          placeholder : "Ingrese una Glosa", 
          Error       : "la Descripción es requerida", 
          Patron      : "Debe ingresar al menos un caracter",
          Requerido   : false,
          Columnas  : {Celular: 1, Mediana: 2, Grande: 2, Enorme: 2},
        },
      ],
    }

    this.cargarProductos();
    this.cargarMediosPago();

  }

  // cargar los medios de pagos de manera dinamica 
  cargarMediosPago(){

    this.gQuery.sql("sp_tipo_operacion_medio_pago_devolver", this.IdTipoOperacion).subscribe((data: any) => { 

      if (data) {
        // cargar los medios de pago
        this.DataVentaDirecta.Campos.push({
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
  
        data.forEach((item: any) => {
          if(item.Asignado =="1"){
            const fila = {
              Id: item.Id,  // Identificador único
              Celdas: [ { Nombre: "Medio", Tipo: "Texto",   SoloLectura : true,   Valor: item.Etiqueta, Estilo :{} },
                        { Nombre: "Monto", Tipo: "Decimal", SoloLectura : false,  Valor: "0", Estilo :{'text-align':'right'}, },
              ]
            };
            this.DataVentaDirecta.Campos.find(campo => campo.Nombre === "Medios")?.Filas.push(fila);
          }
        });
  
        this.gVentaDirectaForm.buildForm();  
      }
    });
  }

  //cargar los productos en la tabla 
  cargarProductos() {
    this.gQuery.sql("sp_productos_devolver").subscribe((data: any) => {
      
      if (data) {
        this.lstProductos = data;
        this.DataVentaDirecta.Campos.push({
          Nombre          : "Productos",
          Etiqueta        : "Productos",
          ColumnaTotal     : "Total",
          Tipo            : "GrupoControles",
          Ancho           : {Celular: "100", Mediana: "50", Grande: "60", Enorme: "60"},
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
          this.DataVentaDirecta.Campos.find(campo => campo.Nombre === "Productos")?.Filas.push(fila);
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
            this.DataVentaDirecta.Campos.find(campo => campo.Nombre === "Productos")?.FilasSubTotal.push(FilaBruto);
            
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
            this.DataVentaDirecta.Campos.find(campo => campo.Nombre === "Productos")?.FilasSubTotal.push(FilaImpuesto);
          
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
            this.DataVentaDirecta.Campos.find(campo => campo.Nombre === "Productos")?.FilasSubTotal.push(FilaTotal);
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
              EstiloFila      : { "font-size":"14px",  "background":"rgb(40, 167, 69)", "color":"white" },
              EstiloTotal     : { 'justify-content': 'right', "font-size":"16px", 'text-align':'right', "padding-right":"10px" }

            }
            this.DataVentaDirecta.Campos.find(campo => campo.Nombre === "Productos")?.FilasSubTotal.push(FilaTotal);
          }
    
        })
  
        this.gVentaDirectaForm.buildForm();  // Reconstruir el formulario con los nuevos datos
      }
    });
  }
  
  SeleccionarCliente(){

    // declarar los formularios
    const productosFormGroup = this.gVentaDirectaForm.gForm.get("Productos") as FormGroup;
    const mediosFormGroup = this.gVentaDirectaForm.gForm.get("Medios") as FormGroup;
  
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
  
            setTimeout(() => {
              // limpiar todos los montos del formulario de montos
              Object.keys(mediosFormGroup.controls).forEach(filaKey => {
                const filaFormGroup = mediosFormGroup.get(filaKey) as FormGroup;
                filaFormGroup.get("Monto")?.setValue("0.00");
              })
      
              // acceder al primer registro y asignarle el valor del total
              mediosFormGroup.controls[ Object.keys(mediosFormGroup.controls)[0]].get("Monto").setValue(this.Venta.Total.toFixed(2));
              // mediosFormGroup.controls[0].get("Medios").setValue(this.Venta.Total);
              console.log('Después de ejecución - Venta:', this.Venta);
            }, 0);
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


      setTimeout(() => {
  
        // limpiar todos los montos del formulario de montos
        Object.keys(mediosFormGroup.controls).forEach(filaKey => {
          const filaFormGroup = mediosFormGroup.get(filaKey) as FormGroup;
          filaFormGroup.get("Monto")?.setValue("0.00");
        })

        // acceder al primer registro y asignarle el valor del total
        mediosFormGroup.controls[ Object.keys(mediosFormGroup.controls)[0]].get("Monto").setValue(this.Venta.Total.toFixed(2));
        // console.log('Después de ejecución - Venta:', this.Venta);
      }, 0);



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
  
  
          setTimeout(() => {
  
            // limpiar todos los montos del formulario de montos
            Object.keys(mediosFormGroup.controls).forEach(filaKey => {
              const filaFormGroup = mediosFormGroup.get(filaKey) as FormGroup;
              filaFormGroup.get("Monto")?.setValue("0.00");
            })
  
            // acceder al primer registro y asignarle el valor del total
            mediosFormGroup.controls[ Object.keys(mediosFormGroup.controls)[0]].get("Monto").setValue(this.Venta.Total.toFixed(2));
            // console.log('Después de ejecución - Venta:', this.Venta);
          }, 0);
        }else{
          
          alert ("Error: \n\n No existe un tarifario configurado de el producto " + this.Venta.Productos.find(item => item.Id ==IdProducto).Producto + " para esta operación con este cliente en la cantidad ingresada");
          productosFormGroup.controls[IdProducto].get("Cantidad")?.setValue(this.Venta.Productos.find(item => item.Id ==IdProducto).Cantidad);
        }
      })
    }

  
    
 
    

  }


  async RegistrarVenta(store:any, parametros:any){
    const coordenadas = await this.actualizarGPS(); 
    
    // console.log(store);
    // console.log(parametros);
// return ;
    this.gQuery.sql(store, parametros + "|" + coordenadas.lat +"|" + coordenadas.lng ).subscribe((data:any) => {
      // console.log(parametros);

      if(data && data[0].Resultado == "1"){
        alert("Venta realizada")
        this.limpiarFormulario()
      }
    });

  }

  limpiarFormulario(){
    // cliente
    this.gVentaDirectaForm.gForm.get("Idcliente").setValue("");
    this.gVentaDirectaForm.gForm.get("Glosa").setValue("");

    const productosFormGroup = this.gVentaDirectaForm.gForm.get("Productos") as FormGroup;

    Object.keys(productosFormGroup.controls).forEach(filaKey => {
      const filaFormGroup = productosFormGroup.get(filaKey) as FormGroup;
      filaFormGroup.get("Cantidad").setValue(0);
      filaFormGroup.get("Bono").setValue("");
      filaFormGroup.get("Precio").setValue("");
      filaFormGroup.get("Total").setValue("");
    })

    const mediosFormGroup = this.gVentaDirectaForm.gForm.get("Medios") as FormGroup;
    Object.keys(mediosFormGroup.controls).forEach(filaKey => {
      const filaFormGroup = mediosFormGroup.get(filaKey) as FormGroup;
      filaFormGroup.get("Monto").setValue(0);
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
}
