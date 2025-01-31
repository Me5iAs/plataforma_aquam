import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { EntregarComponent, DialogUsuario } from './entregar.component';
import { FormsModule, ReactiveFormsModule } from "@angular/forms"
import { MaterialModule } from 'src/app/material.module';
import { gInputDialogModule } from '../../shared/g-inputDialog/g-input-dialog.module';
import { gFormModule } from '../../shared/g-form/g-form.module';

const routes: Routes = [
  { path: '', component: EntregarComponent }
];

@NgModule({
  declarations: [EntregarComponent, DialogUsuario],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    gInputDialogModule,
    gFormModule
  ],
      exports: [
        DialogUsuario
      ],
      entryComponents: [
        DialogUsuario // Asegúrate de que gTableDialog esté aquí si estás usando Angular < 9
      ]
})
export class EntregarModule { }
