import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { gAuthService } from '../services/g-auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class gAuthGuard implements CanActivate {

  constructor(private gAuth: gAuthService, private router: Router) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    try {  
      const baseRoute = "/" + state.url.split('/')[1];      
      const data: any = await (await this.gAuth.isAutorized(baseRoute)).toPromise();

      
      if(state.url =="/"){
        return true;
      }
    
      // no hay data, entonces haces un logout y regresas al login
      if(!data){
        this.gAuth.logOut();
        this.router.navigate(['/login']);
        return false;
      }

      // si hay data pero no estas logueado, entonces regresas al login 
      if(data.isLogged == false){
        this.router.navigate(['/login']);
        return false;
      }

      //si llegas aqui es que hay data y está logueado

      // si no es valido, estas logueado, pero notienes acceso a ese menu
      if(data.isValid == false){
        this.router.navigate(['/']);
        return false;
      }else{
        return true;
      }

   
 
    } catch (error) {
      // En caso de error, permite el acceso por defecto
      this.router.navigate(['/home']);
      return false;
    }
  }

  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {
    return this.canActivate(childRoute, state)
    
  }
}
