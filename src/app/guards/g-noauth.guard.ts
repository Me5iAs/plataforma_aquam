import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { gAuthService } from '../services/g-auth.service';

@Injectable({
  providedIn: 'root'
})
export class gNoAuthGuard implements CanActivate {

  constructor(private gAuth: gAuthService, private router: Router) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    try {  
      const data: any = await (await this.gAuth.isAutorized(state.url)).toPromise();
      
      
      // console.log(data);
      
      if (!data) {
        return true;
      } 

      if(data.isLogged ==false){
        return true;
      }else{
        this.router.navigate(['/']);
        return false;
      }
    } catch (error) {
      return true;
    }
  }
}
