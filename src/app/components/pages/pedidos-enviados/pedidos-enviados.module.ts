import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { PedidosEnviadosComponent } from './pedidos-enviados.component';


const routes: Routes = [
  { path: '', component: PedidosEnviadosComponent }
];

@NgModule({
  declarations: [PedidosEnviadosComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class PedidosEnviadosModule { }
