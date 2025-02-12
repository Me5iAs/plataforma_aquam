/**
 * el json tiene la siguiente estructura:
{
  "titulo": "Mi Titulo"
  "tipo": "boton", // o "icono"
  "nombre": "Guardar", // para boton
  "icono": "save", // para icono
  "formulario": [
    {
      "nombre": "nombre",
      "tipo": "texto",
      "requerido": true,
        "default": "algo"

    },
    {
      "nombre": "edad",
      "tipo": "numero",
      "requerido": false
    },
    {
      "nombre": "fechaNacimiento",
      "tipo": "fecha",
      "requerido": true,
      "default": "algo"
    },
    {
      "nombre": "activo",
      "tipo": "booleano",
      "requerido": false
    },
    {
      "nombre": "pais",
      "tipo": "select",
      "requerido": true,
      "opciones": [
        { "Id": 1, "valor": "Perú" },
        { "Id": 2, "valor": "México" }
      ]
    }
  ],
  "ok": "guardarDatos" // función a ejecutar
}

 */
// import { Component, Input, OnInit } from '@angular/core';
import { Component, Inject, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import {DateAdapter, MAT_DATE_FORMATS} from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from "../../format-datepicker";
import { gQueryService } from 'src/app/services/g-query.service';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatTableDataSource } from '@angular/material/table';
import { gConstantesService } from 'src/app/services/g-constantes.service';

const url_api = gConstantesService.gBaseUrl;

@Component({
  selector: 'app-gInputDialog',
  templateUrl: './g-input-dialog.component.html',
  styleUrls: ['./g-input-dialog.component.css'],
  providers: [
    {provide: DateAdapter, useClass: AppDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
  ]
})
export class gInputDialogComponent  {

  @Input() data: any;
  

  constructor(public dialog: MatDialog) { }
  ngOnInit(): void {

  }

  // Convertir la hora al formato hh:mm:ss
  private formatTimeForDb(time: string): string {
    const parts = time.split(':');
    return `${parts[0]}:${parts[1]}:00`; // Agregar los segundos
  }

    
  openDialog(): void {

    const ancho = this.data.ancho || '400px';
    const dialogRef = this.dialog.open(DialogContent, {
      width: ancho,
      data: this.data
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        let archivo:any = result.ArchivosImagenes;
        this.data.formulario.forEach(param => {
          if (param.Tipo =="ListaDinamica"){
            console.log("ya no se cambia el valor de la lista dinamica")
            // result[param.Nombre] ? result[param.Nombre] = result[param.Nombre].Id : result[param.Nombre]= null; 
          }else if(param.Tipo =="Hora"){
            result[param.Nombre] = this.formatTimeForDb(result[param.Nombre])
          }else if(param.Tipo == "Imagen"){            
            result[param.Nombre] ? result[param.Nombre]= archivo[param.Nombre] : result[param.Nombre]= null;
          } 
          
        })

        
        this.data.ok(result);
      }
    });
  }
}


@Component({
  selector: 'dialog-content',
  templateUrl: 'dialog-content.html',
  styleUrls: ['./g-input-dialog.component.css'],
  providers: [
    {provide: DateAdapter, useClass: AppDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
  ]
})
export class DialogContent {
  form: FormGroup;
  totales: { [key: string]: number } = {}; //bruto
  subtotales: { [key: string]: number } = {}; //subtotales
  netos: { [key: string]: number } = {}; //netos es la suma de bruto mas neto

  dynamicListOptions: { [key: string]: any[] } = {};
  filteredOptions: { [key: string]: Observable<any[]> } = {};

  public FileData;
  public File: { [key: string]: File } = {};
  public imageUrl: { [key: string]: any } = {};

  constructor(
    private gQuery:gQueryService,
    public dialogRef: MatDialogRef<DialogContent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    
    private fb: FormBuilder) {

   
      
    this.form = this.fb.group({});
    this.createForm();
  }

  createForm() {
    const formatoFecha = /^\d{2}\/\d{2}\/\d{4}$/; //si el formato es dd/mm/aaaa
    const formatoHora = /^(1[0-2]|0?[1-9]):([0-5][0-9]) ([AP]M)$/i;

    
    this.data.formulario.forEach(control => {


      
      if (formatoFecha.test(control.Valor)) {
        const [dia, mes, año] = control.Valor.split('/');
        control.Valor = `${año}-${mes}-${dia}`
      }

      if (formatoHora.test(control.Valor)) {
        let [time, periodo] = control.Valor.split(' '); // Separar hora de AM/PM
        let [horas, minutos] = time.split(':').map(Number); // Separar hh y mm
    
        if (periodo.toUpperCase() === 'PM' && horas !== 12) {
          horas += 12; // Convertir PM a formato de 24 horas
        } else if (periodo.toUpperCase() === 'AM' && horas === 12) {
          horas = 0; // Convertir 12 AM a 00 horas
        }
        control.Valor= `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
      }

      let valorDefecto = control.Tipo=='fecha'? new Date(control.valorDefecto + 'T00:00:00'): control.valorDefecto || '';
      
   
      valorDefecto = control.ValorDefecto != null ? control.ValorDefecto: valorDefecto;

      if (control.Tipo === 'ListaDinamica') { 
        this.loadDynamicList(control);
        // let MiControl = new FormControl('', this.getValidators(control) );
        let MiControl = new FormControl(
          { value: '', disabled: control.desactivado || false }, // Aplica disable aquí
          this.getValidators(control)
        );
        this.form.addControl(control.nombre, MiControl);
      }else if(control.Tipo=="TablaDinamica"){
        this.loadDynamicTable(control);
      }else if(control.Tipo =='Imagen'){
        // campo.Valor= this.data.find(item=> item.Nombre = campo.CampoNombreImagen).Valor;
        // this.form.addControl( control.Nombre, {}, this.getValidators(control));

        let MiControl = new FormControl("", this.getValidators(control));
        this.form.addControl(control.Nombre,MiControl)
      // otros
      }else if(control.Tipo === 'GrupoControles' && control.Filas){
              
        const grupoControles = new FormGroup({});
        control.Filas.forEach((fila) => {
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
              let MiControl = new FormControl(
                { value: valorInicial, disabled: celda.desactivado || false }, // Aplica disable aquí
                this.getValidators(celda)
              );
              // let MiControl = new FormControl(valorInicial, this.getValidators(celda) );
              
              filaFormGroup.addControl(celda.Nombre, MiControl);
            }else{
              // const celdaControl = new FormControl(valorDefecto, this.getValidators(celda));
              const celdaControl = new FormControl(
                { value: valorDefecto, disabled: celda.desactivado || false }, // Aplica disable aquí
                this.getValidators(celda)
              );
              filaFormGroup.addControl(celda.Nombre, celdaControl);
            }      
      
                 
                })
                grupoControles.addControl(fila.Id, filaFormGroup);
                // console.log(grupoControles);
              })
              this.form.addControl(control.Nombre, grupoControles);
            // oculto
      }else{
        this.form.addControl(
          control.nombre,
          this.fb.control(
            { value: valorDefecto, disabled: control.desactivado || false }, // Aplica disable aquí
            this.getValidators(control)
          )
        );
        // this.form.addControl(
        //   control.nombre,
        //   this.fb.control(valorDefecto, this.getValidators(control))
        // );
      }

      // console.log(this.fb)

    });
    // console.log(this.fb);
  }

  loadDynamicTable(param){
    param.dataSource= new MatTableDataSource(<any>[])
    // const paramValues= param.Parametros.map(key => `${this.inputs.fila[key]}`).join('|')
    this.gQuery.sql(param.Store, param.Parametros).subscribe((data:any) => {
      
      if(data){
        param.dataSource= new MatTableDataSource(<any>data)
        param.columnas = Object.keys(data[0]);
      }else{
        param.data = [];
        param.columnas = [];
      }
  
   
      
      param.columnas = Object.keys(data[0]).filter(column => !param?.ColumnasOcultas?.includes(column));
      if (param?.ColumnasFusionadas) {
          param.ColumnasFusionadas.forEach((colFusionada: any) => {
          param.columnas.push(colFusionada.Columna);
        });
      }

      if(param.OrdenColumnas){
        param.columnas =  param.OrdenColumnas;
      }   
   
      // console.log("aaa");
      
      if (param?.Acciones ) {
        param.columnas.push('actions');
      }
    })
    // console.log("CCC");
    
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

  isFusionada(column: string, campo): boolean {
    return campo?.ColumnasFusionadas?.some(item => item.Columna==column )
    // return this.Conf?.Datos?.ColumnasFusionadas?.some(fusionada => fusionada.Columna === column);
  }

  getEstiloColumna(campo, columna){
    // console.log(columna)
    return campo?.ColumnasEstilos?.find(item=> item?.Columna == columna)?.Estilo || null
  }

  getEtiquetaColumna(campo, columna){
    let item:any = campo?.ColumnasEtiquetas?.find(item => item.Columna == columna)?.Etiqueta || columna;
    return item;
    
    // return columna
    
  }

  getValorCelda(element:any, columna, control){      
    let item:any = control.CeldasValor?.filter(item => item.Columna == columna)[0]?.Valores?.filter(item => item.Dato == element[columna])[0]?.Valor || element[columna];
    // // console.log(item)
    return item;
    
  }

  getFusionadaStyle(campo, columna: string, tipo: 'EstiloTitulo' | 'EstiloCuerpo'): any {
    const columnaFusionada = campo?.ColumnasFusionadas?.find(item => item.Columna==columna );
    // const columnaFusionada = this.Conf?.Datos?.ColumnasFusionadas?.find(fusionada => fusionada.Columna === column);
    return columnaFusionada?.[tipo] || {}; // Devolver el estilo o un objeto vacío si no existe
  } 

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

  getColorIconoTablaDinamicaAcciones(accion, element){
    if(accion?.Estilo){
      return accion.Estilo(element)
    }else if(accion?.Color){
      return {Color: accion.Color}
    }else{
      return null
    }
  }

  getEventoclick(elemento:any, columna:any, control:any){

    if(control?.ColumnasClick?.some(item=> item.Columna == columna)){
      control?.ColumnasClick?.find(item=> item.Columna == columna).Accion(elemento);
    }
  }

  getValorColumnaIcono(elemento, columna, campo:string, param){  
    
    let item:any = param.ColumnasIcono.filter(item => item.Columna == columna)[0];
 
    // console.log(item);
    // console.log(elemento);
    // console.log(columna);
    let Icono = item.Icono.filter(iconos=> iconos.Valor == elemento[columna]);
    
 
    // if(elemento.Estado == 'Eliminado'){
    //   console.log("AAAA")

    // }
    
    return Icono[0][campo] || "";
    
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
      this.form.value
    ]

  }

  getTooltipColumnaIcono(elemento, columna, campo:string, param){ 
    let item:any = param.ColumnasIcono.filter(item => item.Columna == columna)[0];
    // console.log(item);

    let Icono = item.Icono.filter(iconos=> iconos.Valor == elemento[columna]);
    // console.log(Icono[campo]);
    
    
    return Icono[0][campo] || "";
    
  }

  getReadOnly(Nombre:string){
    return this.data.formulario.find(item => item.Nombre = Nombre).soloLectura || null;
  }

  getValidators(param: any): any[] {
    const validators = [];
    if (param.Requerido) validators.push(Validators.required);
    if (param.tipo === 'numero') validators.push(Validators.pattern('^[0-9]*$')); // Número entero
    if (param.tipo === 'decimal') validators.push(Validators.pattern('^[0-9]+(\\.[0-9]{1,2})?$')); // Decimal con 2 decimales
    if (param.tipo === 'texto') validators.push(Validators.minLength(1));
    if(param.tipo==='fecha'){
      if (param.FechaMinima) validators.push(Validators.min(new Date(param.FechaMinima).getTime()));
      if (param.FechaMaxima) validators.push(Validators.max(new Date(param.FechaMaxima).getTime()));
    }

    if (param.tipo === 'hora') {
      if (param.MinHora) {
        const minHora = this.parseHora(param.MinHora); // Convertir MinHora a un valor comparable
        validators.push(control => {
          const valor = this.parseHora(control.value);
          return valor >= minHora ? null : { minHora: true }; // Valida que sea mayor o igual a MinHora
        });
      }
      if (param.MaxHora) {
        const maxHora = this.parseHora(param.MaxHora); // Convertir MaxHora a un valor comparable
        validators.push(control => {
          const valor = this.parseHora(control.value);
          return valor <= maxHora ? null : { maxHora: true }; // Valida que sea menor o igual a MaxHora
        });
      }
    }
 
    
    return validators;
  }

  parseHora(hora: string): number {
    const [horas, minutos] = hora.split(':').map(Number);
    return horas * 60 + minutos;
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
        if(this.form.get(param.Nombre)){

          this.filteredOptions[param.Nombre] = this.form.get(param.Nombre)?.valueChanges.pipe(
            startWith(''),
            map(value => typeof value === 'string' ? this._filter(value, mappedData) : mappedData)
          );
          if(param?.Valor?.Id){
            this.form.get(param.Nombre).setValue(this.dynamicListOptions[param.Nombre]?.find(option => option.Id === param.Valor?.Id) || null)
          }else{
            this.form.get(param.Nombre).setValue( null)
          }
          
        }else{
          const controlEncontrado = this.buscarControlPorNombre(this.form, param.Nombre);

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

  private _filter(value: string, options: any[]): any[] {
    const filterValue = value.toLowerCase();
    return options.filter(option => option.Valor.toLowerCase().includes(filterValue));
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

  private formatDateForDb(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
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

  displayFn(option: any): string {    
    return option && typeof option === 'object' ? option.Valor : ''; // Verifica que option sea un objeto antes de acceder a 'Valor'
  }

  clearAutocomplete(controlName: string, campo): void {
    this.form.get(controlName)?.setValue('');
    if(campo?.FnChange){
      campo.FnChange()
    }
  }
  
  onOptionSelected(event: any, campo: any) {
    console.log(campo)
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
        this.form.get(element.Campo_a_actualizar).setValue(valor)
      })
     
    }

   
    // Mostrar/ocultar múltiples campos según la selección
    if (campo.HabilitarCampo) {
      campo.HabilitarCampo.forEach(condicion => {
        const Campo = condicion.Campo;
        const ValorCriterio = condicion.ValorCriterio;


        if (selectedValue === ValorCriterio) {
          this.form.get(Campo)?.enable();  // Mostrar el campo
        } else {
          this.form.get(Campo)?.disable(); // Ocultar el campo
          this.form.get(Campo)?.setValue(null); // Limpiar el valor
        }
      });
    }
  }

  calcularTotales(campo) {
    this.totales = {}; // Reiniciar totales

    const formGroup = this.form.get(campo.Nombre) as FormGroup;
  
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
  
  getEstiloSubtotales(fila:any, columna:any){
    if(fila?.ColumnaTotal == columna){ 
      return fila?.EstiloTotal || null;
    }

    if(fila?.ColumnaEtiqueta == columna){ 
      return fila?.EstiloEtiqueta || null;
    }
  }
      
  getFilasKeys(grupo: string): string[] {
    const formGroup = this.form.get(grupo) as FormGroup;
    return formGroup ? Object.keys(formGroup.controls) : [];
  }

  formatearDecimalGrupo(evento:any): void {
    evento.target.value =   parseFloat(evento.target.value).toFixed(2)
  }

  getCeldas(campo: any, index: number) {
    return campo.Filas[index]?.Celdas || [];
  }

  onSubmit(): void {
    if (this.form.valid) {
      const formData = { ...this.form.value };

      for (const key in formData) {
        if (formData[key] instanceof Date) {
          formData[key] = this.formatDateForDb(formData[key]);
        }
      }
    
      if(this?.data?.FnValidacion){
        var resultado = this.data.FnValidacion(formData);
        if(resultado == true){
          formData.ArchivosImagenes = this.File;
          this.dialogRef.close(formData);  
        }
      }else{
        formData.ArchivosImagenes = this.File;
        this.dialogRef.close(formData);
      }
      
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}

