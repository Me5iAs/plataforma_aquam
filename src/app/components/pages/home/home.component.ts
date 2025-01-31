import { Component, OnInit } from '@angular/core';
import { gAuthService } from 'src/app/services/g-auth.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
 
  public User:any;
  groupedMenu: any = {};
  public Object = Object;
  
  constructor(private gAuth:gAuthService){}


  ngOnInit(): void {
    this.gAuth.Menu().subscribe((data:any)=>{
      this.groupedMenu = this.groupByModulo(data[0]);      
    })

    
    this.gAuth.userData().subscribe((data:any) =>{
      this.User = data;
    })
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
