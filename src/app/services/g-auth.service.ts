import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as FingerprintJS from '@fingerprintjs/fingerprintjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { gConstantesService } from './g-constantes.service'
import { map, retry } from 'rxjs/operators';
import { Router } from '@angular/router';

const url_api = gConstantesService.gAuthUrl;

const Cabecera: HttpHeaders = new HttpHeaders({
  "Content-type": "application/json"
});

@Injectable({
  providedIn: 'root'
})
export class gAuthService {

  public loggedIn = new BehaviorSubject<boolean>(!!sessionStorage.getItem("dataUser"));

  constructor(private http: HttpClient, private router:Router) { }

  // ok
  async login(datos:{IdUsuario:string, Clave:string}){

    // si está autorizado debe guardarse el token, sino no
    if(datos.IdUsuario ==""){
      alert("¡Error!, seleccione su usuario");
      return false;
    }
    
    if(datos.Clave ==""){
      alert("¡Error!, Ingrese su clave");
      return false;
    }
    
    // const fp = await this.generateFingerprint();
    const dataFP = await FingerprintJS.load(); 
    const result = await dataFP.get(); 
    const fp = result.visitorId;
    
    const param = {
      tipo: "login",
      IdUsuario: datos.IdUsuario,
      Clave: datos.Clave,
      fingerprint: fp
    };
        
    this.http.post(url_api, param, {headers:Cabecera}).subscribe((data:any) => {
      if(data){
        if(data.Estado == 1){
          localStorage.setItem("auth_token", data.token);
          this.router.navigate(['/']);
        }else{
          alert(data.message)
        }
      }else{
        console.log("error al ejecutar la consulta");
        
      }
      // console.log(data);
      
    })
    
  }

  isAutorized(ruta:string){
    const token = localStorage.getItem('auth_token');
    // console.log(token);
    
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const param = {
      tipo : 'isAutorized',
      ruta: ruta,
    }
    
    // this.http.post(url_api, param, {headers:headers}).subscribe((data:any) => {
    //   if(data){
    //     return data
    //   }else{
    //     return false; 
    //   }  
    // })

    return this.http.post(url_api, param, {headers:headers}).pipe(
      map(data=>data), retry(3)
    )
  }

  userData(){
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const param = {
      tipo : 'UserData'
    }
   
    return this.http.post(url_api, param, {headers:headers}).pipe(
      map(data=>data), retry(3)
    )
  }

  Menu(){
    const token = localStorage.getItem('auth_token');
    // console.log(token);
    
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const param = {
      tipo : 'Menu'
    }
   
    return this.http.post(url_api, param, {headers:headers}).pipe(
      map(data=>data), retry(3)
    )
  }

  logOut(){
    localStorage.removeItem("auth_token");
    this.router.navigate(["/login"]);
  }


}
