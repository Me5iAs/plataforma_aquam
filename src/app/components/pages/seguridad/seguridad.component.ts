import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { gQueryService } from 'src/app/services/g-query.service';
import { gTableComponent } from '../../shared/g-table/g-table.component';

@Component({
  selector: 'app-seguridad',
  templateUrl: './seguridad.component.html',
  styleUrls: ['./seguridad.component.css']
})

export class SeguridadComponent implements OnInit {

  // usuarios
  @ViewChild('gTableUsers') gTableUsers: gTableComponent;
  DataUsers: any;

  //  permisos
  menuItems = new MatTableDataSource<any>([]);
  tiposUsuario: any[] = [];
  tipoUsuarioMenu: any[] = [];
  displayedColumns: string[] = ['Modulo', 'Item'];

  constructor(private gQuery: gQueryService) { }

  ngOnInit(): void {

    // usuarios
    this.DataUsers = {
      Titulo: "Tipos de Usuarios",
      Datos: {
        Store: "sp_tipousuario_devolver",

        ColumnasOcultas: ["Id"],

      },
      Opciones: {
        Checkbox: false,
        DeleteSelectCheck: false,
        Filtro: false,
      },
      Acciones: {

        Agregar: {
          Color: "green",
          Titulo: "Registrar Nuevo Tipo de Usuario",
          FnAgregar: (result: any) => {
            let parametros =
              result.Tipo + "|" +
              result.Descripcion
            this.gQuery.sql("sp_tipousuario_registrar", parametros).subscribe((data: any) => {
              if (data) {
                if (data[0].Resultado == "1") {
                  alert("Tipo de Usuario registrado");
                  this.gTableUsers.cargarData();
                  this.loadPermissions();
                } else {
                  alert("Error al registrar el Tipo de Usuario: " + data[0].Resultado);
                }
              }
            })
          },
          Parametros: [
            {
              Nombre: "Tipo",
              Valor: "",
              Etiqueta: "Cargo",
              Tipo: "Texto",
              placeholder: "Cargo",
              Error: "El Cargo es requerido",
              Patron: "Debe ingresar el Cargo",
              Requerido: true
            },
            {
              Nombre: "Descripcion",
              Valor: "",
              Etiqueta: "Descripción",
              Tipo: "Texto",
              placeholder: "Descripción",
              Error: "La Descripción es requerida",
              Patron: "Debe ingresar al menos un caracter",
              Requerido: true
            },
          ],
        },

        Editar: {
          Color: '#FFC107',
          Titulo: "Editar Tipo de Usuario",
          FnValidacion: (result) => {
            return true;
          },
          FnEditar: (result) => {
            let parametros =
              result.Id + "|" +
              result.Tipo + "|" +
              result.Descripcion;
              
            this.gQuery.sql("sp_tipousuario_actualizar", parametros).subscribe((data: any) => {
              if (data) {
                if (data[0].Resultado == "1") {
                  alert("Producto atualizado");
                  this.gTableUsers.cargarData();
                  this.loadPermissions();
                  
                } else {
                  alert("Error al editar el Tipo de Usuario");
                }
              }
            })
          },

          Parametros: [
            {
              Nombre: "Id",
              Valor: "",
              Tipo: "Oculto"
            },
            {
              Nombre: "Tipo",
              Valor: "",
              Etiqueta: "Cargo",
              Tipo: "Texto",
              placeholder: "Cargo",
              Error: "El Cargo es requerido",
              Patron: "Debe ingresar al menos un caracter",
              Requerido: true
            },
            {
              Nombre: "Descripcion",
              Valor: "",
              Etiqueta: "Descripción",
              Tipo: "Texto",
              placeholder: "Descripción",
              Error: "La Descripción es requerida",
              Patron: "Debe ingresar al menos un caracter",
              Requerido: true
            },

          ],
        },

        Eliminar: {
          Color: "#f44336",
          Store: "sp_tipousuario_eliminar",
          Tooltip: "Eliminar el Tipo de Usuario",
          Mensaje: "¿Esta seguro de que quiere eliminar este tipo de usuario?",
          Icono: "delete_forever",
          Parametros: ["Id"],

          Respuestas: [
            { Resultado: "1", Mensaje: "el tipo de usuario fue eliminado" },
            { Resultado: "-1", Mensaje: "Error: El tipo de usuario no pudo darse de baja" },
          ]
        },
      }
    }

    // permisos
    this.gQuery.cargarLista(this.tiposUsuario, "sp_tipousuario_devolver");
    this.gQuery.cargarLista(this.tipoUsuarioMenu, "sp_tipousuario_menu_devolver");

    this.loadPermissions(); // Carga los datos iniciales
  }

  ngAfterViewInit(): void {
    this.gTableUsers.cargarData();
  }

  loadPermissions(): void {
    this.gQuery.sql("sp_menu_devolver", "0").subscribe((data: any) => {
      this.menuItems = new MatTableDataSource(<any>data);
      this.displayedColumns = ['Modulo', 'Item', ...this.tiposUsuario.map((tipo) => tipo.Tipo)];
    })
  }

  isPermissionEnabled(menuId: number, tipoId: number): boolean {
    if (!this.tipoUsuarioMenu) {
      return false;
    }

    return this.tipoUsuarioMenu.some(
      (relation) => relation.IdMenu === menuId && relation.IdTipoUsuario === tipoId
    );
  }

  togglePermission(menuId: number, tipoId: number, enabled: boolean): void {
    const estado = enabled ? 1 : 0;
    this.gQuery.sql("sp_tipousuario_menu_actualizar", menuId + "|" + tipoId + "|" + estado).subscribe((data) => {
      console.log(data);
    })
  }
}
