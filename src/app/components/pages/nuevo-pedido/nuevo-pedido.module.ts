import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { NuevoPedidoComponent } from './nuevo-pedido.component';
import { gFormModule } from '../../shared/g-form/g-form.module';
import { FormsModule, ReactiveFormsModule } from "@angular/forms"
import { MaterialModule } from 'src/app/material.module';
import { gInputDialogModule } from '../../shared/g-inputDialog/g-input-dialog.module';

const routes: Routes = [
  { path: '', component: NuevoPedidoComponent }
];

@NgModule({
  declarations: [NuevoPedidoComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MaterialModule,
    FormsModule, 
    ReactiveFormsModule,
    gFormModule,
    gInputDialogModule
  ]
})
export class NuevoPedidoModule { }
