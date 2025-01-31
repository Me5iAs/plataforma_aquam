import { Component, OnInit, ViewChild } from '@angular/core';
import { gAuthService } from 'src/app/services/g-auth.service';
import { gQueryService } from '../../../services/g-query.service';

// import { gInputDialogComponent } from '../../shared/g-inputDialog/g-input-dialog.component';

@Component({
  selector: 'app-miperfil',
  templateUrl: './miperfil.component.html',
  styleUrls: ['./miperfil.component.css']
})


export class MiperfilComponent implements OnInit {

  // @ViewChild('gInput') gInput: gInputDialogComponent;

  public DataUser = [];
  displayedColumns: string[] = ['Icono', 'Campo', 'Valor', 'Edit'];
  
  dataSource  = [];
  ValorDefault = "aa"
  public User:any;
  miJson = {
    titulo: "Actualizar Dato",
    tipo: 'icono', 
    icono: 'edit',
    formulario: [
      { nombre: 'dato', tipo: 'texto', requerido: true, default:"aaaa" },
    ],
    ok: (result) => { 
      console.log('Datos enviados:', result); 
    }
  };

  constructor(private gAuth:gAuthService, private gQuery:gQueryService){}

  

  ngOnInit(): void {
 
    

    this.gAuth.userData().subscribe((data:any) =>{
      this.User = data;
      this.gQuery.sql("sp_usuario_data", this.User.Id).subscribe((data:any) => {
        this.dataSource  = [
          {Icono: 'face',           Campo: 'Nombre',              Name:'Nombre',            Valor: data[0].Nombre,          Edit: 'edit'},
          {Icono: 'assignment_ind', Campo: 'Usuario',             Name: 'Usuario',          Valor: data[0].Usuario,         Edit: 'edit'},
          {Icono: 'lock',           Campo: 'Clave',               Name: 'Clave',            Valor: '******',                Edit: 'edit'},
          {Icono: 'phone',          Campo: 'Teléfono',            Name: 'Telefono',         Valor: data[0].Telefono,        Edit: 'edit'},
          {Icono: 'cottage',        Campo: 'Dirección',           Name: 'Direccion',        Valor: data[0].Direccion,       Edit: 'edit'},
          {Icono: 'location_on',    Campo: 'Referencia',          Name: 'Referencia',       Valor: data[0].Referencia,      Edit: 'edit'},
          {Icono: 'event',          Campo: 'Fecha de Nacimiento', Name: 'FechaNacimiento',  Valor: data[0].FechaNacimiento, Edit: 'edit'},
        ];
      })
    })



  
  }

  getDialogData(item:any){
    if(item.Campo=="Clave"){
      return {
        titulo: 'Actualizar ' + item.Campo,
        tipo: 'icono',
        icono: 'edit',
        formulario: [
          { nombre: 'Clave Antigua',  tipo: 'clave',  requerido: true },
          { nombre: 'Escriba su nueva clave',  tipo: 'clave',  requerido: true },
          { nombre: 'Vuelva a escribir su nueva clave',  tipo: 'clave',  requerido: true }

        ],
        ok: (result) => this.onActualizarClave(result)
      }
    }else{
   
      
     return {
        titulo: 'Actualizar ' + item.Campo,
        tipo: 'icono',
        icono: 'edit',
        formulario: [
          { nombre: item.Campo,   tipo: item.Campo == 'Fecha de Nacimiento'? 'fecha':'texto', requerido: true, valorDefecto: item.Valor},
          { nombre: 'Campo',      tipo: 'invisible',                                          requerido: true, valorDefecto: item.Campo},
          { nombre: 'IdUsuario',  tipo: 'invisible',                                          requerido: true, valorDefecto: this.User.Id}
        ],
        ok: (result) => this.onActualizarDato(result)
      }
    }
  }


  onActualizarDato(result:any): void{

    let CampoBD = ""
    this.dataSource.forEach(item => {
      if(item.Campo == result.Campo){
        CampoBD = item.Name;
      }
    })
    console.log(result[result.Campo]);
    let valor =""
    if(CampoBD =="FechaNacimiento"){
      valor = this.formatDate(result[result.Campo])
    }else{
      valor =  result[result.Campo];
    }
    
    const param = result.IdUsuario + "|" + CampoBD + "|" + valor;
    this.gQuery.sql("sp_usuarios_actualizardato", param).subscribe();

    this.dataSource.forEach(item => {
      if (item.Campo ===  result.Campo) {
        let valor;
        if(item.Name =="FechaNacimiento"){
          valor = this.formatDate(result[result.Campo])
        }else{
          valor =  result[result.Campo];
        }
        item.Valor = valor;
      }
    });

  }

  onActualizarClave(result:any): void {
    console.log(result);
    if(result["Escriba su nueva clave"] != result["Vuelva a escribir su nueva clave"]){
      alert("error: La clave nueva no coincide")
      return;
    }
    
      const param = this.User.Id + "|" + result["Clave Antigua"] + "|" + result["Escriba su nueva clave"];
    this.gQuery.sql("sp_usuarios_cambiarclave", param).subscribe((data:any)=>{
      if(data && data[0].resultado ==1){
        alert("Clave Actualizada");    
      }else{
        alert("Error: La clave ingresada no coincide con su clave actual");    
      }
    });

  }
  

  // cambiar el formato de BD a texto
  formatFecha(fechaString) {
    // Dividir la cadena de fecha en año, mes y día
    // console.log(fechaString);
    
    const [anio, mes, dia] = fechaString.split('-');
  
    // Array con los nombres de los meses
    const meses = [
        "enero", "febrero", "marzo", "abril", "mayo", "junio",
        "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
    ];
  
    // Retornar la fecha en el formato "26 de junio de 1952"
    return `${parseInt(dia)} de ${meses[parseInt(mes) - 1]} de ${anio}`;
}

  // cambiar el formato del datapicker a bd
  formatDate(date: Date): string {
   
    // const fecha = this.form.get('nombreDelCampo').value; // obtener el valor del datepicker

// Convertir la fecha a formato "YYYY-MM-DD"
    const fechaString = date.toISOString().split('T')[0]; 
    return fechaString;
    // const year = date.getFullYear();
    // const month = ('0' + (date.getMonth() + 1)).slice(-2);  // Añadir un 0 si el mes es menor a 10
    // const day = ('0' + date.getDate()).slice(-2);  // Añadir un 0 si el día es menor a 10
    // return `${year}-${month}-${day}`;
  }
 

  
}
