import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.css']
})
export class ContentComponent implements OnInit {
  isDrawerOpened = true;
  isSmallScreen = false;
  
  constructor(private breakpointObserver: BreakpointObserver) { }
  showFiller = true;
  ngOnInit(): void {
    this.breakpointObserver.observe([Breakpoints.Handset]).subscribe(result => {
      this.isSmallScreen = result.matches;
      this.isDrawerOpened = !this.isSmallScreen; // Drawer abierto si no es pantalla pequeña
    });
  }

}
