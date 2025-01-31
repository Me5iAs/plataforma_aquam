import { Component, Inject, OnInit, ViewChild } from '@angular/core';

import { gConstantesService } from 'src/app/services/g-constantes.service';
import { gQueryService } from 'src/app/services/g-query.service';
import { gInputDialogComponent } from '../../shared/g-inputDialog/g-input-dialog.component';
import { gAuthService } from 'src/app/services/g-auth.service';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { APP_DATE_FORMATS, AppDateAdapter } from '../../format-datepicker';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
const url_api = gConstantesService.gImageneUsuarios;


@Component({
  selector: 'app-pedidos-rendir',
  templateUrl: './pedidos-rendir.component.html',
  styleUrls: ['./pedidos-rendir.component.css']
})
export class PedidosRendirComponent implements OnInit {
@ViewChild('gInputs') gInputs: gInputDialogComponent

  lstVendedores: any[] = [];
  url_user =gConstantesService.gImageneUsuarios
  url_pagos = gConstantesService.gImagenesPagos
  User: any;
  constructor(private gQuery:gQueryService, private gAuth:gAuthService, private dialog: MatDialog) { }

  ngOnInit(): void {
    (window as any).mostrarImagen = this.mostrarImagen.bind(this);
    this.gAuth.userData().subscribe((data: any) => {
      this.User = data;
    });

    this.gQuery.sql("sp_operaciones_pnd_rendir_devolver").subscribe((data:any)=> {
      if(data){
        // this.lstVendedores = data;
        this.lstVendedores = Object.values(
          data.reduce((acc, curr) => {
            const {
              IdUsuarioRepartidor,
              NombreRepartidor,
              ValorEfectivo,
              ValorTransferencia,
              Estado,
              ...rest
            } = curr;
        
            // Inicializar agrupación por repartidor
            if (!acc[IdUsuarioRepartidor]) {
              acc[IdUsuarioRepartidor] = {
                Id: IdUsuarioRepartidor,
                Repartidor: NombreRepartidor,
                Efectivo: ValorEfectivo,
                Transferencia: ValorTransferencia,
                Estado: Estado,
                Productos: [],
              };
            }
        
            // Sumar los valores de las columnas "producto" (excluyendo las columnas no deseadas)
            Object.keys(rest).forEach((key) => {
              if (
                !["IdCliente", "NombreCliente", "EstadoOperacion"].includes(key)
              ) {
                const cantidad = parseFloat(rest[key]) || 0;
                const existingProduct = acc[IdUsuarioRepartidor].Productos.find(
                  (prod) => prod.Producto === key
                );
                if (existingProduct) {
                  existingProduct.Cantidad += cantidad;
                } else {
                  acc[IdUsuarioRepartidor].Productos.push({
                    Producto: key,
                    Cantidad: cantidad,
                  });
                }
              }
            });
        
            return acc;
          }, {})
        );

        console.log(this.lstVendedores); 
       
      }
    })
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = '../../../../assets/default-avatar.jpg'; // Ruta de la imagen por defecto
  }

  Rendir(rep:any ){
    // IdRepartidor:any, ValorEntregas:any, Estado:any
    console.log(rep);
    
    if(rep.Estado == '2'){
      alert("No es posible procesar el pago de este repartidor, porque no todos sus pedidos fueron entregados como se esperaba. \n\n Solicite el VB del usuario correspondinete para continuar.")
      return false;
    }
    let campos = [];

      campos.push(
        { Tipo            : "TablaDinamica",
          TituloTabla     :  "<span>Efectivo: <b>" + rep.Efectivo + "</b>, Banco: <b> " + rep.Transferencia + "</b></span>",
          Store           : "sp_operaciones_rendir_repartidor_devolver", 
          Parametros      : rep.Id,
          ColumnasOcultas : [
                              "IdOperacion",
                              "FechaRegistro",
                              "HoraRegistro",
                              "FechaEnvio", 
                              "HoraEnvio", 
                              "FechaEntrega",
                              "HoraEntrega",
                              "EstadoPago",
                              "Glosa",
                              "Productos"
          ],
          // OrdenColumnas   : ["Abreviatura", "PrecioUnitario", "Cantidad", "CantidadEntregada"],
          ColumnasEtiquetas:[
            { Columna: "NombreCliente",       Etiqueta:"Cliente"},
            { Columna: "MontoEsperado",       Etiqueta:"Valor Entrega"},
            { Columna: "MontoEfectivo",       Etiqueta:"Efectivo"},
            { Columna: "MontoTransferencia",  Etiqueta:"Bco."},
            { Columna: "MontoCredito",        Etiqueta:"Cred."},
            { Columna: "PagoPorApp",          Etiqueta:"App?"},
            { Columna: "EstadoOperacion",     Etiqueta:"Estado"},
          ],
          CeldasValor: [
            {Columna: "EstadoOperacion", Valores:  [
              {Dato: "2", Valor: "Entregado"},
              {Dato: "5", Valor: "Rechazado"},
              {Dato: "4", Valor: "Reprogramado"},
            ]},
          ],
          ColumnasIcono     : [
            { Columna : "EstadoOperacion",
              Icono   : [ 
                          {Valor: "2", Etiqueta: "Entregado",     Icono: "check_circle",  Estilo: {color:"#28A745", cursor:"help" }},
                          {Valor: "4", Etiqueta: "Reprogramado",  Icono: "update",        Estilo: {color:"#FFC107", cursor:"help"}},
                          {Valor: "5", Etiqueta: "Rechazado",     Icono: "cancel",        Estilo: {color:"#f44336", cursor:"help"}},
                        ]
            },
            { Columna : "PagoPorApp",
              Icono   : [ 
                          {Valor: "0", Etiqueta: "Sin QR",  Icono: "qr_code_scanner",  Estilo: {color:"#C4C4C4", cursor:"not-allowed" }},
                          {Valor: "1", Etiqueta: "ver QR",  Icono: "qr_code_scanner",  Estilo: {color:"#0084b5", cursor:"pointer"}},
                        ]
            },
            
          ],
          ColumnasClick     : [
            {Columna: "PagoPorApp", Accion: (result)=>{ 
              if(result.PagoPorApp =="0"){
                return false;
              }
              this.mostrarImagen(result.IdOperacion)
              // console.log(result);
             }}
          ],
          ColumnasEstilos  : [
            {Columna: "MontoEsperado",      Estilo: {"text-align": "right", "padding-left":"5px"} },
            {Columna: "MontoEfectivo",      Estilo: {"text-align": "right", "padding-left":"5px"} },
            {Columna: "MontoTransferencia", Estilo: {"text-align": "right", "padding-left":"5px"} },
            {Columna: "MontoCredito",       Estilo: {"text-align": "right", "padding-left":"5px"} },
            {Columna: "PagoPorApp",         Estilo: {"text-align": "center"} },
            {Columna: "EstadoOperacion",    Estilo: {"text-align": "center  "} },
          ],
        },
      );



      this.gInputs.data = {
        titulo: "Rendir Entregas",
        tipo: 'icono',
        BtnAceptar: "Rendir",
        ancho: '90vw',
        icono: 'edit',
        formulario: campos,
        FnValidacion: (result) => { return true },
        ok: (result) => {
          
          console.log(result);
         
          this.gQuery.sql("sp_operaciones_venta_cliente_registrar", rep.Id).subscribe();
          this.lstVendedores = this.lstVendedores.filter(vendedor => vendedor.Id !== rep.Id);
          alert("Rendición Registrada");

        }
      };

      this.gInputs.openDialog()

    }
    
 mostrarImagen(IdOperacion) {
    const imageUrl = this.url_pagos + IdOperacion + ".jpg";

    fetch(imageUrl, { method: 'HEAD' })
      .then(response => {
        if (response.ok) {
          const dialogRef = this.dialog.open(DialogUsuario, {
            data: imageUrl,
            disableClose: false,
            panelClass: 'image-dialog',
            // height: "100%",
            // width: "100%",
            // maxHeight: "95vh",
            // maxWidth: "95vw",
          });

          dialogRef.afterClosed().subscribe(result => { });
        }
        else {
          alert("No se ha registrado el voucher de la transferencia")
        }
      });
  }

}



@Component({
  selector: 'dialog-imagen',
  templateUrl: 'dialog-imagen.html',
  styleUrls: ['./pedidos-rendir.component.css'],
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
