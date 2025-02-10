import { Component, Input, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { gAuthService } from 'src/app/services/g-auth.service';
import { filter } from 'rxjs/operators';


@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.css']
})
export class SidenavComponent implements OnInit {

  expandedMenus: { [key: string]: boolean } = {};
  @Input() opened: boolean = true; // Controla si el sidenav está abierto

  public User:any;
  groupedMenu: any = {};
  public Object = Object;

  constructor(private gAuth:gAuthService, private router: Router) { }


  showFiller = false;

  toggleFiller() {
    this.showFiller = !this.showFiller;
  }

    public Menu;
    currentRoute: string = '';
  
  
    ngOnInit(): void {

      this.currentRoute = this.router.url; // Inicializar la ruta actual

      this.gAuth.Menu().subscribe((data:any)=>{
       
        
        this.groupedMenu = this.groupByModulo(data[0]);  
        
        Object.keys(this.groupedMenu).forEach((modulo) => {
          this.expandedMenus[modulo] = true; // Expandido por defecto
        });
        // console.log(this.groupedMenu);
       
        
      })
  
      this.gAuth.userData().subscribe((data:any) =>{
        this.User = data;
      })


      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe((event: NavigationEnd) => {
        this.currentRoute = event.urlAfterRedirects; // Captura la ruta actual
      });

      
     
      
    }
  
    toggleMenu(modulo: string): void {
      this.expandedMenus[modulo] = !this.expandedMenus[modulo]; // Cambiar el estado expandido/colapsado
    }
  
    isExpanded(modulo: string): boolean {
      return this.expandedMenus[modulo]; // Verificar si está expandido
    }

    isActive(link: string): boolean {
      return this.currentRoute === link; // Compara la ruta con el link del ítem
    }

    groupByModulo(menuItems: any[]) {
      return menuItems.reduce((groups, item) => {
        const modulo = item.Modulo;
        if (!groups[modulo]) {
          groups[modulo] = [];
        }
        groups[modulo].push(item);
        return groups;
      }, {});
    }
}
