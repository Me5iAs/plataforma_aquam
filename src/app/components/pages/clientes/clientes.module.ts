import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { ClientesComponent } from './clientes.component';
import { FormsModule, ReactiveFormsModule } from "@angular/forms"
import { MaterialModule } from 'src/app/material.module';
import { gTableModule } from '../../shared/g-table/g-table.module';
import { gMapaModule } from '../../shared/g-mapa/g-mapa.module';
import { gInputDialogModule } from '../../shared/g-inputDialog/g-input-dialog.module';

const routes: Routes = [
  { path: '', component: ClientesComponent }
];

@NgModule({
  declarations: [ClientesComponent],
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
export class ClientesModule { }
