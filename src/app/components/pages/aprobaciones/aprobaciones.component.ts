import { Component, OnInit, ViewChild } from '@angular/core';
import { gTableComponent } from '../../shared/g-table/g-table.component';
import { gQueryService } from 'src/app/services/g-query.service';
import { gAuthService } from 'src/app/services/g-auth.service';
import { gInputDialogComponent } from '../../shared/g-inputDialog/g-input-dialog.component';
import { Placeholder } from '@angular/compiler/src/i18n/i18n_ast';

@Component({
  selector: 'app-aprobaciones',
  templateUrl: './aprobaciones.component.html',
  styleUrls: ['./aprobaciones.component.css']
})
export class AprobacionesComponent implements OnInit {
  
  @ViewChild('gTableEntregas') gTableEntregas: gTableComponent;
  @ViewChild('gInputs') gInputs: gInputDialogComponent
  DataEntregas:any;
  User: any;

  constructor( private gQuery: gQueryService, private gAuth:gAuthService) { }

  ngOnInit(): void {
    this.gAuth.userData().subscribe((data: any) => {
      this.User = data;
    });
    
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
                ancho: '90vw',
                icono: 'edit',
                formulario: campos,
                FnValidacion: (result) => { return true },
                ok: (result) => {
                  console.log(result);
                  this.gQuery.sql("sp_operaciones_aprobaciones_aprobar", result.IdOperacion + "|"+ this.User?.Id).subscribe();
                  alert("Aprobación Registrada");
                  this.gTableEntregas.cargarData()
                }
              };

              this.gInputs.openDialog()

        
            },
          },
          
        ]

      }
    }
  }

  ngAfterViewInit(): void {
    this.gTableEntregas.cargarData();

  }
}
