import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { gInputDialogComponent, DialogContent } from './g-input-dialog.component';
import { MaterialModule } from 'src/app/material.module';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

@NgModule({
  declarations: [gInputDialogComponent, DialogContent],
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  exports: [
    gInputDialogComponent
  ],
  entryComponents: [
    DialogContent // Asegúrate de que gTableDialog esté aquí si estás usando Angular < 9
  ]
})
export class gInputDialogModule { }
