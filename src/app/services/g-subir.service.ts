import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { gConstantesService } from './g-constantes.service';

const url_api = gConstantesService.gSubirUrl;


@Injectable({
  providedIn: 'root'
})
export class gSubirService {
  
 
	constructor(private http: HttpClient){}
	
	public subirImagen(imagenParaSubir: File, Nombre:string, Tipo:string){

		const formData = new FormData(); 
    formData.append('imagenPropia', imagenParaSubir, imagenParaSubir.name); 
    formData.append("Nombre",Nombre);
		formData.append("Tipo",Tipo);
		return this.http.post(url_api, formData);

	}
	
	 
	
  
}

