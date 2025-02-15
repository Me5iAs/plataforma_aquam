import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class gAuxService {

  constructor() { }

  public getAhora(
    formatType:
      | "fecha_base"
      | "fecha_corta"
      | "fecha_larga"
      | "hora_base"
      | "hora_corta"
      | "hora_larga"
  ): string {
    const now = new Date();
    // Convertir a UTC y ajustar a GMT-5 (restando 5 horas en milisegundos)
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const gmtMinus5 = new Date(utc - 5 * 60 * 60000);

    // Componentes de la fecha
    const day = String(gmtMinus5.getDate()).padStart(2, "0");
    const month = String(gmtMinus5.getMonth() + 1).padStart(2, "0");
    const year = String(gmtMinus5.getFullYear());
    const shortYear = year.slice(-2);

    // Componentes de la hora
    const hours24 = String(gmtMinus5.getHours()).padStart(2, "0");
    const hours12 = String(gmtMinus5.getHours() % 12 || 12).padStart(2, "0");
    const minutes = String(gmtMinus5.getMinutes()).padStart(2, "0");
    const seconds = String(gmtMinus5.getSeconds()).padStart(2, "0");
    const meridiem = gmtMinus5.getHours() >= 12 ? "pm" : "am";

    switch (formatType) {
      case "fecha_base":
        return `${year}-${month}-${day}`;
      case "fecha_corta":
        return `${day}/${month}/${shortYear}`;
      case "fecha_larga":
        return `${day}/${month}/${year}`;
      case "hora_base":
        return `${hours24}:${minutes}:${seconds}`;
      case "hora_corta":
        return `${hours12}:${minutes} ${meridiem}`;
      case "hora_larga":
        return `${hours12}:${minutes}:${seconds} ${meridiem}`;
      default:
        throw new Error("Formato no reconocido");
    }
  }
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
  
  // el uso de la funcion GPS es:
  // async function obtenerPosicion() {
  //   const posicion = await this.gAuxService.getGPSPosition();
  //   console.log(posicion);
  // }
  getGPS(): Promise<string> {
    return new Promise<string>((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            resolve(`${lat},${lng}`);
          },
          (error) => {
            // Si ocurre algún error (por ejemplo, el usuario deniega el acceso), se retorna ""
            resolve("");
          }
        );
      } else {
        // Si el navegador no soporta geolocalización
        resolve("");
      }
    });
  }
}
