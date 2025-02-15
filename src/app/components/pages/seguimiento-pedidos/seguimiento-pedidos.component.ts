import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {DateAdapter, MAT_DATE_FORMATS} from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from "../../format-datepicker";
import { gTableComponent } from '../../shared/g-table/g-table.component';
import { gQueryService } from 'src/app/services/g-query.service';
import { gInputDialogComponent } from '../../shared/g-inputDialog/g-input-dialog.component';
import { gMapaComponent } from '../../shared/g-mapa/g-mapa.component';

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
    @ViewChild('gMapaHistorial') gMapaHistorial: gMapaComponent;
    DataSeguimiento: any;

  FiltroForm = new FormGroup({ 
    Desde: new FormControl(new Date(), Validators.required),  
    Hasta: new FormControl(new Date(), Validators.required),
    Pendientes: new FormControl(true, Validators.required),
    Eliminados: new FormControl(true, Validators.required),
  });


  constructor(private gQuery: gQueryService) { }

  ngOnInit(): void {
    let pDesde = this.formatDate(new Date());
    let pHasta = this.formatDate(new Date());

    this.DataSeguimiento = {
      Titulo  : "Productos",
      Datos: {
        Store: "sp_operaciones_seguimiento",
        Parametros: pDesde + "|" + pHasta + "|1|1" ,
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
                        {Valor: "Rechazado sin rendir",   Etiqueta: "Rechazado sin rendir",     Icono: "dangerous",             Estilo: {color:"#ff2c16", cursor:"help"}},
                        {Valor: "Rendido",                Etiqueta: "Rendido",                  Icono: "check_circle",          Estilo: {color:"#28A745", borderRadius:"50%", boxShadow:"0px 0px 3px 4px #28A745", cursor:"help"}},
                        {Valor: "Reprogramado rendido",   Etiqueta: "Reprogramado rendido",     Icono: "update",                Estilo: {color:"#FFFFFF", background:"#FF2377", borderRadius:"50%", boxShadow:"0px 0px 4px 2px #FF2377", cursor:"help"}},
                        {Valor: "Rechazado rendido",      Etiqueta: "Rechazado rendido",        Icono: "dangerous",             Estilo: {color:"#ff2c16", borderRadius:"50%", boxShadow:"0px 0px 3px 4px #ff2c16", cursor:"help"}},
                        {Valor: "Eliminado",              Etiqueta: "Eliminado",                Icono: "highlight_off",         Estilo: {color:"#a02200", background:"black", "border-radius":"50%", "box-shadow":"0px 0px 4px 2px black", cursor:"help"}},
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
                OrdenColumnas   : ["Hora", "Usuario", "Detalles", "Estado"],
                ColumnasFusionadas: [
                  { Columna: "Hora",
                    Titulo: "$Hora",
                    Cuerpo: "<span>$Fecha</span>",
                    EstiloTitulo: { display:"block", minWidth:'60px',"font-size":"12px" },
                    EstiloCuerpo: { display:"block", "font-size":"12px", color: "#212529"},
                  },
                  
                ],
                // ColumnasClick     : [
                //   {Columna: "GPS", Accion: (result)=>{
                //     console.log(result);
                    
                //   }}
                // ],
                ColumnasIcono     : [
                  { Columna : "Estado",
                    Icono   : [ 
                                {Valor: "Pendiente",              Etiqueta: "Pendiente",                Icono: "access_time_filled",    Estilo: {color:"#FFC107", cursor:"help"}},
                                {Valor: "Enviado",                Etiqueta: "Enviado",                  Icono: "local_shipping",        Estilo: {color:"#ed7c31", cursor:"help"}},
                                {Valor: "Entregado",              Etiqueta: "Entregado",                Icono: "volunteer_activism",    Estilo: {color:"#0084b5", cursor:"help"}},
                                {Valor: "Reprogramado sin rendir",Etiqueta: "Reprogramado sin rendir",  Icono: "update",                Estilo: {color:"#FF2377", cursor:"help"}},
                                {Valor: "Rechazado sin rendir",   Etiqueta: "Rechazado sin rendir",     Icono: "dangerous",             Estilo: {color:"#ff2c16", cursor:"help"}},
                                
                                {Valor: "Rendido",                Etiqueta: "Rendido",                  Icono: "check_circle",          Estilo: {color:"#28A745", borderRadius:"50%", boxShadow:"0px 0px 3px 4px #28A745", cursor:"help"}},
                                {Valor: "Reprogramado rendido",   Etiqueta: "Reprogramado rendido",     Icono: "update",                Estilo: {color:"#FFFFFF", background:"#FF2377", borderRadius:"50%", boxShadow:"0px 0px 4px 2px #FF2377", cursor:"help"}},
                                {Valor: "Rechazado rendido",      Etiqueta: "Rechazado rendido",        Icono: "dangerous",             Estilo: {color:"#ff2c16", borderRadius:"50%", boxShadow:"0px 0px 3px 4px #ff2c16", cursor:"help"}},
                                {Valor: "Eliminado",              Etiqueta: "Eliminado",                Icono: "highlight_off",         Estilo: {color:"#a02200", background:"black", "border-radius":"50%", "box-shadow":"0px 0px 4px 2px black", cursor:"help"}},

                             ], },
                ],
                ColumnasEstilos  : [
                  {Columna: "Usuario",       Estilo: {"text-align": "center"} },
                  {Columna: "Estado",       Estilo: {"text-align": "center"} }
                ],
                Acciones: [
                  { Nombre  : 'mapa',
                    // Color   : "#0084b5",
                    Estilo:(accion)=> {
                      // console.log(accion);
                      
                      if(accion.GPS ==""){
                        return {color: "#c3c3c3", cursor:"not-allowed"};
                      }else{
                        return {color: "#0084b5", cursor:"pointer"};
                      }
                    },
                    Tooltip : "Mapa",
                    Icono   : "map",
                    Tipo    : 'Accion',
                    Funcion : (accion) => {
                      if(accion.GPS != ""){
                        const [latitud, longitud] = accion.GPS.split(",");
                        this.gMapaHistorial.dataMap = {
                          Tipo          : "Icono",
                          AgregarPlanta : true,
                          MostrarDetalles: true,
                          Rutas         : false,
                          Icono         : {Icono: "map", Estilo: {color:"#a02200"}},
                          Marcadores: [{
                            Latitud : latitud,
                            Longitud: longitud
                           }]
                        }
                        this.gMapaHistorial.VerMapaModal()
                      }
                      // console.log(accion);
                      
                    }
                  }
                ]
                
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
              BtnAceptar: "Cerrar",
              BtnCancelar: false,
              ancho: '600px',
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
    this.CargarSeguimiento();

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

    let pDel = "";
    if(this.FiltroForm.value.Eliminados == true){
      pDel = "1";
    }else{
      pDel = "0";
    }

    
    let pDesde = this.formatDate(this.FiltroForm.value.Desde);
    let pHasta = this.formatDate(this.FiltroForm.value.Hasta);

    this.DataSeguimiento.Datos.Parametros = pDesde + "|" + pHasta + "|" + pPend + "|" + pDel;
    this.gTableSeguimiento.cargarData()
  }

  formatDate(date){
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

}
