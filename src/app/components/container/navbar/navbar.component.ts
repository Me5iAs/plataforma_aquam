import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { gQueryService } from 'src/app/services/g-query.service';
import { gAuthService } from 'src/app/services/g-auth.service';
import { filter } from 'rxjs/operators';


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  @Output() toggleDrawer = new EventEmitter<void>();

  public titulo$;
  constructor(private router: Router, private gQuery:gQueryService, private gAuth:gAuthService) { }

  ngOnInit(): void {


    this.titulo$ = this.gQuery.sql("sp_menu_data", this.router.url);
    
    // console.log(this.titulo$);
    
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
      // alert("AA")
      this.titulo$ = this.gQuery.sql("sp_menu_data", this.router.url);

    });
}
  onToggleDrawer() {
    this.toggleDrawer.emit();
  }
  
  logout(): void {
    this.gAuth.logOut()
    // Lógica para cerrar sesión
  }

}
