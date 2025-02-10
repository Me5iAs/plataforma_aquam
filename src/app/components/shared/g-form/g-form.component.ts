/**
 * Estructura
 * 
 *     this.Conf = {
      Titulo: "Nueva Persona", //titulo del formulario
      FnOk: (result: any) => { },
      FnValidacion:(result:any) => {},
      Campos: [
        {
          Nombre: "Desde",
          Valor: "",
          Etiqueta: "Desde",
          Tipo: "Numero",
          placeholder: "Desde",
          Error: "El campo es requerido",
          Patron: "Debe ingresar un valor",
          Requerido: true,
          Estilo: { width: 'calc(50% - 5px)', 'display': 'inline-block', 'margin-right': '10px' }
        },
        {
          Nombre: "Hasta",
          Valor: "",
          Etiqueta: "Hasta",
          Tipo: "Numero",
          placeholder: "Hasta",
          Error: "El campo hasta es requerido",
          Patron: "Debe ingresar el valor hasta",
          Requerido: true,
          Estilo: { width: 'calc(50% - 5px)', 'display': 'inline-block' }
        }
      ],
    },

    los campos reciben los tipos 
 *  
 * }
 */

import { Inject, Component, Input, AfterViewInit, EventEmitter, Renderer2, OnInit, ViewChild, ElementRef, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { gQueryService } from "../../../services/g-query.service"
import { FormBuilder, FormControl, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { gAuxService } from '../../../services/g-aux.services';
import { gConstantesService } from "../../../services/g-constantes.service"
import * as L from 'leaflet';
import 'leaflet-routing-machine';
import { Router } from '@angular/router';
import {DateAdapter, MAT_DATE_FORMATS} from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from "../../format-datepicker";
import { isNgTemplate } from '@angular/compiler';

const url_api = gConstantesService.gBaseUrl;

@Component({
  selector: 'g-form',
  templateUrl: './g-form.component.html',
  styleUrls: ['./g-form.component.css'],
    providers: [
      {provide: DateAdapter, useClass: AppDateAdapter},
      {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
    ]
})
export class gFormComponent implements OnInit {
  
  gForm: FormGroup;
  // @Output() Formulario = new EventEmitter<any[]>();
  @Input() Conf: any;
  
  totales: { [key: string]: number } = {}; //bruto
  subtotales: { [key: string]: number } = {}; //subtotales
  netos: { [key: string]: number } = {}; //netos es la suma de bruto mas neto

  dynamicListOptions: { [key: string]: any[] } = {};
  filteredOptions: { [key: string]: Observable<any[]> } = {};
  public FileData;
  public File: { [key: string]: File } = {};
  public imageUrl: { [key: string]: any } = {};

  constructor(
    private gQuery: gQueryService,
    private gAux: gAuxService,
    public dialog: MatDialog,
    private fb: FormBuilder,
    private renderer:Renderer2,
    private router: Router) { }

  ngOnInit(): void {
    this.gForm = this.fb.group({});
    this.buildForm()
  }

  buildForm(): void {
    const formatoFecha = /^\d{2}\/\d{2}\/\d{4}$/; //si el formato es dd/mm/aaaa
    const formatoHora = /^(1[0-2]|0?[1-9]):([0-5][0-9]) ([AP]M)$/i;

    // console.log(this.Conf.Campos);
    this.Conf.Campos.forEach(campo => {

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
      
      valorDefecto = campo.ValorDefecto != null ? campo.ValorDefecto: valorDefecto;

      
      let control;

      // lista dinamica
      if (campo.Tipo === 'ListaDinamica') { 
        this.loadDynamicList(campo);
        control = new FormControl('', this.getValidators(campo) );


      // grupo de controles 
      }else if(campo.Tipo === 'GrupoControles' && campo.Filas){
        
        const grupoControles = new FormGroup({});
      
        campo.Filas.forEach((fila) => {
          const filaFormGroup = new FormGroup({});

          fila.Celdas.forEach(celda => {
            let valorDefecto = celda.Valor || '';

            if (celda.Tipo === 'Fecha' && formatoFecha.test(valorDefecto)) {
              const [dia, mes, año] = valorDefecto.split('/');
              valorDefecto = `${año}-${mes}-${dia}`;
            }

            if (celda.Tipo === 'Hora' && formatoHora.test(valorDefecto)) {
              let [time, periodo] = valorDefecto.split(' ');
              let [horas, minutos] = time.split(':').map(Number);
  
              if (periodo.toUpperCase() === 'PM' && horas !== 12) {
                horas += 12;
              } else if (periodo.toUpperCase() === 'AM' && horas === 12) {
                horas = 0;
              }
              valorDefecto = `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
            }

            if (celda.Tipo === 'ListaDinamica') { 
              this.loadDynamicList(celda);
              let valorInicial = celda.Valor || '';
              if (celda.Tipo === 'ListaDinamica' && typeof valorInicial !== 'object') {
                const listaOpciones = this.dynamicListOptions[celda.Nombre] || [];
                const objetoCompleto = listaOpciones.find(item => item.Id === valorInicial);
                if (objetoCompleto) {
                  valorInicial = objetoCompleto; // Asignar el objeto completo al valor inicial
                }
              }
              control = new FormControl(valorInicial, this.getValidators(celda) );
              
              filaFormGroup.addControl(celda.Nombre, control);
            }else{
              const celdaControl = new FormControl(valorDefecto, this.getValidators(celda));
              filaFormGroup.addControl(celda.Nombre, celdaControl);
            }      

           
          })
          grupoControles.addControl(fila.Id, filaFormGroup);
          // console.log(grupoControles);
        })
        this.gForm.addControl(campo.Nombre, grupoControles);
      // oculto
      }else if(campo.Tipo === 'Oculto'){
        control = new FormControl(valorDefecto);
      
      
      // imagen
      }else if(campo.Tipo =='Imagen' && campo.CampoNombreImagen){
        // campo.Valor= this.data.find(item=> item.Nombre = campo.CampoNombreImagen).Valor;
        control = new FormControl("", this.getValidators(campo));
      
      // otros
      }else{
        control = new FormControl(valorDefecto, this.getValidators(campo));
      }
      if(control){
        this.gForm.addControl(campo.Nombre, control);

        if (campo.IniciaDeshabilitado) {
          let mantenerHabilitado = false;
        
          this.Conf.Campos.forEach(item => {
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

  getValidators(param: any): any[] {
    const validators = [];
    if (param?.Requerido == true) validators.push(Validators.required);
    if (param.Tipo === 'Numero') validators.push(Validators.pattern('^[0-9]*$')); // Número entero
    if (param.Tipo === 'Decimal') validators.push(Validators.pattern('^[0-9]+(\\.[0-9]{1,2})?$')); // Decimal con 2 decimales
    if (param.Tipo === 'Texto') validators.push(Validators.minLength(1));
    if (param?.FechaMinima) validators.push(Validators.min(new Date(param.FechaMinima).getTime()));
    if (param?.FechaMaxima) validators.push(Validators.max(new Date(param.FechaMaxima).getTime()));

    return validators;
  }

  esColumnaSubTotal(campo: any, columna: string): boolean {
    return campo?.FilasSubTotal.some((ct: any) => ct.Nombre === columna);
  }

  getEstiloSubtotales(fila:any, columna:any){
    if( columna == fila?.ColumnaTotal ){ 
      return fila?.EstiloTotal || null;
    }

    if( columna == fila?.ColumnaEtiqueta){ 
      return fila?.EstiloEtiqueta || null;
    }
  }
  
  calcularTotales(campo) {
    this.totales = {}; // Reiniciar totales

    const formGroup = this.gForm.get(campo.Nombre) as FormGroup;
  
    Object.keys(formGroup.controls).forEach(filaKey => {
      const filaFormGroup = formGroup.get(filaKey) as FormGroup;
  
      const nombreColumna = campo.ColumnaTotal;

        const control = filaFormGroup.get(nombreColumna);
        const valor = control?.value ? parseFloat(control.value) : 0;
  
        if (!this.totales[nombreColumna]) {
          this.totales[nombreColumna] = 0;
        }
        this.totales[nombreColumna] += valor;
      // });
    });
    
  
    // return this.aplicarFormato(this.totales[columna], formato);
  }

  valorSubtotal(campo: any, fila:any, columna: any) {

    this.calcularTotales(campo);

    if(fila.ColumnaTotal == columna){

      //sumar todas las filas de la columna
      const valor =  fila.Valor(this.totales[columna]);
      const formato = fila.Formato || "0.00";
      return this.aplicarFormato(valor, formato);

    }else if(fila.ColumnaEtiqueta == columna){
      return fila.Etiqueta;
    }else{
      return "";
    }

  }
  
  formatearDecimalGrupo(evento:any): void {
    evento.target.value =   parseFloat(evento.target.value).toFixed(2)
    // if (control && control.value !== null && !isNaN(control.value)) {
    //   control.setValue(parseFloat(control.value).toFixed(2));
    // }
  }

  formatearDecimal(nombreControl: string): void {
    const control = this.gForm.get(nombreControl);
    if (control && control.value !== null && !isNaN(control.value)) {
      control.setValue(parseFloat(control.value).toFixed(2));
    }
  }

  aplicarFormato(valor: number, formato: string): string {
    if (!valor) return "0";
  
    // Formato con moneda
    if (formato.includes("S/")) {
      return `S/ ${valor.toFixed(2)}`;
    }
  
    // Formato con dos decimales
    if (formato === "0.00") {
      return valor.toFixed(2);
    }
  
    // Formato sin decimales
    if (formato === "0") {
      return valor.toFixed(0);
    }
  
    // Formato personalizado (agrega más casos según lo necesites)
    return valor.toString();
  }
  
  getColumnClasses(columnas?: { Celular: number; Mediana: number; Grande: number, Enorme: number }, ancho?: { Celular: number; Mediana: number; Grande: number, Enorme: number }): string[] {
    // console.log(columnas)
    // console.log(ancho)
    const classes = [];
    if(ancho){
      classes.push(`cols-${ancho.Celular}-celular`);
      classes.push(`cols-${ancho.Mediana}-mediana`);
      classes.push(`cols-${ancho.Grande}-grande`);
      classes.push(`cols-${ancho.Enorme}-enorme`);
    }else if (columnas) {
      classes.push(`cols-${columnas.Celular}-celular`);
      classes.push(`cols-${columnas.Mediana}-mediana`);
      classes.push(`cols-${columnas.Grande}-grande`);
      classes.push(`cols-${columnas.Enorme}-enorme`);
    } else {
      // Si no se especifica, por defecto ocupa todo el ancho.
      classes.push('cols-1-celular', 'cols-1-mediana', 'cols-1-grande', 'cols-1-enorme');
    }
    // console.log(classes);
    return classes;
  } 
  
  getFilasKeys(grupo: string): string[] {
    const formGroup = this.gForm.get(grupo) as FormGroup;
    return formGroup ? Object.keys(formGroup.controls) : [];
  }

  getCeldas(campo: any, index: number) {
    return campo.Filas[index]?.Celdas || [];
  }
  
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
        if(this.gForm.get(param.Nombre)){

          this.filteredOptions[param.Nombre] = this.gForm.get(param.Nombre)?.valueChanges.pipe(
            startWith(''),
            map(value => typeof value === 'string' ? this._filter(value, mappedData) : mappedData)
          );
          if(param?.Valor?.Id){
            this.gForm.get(param.Nombre).setValue(this.dynamicListOptions[param.Nombre]?.find(option => option.Id === param.Valor?.Id) || null)
          }else{
            this.gForm.get(param.Nombre).setValue( null)
          }
          
        }else{
          const controlEncontrado = this.buscarControlPorNombre(this.gForm, param.Nombre);

          if (controlEncontrado) {
            this.filteredOptions[param.Nombre] = controlEncontrado.valueChanges.pipe(
              startWith(''),
              map(value => (typeof value === 'string' ? this._filter(value, mappedData) : mappedData))
            );
            if(param?.Valor?.Id){
              controlEncontrado.setValue(this.dynamicListOptions[param.Nombre]?.find(option => option.Id === param.Valor?.Id));
            }else{
              controlEncontrado.setValue(null);  
            }
            
          } else {
            console.warn(`Control con el nombre "${param.Nombre}" no encontrado.`);
          }
        }
   
      },  
      (error) => {
        console.error('Error al cargar la lista dinámica:', error);
      }
    );
  }

  buscarControlPorNombre(formGroup: FormGroup, nombre: string): AbstractControl | null {
    for (const key of Object.keys(formGroup.controls)) {
      const control = formGroup.get(key);
  
      if (key === nombre) {
        // Si el nombre coincide, retorna el control
        return control;
      }
  
      // Si es un FormGroup, realiza una búsqueda recursiva
      if (control instanceof FormGroup) {
        const resultado = this.buscarControlPorNombre(control, nombre);
        if (resultado) {
          return resultado;
        }
      }
    }
    return null; // Retorna null si no se encuentra el control
  }

  setFocus(nombreControl: string): void {
    const elemento = document.querySelector(`[ng-reflect-name="${nombreControl}"]`) as HTMLInputElement;
  if (elemento) {
    this.renderer.selectRootElement(elemento).focus(); // Usa Renderer2 para establecer el foco
  } else {
    console.warn(`No se encontró el control con formControlName="${nombreControl}"`);
  }
  }

  private _filter(value: string, options: any[]): any[] {
    const filterValue = value.toLowerCase();
    return options.filter(option => option.Valor.toLowerCase().includes(filterValue));
  }

  MostrarModalMapa(campo: any) {
    // Bloqueo de eventos de foco globales
    const focusHandler = (event: FocusEvent) => {
      (event.target as HTMLElement).blur();  // Solo aplicar `blur()`, sin `preventDefault()`
    };
  
    // Añadir el listener de foco global con opción `passive: false`
    document.addEventListener('focus', focusHandler, { capture: true, passive: false });
  
    const dialogRef = this.dialog.open(DialogMapa, {
      data: { data: this.gForm.get(campo.Nombre).value },
      disableClose: true,
      autoFocus: false,
      restoreFocus: false,
      panelClass: 'image-dialog',
      height: "100%",
      width: "100%",
      maxHeight: "95vh",
      maxWidth: "95vw",
    });
  
    dialogRef.afterOpened().subscribe(() => {
      document.removeEventListener('focus', focusHandler, true);  // Quitar el listener después de abrir
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.gForm.get(campo.Nombre).setValue(result);
      }
    });
  }
  
  public previewImage(event, NombreCampo) {
    const reader = new FileReader();
    const file = event.target.files[0];
    reader.readAsDataURL(file);

    reader.onload = _event => {
      this.imageUrl[NombreCampo] = reader.result;
    };
  }

  dirImagen(carpeta:string, nombre:string){
    return url_api + carpeta + "/" + nombre + ".jpg";
  }

  onFileChange(event, NombreCampo) {
    if (event.target.files.length > 0) {
      this.File[NombreCampo] = event.target.files[0];
      console.log(this.File);
      
    }
    this.FileData = [
      this.File,
      this.gForm.value
    ]

  }

  displayFn(option: any): string {    
    return option && typeof option === 'object' ? option.Valor : ''; // Verifica que option sea un objeto antes de acceder a 'Valor'
  }

  clearAutocomplete(controlName: string, campo): void {
    this.gForm.get(controlName)?.setValue('');
    if(campo?.FnChange){
      campo.FnChange()
    }
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


    // ActualizarOtroCampo : [ //solo es aplicable a lista dinamica
    //   {
    //     Campo_a_actualizar: es el campo que se modificara cuando se modifique el select 
    //     item_con_data: cuando es una lista dinamica, en el sp vienen varios campos, lo que hace es buscar el valor del campo del sp y poner ese valor al control que se Actualizar
    //     valorDirecto: si no se quiere buscar el valor en el sp, se puede poner un valor directo
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
        this.gForm.get(element.Campo_a_actualizar).setValue(valor)
      })
     
    }

   
  
    // Mostrar/ocultar múltiples campos según la selección
    if (campo.HabilitarCampo) {
      campo.HabilitarCampo.forEach(condicion => {
        const Campo = condicion.Campo;
        const ValorCriterio = condicion.ValorCriterio;


        if (selectedValue === ValorCriterio) {
          this.gForm.get(Campo)?.enable();  // Mostrar el campo
        } else {
          this.gForm.get(Campo)?.disable(); // Ocultar el campo
          this.gForm.get(Campo)?.setValue(null); // Limpiar el valor
        }
      });
    }
  }

  onOptionSelected2(selitem:any, campo:any){
    this.Conf.Campos.forEach(item => {
      if(item?.ActualizarOtroCampo){ 
        this.gForm.get(item.ActualizarOtroCampo.Campo_a_actualizar).setValue(
          selitem.option.value.Data[item.ActualizarOtroCampo.item_con_data]
        )
      }
    });
  }

  isSaveDisabled(): boolean {
    const controls = this.gForm.controls;
    for (let name in controls) {
      const control = controls[name];
      if (control instanceof FormGroup) {
        continue;
      }
      if (control.invalid && control.touched) {
        return true;
      }
    }
    return false;
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

  onOk() {
    let data:any =  this.gForm.value;
    let archivo:any = this.File;
    let validado = false
    let result:any = this.gForm.value
    this.Conf.Campos.forEach(param => {
      if (param.Tipo =="ListaDinamica"){
        // console.log("ya no se cambia el valor de la lista dinamica")
        // result[param.Nombre] ? result[param.Nombre] = result[param.Nombre].Id : result[param.Nombre]= null; 
      }else if(param.Tipo =="Hora"){
        result[param.Nombre] = this.formatTimeForDb(result[param.Nombre])
      }else if(param.Tipo =="Fecha"){
        result[param.Nombre] = this.formatDateForDb(result[param.Nombre])
      }else if(param.Tipo == "Imagen"){
        result[param.Nombre] ? result[param.Nombre]= archivo[param.Nombre] : result[param.Nombre]= null;
      } 
      
    })

    if(this?.Conf?.FnValidacion){
      if (this?.Conf?.FnValidacion(this.gForm.value)) {
        validado = true;
      }else{
        validado = false;
      }
    }else{
      validado = true
    }

    if (validado==true){
      
        
   
    // result.data.File = ;
      this.Conf.FnOk(result)


    }
  }
}




@Component({
  selector: 'dialog-mapa',
  templateUrl: 'g-dialog-map.html',
  styleUrls: ['./g-dialog-map.css'],
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
      if (this.popupMarker) {
        this.popupMap.removeLayer(this.popupMarker);
      }
      this.selectedLocation = e.latlng;
      this.popupMarker = L.marker(e.latlng).addTo(this.popupMap);
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
