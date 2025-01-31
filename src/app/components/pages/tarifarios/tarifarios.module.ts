import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { TarifariosComponent } from './tarifarios.component';


const routes: Routes = [
  { path: '', component: TarifariosComponent }
];

@NgModule({
  declarations: [TarifariosComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class TarifariosModule { }
