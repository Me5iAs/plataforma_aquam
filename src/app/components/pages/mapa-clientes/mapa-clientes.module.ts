import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { MapaClientesComponent } from './mapa-clientes.component';


const routes: Routes = [
  { path: '', component: MapaClientesComponent }
];

@NgModule({
  declarations: [MapaClientesComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class MapaClientesModule { }
