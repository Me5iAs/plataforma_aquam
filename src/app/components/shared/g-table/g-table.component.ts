/**
 * en caso del campo ListaDinamica se tiene esta configuracion:
 * 
 * listaDinamica:
 *         {
          "Nombre": "IdCliente",
          "Valor": "",
          "Etiqueta": "Cliente",
          "Tipo": "ListaDinamica",
          "Store": "sp_clientes_devolver",  // Simulando una consulta para obtener los clientes
          "Parametros": { "pId": "0" },  // Puedes ajustar estos parámetros según tus necesidades
          "Resultado": { "Id": "Id", "Valor": "Nombre" },
          "Error": "Seleccione un cliente",
          "Requerido": true,
          "Estilo": { "max-width": "300px" }
        },

        Lista:
          {
              Nombre      : "Tipo", 
              Valor       : "",
              Etiqueta    : "Tipo", 
              Tipo        : "Lista",
              Lista       : [{Id:"Debe", Valor:"Debe"}, {Id:"Haber", Valor:"Haber"}], 
              placeholder : "Seleccione el tipo ", 
              Error       : "Es requerido seleccionar na cuenta", 
              Patron      : "Seleccione una opción"
            },
 */

import { Inject, Component, Input, Output, EventEmitter, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { gQueryService } from "../../../services/g-query.service"
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { saveAs } from 'file-saver';
import {DateAdapter, MAT_DATE_FORMATS} from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from "../../format-datepicker";
import { Observable, of, Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { gAuxService } from '../../../services/g-aux.services';
import { gConstantesService } from "../../../services/g-constantes.service"

import * as L from 'leaflet';
import 'leaflet-routing-machine';
import { NavigationStart, Router } from '@angular/router';

const url_api = gConstantesService.gBaseUrl;
@Component({
  selector: 'g-Table',
  templateUrl: './g-table.component.html',
  styleUrls: ['./g-table.component.css'],

})

export class gTableComponent  {

  @Input() Conf: any;
  @Output() selectedItems = new EventEmitter<any[]>();
  
  dataSource: MatTableDataSource<any[]>;
  DataActual;
  filterValue: string = '';
  fechaDesde: Date | null = null;
  fechaHasta: Date | null = null;

  displayedColumns: string[];
  hiddenColumns: string[]; 
  pageSizeOptions;
  pageSize;
  ItemsSeleccionados: any[] = []; // Array para almacenar las filas seleccionadas
  isDataLoaded:boolean = false;
  


  @ViewChild(MatPaginator) paginator!: MatPaginator; 
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  
  intervalId: any;
  routerSubscription: Subscription;

  constructor(
    public dialog: MatDialog, 
    private snackBar: MatSnackBar,
    private gQuery:gQueryService,
    public gAux:gAuxService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource<any>();  // Inicializa la instancia


    // paginacion
    this.pageSizeOptions = this.Conf?.Opciones?.Paginacion?.Op || [5, 10, 15];
    this.pageSize = this.Conf?.Opciones?.Paginacion?.Size || 50;
    let i = 0;
    
    if(this.Conf?.Opciones?.Recarga?.Intervalo){
      this.intervalId = setInterval(() => {
        i++
        // console.log(i);

        this.recargarData(this.Conf?.Opciones?.Recarga.IdUnico);
      }, this.Conf?.Opciones?.Recarga.Intervalo)
    }
    
    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.DetenerRecarga();
      }
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;  // Enlace entre la tabla y el paginador
  }

  DetenerRecarga(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  ngOnDestroy(): void {
    // Limpia el intervalo cuando se destruye el componente
    this.DetenerRecarga();

    // Cancela la suscripción a los eventos del router
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
  
  recargarData(IdUnico:string) {

    const parametros = this.Conf.Datos.Parametros ? this.Conf.Datos.Parametros : undefined;

    this.gQuery.sql(this.Conf.Datos.Store, parametros).subscribe((data:any) => {
      
      if(data){
        const newIds = data.map(item => item[IdUnico]);
        const originalIds = this.DataActual.map(item=> item[IdUnico]);
        const itemsToRemove = this.DataActual.filter(item => !newIds.includes(item[IdUnico]));
        const itemsToAdd = data.filter(item => !originalIds.includes(item[IdUnico]));

        let updatedData = this.dataSource.data.filter(item => !itemsToRemove.some(r => r[IdUnico] === item[IdUnico]));
        updatedData = [...updatedData, ...itemsToAdd];
  
        // Inicializar el dataSource antes de asignarle datos
        this.dataSource.data = updatedData;
        this.DataActual = [...data];
        this.dataSource.paginator = this.paginator;
      }else{
        this.dataSource.data = [];
        this.DataActual = [];
      }

      /*
      let newIds;

      data? newIds = data.map(item => item[IdUnico]): newIds =[];
      // const newIds = data.map(item => item[IdUnico]);
      const originalIds = this.DataActual.map(item => item[IdUnico]);

      const itemsToRemove = this.DataActual.filter(item => !newIds.includes(item[IdUnico]));
      
      let itemsToAdd
      data? itemsToAdd = data.filter(item => !originalIds.includes(item[IdUnico])):itemsToAdd=[];

      let updatedData = this.dataSource.data.filter(item => !itemsToRemove.some(r => r[IdUnico] === item[IdUnico]));
      updatedData = [...updatedData, ...itemsToAdd];

      // Inicializar el dataSource antes de asignarle datos
      this.dataSource.data = updatedData;
      this.DataActual = [...data];
      */
    });
  }

  AnchoAcciones(){
    let total;
    if(this.Conf?.Acciones){
       total = Object.keys(this.Conf.Acciones).filter(item=> item != "Agregar" && item !="Otros").length
      if(this.Conf?.Acciones?.Otros){
        total = total + Object.keys(this.Conf.Acciones.Otros).length;
      }
    }
    return total * 40;    
  }

  cargarData() {

    const target = document.getElementById('cargando_principal');
    target.style.display = "block";

    // const parametros = this.Conf?.Datos?.Parametros ?? undefined;
    const parametros = this?.Conf?.Datos?.Parametros ? this.Conf.Datos.Parametros : undefined;

    this.gQuery.sql(this?.Conf?.Datos?.Store, parametros).subscribe((data:any) => {
      target.style.display = "none";
     

      // Inicializar el dataSource antes de asignarle datos
      this.dataSource = new MatTableDataSource<any>();
     
      if (!Array.isArray(data) || data.length === 0) {
        this.dataSource.data = [];
        this.DataActual = [];
        this.ItemsSeleccionados = []; // Deselecciona todos
        this.selectedItems.emit(this.ItemsSeleccionados);
      } else {
        this.DataActual = [...data];
        this.ItemsSeleccionados = []; // Deselecciona todos
        this.selectedItems.emit(this.ItemsSeleccionados);

        this.isDataLoaded = true;
        this.displayedColumns = [];

        // this.dataSource = new MatTableDataSource(<any>data);
        this.dataSource.data = data;
        
        // if(this.Conf?.Opciones?.Paginacion){
        //   this.dataSource.paginator = this.paginator;
        // }
       
        if (this?.Conf?.Opciones?.Paginacion) {
          if (!this.dataSource.paginator) {
            this.dataSource.paginator = this.paginator; // Asignar paginator solo si aún no se asignó
          }
        }

        this.hiddenColumns = this.Conf.Datos.ColumnasOcultas;

        // si se ha establecido el orden de las columnas
        if(this.Conf?.Datos?.OrdenColumnas){
          this.displayedColumns =  this.Conf.Datos.OrdenColumnas
           
        }else{

        
        this.displayedColumns = Object.keys(data[0]).filter(column => !this.hiddenColumns.includes(column));
        
        // Procesar Columnas Fusionadas
        if (this.Conf?.Datos?.ColumnasFusionadas) {
          this.Conf.Datos.ColumnasFusionadas.forEach((colFusionada: any) => {
            this.displayedColumns.push(colFusionada.Columna);
          });
        }
        }
        
        if ( this.Conf?.Opciones?.Checkbox){
          this.displayedColumns = ['select', ...this.displayedColumns]
        }

        if (
          this.Conf?.Acciones && (this.Conf.Acciones.Editar ||
                                  this.Conf.Acciones.Eliminar  ||
                                  this.Conf.Acciones.Info  ||
                                    (this.Conf.Acciones.Otros?.length > 0)
                                )
        ) {
          for (let i = this.displayedColumns.length - 1; i >= 0; i--) {
            if (this.displayedColumns[i] === 'actions') {
              this.displayedColumns.splice(i, 1); // Eliminar el elemento en el índice actual
            }
          }
          
          this.displayedColumns.push('actions');
        }

      }
    });
  }

  isFusionada(column: string): boolean {
    return this.Conf?.Datos?.ColumnasFusionadas?.some(fusionada => fusionada.Columna === column);
  }
  
  getFusionadaHTML(row: any, column: string): string {
    const columnaFusionada = this.Conf?.Datos?.ColumnasFusionadas?.find(fusionada => fusionada.Columna === column);
    if (!columnaFusionada || !columnaFusionada.HTML) return '';
  
    let html = columnaFusionada.HTML;
  
    // Reemplazar las variables de la fila dentro del HTML
    Object.keys(row).forEach(columna => {
      const valor = row[columna] || '';
      html = html.replace(new RegExp(`\\$${columna}`, 'g'), valor);
    });
  
    // Reemplazar comillas simples por dobles para asegurar que Angular interprete las clases correctamente
    return html.replace(/class='([^']+)'/g, 'class="$1"');
  }
  
  // Procesar el valor para el Titulo o Cuerpo con las columnas sustituidas
  getFusionadaValue(row: any, column: string, tipo: 'Titulo' | 'Cuerpo'): string {
    const columnaFusionada = this.Conf?.Datos?.ColumnasFusionadas?.find(fusionada => fusionada.Columna === column);
    if (!columnaFusionada) return '';

    // Obtenemos la plantilla (Titulo o Cuerpo) y reemplazamos las variables como $Cliente, $Cantidad, etc.
    let template = columnaFusionada[tipo] || '';

      // Verifica si alguna de las variables en la plantilla está vacía en la fila actual
  const contieneDatos = Object.keys(row).some(columna => {
    const placeholder = `$${columna}`;
    return template.includes(placeholder) && row[columna];
  });

  if (!contieneDatos) {
    // Si no hay datos en ninguna de las columnas requeridas, retorna vacío
    return '';
  }
    Object.keys(row).forEach(columna => {
      const valor = row[columna] || '';
        template = template.replace(new RegExp(`\\$${columna}`, 'g'), valor);
    });
    return template;
  }

  // Obtener los estilos para el Titulo o el Cuerpo
  getFusionadaStyle(column: string, tipo: 'EstiloTitulo' | 'EstiloCuerpo'): any {
    const columnaFusionada = this.Conf?.Datos?.ColumnasFusionadas?.find(fusionada => fusionada.Columna === column);
    return columnaFusionada?.[tipo] || {}; // Devolver el estilo o un objeto vacío si no existe
  } 

  getExisteColumnaIcono(columna){
    if(this.Conf?.Datos?.ColumnasIcono){
      if(this.Conf?.Datos?.ColumnasIcono?.filter(item => item.Columna == columna).length > 0){
        return true;
      }else{
        return false;
      }
    }else{
      return false;
    }
    
  }

  
  getEstiloColumna(columna){
    // console.log(columna)
    return this.Conf?.Datos?.ColumnasEstilos?.find(item=> item.Columna == columna)?.Estilo || null
    // return Array.isArray(this?.Conf?.Datos?.ColumnasEstilos) && this?.Conf?.Datos?.ColumnasEstilos.length > 0 
    // ? this.Conf.Datos.ColumnasEstilos[0][columna] || null
    // : null;
  }

  getColumnaPantalla(columna:any){
    const classes = [];
    let fila;
    // console.log(columna);
    if(this.Conf?.Datos?.ColumnasOcultarPantallas?.some(item => item.Columna ==columna)){
      fila = this.Conf?.Datos?.ColumnasOcultarPantallas?.find(item => item.Columna ==columna);
      fila.Celular== true?  classes.push("ocultar_celular") : classes.push("mostrar_celular");
      fila.Mediano== true?  classes.push("ocultar_mediana") : classes.push("mostrar_mediana");
      fila.Grande== true?   classes.push("ocultar_grande")  : classes.push("mostrar_grande");
      fila.Enorme== true?   classes.push("ocultar_enorme")  : classes.push("mostrar_enorme");

    }else{
      classes.push('mostrar_celular', 'mostrar_mediana', 'mostrar_grande', 'mostrar_enorme');
    }
    
    
    return classes;
  }


  getEventoclick(elemento:any, columna:any){

    if(this.Conf?.Datos?.ColumnasClick?.some(item=> item.Columna == columna)){
      this.Conf?.Datos?.ColumnasClick?.find(item=> item.Columna == columna).Accion(elemento);
    }
  }

  getValorColumnaIcono(elemento, columna, campo:string){  
    
    let item:any = this.Conf.Datos.ColumnasIcono.filter(item => item.Columna == columna)[0];
    
    // console.log(item);
    // console.log(elemento);
    // console.log(columna);
    let Icono = item.Icono.filter(iconos=> iconos.Valor == elemento[columna]);
    
    
    // console.log(campo);
    // if(elemento.EstadoPedido == 'Eliminado'){
    //   console.log("AAAA")

    // }
  
    return Icono[0][campo] || "";
    
  }

  getEtiquetaColumna(columna){
    let item:any = this.Conf.Datos?.ColumnasEtiquetas?.filter(item => item.Columna == columna)[0]?.Etiqueta || columna;
    return item;
    
  }
  
  getValorCelda(valor:any, columna){
    
    let item:any = this.Conf?.Datos?.CeldasValor?.filter(item => item.Columna == columna)[0]?.Valores?.filter(item => item.Dato == valor)[0]?.Valor || valor;
    // console.log(item)
    return item;
    
  }

  aplicarFiltro(event: Event | null = null) {
    const filterValue = event ? (event.target as HTMLInputElement).value : this.filterValue;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  filtrarPorFechas() {
    if (this.fechaDesde && this.fechaHasta) {
      const desde = new Date(this.fechaDesde);
      const hasta = new Date(this.fechaHasta);

      this.dataSource.data = this.dataSource.data.filter((item) => {
        const fechaReferencia = new Date(item['campoFecha']); // Cambia 'campoFecha' al nombre correcto del campo
        return fechaReferencia >= desde && fechaReferencia <= hasta;
      });
    }
  }
  
  limpiarFiltro() {
    this.filterValue = '';
    this.aplicarFiltro();
  }
  
  ejecutarAccion(accion: any, element: any) {
    // Ejecutar la función de la acción
    
    if(accion.Tipo =='Info'){
      accion.Parametros.forEach(param => {
        if (param.Nombre in element) {
          param.Valor = element[param.Nombre];
        }
      });
      console.log(accion);
      
      let ancho = Object.values(accion.Parametros.find(item => item.Tipo=="TablaDinamica") || []).length> 0? '90vw': '450px';
      console.log(ancho);
      
      this.dialog.open(gTableDialog, {
        width: ancho,    
        data: {data:accion, isMode:"Info", fila: element},  
        maxHeight: "95vh",
        maxWidth: "95vw",
      });
      // this.info(element)
    }else{
      accion.Funcion(element);
      // if (accion.Recargar== true) {
      //   this.cargarData();
      // }
    }
    
    // Preguntar si se debe recargar

  }

  info(element:any){ 
    this.Conf.Acciones.Info.Parametros.forEach(param => {
      if (param.Nombre in element) {
        param.Valor = element[param.Nombre];
      }
    });
    
 
    this.dialog.open(gTableDialog, {
      width: '450px',
      data: {data:this.Conf.Acciones.Info, isMode:"Info", fila: element },
      maxHeight: "95vh",
      maxWidth: "95vw",
    });

    
  }

  agregar(){
    
    const dialogRef = this.dialog.open(gTableDialog, {
      width: '450px',
      data: { data    :   this.Conf.Acciones.Agregar, isMode:"Agregar" }
    });

    dialogRef.afterClosed().subscribe(result => {      
      if (result?.result) {

        // si hay una funcion de agregar se usa esa, sino se hace directamente
        if(this.Conf.Acciones.Agregar.FnAgregar){
          

          this.Conf.Acciones.Agregar.Parametros.forEach(param => {
            if (param.Tipo =="ListaDinamica"){
              result.data[param.Nombre] = result.data[param.Nombre]?.Id || null
            }

            if(param.Tipo =="Hora"){
              result.data[param.Nombre] = this.formatTimeForDb(result.data[param.Nombre])
            }

            if(param.Tipo =="Fecha"){
              result.data[param.Nombre] = this.formatDateForDb(result.data[param.Nombre])
            }

            if(param.Tipo == "Imagen"){
              result.data[param.Nombre] = result.archivo[param.Nombre] || null;
            } 
            
          })
        // result.data.File = ;
          this.Conf.Acciones.Agregar.FnAgregar(result.data)
        }else{

        const target = document.getElementById('cargando_principal');
        target.style.display = "block";        
        
        const Parametros = this.Conf.Acciones.Agregar.Parametros.map(param => result.data[param.Nombre]).join('|');
        this.gQuery.sql( this.Conf.Acciones.Agregar.Store, Parametros)
        .subscribe(response => {

          
          target.style.display = "none";
          if(!response){
            alert("hubo un error al conectarse a la BD");
            return;
          }
          const resultado = response["resultado"];
          const mensaje = this.Conf.Acciones.Agregar.Respuestas.find(res => res.Resultado === resultado)?.Mensaje || "Se produjo un error desconocido.";
          alert(mensaje);

          if (parseInt(resultado) > 0) {
            this.cargarData(); // Refresh data
        }
         
        }, (error) => {
          console.error('Error ejecutando la consulta SQL:', error);
          alert('Hubo un error al intentar eliminar la cuenta.');
        }); 
      }
      }
    });
  }

  // // Convertir la hora al formato hh:mm:ss
  private formatTimeForDb(time: string): string {
    const parts = time.split(':');
    return `${parts[0]}:${parts[1]}:00`; // Agregar los segundos
  }

  // // Convertir la fecha al formato YYYY-MM-DD
  private formatDateForDb(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  editar(element:any){

   
    
    this.Conf.Acciones.Editar.Parametros.forEach(param => {
      if (param.Nombre in element) {
        param.Valor = element[param.Nombre];
      }
    });


    
    const dialogRef = this.dialog.open(gTableDialog, {
      width: '450px',
      data: {data:this.Conf.Acciones.Editar, isMode:"Editar" }
    });

    dialogRef.afterClosed().subscribe(result => {

      
      if (result?.result) {

        // si hay una funcion de agregar se usa esa, sino se hace directamente
        if(this.Conf.Acciones.Editar.FnEditar){
          this.Conf.Acciones.Editar.Parametros.forEach(param => {
            if (param.Tipo =="ListaDinamica"){
              result.data[param.Nombre] = result.data[param.Nombre]?.Id || null;
            }

            if(param.Tipo =="Hora"){
              result.data[param.Nombre] = this.formatTimeForDb(result.data[param.Nombre])
            }

            if(param.Tipo =="Fecha"){
              result.data[param.Nombre] = this.formatDateForDb(result.data[param.Nombre])
            }

            if(param.Tipo == "Imagen"){
              result.data[param.Nombre] = result.archivo[param.Nombre] || null;
            } 
          })
        
          this.Conf.Acciones.Editar.FnEditar(result.data)
        }else{
          
          const target = document.getElementById('cargando_principal');
          target.style.display = "block";
        
          const Parametros = this.Conf.Acciones.Editar.Parametros.map(param => result.data[param.Nombre]).join('|');
          this.gQuery.sql( this.Conf.Acciones.Editar.Store, Parametros)
            .subscribe(response => {
          
              target.style.display = "none";
              if(!response){
                alert("hubo un error al conectarse a la BD");
                return;
              }
              const resultado = response["resultado"];
              const mensaje = this.Conf.Acciones.Editar.Respuestas.find(res => res.Resultado === resultado)?.Mensaje || "Se produjo un error desconocido.";
    
              alert(mensaje);
    
              if(resultado == "1") {
                this.cargarData(); // Refresh data
              } 
            }, (error) => {
            console.error('Error ejecutando la consulta SQL:', error);
            alert('Hubo un error al intentar eliminar la cuenta.');
          }); 
        }
      }

    });
  }

  eliminar(item:any): void {
    console.log(item);
  
    const Estado = item[this.Conf.Acciones.Eliminar?.Reactivar?.Estado.Columna] || "1";
    
    let ModoReactivar = false; 

    if(this.Conf.Acciones.Eliminar?.Reactivar && Estado == 0){
      ModoReactivar = true;
    }else{
      ModoReactivar = false;
    }

    let Mensaje
    if(ModoReactivar == false){
      Mensaje = this.Conf.Acciones.Eliminar.Mensaje || '¿Está seguro de que desea eliminar este registro?';
    }else{
      Mensaje = this.Conf.Acciones.Eliminar?.Reactivar?.Mensaje || '¿Está seguro de que desea reactivar este registro?';        
    }
    
    
    

    const confirmed = confirm(Mensaje);

    if (confirmed) {   
      const target = document.getElementById('cargando_principal');
      target.style.display = "block";

      let store; 
      ModoReactivar == false? store = this.Conf.Acciones.Eliminar.Store: store = this.Conf.Acciones.Eliminar.Reactivar.Store;
      
      const Parametros = this.Conf.Acciones.Eliminar.Parametros.map(param => item[param]).join('|');

      this.gQuery.sql( store, Parametros)
      .subscribe(response => {

        target.style.display = "none";
        
        if(!response){
          alert("hubo un error al conectarse a la BD");
          return;
        }
        
        const resultado = response[0].Resultado;
        if(ModoReactivar== false){
          let mensaje = this.Conf.Acciones.Eliminar.Respuestas.find(res => res.Resultado === resultado)?.Mensaje || "Se produjo un error desconocido.";
          alert(mensaje)
        }else{
          let mensaje = this.Conf.Acciones.Eliminar?.Reactivar.Respuestas.find(res => res.Resultado === resultado)?.Mensaje || "Se produjo un error desconocido.";
          alert(mensaje)
        }
        // const mensaje = this.Conf.Acciones.Eliminar.Respuestas.find(res => res.Resultado === resultado)?.Mensaje || "Se produjo un error desconocido.";
        // alert(mensaje);

        if(resultado == "1") {
          this.cargarData(); // Refresh data
        } 
      }, (error) => {
        console.error('Error ejecutando la consulta SQL:', error);
        alert('Hubo un error al intentar eliminar la cuenta.');
      }); 
    }
  }

  exportToCSV() {
    // Obtén el separador desde el JSON o usa tabulaciones por defecto
    const separator = this.Conf?.Acciones.Exportar?.Separador || '\t';

    const csvData = this.dataSource.data.map(row => {
      return this.displayedColumns
        .filter(column => column !== 'actions') // Excluye la columna de acciones
        .map(column => row[column])
        .join(separator);
    });

    const csvContent = [
      this.displayedColumns.filter(column => column !== 'actions').join(separator), // Header row
      ...csvData
    ].join('\n');

    // Añadir el BOM para UTF-8
    const bom = '\uFEFF';

    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${this.Conf.Titulo}.csv`);
  }

  sumarCampo(nombreColumna: string): number {
    if (!this.dataSource || !this.dataSource.data.length) {
      return 0; // Si no hay datos, retornar 0
    }
  
    // Recorrer todas las filas de la tabla y sumar los valores de la columna
    let total = 0;
    this.dataSource.data.forEach((row: any) => {
      const v = row[nombreColumna];
      const valor = parseFloat(v);
      
      if (!isNaN(valor)) {
        total += valor;
      } else {
        // console.warn(`El valor de la columna '${nombreColumna}' no es un número en la fila:`, row);
      }
    });
  
    return total;
  }

  contarCampo(nombreColumna: string): number {
    if (!this.dataSource || !this.dataSource.data.length) {
      return 0; // Si no hay datos, retornar 0
    }
  
    // Recorrer todas las filas de la tabla y sumar los valores de la columna
    let total = 0;
    this.dataSource.data.forEach((row: any) => {
      const valor = parseFloat(row[nombreColumna]);
  
      if (!isNaN(valor) && valor>0) {
        total ++;
      } else {
        console.warn(`El valor de la columna '${nombreColumna}' no es un número en la fila:`, row);
      }
    });
  
    return total;
  }

  TieneDatos(){
    if (!this.dataSource || !this.dataSource.data.length) {    
      return false; 
    }else{
      return true;
    }
  }

  // SECCIÓN DE SELECCIÓN
  //======================

  // seleccionar / deseleccionar un registro
  toggleSelection(row: any) {
    // al hacer click en un check verifica si está seleccionado, si lo está lo "deselecciona" y lo retira del array de items seleccionados, si no lo está lo selecciona y lo ingresa a la matriz de items seleccionados
    const index = this.ItemsSeleccionados.indexOf(row);
    if (index === -1) {
      this.ItemsSeleccionados.push(row); // Añadir a la selección
    } else {
      this.ItemsSeleccionados.splice(index, 1); // Eliminar de la selección
    }
    this.selectedItems.emit(this.ItemsSeleccionados); // Emitir los elementos seleccionados
  }

  // seleccionar / deseleccionar todo
  toggleSelectAll(event: any) {
    // si se está chequeando, entonces se selecciona todo, sino se quita a todos
    if (event.checked) {
      this.ItemsSeleccionados = this.dataSource.data.slice(); // Selecciona todos
    } else {
      this.ItemsSeleccionados = []; // Deselecciona todos
    }
    this.selectedItems.emit(this.ItemsSeleccionados); // Emitir los elementos seleccionados
  }

  // seleccionar todo
  seleccionarTodo(){
    // está pensado para ser accedido como un método desde una posicion externa, por eso está en español
    this.ItemsSeleccionados = this.dataSource.data.slice();
  }

  eliminarSeleccion(){

    // 1. Verificar si hay elementos seleccionados
    if (this.ItemsSeleccionados.length === 0) {
      this.snackBar.open('No hay elementos seleccionados para eliminar.', 'Cerrar', { duration: 3000 });
      return;
    }
  
    // 2. Confirmación del usuario
    const confirmed = confirm(`¿Está seguro de que desea eliminar ${this.ItemsSeleccionados.length} elemento(s)?`);
    if (!confirmed) {
      return;
    }
  
    // 3. Recorrer los elementos seleccionados y eliminarlos
    let eliminados = 0;
    let noeliminados = 0;
    const total = this.ItemsSeleccionados.length;
    let contador = 0;
    const target = document.getElementById('cargando_principal');
    target.style.display = "block";
 
      this.ItemsSeleccionados.forEach(item => {
        const Parametros = this.Conf.Acciones.Eliminar.Parametros.map(param => item[param]).join('|');
        this.gQuery.sql( this.Conf.Acciones.Eliminar.Store, Parametros)
        .subscribe(response => {
          contador++;
          if(!response){
            noeliminados++;
            return;
          }

          if(response["resultado"] == "1") {
           eliminados++;
          } 

          if (contador === total) {

            if(eliminados == 0){
              alert("No se ha eliminado ningun registro, " + noeliminados + " registros no eliminados.")
              this.cargarData()
              return;
            }
      
            if(eliminados> 0 && noeliminados>0){
              alert("Se han eliminado " + eliminados + " registros, no se ha podido eliminar" + noeliminados + " registros.");
              this.cargarData()
              return;
            }
      
            if(eliminados> 0 && noeliminados==0){
              alert("Se han eliminado " + eliminados + " registros.");
              this.cargarData()
              return;
            }
          }
        },
        (error) => {
          noeliminados++
          contador++;
          if (contador === total) {

            if(eliminados == 0){
              alert("No se ha eliminado ningun registro, " + noeliminados + " registros no eliminados.")
              this.cargarData()
              return;
            }
      
            if(eliminados> 0 && noeliminados>0){
              alert("Se han eliminado " + eliminados + " registros, no se ha podido eliminar" + noeliminados + " registros.");
              this.cargarData()
              return;
            }
      
            if(eliminados> 0 && noeliminados==0){
              alert("Se han eliminado " + eliminados + " registros.");
              this.cargarData()
              return;
            }
          }
        }); 
      })

      target.style.display = "none";

      
       
     
  
  }

  isAllSelected() {
    return this.ItemsSeleccionados.length === this.dataSource.data.length;
  }

  isIndeterminate() {
    return this.ItemsSeleccionados.length > 0 && this.ItemsSeleccionados.length < this.dataSource.data.length;
  }

  
}


@Component({
  selector: 'g-table-dialog',
  templateUrl: './g-table-dialog.html',
  styleUrls: ['./g-table-dialog.css'],
  providers: [
    {provide: DateAdapter, useClass: AppDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
  ]
})
export class gTableDialog implements OnInit {

  gTableForm: FormGroup;
  isMode:any;

  public FileData;
 public File: { [key: string]: File } = {};
  public imageUrl: { [key: string]: any } = {};

  data: any;
  Titulo: string =""
  public isSoloLectura:boolean = false;
    

  filteredOptions: { [key: string]: Observable<any[]> } = {}; // Para manejar los filtros del autocomplete
  dynamicListOptions: { [key: string]: any[] } = {}; // Para almacenar las opciones de listas dinámicas cargadas


  constructor(
    public dialogRef: MatDialogRef<gTableDialog>,
    @Inject(MAT_DIALOG_DATA) public inputs: any,
    private fb: FormBuilder,
    private gQuery: gQueryService,
    public dialog: MatDialog,
   
  ) {
    this.gTableForm = this.fb.group({});
  }

  ngOnInit(): void {
    this.data = this.inputs.data.Parametros;    
    this.Titulo = this.inputs?.data?.Titulo
    this.isMode = this.inputs.isMode;
    if(this.isMode =="Info"){
      this.isSoloLectura = true;
    }
    this.buildForm();

    
  }

  buildForm(): void {
    const formatoFecha = /^\d{2}\/\d{2}\/\d{4}$/; //si el formato es dd/mm/aaaa
    const formatoHora = /^(1[0-2]|0?[1-9]):([0-5][0-9]) ([AP]M)$/i;

    this.data.forEach(campo => {
 
      if (formatoFecha.test(campo.Valor)) {
        const [dia, mes, año] = campo.Valor.split('/');
        campo.Valor = `${año}-${mes}-${dia}`
      }

      if (formatoHora.test(campo.Valor)) {
        let [time, periodo] = campo.Valor.split(' '); // Separar hora de AM/PM
        let [horas, minutos] = time.split(':').map(Number); // Separar hh y mm
    
        if (periodo.toUpperCase() === 'PM' && horas !== 12) {
          horas += 12; // Convertir PM a formato de 24 horas
        } else if (periodo.toUpperCase() === 'AM' && horas === 12) {
          horas = 0; // Convertir 12 AM a 00 horas
        }
        campo.Valor= `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
      }
      
      let valorDefecto = campo.Tipo=='Fecha'? new Date(campo.Valor + 'T00:00:00'): campo.Valor || '';
      
      
      if(this.isMode=="Agregar"){
        valorDefecto = campo.ValorDefecto != null ? campo.ValorDefecto: valorDefecto;
      }

      
      let control;

      if (campo.Tipo === 'ListaDinamica') { 
        this.loadDynamicList(campo);
        control = new FormControl('', this.getValidators(campo) );
        
      }else if(campo.Tipo=="TablaDinamica"){
        this.loadDynamicTable(campo);

      }else if(campo.Tipo === 'Oculto'){
        control = new FormControl(valorDefecto);
        
      }else if(campo.Tipo =='Imagen' && campo.CampoNombreImagen){
        campo.Valor= this.data.find(item=> item.Nombre = campo.CampoNombreImagen).Valor;
        control = new FormControl("", this.getValidators(campo));
      }else{
        control = new FormControl(valorDefecto, this.getValidators(campo));
      }
      if(control){
        this.gTableForm.addControl(campo.Nombre, control);

        if (campo.IniciaDeshabilitado) {
          let mantenerHabilitado = false;
        
          this.data.forEach(item => {
            if (item.HabilitarCampo) {
              item.HabilitarCampo.forEach(condicion => {
                if (condicion.Campo === campo.Nombre) {
                  // console.log(item);
                  if (item.Valor === condicion.ValorCriterio) {
                    mantenerHabilitado = true;  // No deshabilitar si el valor coincide con el esperado
                  }
                }
              });
            }
          });
          if (!mantenerHabilitado) {
            control.disable();
          }
        }

      }
    });

     
  }

  // AUXILIARES

  getValidators(param: any): any[] {
    const validators = [];
    if (param.Requerido) validators.push(Validators.required);
    if (param.Tipo === 'Numero') validators.push(Validators.pattern('^[0-9]*$')); // Número entero
    if (param.Tipo === 'Decimal') validators.push(Validators.pattern('^[0-9]+(\\.[0-9]{1,2})?$')); // Decimal con 2 decimales
    if (param.Tipo === 'Texto') validators.push(Validators.minLength(1));
    if (param.Tipo === 'FechaMinima') validators.push(Validators.min(new Date(param.FechaMinima).getTime()));
    if (param.Tipo === 'FechaMinima') validators.push(Validators.max(new Date(param.FechaMaxima).getTime()));

    return validators;
  }

  getValorLista(campo): string {
    const opcion = campo.Lista.find(opcion => opcion.Id === campo.Valor);
    return opcion ? opcion.Valor : campo.Valor;
  }

  getValorListaDinamica(campo): string {
    if(Object.keys(this.dynamicListOptions).length === 0){
      return "";
    }else{
      return this.dynamicListOptions[campo.Nombre].find(option => option.Id = campo.Valor ).Valor;
      
    }
    
  }

  isFusionada(column: string, campo): boolean {
  
  
    return campo?.ColumnasFusionadas?.some(item => item.Columna==column )
    // return this.Conf?.Datos?.ColumnasFusionadas?.some(fusionada => fusionada.Columna === column);
  }
   
  getTituloTabla(campo){
    if(campo?.dataSource?.data[0]){
      let template = campo.TituloTabla;
      // console.log(campo.dataSource.data[0]);
      
      Object.keys(campo.dataSource.data[0]).forEach(columna => {
        const valor = campo.dataSource.data[0][columna] || '';
  
          template = template.replace(new RegExp(`\\$${columna}`, 'g'), valor);
      });
      return template;
    }else{
      return "";
    }
   
  }

  getEstiloColumna(campo, columna){
    // console.log(columna)
    return campo?.ColumnasEstilos?.find(item=> item?.Columna == columna)?.Estilo || null
  }
 
  // EstiloColumna(columna, campo, tipo){
  //   // console.log(campo);

  //   if(campo?.EstiloColumnas?.some(item => item.Columnna ==columna && item[tipo]!=null) ){
  //   // if(campo.EstiloColumnas.some(item=> item.Columna ==columna && item[tipo]!=null )){
  //     return campo?.EstiloColumnas?.filter(item => item.Columnna ==columna && item[tipo]!=null)[0][tipo]
  //   }else if(campo?.EstiloColumnas?.some(item => item.Columnna ==columna)){
  //     return 
  //   }else{
  //     return "";
  //   }

  // }
  // Procesar el valor para el Titulo o Cuerpo con las columnas sustituidas
  getFusionadaValue(row: any, column: string, tipo: 'Titulo' | 'Cuerpo', campo): string {
    const columnaFusionada = campo?.ColumnasFusionadas?.find(item => item.Columna==column );
    if (!columnaFusionada) return '';

    // Obtenemos la plantilla (Titulo o Cuerpo) y reemplazamos las variables como $Cliente, $Cantidad, etc.
    let template = columnaFusionada[tipo] || '';

    // Verifica si alguna de las variables en la plantilla está vacía en la fila actual
    const contieneDatos = Object.keys(row).some(columna => {
      const placeholder = `$${columna}`;
      return template.includes(placeholder) && row[columna];
    });

  if (!contieneDatos) {
    // Si no hay datos en ninguna de las columnas requeridas, retorna vacío
    return '';
  }
    Object.keys(row).forEach(columna => {
      const valor = row[columna] || '';
        template = template.replace(new RegExp(`\\$${columna}`, 'g'), valor);
    });
    return template;

  }
  
  // Obtener los estilos para el Titulo o el Cuerpo
  getFusionadaStyle(campo, columna: string, tipo: 'EstiloTitulo' | 'EstiloCuerpo'): any {
    const columnaFusionada = campo?.ColumnasFusionadas?.find(item => item.Columna==columna );
    // const columnaFusionada = this.Conf?.Datos?.ColumnasFusionadas?.find(fusionada => fusionada.Columna === column);
    return columnaFusionada?.[tipo] || {}; // Devolver el estilo o un objeto vacío si no existe
  } 

  getExisteColumnaIcono(columna, campo){
    if(campo.ColumnasIcono){
      if(campo.ColumnasIcono?.filter(item => item.Columna == columna).length > 0){
        return true;
      }else{
        return false;
      }
    }else{
      return false;
    }
    
  }

  getValorColumnaIcono(elemento, columna, campo:string, param){  
    
    let item:any = param.ColumnasIcono.filter(item => item.Columna == columna)[0];
    // console.log(item);

    let Icono = item.Icono.filter(iconos=> iconos.Valor == elemento[columna]);
    // console.log(Icono[campo]);
    
    
    return Icono[0][campo] || "";
    
  }

  getEventoclick(elemento:any, columna:any, control:any){

    if(control?.ColumnasClick?.some(item=> item.Columna == columna)){
      control?.ColumnasClick?.find(item=> item.Columna == columna).Accion(elemento);
    }
  }

  getEtiquetaColumna(campo, columna){
    let item:any = campo?.ColumnasEtiquetas?.find(item => item.Columna == columna)?.Etiqueta || columna;
    return item;
    
    // return columna
    
  }

  // Devolver las opciones filtradas para el autocomplete
  filterOptions(controlName: string): Observable<any[]> {
    return this.filteredOptions[controlName];
  }

  // Función para mostrar el valor en el input después de seleccionar
  displayFn(option: any): string {    
    return option && typeof option === 'object' ? option.Valor : ''; // Verifica que option sea un objeto antes de acceder a 'Valor'
  }

  // filtrar
  private _filter(value: string, options: any[]): any[] {
    const filterValue = value.toLowerCase();
    return options.filter(option => option.Valor.toLowerCase().includes(filterValue));
  }
  
texto(a){
  return JSON.stringify(a);
}

loadDynamicTable(param){
  param.dataSource= new MatTableDataSource(<any>[])
  const paramValues= param.Parametros.map(key => `${this.inputs.fila[key]}`).join('|')
  this.gQuery.sql(param.Store, paramValues).subscribe((data:any) => {
    // console.log(data);
    
    if(data){
      param.dataSource= new MatTableDataSource(<any>data)
      param.columnas = Object.keys(data[0]);
    }else{
      param.data = [];
      param.columnas = [];
    }

    if(param.OrdenColumnas){
      param.columnas =  param.OrdenColumnas;
    }

    
    param.columnas = Object.keys(data[0]).filter(column => !param.ColumnasOcultas.includes(column));
    if (param.ColumnasFusionadas) {
      param.ColumnasFusionadas.forEach((colFusionada: any) => {
        param.columnas.push(colFusionada.Columna);
      });
    }
    

  
    if (
      param?.Acciones && (param.Acciones.Editar ||
                              param.Acciones.Eliminar  ||
                              param.Acciones.Info  ||
                                (param.Acciones.Otros?.length > 0)
                            )
    ) {
      param.columnas.push('actions');
    }

    
  })
  
}
AnchoAcciones(param){
  let total;
  if(param?.Acciones){
     total = Object.keys(param.Acciones).filter(item=> item != "Agregar" && item !="Otros").length
    if(param?.Acciones?.Otros){
      total = total + Object.keys(param.Acciones.Otros).length;
    }
  }
  return total * 40;    
}
// CARGAR LISTA DINÁMICA (carga la lista en un array con el nombre del campo)
loadDynamicList(param: any): void {
  const paramValues = param?.Parametros ? Object.values(param.Parametros).join('|') : '';
  this.gQuery.sql(param.Store, paramValues).subscribe(
    (data: any[]) => {

      const mappedData = data.map(item => ({
        Id: item[param.Resultado.Id],
        Valor: item[param.Resultado.Valor],
        Data: item
      }));

      this.dynamicListOptions[param.Nombre] = mappedData;  // Guardar las opciones originales
    
      // Configurar el autocomplete para la lista dinámica
      this.filteredOptions[param.Nombre] = this.gTableForm.get(param.Nombre)?.valueChanges.pipe(
        startWith(''),
        map(value => typeof value === 'string' ? this._filter(value, mappedData) : mappedData)
      );
  
      
      
      if(this.isMode == "Agregar"){
        this.gTableForm.get(param.Nombre).setValue(this.dynamicListOptions[param.Nombre]?.find(option => option.Id === param.Valor) || null)
      }else if (this.isMode =="Editar"){
        this.gTableForm.get(param.Nombre).setValue(this.dynamicListOptions[param.Nombre]?.find(option => option.Id === param.Valor) || null)
      }else if (this.isMode =="Info"){
        this.gTableForm.get(param.Nombre).setValue(this.dynamicListOptions[param.Nombre].find(option => option.Id = param.Valor ).Valor);
        }
      

    },  
    (error) => {
      console.error('Error al cargar la lista dinámica:', error);
    }
  );
}

  // Limpiar el campo del autocomplete
  clearAutocomplete(controlName: string): void {
    this.gTableForm.get(controlName)?.setValue('');
  }

  // mapa
  MostrarModalMapa(campo:any) {
    const dialogRef = this.dialog.open(DialogMapa, {
      // data: {data:this.Conf.Acciones.Info, isMode:"Info"}
      data: {data: this.gTableForm.get(campo.Nombre).value, isSoloLectura: this.isSoloLectura },
      disableClose: false,
      panelClass: 'image-dialog',
      height: "100%",
      width: "100%",
      maxHeight: "95vh",
      maxWidth: "95vw",
    });
    
    dialogRef.afterClosed().subscribe(result => {     
      
      if (result) {
        this.gTableForm.get(campo.Nombre).setValue(result)    
      }
    });
  }

  // // Ajustar los valores a enviar según el tipo de campo
  private ajustarValorParaEnvio(param: any): any {
    const value = this.gTableForm.get(param.Nombre)?.value;

    if (param.Tipo === 'ListaDinamica') {
      return value.Id ? value.Id : value;  // Devolver solo el Id
    }

    // if (param.Tipo === 'Fecha' && value instanceof Date) {
    //   return this.formatDateForDb(value); // Formato YYYY-MM-DD
    // }

    // if (param.Tipo === 'Hora' && typeof value === 'string') {
    //   return this.formatTimeForDb(value); // Formato hh:mm:ss
    // }

    return value;  // Para otros tipos, devolver el valor directamente
  }

  onOptionSelected(event: any, campo: any) {

    let selectedValue: any;

    if (event.value !== undefined) {
      selectedValue = event.value;  // Caso para MatSelect
    } else if (event.option?.value !== undefined) {
      selectedValue = event.option.value;  // Caso para MatAutocomplete
    } else {
      selectedValue = null;
    }


    console.log(selectedValue)

    // ActualizarOtroCampo : [ //solo es aplicable a lista dinamica
    //   {
    //     Campo_a_actualizar: es el campo que se modificara cuando se modifique el select 
    //     item_con_data: cuando es una lista dinamica, en el sp vienen varios campos, lo que hace es buscar el valor del campo del sp y poner ese valor al control que se Actualizar
         
    //   }
    // ]
    if (campo.ActualizarOtroCampo) {
      campo.ActualizarOtroCampo.forEach(element => {
        let valor :any;
        if (element.item_con_data !== undefined ){
          valor = selectedValue.Data[element.item_con_data];
        }else if(element.valorDirecto !== undefined){
          valor = element.valorDirecto;

        }
        this.gTableForm.get(element.Campo_a_actualizar).setValue(valor)
      })
     
    }

   
  
    // Mostrar/ocultar múltiples campos según la selección
    if (campo.HabilitarCampo) {
      campo.HabilitarCampo.forEach(condicion => {
        const Campo = condicion.Campo;
        const ValorCriterio = condicion.ValorCriterio;


        if (selectedValue === ValorCriterio) {
          this.gTableForm.get(Campo)?.enable();  // Mostrar el campo
        } else {
          this.gTableForm.get(Campo)?.disable(); // Ocultar el campo
          this.gTableForm.get(Campo)?.setValue(null); // Limpiar el valor
        }
      });
    }
  }

  
  onOptionSelected2(selitem:any, campo:any){
    this.data.forEach(item => {
      if(item?.ActualizarOtroCampo){ 
        this.gTableForm.get(item.ActualizarOtroCampo.Campo_a_actualizar).setValue(
          selitem.option.value.Data[item.ActualizarOtroCampo.item_con_data]
        )
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close({result: false});
  }
  
  onOk() {
    if(this?.inputs?.data?.FnValidacion){
      if (this.inputs.data.FnValidacion(this.gTableForm.value)) {
        this.dialogRef.close({result: true, data: this.gTableForm.value, archivo: this.File});
      } 
    }else{
      this.dialogRef.close({result: true, data: this.gTableForm.value});
    }
  }

  isSaveDisabled(): boolean {
    const controls = this.gTableForm.controls;
    for (let name in controls) {
      if (controls[name].invalid && controls[name].touched) {
        return true;
      }
    }
    return false;
  }
  
  public previewImage(event, NombreCampo) {
    const reader = new FileReader();
    const file = event.target.files[0];
    reader.readAsDataURL(file);

    reader.onload = _event => {
      // console.log(_event);
      this.imageUrl[NombreCampo] = reader.result;
    };
  }

  dirImagen(carpeta:string, nombre:string){
    return url_api + carpeta + "/" + nombre + ".jpg";
  }

  onFileChange(event, NombreCampo) {
    if (event.target.files.length > 0) {
      this.File[NombreCampo] = event.target.files[0];
    }
    this.FileData = [
      this.File,
      this.gTableForm.value
    ]

  }
}

@Component({
  selector: 'dialog-mapa',
  templateUrl: 'g-table-dialog-map.html',
  styleUrls: ['./g-table-dialog-map.css'],
})
export class DialogMapa implements OnInit {
  @ViewChild('popupMap', { static: true }) popupMapContainer: ElementRef;
  popupMap: L.Map;
  popupMarker: L.Marker;
  selectedLocation: { lat: number, lng: number };

  constructor(
    public dialogRef: MatDialogRef<DialogMapa>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  CentroGPS(): {lat, lng}{
    
    
    if(this.data && this.data!=""){
      const [lat, lng] = this.data.data.split(",").map(Number);
      const coordJson = { lat, lng };
      return coordJson;
    }else{
      return {lat: -3.7722102000000004, lng:-73.26553229999999}
    }
  }

  ngOnInit(): void { 
    
  
    this.popupMap = L.map(this.popupMapContainer.nativeElement, {

      center: this.CentroGPS(),
      zoom: 16
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.popupMap);
    
    
    this.popupMarker = L.marker(this.CentroGPS()).addTo(this.popupMap);
   
    
    
    
    this.popupMap.on('click', (e) => {
      if(this.data.isSoloLectura == false){
        if (this.popupMarker) {
          this.popupMap.removeLayer(this.popupMarker);
        }
        this.selectedLocation = e.latlng;
        this.popupMarker = L.marker(e.latlng).addTo(this.popupMap);
      }
    });

  }

  onConfirm(e:Event): void {
    e.preventDefault();
    e.stopPropagation();
    if(this.selectedLocation){
      this.dialogRef.close(this.selectedLocation.lat + ", " + this.selectedLocation.lng);
    }else{
      alert("debe seleccionar un punto en el mapa")
    }
    
  }
  

  onCancel(): void {
    this.dialogRef.close();
  }
}