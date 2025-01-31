import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { gFormComponent, DialogMapa } from './g-form.component';
import { MaterialModule } from "../../../material.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

@NgModule({
  declarations: [gFormComponent, DialogMapa],
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  exports: [
    gFormComponent
  ],
  entryComponents: [
    DialogMapa // Asegúrate de que gTableDialog esté aquí si estás usando Angular < 9
  ]
})
export class gFormModule { }
