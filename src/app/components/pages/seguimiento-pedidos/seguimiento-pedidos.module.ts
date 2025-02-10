import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { SeguimientoPedidosComponent } from './seguimiento-pedidos.component';
import { FormsModule, ReactiveFormsModule } from "@angular/forms"
import { MaterialModule } from 'src/app/material.module';
import { gTableModule } from '../../shared/g-table/g-table.module';
import { gMapaModule } from '../../shared/g-mapa/g-mapa.module';
import { gInputDialogModule } from '../../shared/g-inputDialog/g-input-dialog.module';

const routes: Routes = [
  { path: '', component: SeguimientoPedidosComponent }
];

@NgModule({
  declarations: [SeguimientoPedidosComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MaterialModule,
    FormsModule, 
    ReactiveFormsModule,
    gTableModule,
    gMapaModule,
    gInputDialogModule
  ]
})
export class SeguimientoPedidosModule { }
