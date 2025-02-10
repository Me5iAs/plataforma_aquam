import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {DateAdapter, MAT_DATE_FORMATS} from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from "../../format-datepicker";
import { gTableComponent } from '../../shared/g-table/g-table.component';
import { gQueryService } from 'src/app/services/g-query.service';
import { gInputDialogComponent } from '../../shared/g-inputDialog/g-input-dialog.component';

@Component({
  selector: 'app-seguimiento-pedidos',
  templateUrl: './seguimiento-pedidos.component.html',
  styleUrls: ['./seguimiento-pedidos.component.css'],
  providers: [
    {provide: DateAdapter, useClass: AppDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
  ]
})
export class SeguimientoPedidosComponent implements OnInit {
    @ViewChild('gTableSeguimiento') gTableSeguimiento: gTableComponent;
    @ViewChild('gInputs') gInputs: gInputDialogComponent
    DataSeguimiento: any;

  FiltroForm = new FormGroup({ 
    Desde: new FormControl(new Date(), Validators.required),  
    Hasta: new FormControl(new Date(), Validators.required),
    Pendientes: new FormControl(true, Validators.required),
  });


  constructor(private gQuery: gQueryService) { }

  ngOnInit(): void {
    let pDesde = this.formatDate(new Date());
    let pHasta = this.formatDate(new Date());

    this.DataSeguimiento = {
      Titulo  : "Productos",
      Datos: {
        Store: "sp_operaciones_seguimiento",
        Parametros: pDesde + "|" + pHasta + "|1" ,
        OrdenColumnas   : [
          "Cliente",
          "EstadoPedido",
          "Estado",
          "TotalPago",
        ],
        ColumnasEtiquetas : [
          {Columna: "U_Repartidor", Etiqueta: "Repartidor"},
          {Columna: "EstadoPedido", Etiqueta: " "},
          {Columna: "TotalPago", Etiqueta:"Pagado"}
        ],   
        ColumnasOcultas: [
          "Id", "U_Registro", "F_Registro", "H_Registro",
          "U_Envia", "F_Envio", "H_Envio",
          "U_Repartidor", "F_Entrega", "H_Entrega",
          "U_recibeRendicion", "F_Rendicion", "H_Renicion",
          "Glosa", "Cliente", "TipoOperacion",
          , "EstadoPago",
          "PagoEfectivo", "PagoBanco"

        ],
        ColumnasIcono     : [
          { Columna : "EstadoPedido",
            Icono   : [ 
                        {Valor: "Pendiente",              Etiqueta: "Pendiente",                Icono: "access_time_filled",    Estilo: {color:"#FFC107", cursor:"help" }},
                        {Valor: "Enviado",                Etiqueta: "Enviado",                  Icono: "local_shipping",        Estilo: {color:"#ed7c31", cursor:"help"}},
                        {Valor: "Entregado",              Etiqueta: "Entregado",                Icono: "volunteer_activism",    Estilo: {color:"#0084b5", cursor:"help"}},
                        {Valor: "Reprogramado sin rendir",Etiqueta: "Reprogramado sin rendir",  Icono: "update",                Estilo: {color:"#FF2377", cursor:"help"}},
                        {Valor: "Rechazado sin rendir",   Etiqueta: "Rechazado sin rendir",     Icono: "report_problem",                 Estilo: {color:"#ff2c16", cursor:"help"}},
                        {Valor: "Rendido",                Etiqueta: "Rendido",                  Icono: "assignment_turned_in",  Estilo: {color:"#28A745", cursor:"help"}},
                        {Valor: "Reprogramado rendido",   Etiqueta: "Reprogramado rendido",     Icono: "event_available",       Estilo: {color:"#FF2377", cursor:"help"}},
                        {Valor: "Rechazado rendido",      Etiqueta: "Rechazado rendido",        Icono: "dangerous",        Estilo: {color:"#ff2c16", cursor:"help"}},
                      ], },
        ],
        ColumnasFusionadas: [
          { Columna: "Cliente",
            Titulo: "$Cliente",
            Cuerpo: "<span>$TipoOperacion - $Glosa</span>",
            EstiloTitulo: { display:"block", },
            EstiloCuerpo: { display:"block", "font-size":"10px", color: "#212529"},
          },
          { Columna: "Estado",
            Titulo: "$EstadoPedido",
            Cuerpo: "<span>$EstadoPago</span>",
            EstiloTitulo: { display:"block", },
            EstiloCuerpo: { display:"block", "font-size":"10px", color: "#212529"},
          },

        ],
        ColumnasEstilos: [
          {Columna: "Estado", Estilo : {"text-align": "center"}},
          {Columna: "TotalPago", Estilo : {"text-align": "right"}}
        ],

      },
      Opciones: {
        Checkbox          : false,
        DeleteSelectCheck : false,
        Filtro            : true,
        AnchoTabla        : "100%"
      },
      Acciones: {

      Otros: [
        { Nombre: 'Historial',
          Color: "#048979",
          Tooltip: "Historial",
          Icono: "history_edu",
          Tipo: 'Accion',
          Funcion: (row) => {
            let campos = [];
            campos.push(
              { Tipo            : "TablaDinamica",
                TituloTabla     :  "<span>Cliente: <b>" + row.Cliente + " </b></span>",
                Store           : "sp_operaciones_historial_idoperacion_devolver", 
                Parametros      : row.Id,
                ColumnasOcultas : ["Id", "Fecha", "Hora"],
                OrdenColumnas   : ["Fecha", "Usuario", "Detalles", "Estado"],
                ColumnasFusionadas: [
                  { Columna: "Fecha",
                    Titulo: "$Fecha",
                    Cuerpo: "<span>$Hora</span>",
                    EstiloTitulo: { display:"block", },
                    EstiloCuerpo: { display:"block", "font-size":"10px", color: "#212529"},
                  },
                  
                ],
                ColumnasIcono     : [
                  { Columna : "Estado",
                    Icono   : [ 
                                {Valor: "Pendiente",              Etiqueta: "Pendiente",                Icono: "access_time_filled",    Estilo: {color:"#FFC107", cursor:"help" }},
                                {Valor: "Enviado",                Etiqueta: "Enviado",                  Icono: "local_shipping",        Estilo: {color:"#ed7c31", cursor:"help"}},
                                {Valor: "Entregado",              Etiqueta: "Entregado",                Icono: "volunteer_activism",    Estilo: {color:"#0084b5", cursor:"help"}},
                                {Valor: "Reprogramado sin rendir",Etiqueta: "Reprogramado sin rendir",  Icono: "update",                Estilo: {color:"#FF2377", cursor:"help"}},
                                {Valor: "Rechazado sin rendir",   Etiqueta: "Rechazado sin rendir",     Icono: "report_problem",                 Estilo: {color:"#ff2c16", cursor:"help"}},
                                {Valor: "Rendido",                Etiqueta: "Rendido",                  Icono: "assignment_turned_in",  Estilo: {color:"#28A745", cursor:"help"}},
                                {Valor: "Reprogramado rendido",   Etiqueta: "Reprogramado rendido",     Icono: "event_available",       Estilo: {color:"#FF2377", cursor:"help"}},
                                {Valor: "Rechazado rendido",      Etiqueta: "Rechazado rendido",        Icono: "dangerous",        Estilo: {color:"#ff2c16", cursor:"help"}},
                              ], },
                ],
                // ColumnasEtiquetas:[
                //   { Columna: "Abreviatura", Etiqueta:"Prod"},
                //   { Columna: "Cantidad", Etiqueta:"Pedido"},
                //   { Columna: "PrecioUnitario", Etiqueta:"S/"},
                //   // { Columna: "Total", Etiqueta:"Total"},
                //   { Columna: "CantidadEntregada", Etiqueta:"Entregado"},
                //   // { Columna: "TotalEntrega", Etiqueta:"T. Entrega"},

                // ],
                ColumnasEstilos  : [
                  {Columna: "Usuario",       Estilo: {"text-align": "center"} },
                  {Columna: "Estado",       Estilo: {"text-align": "center"} }
                ],
              },
            );


            campos.push({
              nombre: 'IdOperacion',   
              tipo: 'Oculto', 
              valorDefecto: row.IdOperacion, 
              soloLectura:true 
            })

            this.gInputs.data = {
              titulo: "Historial del Pedido",
              tipo: 'icono',
              BtnAceptar: "Aprobar",
              ancho: '500px',
              icono: 'edit',
              formulario: campos,
              FnValidacion: (result) => { return true },
              ok: (result) => {}
            };

            this.gInputs.openDialog()

      
          },
        },
          
      ]


      }
    }
  }
  ngAfterViewInit(): void {
    this.gTableSeguimiento.cargarData();

  }

  hoy(){
    return new Date()
  }

  CargarSeguimiento(){
    let pPend = "";
    if(this.FiltroForm.value.Pendientes == true){
      pPend = "1";
    }else{
      pPend = "0";
    }

    
    let pDesde = this.formatDate(this.FiltroForm.value.Desde);
    let pHasta = this.formatDate(this.FiltroForm.value.Hasta);

    this.DataSeguimiento.Datos.Parametros = pDesde + "|" + pHasta + "|" + pPend;
    this.gTableSeguimiento.cargarData()
  }

  formatDate(date){
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

}
