import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { gTableComponent, gTableDialog, DialogMapa } from './g-table.component';
import { MaterialModule } from "../../../material.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
// import { gInputDialogModule } from '../g-inputDialog/g-input-dialog.module';
// import { gInputDialogModule } from '../../shared/g-inputDialog/g-input-dialog.module';

@NgModule({
  declarations: [gTableComponent, gTableDialog, DialogMapa],
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    // gInputDialogModule
  ],
  exports: [
    gTableComponent
  ],
  entryComponents: [
    gTableDialog, DialogMapa // Asegúrate de que gTableDialog esté aquí si estás usando Angular < 9
  ]

})
export class gTableModule { }
