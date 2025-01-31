import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { gAuthService } from 'src/app/services/g-auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  
  public Menu;
  currentRoute: string = '';

  constructor(private gAuth:gAuthService, private router: Router) { }

  ngOnInit(): void {
    this.gAuth.Menu().subscribe((data:any)=>{
      // console.log(data);
      this.Menu = data[0];
      
    })

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentRoute = event.urlAfterRedirects; // Captura la ruta actual
    });
    
  }

  isActive(link: string): boolean {
    return this.currentRoute === link; // Compara la ruta con el link del ítem
  }

}
