import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { PedidosEntregarComponent, DialogUsuario } from './pedidos-entregar.component';
import { FormsModule, ReactiveFormsModule } from "@angular/forms"
import { MaterialModule } from 'src/app/material.module';
import { gTableModule } from '../../shared/g-table/g-table.module';
import { gMapaModule } from '../../shared/g-mapa/g-mapa.module';
import { gInputDialogModule } from '../../shared/g-inputDialog/g-input-dialog.module';

const routes: Routes = [
  { path: '', component: PedidosEntregarComponent }
];

@NgModule({
  declarations: [PedidosEntregarComponent, DialogUsuario],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    gTableModule,
    gMapaModule,
    gInputDialogModule

  ],
    exports: [
      DialogUsuario
    ],
    entryComponents: [
      DialogUsuario // Asegúrate de que gTableDialog esté aquí si estás usando Angular < 9
    ]
})
export class PedidosEntregarModule { }
