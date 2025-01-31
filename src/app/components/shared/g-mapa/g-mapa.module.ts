import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { gMapaComponent,gMapaDialog } from './g-mapa.component';
import { MaterialModule } from 'src/app/material.module';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

@NgModule({
  declarations: [gMapaComponent, gMapaDialog],
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    gMapaComponent
  ],
  entryComponents: [
    gMapaDialog // Asegúrate de que gTableDialog esté aquí si estás usando Angular < 9
  ]
})
export class gMapaModule { }
