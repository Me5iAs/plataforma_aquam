import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { RecordClienteComponent } from './record-cliente.component';


const routes: Routes = [
  { path: '', component: RecordClienteComponent }
];

@NgModule({
  declarations: [RecordClienteComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class RecordClienteModule { }
