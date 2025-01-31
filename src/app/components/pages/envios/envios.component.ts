import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { gAuthService } from 'src/app/services/g-auth.service';
import { gTableComponent } from '../../shared/g-table/g-table.component';
import { gQueryService } from 'src/app/services/g-query.service';
import { Router } from '@angular/router';
import { gMapaComponent } from '../../shared/g-mapa/g-mapa.component';
import { gConstantesService } from 'src/app/services/g-constantes.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from "../../format-datepicker";
import { gInputDialogComponent } from '../../shared/g-inputDialog/g-input-dialog.component';


const url_api = gConstantesService.gImagenesClientes;

@Component({
  selector: 'app-envios',
  templateUrl: './envios.component.html',
  styleUrls: ['./envios.component.css']
})
export class EnviosComponent implements OnInit {

  @ViewChild('gTableEnvios') gTableEnvios: gTableComponent;
  @ViewChild('gMapaCliente') gMapaCliente: gMapaComponent;

  @ViewChild('gMapaEnvios') gMapaEnvios: gMapaComponent;

  @ViewChild('gInputs') gInputs: gInputDialogComponent
  
  constructor(
    private gAuth:gAuthService, 
    private gQuery:gQueryService, 
    private router:Router,
    private dialog: MatDialog,
  ) { }
  UserData:any = "";
  DataEnvios:any = {};
  DataMapCliente:any = {}

  ngOnInit(): void {

    (window as any).mostrarImagen = this.mostrarImagen.bind(this);

    this.gAuth.userData().subscribe((data:any)=>{
      this.UserData = data;

      this.DataEnvios = {
        Titulo    :   "Envios", 
        Datos     :{
          Store           : "sp_envios_devolver_x_repartidor",
          Parametros      : this.UserData.Id,
          // OrdenColumnas   : ["Cliente"],
          ColumnasOcultas : ["IdPedido","Pedidos", "Glosa", "IdCliente", "Cliente", "Telefono", "Direccion", "Referencia", "Latitud", "Longitud", "EstadoPedido", "Botellones", "Precio_Botellones", "Bono_Botellones", "Paquetes", "Precio_Paquetes", "Bono_Paquetes"], //el sp_ devuelve varias columnas, aqui se establecen las columnas que no se desea mosrar
          ColumnasFusionadas: [
            { Columna: "Cliente",
              Titulo: "$Cliente ($Pedidos)",
              Cuerpo: "<span>$Direccion - $Referencia</span><span>$Glosa<span><br><span>$Telefono</span>",
              EstiloTitulo: { display:"block", color: "#1f1a17", "font-weight":"bold" },
              EstiloCuerpo: { display:"block", color: "#1f1a17", "font-weight":" 400"},
            },
          ]
        },

        Opciones: {
          Checkbox          : false,
          DeleteSelectCheck : false,
          Filtro            : true,
          AccionesGenerales:[
            { 
              Accion: "Ver Mapa",  // Nombre de la acción personalizada
              Icono: "map",  // Nombre del ícono de Material Design para la acción
              Color: "#004998",  // Color del botón de la acción personalizada
              Funcion: ()=>{
                this.gMapaEnvios.dataMap = {
                  Tipo          : "Icono",
                  AgregarPlanta : true,
                  MostrarDetalles: true,
                  Rutas         : true,
                  Icono         : {Icono: "map", Estilo: {color:"#a02200"}},
                  CargaDinamica : {
                    Store:"sp_envios_devolver_x_repartidor", 
                    Parametros:this.UserData.Id,
                    Latitud:"Latitud",
                    Longitud:"Longitud",
                    // Icono: "marker_env.png" //si noicono no hay icono dinamico
                    IconoDinamico : [
                      {Campo: "EstadoPedido", Valor: "1", Icono: "assets/marker_env.png"},
                      {Campo: "EstadoPedido", Valor: "2", Icono: "assets/marker_ok.png"},
                      {Campo: "EstadoPedido", Valor: "3", Icono: "assets/marker_error.png"},
                      {Campo: "EstadoPedido", Valor: "4", Icono: "assets/marker_rep.png"},
                    ],
                    // Popup: "Cliente" //el campo
                    PopupDinamico: {
                      Titulo : "Cliente", 
                      Cuerpo: ["Direccion", "Pedidos"], 
                      botones:  [
                        {
                          
                          Icono :   { Imagen: "foto_icon.png", Ancho: "20px", Alto: "20px" },
                          onclick: (item)=> {
                            console.log(item);
                            this.mostrarImagen(item.IdCliente);
                          }
                          
                        }
                      ]
                    }
                  },
                  Marcadores: []
                }
                this.gMapaEnvios.VerMapaModal()
              }  // Función a ejecutar cuando se selecciona la acción
            }
          ],
        },
        Acciones: {
          Otros: [
            { Nombre      : 'Mapa',
              Color       : "green",
              Tipo        : "Accion",
              Accion      : "Ver Ruta",
              Titulo      : "Mapa de Pedidos",
              Icono       : "pin_drop",
              Funcion     : (row)=> {               
                this.gMapaCliente.dataMap = {
                  Tipo: "Icono",
                  AgregarPlanta: true,
                  Rutas: true,
                  Icono: {
                    Icono: "map",
                    Estilo: {color:"#a02200"}
                  },
                  Marcadores: [
                    {
                      Latitud : row.Latitud,
                      Longitud: row.Longitud,
                      Popup: this.gMapaCliente.createPopup(row.Cliente, row.Direccion,
                        [
                            {
                              Icono :   { Imagen: "foto_icon.png", Ancho: "20px", Alto: "20px" },
                              onclick: (item)=> {
                                this.mostrarImagen(row.IdCliente);
                              }
                              
                            }
                          ]
                      ) ,                      
                    }
                  ]
                }
                this.gMapaCliente.VerMapaModal()
               }
            },
            { Nombre       : 'Atender', //identificador unico
              Color        : '#004998',
              Accion       : 'Registrar entrega',
              Tipo         : 'Accion', //Info o Accion
              Titulo       : "Registrar entrega",
              Funcion      : (row)=> { this.router.navigate(['/entregar/' + row.IdPedido])
                              },
              Icono        : 'assignment_turned_in',
            },
            {
              Nombre       : 'Reprogramar', //identificador unico
              Color        : '#FF9800',
              Tipo         : 'Accion', //Info o Accion
              Accion       : 'Repogramar pedido',
              // Titulo       : "Info del Pedido",
              Funcion      : (row)=> { 
                const today = new Date();
                const formattedDate = today.toISOString().split('T')[0];

                this.gInputs.data = {
                  titulo: 'Reprogramra pedido ',
                  tipo: 'icono',
                  icono: 'edit',
                  formulario: [
                    { nombre: 'Fecha',   tipo: 'fecha', requerido: true, valorDefecto: formattedDate},                    
                    { nombre: 'Glosa',   tipo: 'texto', requerido: true, valorDefecto: ""}, 
                    { nombre: 'IdPedido',  tipo: 'invisible', requerido: true, valorDefecto: row.IdPedido}
                  ],
                  ok: (result) => {
                    // this.gQuery.sql("sp_reprogramar_pedido", pIdPedido )
                    console.log(result);
                    
                  }
                };
                this.gInputs.openDialog();
              },
              Icono        : 'update',
            },
            {
              Nombre       : 'Recazar', //identificador unico
              Color        : '#F44336',
              Tipo         : 'Accion', //Info o Accion
              Accion       : 'Rechazar pedido',
              // Titulo       : "Info del Pedido",
              Funcion      : (row)=> { this.router.navigate(['/entregar/' + row.IdPedido])
                              },
              Icono        : 'block',
            }
          ],
        }
      }
      
      this.gTableEnvios.Conf = this.DataEnvios;
      this.gTableEnvios.cargarData()


    })

    // 
  }
  getDialogData(){
    
  }
  mostrarImagen(IdCliente) {
    const imageUrl = url_api + IdCliente + ".jpg";

    fetch(imageUrl, { method: 'HEAD' })
      .then(response => {
        if (response.ok) {
          const dialogRef = this.dialog.open(DialogUsuario, {
            data: imageUrl,
            disableClose: false,
            panelClass: 'image-dialog'
          });

          dialogRef.afterClosed().subscribe(result => { });
        }
        else {
          alert("este cliente no tiene foto registrada")
        }
      });
  }
}


@Component({
  selector: 'dialog-imagen',
  templateUrl: 'dialog-imagen.html',
  styleUrls: ['./envios.component.css'],
  providers: [
    { provide: DateAdapter, useClass: AppDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS }
  ]
})
export class DialogUsuario implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<DialogUsuario>,
    @Inject(MAT_DIALOG_DATA) public imageUrl: string
  ) { }

  ngOnInit(): void { }

  onCancel(): void {

    this.dialogRef.close();
  }
}