import { Component, OnInit, ViewChild } from '@angular/core';
import { gTableComponent } from '../../shared/g-table/g-table.component';
import { gQueryService } from 'src/app/services/g-query.service';
import { gAuthService } from 'src/app/services/g-auth.service';
import { gInputDialogComponent } from '../../shared/g-inputDialog/g-input-dialog.component';
import { gAuxService } from 'src/app/services/g-aux.services';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { APP_DATE_FORMATS, AppDateAdapter } from '../../format-datepicker';


@Component({
  selector: 'app-aprobaciones',
  templateUrl: './aprobaciones.component.html',
  styleUrls: ['./aprobaciones.component.css'],
    providers: [
      {provide: DateAdapter, useClass: AppDateAdapter},
      {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
    ]
})
export class AprobacionesComponent implements OnInit {
  
  @ViewChild('gTableEntregas') gTableEntregas: gTableComponent;
  @ViewChild('gTableAprobacionesEmitidas') gTableAprobacionesEmitidas: gTableComponent;
  
  @ViewChild('gInputs') gInputs: gInputDialogComponent
  DataEntregas:any;
  DataAprobacionesEmitidas: any;
  User: any;

  emitidosForm = new FormGroup({
    pDesde: new FormControl( new Date(), Validators.required),
    pHasta: new FormControl(new Date(), Validators.required)
  });

  constructor( private gQuery: gQueryService, private gAuth:gAuthService, private gAux:gAuxService) { }

  ngOnInit(): void {
    this.gAuth.userData().subscribe((data: any) => {
      this.User = data;
    });
    
    // pendientes 
    this.DataEntregas = {
      Titulo: "Entregas",
      Datos: {
        Store: "sp_operaciones_aprobaciones_pendientes_devolver",
        // OrdenColumnas   : ["Id","Nombre", "Tipo", "Sueldo"],
        ColumnasEtiquetas : [{Columna: "Tipo", Etiqueta: "Motivo"},],   
        ColumnasOcultas: ["Id", "IdOperacion", "IdUsuarioSol", "FechaSol", "HoraSol", "Glosa"],
        CeldasValor: [
          {Columna: "Tipo", Valores:  [
            {Dato: "1", Valor: "Entrega menor a la registrada"},
            {Dato: "2", Valor: "Entrega al crédito"},
            {Dato: "3", Valor: "Pedido rechazado"},
            {Dato: "4", Valor: "Pedido reprogramado"},
          ]},
        ],
        ColumnasFusionadas: [
          { Columna: "F. Solicitud",
            Titulo: "$FechaSol",
            Cuerpo: "<span>$HoraSol</span>",
            EstiloTitulo: { display:"block", },
            EstiloCuerpo: { display:"block", "font-size":"12px", color: "#212529"},
          },
        ],
        // ColumnasEstilos: [{
        //   Columna: "Usuario", Estilo : {"text-align": "center"}
        // }
        // ],

      },
      Opciones: {
        Checkbox: false,
        DeleteSelectCheck: false,
        Filtro: true,
        Paginacion: {Op: [20,30,50, 100, 200],Size: 20},

      },
      Acciones: {

        Otros: [
          

          { Nombre: 'Decidir',
            Color: "#048979",
            Tooltip: "Aprobar / Rechazar pedido",
            Icono: "new_releases",
            Tipo: 'Accion',
            Funcion: (row) => {
              let Glosas = row.Glosa.split("|");
              let campos = [];
              let contador = 1;

              Glosas.forEach(item => {
                campos.push({
                  nombre: 'Motivo ' +  contador,   
                  tipo: 'texto', 
                  requerido: true, 
                  valorDefecto: item, 
                  soloLectura:true 
                })
                contador++;
              })

              campos.push(
                { Tipo            : "TablaDinamica",
                  TituloTabla     :  "<span>Cliente: <b> $Cliente</b></span>",
                  Store           : "sp_operaciones_productos_pedido_devolver", 
                  Parametros      : row.IdOperacion,
                  ColumnasOcultas : ["Id","Cliente","IdProducto","Producto","Total", "CantidadBono", "CantidadEntregadaBono"],
                  OrdenColumnas   : ["Abreviatura", "PrecioUnitario", "Cantidad", "CantidadEntregada"],
                  ColumnasEtiquetas:[
                    { Columna: "Abreviatura", Etiqueta:"Prod"},
                    { Columna: "Cantidad", Etiqueta:"Pedido"},
                    { Columna: "PrecioUnitario", Etiqueta:"S/"},
                    // { Columna: "Total", Etiqueta:"Total"},
                    { Columna: "CantidadEntregada", Etiqueta:"Entregado"},
                    // { Columna: "TotalEntrega", Etiqueta:"T. Entrega"},

                  ],
                  ColumnasEstilos  : [
                    {Columna: "PrecioUnitario",       Estilo: {"text-align": "center"} },
                    {Columna: "Cantidad",  Estilo: {"text-align": "right"} },
                    {Columna: "CantidadEntregada",    Estilo: {"text-align": "right"} },
                  ],

                  
                },
              );

              campos.push(  
                { Tipo            : "TablaDinamica",
                TituloTabla     :  "<span><b>Pagos</b></span>",
                Store           : "sp_operaciones_entrega_credito_devolver", 
                Parametros      : row.IdOperacion,
                ColumnasOcultas : ["IdOperacion"],
                // OrdenColumnas   : ["Abreviatura", "PrecioUnitario", "Cantidad", "CantidadEntregada"],
                ColumnasEtiquetas:[
                  { Columna: "ValorEntrega",        Etiqueta:"Valor Entregado"},
                  { Columna: "MontoCredito",        Etiqueta:"Cred."},
                  { Columna: "MontoEfectivo",       Etiqueta:"Efectivo"},
                  { Columna: "MontoTransferencia",  Etiqueta:"Bnco"},
                ],
                ColumnasEstilos  : [
                  {Columna: "MontoCredito",       Estilo: {"text-align": "right"} },
                  {Columna: "MontoEfectivo",      Estilo: {"text-align": "right", "padding-left":"5px"} },
                  {Columna: "MontoTransferencia", Estilo: {"text-align": "right", "padding-left":"5px"} },
                ],
              })

              campos.push({
                nombre: 'IdOperacion',   
                tipo: 'Oculto', 
                valorDefecto: row.IdOperacion, 
                soloLectura:true 
              })

              this.gInputs.data = {
                titulo: "Requerimientos de Aprobación",
                tipo: 'icono',
                BtnAceptar: "Aprobar",
                // ancho: '90vw',
                ancho: "350px",
                icono: 'edit',
                formulario: campos,
                FnValidacion: (result) => { return true },
                ok: (result) => {
                  console.log(result);
                  this.gAux.getGPS().then(posicion => {
                    this.gQuery.sql("sp_operaciones_aprobaciones_aprobar", result.IdOperacion + "|"+ this.User?.Id + "|" + posicion).subscribe((data:any)=>{
                      if(data && data[0].Resultado =="1"){
                        this.gTableEntregas.cargarData();
                        this.gTableAprobacionesEmitidas.cargarData();
                      }
                      alert(data[0].Mensaje)
                    });
                  })
  
                }
              };

              this.gInputs.openDialog()

        
            },
          },
          
        ]

      }
    }

    // emitidas
    this.DataAprobacionesEmitidas = {
      Titulo: "Entregas",
      Datos: {
        Store: "sp_operaciones_aprobaciones_emitidas_devolver",
        Parametros    : this.gAux.fecha_2b(this.emitidosForm.value.pDesde) + "|" + this.gAux.fecha_2b(this.emitidosForm.value.pHasta),
        OrdenColumnas   : ["Solicitud", "Aprobacion", "Operacion", "Motivo", "Entrega","Pago"],
        ColumnasFusionadas: [
          { Columna: "Motivo",
            Titulo: "$Tipo",
            Cuerpo: "<span>$Glosa</span>",
            EstiloTitulo: { display:"block", "font-size":"12px", color: "#212529"},
            EstiloCuerpo: { display:"block", "font-size":"12px", color: "#212529"},
          },

          { Columna: "Entrega",
            Titulo: "$Cliente",
            Cuerpo: "<span>$Entregas</span>",
            EstiloTitulo: { display:"block", "font-size":"12px", color: "#212529"},
            EstiloCuerpo: { display:"block", "font-size":"12px", color: "#212529"},
          },
          { Columna: "Operacion",
            Titulo: "$Cliente",
            Cuerpo: "<span>$Entregas<br>$Tipo<br>$Glosa</span>",
            EstiloTitulo: { display:"block", "font-size":"12px", color: "#212529"},
            EstiloCuerpo: { display:"block", "font-size":"12px", color: "#212529"},
          },

          { Columna: "Solicitud",
            Titulo: "$U_Solicita",
            Cuerpo: "<span>$H_Solicitud <br>$F_Solicitud</span>",
            EstiloTitulo: { display:"block", },
            EstiloCuerpo: { display:"block", "font-size":"12px", color: "#212529"},
          },

          { Columna: "Aprobacion",
            Titulo: "$U_Aprobador",
            Cuerpo: "<span>$H_Aprobacion <br>$F_Aprobacion</span>",
            EstiloTitulo: { display:"block", },
            EstiloCuerpo: { display:"block", "font-size":"12px", color: "#212529"},
          },

          { Columna: "Pago", 
            Titulo: "Efec: $MontoEfectivo", 
            Cuerpo: "Bco: $MontoTransferencia <br> Cred: $MontoCredito",
            EstiloTitulo: { display:"block", textAlign:'right', "min-width":"80px", "font-size":"12px"},
            EstiloCuerpo: { display:"block", textAlign:'right', "min-width":"80px", "font-size":"12px"}
          }
        ],
        ColumnasEstilos: [
          {Columna: "Pago", Estilo : {"text-align": "center"}},
          {Columna: "Aprobacion", Estilo : {"text-align": "center"}},
          {Columna: "Solicitud", Estilo : {"text-align": "center"}},

        ],
        ColumnasOcultarPantallas: [
          {Columna: "Entrega",    Celular: true, Mediano: true, Grande : false, Enorme : false },
          {Columna: "Motivo",     Celular: true, Mediano: true, Grande : false, Enorme : false },
          {Columna: "Operacion",  Celular: false, Mediano: false, Grande : true, Enorme : true }
        ]
      },
      Opciones: {
        Checkbox: false,
        DeleteSelectCheck: false,
        Filtro: true,
        Paginacion: {Op: [20,30,50, 100, 200],Size: 20},

      },
      Acciones: {

        Otros: [
          { Nombre: 'Revertir aprobación',
            //Color: "rgb(40, 167, 69)",
            Estilo: (item)=>{
              if (['3', '6', '7', '8'].includes(item.EstadoOperacion)) {
                return {
                  color: "#c3c3c3",
                  cursor: "no-drop"
                }
              }else{
                return {
                  color: "rgb(40, 167, 69)",
                  cursor: "pointer"
                }
              }
            },
            Tooltip: "Revertir Aprobación",
            Icono: "restart_alt",
            Tipo: 'Accion',
            Funcion: (row) => {
              console.log(row);
              
              if (['3', '6', '7', '8'].includes(row.EstadoOperacion)) {
                alert("Error: \n\n No es posible revertir la aprobación de operaciones que ya estén rendidas");
                return false;
              }
                       
             if(confirm("¡Alerta! \n\n ¿Confirma que quiere revertir la aprobación?")){
                this.gAux.getGPS().then(posicion => {
                  this.gQuery.sql("sp_operaciones_aprobacion_revertir", row.IdOperacion + "|" + this.User.Id + "|" + row.EstadoOperacion + "|" + posicion).subscribe((data:any)=>{
                    if(data && data[0].Resultado =='1'){
                      alert(data[0].Mensaje);
                      this.gTableEntregas.cargarData()
                      this.gTableAprobacionesEmitidas.cargarData()
                    }else{
                      alert(data[0].Mensaje);
                    }
                  });
                })              
              }
            },
          },
        ]
      }
    }
  }

  ngAfterViewInit(): void {
    this.gTableEntregas.cargarData();
    this.gTableAprobacionesEmitidas.cargarData();

  }

  cargarEmitidos(){
    let parameros = this.gAux.fecha_2b(this.emitidosForm.value.pDesde) + "|" + this.gAux.fecha_2b(this.emitidosForm.value.pHasta);
    console.log(parameros);
    this.DataAprobacionesEmitidas.Datos.Parametros = parameros;
    this.gTableAprobacionesEmitidas.cargarData()
  }
}
