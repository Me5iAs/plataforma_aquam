import { Component, OnInit } from '@angular/core';
import { gAuthService } from 'src/app/services/g-auth.service';
// import { UsuarioI } from "../../models/usuario.interface";
import {FormGroup, FormControl, Validators} from "@angular/forms";
import { Router } from "@angular/router";
import { gQueryService } from 'src/app/services/g-query.service'; 

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  Usuarios: any[] = []; // Inicializamos como un array vacío

  constructor(public gAuth:gAuthService, private gQuery:gQueryService, private route:Router) { }

  loginForm = new FormGroup({
    IdUsuario: new FormControl("",Validators.required),
    Clave: new FormControl("", Validators.required)
  });
  

  ngOnInit(): void {  
    this.gQuery.cargarLista(this.Usuarios, "sp_usuarios_devolver")
  }

  onLogin(form: any){
    // console.log("AAA");
    
    this.gAuth.login(form);
  }

  onLogout(){
    this.gAuth.logOut();
  }
}
