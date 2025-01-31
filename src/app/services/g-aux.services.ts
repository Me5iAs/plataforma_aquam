import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class gAuxService {

  constructor() { }


  Hora_2b(time: string): string {
  const parts = time.split(':');
  return `${parts[0]}:${parts[1]}:00`; 
  }

  fecha_2b(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
  }

  fecha_2n(fecha:string){
    return [fecha.substr(8,2), fecha.substr(5,2), fecha.substr(0,4) ].join("/");
  }

  fecha_2datapicker(fecha:string){
    // console.log(fecha)
    return [fecha.substr(6,4), fecha.substr(3,2), fecha.substr(0,2) ].join("-");  
  }

  parte_fecha(fecha:string, tipo:string){
    // console.log(fecha);
    
    // D:dia completo, d:dia abreviado, M:mes completo, m:mes abreviado
    // fecha: 18/10/2020
    let fechaA = fecha.split("/");
    let date = new Date(fechaA[1] + "-" + fechaA[0] + "-" + fechaA[2]);

    let diaC = ["lunes", "martes", "miércoles", "jueves", "viernes", "sabado","domingo"];
    let diaA = ["LUN", "MAR", "MIE", "JUE", "VIE", "SAB","DOM"];
    let mesC = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    let mesA = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
    if(tipo=="D"){
      return diaC[date.getDay()-1];
    }
    if(tipo=="d"){
      return diaA[date.getDay()-1];
    }
    if(tipo=="M"){
      return mesC[Number(fechaA[1])-1];
    }
    if(tipo=="m"){
      return mesA[Number(fechaA[1])-1];
    }
  }

  parte_entero(numero:any): string {
    // Dividir el número por el punto decimal
    const [entero] = numero.toString().split(".");
    // Retornar solo la parte entera
    return entero;
  }
  
  parte_decimal(numero:any): string {
    const [, decimal] = numero.toString().split(".");
    return (decimal || "00").padEnd(2, "0");
  }
  
 

}
