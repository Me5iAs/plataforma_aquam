import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {map, retry} from "rxjs/operators/";
import { gConstantesService } from "./g-constantes.service"
import { Observable } from 'rxjs';

const url_api = gConstantesService.gServiceUrl;

const Cabecera: HttpHeaders = new HttpHeaders({
  "Content-type": "application/json"
});

@Injectable({
  providedIn: 'root'
})
export class gQueryService {

  constructor(private http:HttpClient) { }

  sql(procedimiento:string, datos?:any){   
    return this.http.post(url_api, {name:procedimiento, datos: datos},
      {headers: Cabecera})
      .pipe(
        map(data=>data), 
        retry(3) 
        
      );
  }

  actualizarDatos(procedimiento: string, datos?:any){
    this.sql(procedimiento, datos).subscribe();
  }
  
  cargarLista(variableDestino: any[], procedimiento: string, datos?: any) {
    this.sql(procedimiento, datos).subscribe(
      (resultado: any[]) => {
        // Actualiza el contenido de la variable destino en lugar de asignar una nueva referencia
        variableDestino.length = 0; // Limpiamos el array
        resultado?.forEach(item => variableDestino.push(item)); // Agregamos los nuevos elementos
  
      },
      (error) => {
        variableDestino.length = 0; // Vaciamos la variable en caso de error
        console.error("Error al cargar datos:", error);
      }
    );
  }


}
