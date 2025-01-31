/**
 * 
 * dataMap = {
 *  Titulo: "Mi Titulo de Mapa",
 *  Tipo  : "Boton", //puede ser Boton, Icono o Elemento
 *  Boton : { //solo si es tipo boton
 *    Texto : "texto del boton"
 *    Estilo: {}
 *  }.
 *  Icono   : {
 *    Icono : 'home',
 *    Estilo: 'color:'black''
 *  }
 *  Marcadores: [
 *    {Id: "", Lat:"", Lng:"", Marcador: {Color:"", Icono:""}, Popup: ""}
 *  ]
 * }
 */


import { Component, ElementRef, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from "../../format-datepicker";
import { gQueryService } from 'src/app/services/g-query.service';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
import { BehaviorSubject } from 'rxjs';
import 'leaflet-polylinedecorator';

@Component({
  selector: 'g-mapa',
  templateUrl: './g-mapa.component.html',
  styleUrls: ['./g-mapa.component.css'],
  providers: [
    { provide: DateAdapter, useClass: AppDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS }
  ]
})
export class gMapaComponent implements OnInit {

  @Input() dataMap: any;

  @ViewChild('gMapElement', { static: true }) gMapElement: ElementRef;
  gMap: L.Map;
  Marker: L.Marker;
  selectedLocation: { lat: number, lng: number };
  private map: L.Map;
  private markers: L.Marker[] = [];
  private routeControl: L.Routing.Control;
  public MostrarDetalle = false;
  rutas = [];
  ruta = {}
  instructions: [] = [];

  private selectedMarkers = new BehaviorSubject<any[]>([]);
  selectedMarkers$ = this.selectedMarkers.asObservable();

  constructor(public dialog: MatDialog, private gQuery: gQueryService) { }

  public intervalId;

  ngOnInit(): void {
    if (this.dataMap?.Tipo == "Elemento") {
      this.intervalId = setInterval(() => {
        let elem: HTMLElement;

        elem = document.querySelector("#gMapElement");

        if (elem) {
          clearInterval(this.intervalId);
          this.initMap(elem);
        }
      }, 500);
    }
  }

  initMap(htmlelement) {
    // console.log("AAAA");
    
    this.gMap = L.map(htmlelement, {
      center: { lat: -3.7722102000000004, lng: -73.26553229999999 },
      zoom: 14
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.gMap);
   
    if(this.dataMap.AgregarPlanta){
      const HomeIcon = L.icon({
        iconUrl: 'assets/marker_home.png', // Ruta al icono de pendientes
        iconSize: [25.5, 25.5],
        iconAnchor: [12, 32],
        popupAnchor: [1, -24],
        shadowSize: [41, 41]     
      });
      //-5, -32
      L.marker([-3.7722102000000004, -73.26553229999999], {icon: HomeIcon, draggable:false}).addTo(this.gMap);
    }

    if(this.dataMap.CargaDinamica){
      
      console.log(this.dataMap.CargaDinamica);
      this.gQuery.sql(this.dataMap.CargaDinamica.Store,this.dataMap.CargaDinamica.Parametros).subscribe((data:any)=>{
        
        if(data){
          data.forEach(item=>{
            console.log(item);
            
            let Lat = item[this.dataMap.CargaDinamica.Latitud];
            let Lng = item[this.dataMap.CargaDinamica.Longitud];
            let Popup = item[this.dataMap.CargaDinamica.Popup] || "";

            this.dataMap.Marcadores.push({
              Latitud: Lat,
              Longitud: Lng,
              Popup: Popup
            });


            if(item.Icono){
              this.Marker = L.marker([Lat, Lng],{icon: item.Icono }).addTo(this.gMap);
            }else{
              this.Marker = L.marker([Lat, Lng]).addTo(this.gMap);
            }
            
            if(item.Popup){
              this.Marker.bindPopup(Popup, {
                closeOnClick: false,
                autoClose: false
              })
            }

            
          })
        }      
      })
    }else{
      this.dataMap?.Marcadores?.forEach(item => {
        this.Marker = L.marker([item.Latitud, item.Longitud],{icon: item.Icono }).addTo(this.gMap);

        if(item.Popup){
          this.Marker.bindPopup(item.Popup, {
            closeOnClick: false,
            autoClose: false
          })
        }
      })
    }

    if(this.dataMap.Rutas){

      
      for (let i = 0; i < this.dataMap.Marcadores.length - 1; i++) {
        const start = this.dataMap.Marcadores[i];
        const end = this.dataMap.Marcadores[i + 1];
    
        L.Routing.control({
          waypoints: [
            L.latLng(start.Latitud, start.Longitud),
            L.latLng(end.Latitud, end.Longitud)
          ],
          routeWhileDragging: true
        }).addTo(this.gMap);
      }
    }

  }

  public VerMapaModal() {
    const dialogRef = this.dialog.open(gMapaDialog, {
      data: this.dataMap,
      disableClose: false,
      height: "100%",
      width: "100%",
      maxHeight: "95vh",
      maxWidth: "95vw",
    });


    dialogRef.afterClosed().subscribe(result => {
      // 
      // console.log(result);

    });
  }

  // FUNCIONES GNEERALES PARA MAPAS

  // Agregar Marcadores

  CrearIcono(imagen: string) {
    return L.icon({
      iconUrl: imagen,
      // iconUrl: '../../../assets/pin_ch.png', // Ruta al icono de pendientes
      iconSize: [25.5, 35],
      iconAnchor: [12, 32],
      popupAnchor: [1, -24],
      shadowSize: [41, 41]    
    });
  }

  // aregar marcadores
  addMarkers(
    data: { icono: L.Icon, coordinates: [number, number], popupContent: HTMLElement }[],
    hasRoutes: boolean): void {

    this.clearMarkers();
    // this.allMarkersData = data.map(item => item.popupContent);

    const waypoints = [];


    // let marker
    // marker = L.marker([-3.7722102000000004, -73.26553229999999], {icon: HomeIcon, draggable:false}).addTo(this.map);
    // marker.bindPopup("Planta", {
    //   closeOnClick: false,
    //   autoClose: false
    // })
    // this.markers.push(marker);


    data.forEach((item, index) => {
      let marker = L.marker(item.coordinates, { icon: item.icono, draggable: false }).addTo(this.map);

      if (item.popupContent) {
        marker.bindPopup(item.popupContent);
        // marker.bindPopup(item.popupContent, {
        //   closeOnClick: false,
        //   autoClose: false
        // })
      }

      this.markers.push(marker);

      if (hasRoutes) {
        waypoints.push(L.latLng(item.coordinates[0], item.coordinates[1]));
      }
    });

    if (hasRoutes && waypoints.length > 1) {
      if (this.routeControl) {
        this.map.removeControl(this.routeControl);
      }

      this.routeControl = L.Routing.control({
        waypoints: waypoints,
        routeWhileDragging: true
      }).addTo(this.map);

    }

    this.addMarkerClickEvents();
    const el: HTMLElement = document.querySelector(".leaflet-routing-container");
    if (el) {
      el.style.display = "none";
    }

  }

  addMarkerClickEvents() {
    this.map.eachLayer(layer => {
      if (layer instanceof L.Marker) {
        layer.on("click", (e) => {
          const clickedLatLng = (e.target as L.Marker).getLatLng();
          this.map.eachLayer(mark => {
            // console.log(mark);
            if (mark instanceof L.Marker) {
              if (mark.getLatLng().equals(clickedLatLng)) {
                mark.openPopup();
              }
            }
          });
        });
      }
    });
  }

  //  crear popup para los marcadores
  createPopup(
    Titulo: string,
    Cuerpo: string,
    botones?: any[],
    options?: { includeCheckbox?: boolean, fnCheck?, extraData?: any }) {

    // MODELO DE BOTONES
    // botones =  [
    //   {
    //     Icono :  { Imagen, ancho, alto } ,
    //     onclick: function(e){
    //       e.preventDefault();
    //     }
    //   }
    // ]

    const div = document.createElement('div');

    if (options?.includeCheckbox) {
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.style.marginTop = '5px';
      checkbox.onchange = (e: Event) => {
        options?.fnCheck(e);
      };
      div.appendChild(checkbox);
    }

    const hTitulo = document.createElement('b');
    hTitulo.textContent = Titulo;
    hTitulo.style.fontSize = '12px';
    hTitulo.style.fontWeight = "bold"
    div.appendChild(hTitulo);

    const hCuerpo = document.createElement('div')
    hCuerpo.textContent = Cuerpo;
    hCuerpo.style.fontSize = '11px'
    div.appendChild(hCuerpo)

    const divbutton = document.createElement('div');
    divbutton.style.textAlign = "center"
    botones?.forEach(element => {
      const boton = document.createElement('span');
      boton.innerHTML = "<img src='../../../../assets/" + element["Icono"].Imagen + "' style='width: " + element["Icono"].Ancho + "; height:" + element["Icono"].Alto + "' />";
      boton.style.display = "inline-block";
      boton.style.width = element["Icono"].Ancho;
      boton.style.marginLeft = "5px";
      boton.style.cursor = "pointer";
      boton.style.marginTop = "5px";
      boton.onclick = element.onclick;
      divbutton.appendChild(boton);
    });
    div.appendChild(divbutton);

    return div;
  }

  // Limpiar marcadores
  clearMarkers(): void {
    this.markers.forEach(marker => this.map.removeLayer(marker));
    this.markers = [];

    if (this.routeControl) {
      this.map.removeControl(this.routeControl);
      this.routeControl = null;
    }
  }

}



@Component({
  selector: 'g-mapa-dialog',
  templateUrl: './g-mapa-dialog.html',
  styleUrls: ['./g-mapa-dialog.css'],
  providers: [
    { provide: DateAdapter, useClass: AppDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS }
  ]
})
export class gMapaDialog implements OnInit {
  @ViewChild('popupMap', { static: true }) popupMapContainer: ElementRef;
  popupMap: L.Map;
  popupMarker: L.Marker;
  routeControl:any; 
  rutas:any;
  private popupMarkers: L.Marker[] = [];
  MostrarDetalle = false;
  public tramosInfo: Array<{ 
    distancia: number, 
    tiempo: number, 
    inicio: { lat: number, lng: number }, 
    fin: { lat: number, lng: number } 
  }> = [];
  

  constructor(
    private gQuery:gQueryService,
    public dialogRef: MatDialogRef<gMapaDialog>,
    @Inject(MAT_DIALOG_DATA) public DataDialog: any) {
  }
  ngOnInit(): void {

    this.popupMap = L.map(this.popupMapContainer.nativeElement, {
      center: { lat: -3.7722102000000004, lng: -73.26553229999999 },
      zoom: 14
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.popupMap);
    
    
    if(this.DataDialog.AgregarPlanta){
      const HomeIcon = L.icon({
        iconUrl: 'assets/marker_home.png', // Ruta al icono de pendientes
        iconSize: [25.5, 25.5],
        iconAnchor: [12, 32],
        popupAnchor: [1, -24],
        shadowSize: [41, 41]     
      });
      //-5, -32
      let marker = L.marker([-3.7722102000000004, -73.26553229999999], {icon: HomeIcon, draggable:false}).addTo(this.popupMap);
      this.popupMarkers.push(marker);

    }

    if(this.DataDialog.CargaDinamica){
      this.gQuery.sql(this.DataDialog.CargaDinamica.Store, this.DataDialog.CargaDinamica.Parametros)
      .subscribe((data:any)=>{
        if(data){
          data.forEach(item=>{
            let Lat = item[this.DataDialog.CargaDinamica.Latitud];
            let Lng = item[this.DataDialog.CargaDinamica.Longitud];
            let Popup
            if(this.DataDialog.CargaDinamica.PopupDinamico){
              let cuerpo="";
              this.DataDialog.CargaDinamica.PopupDinamico.Cuerpo.forEach(itemCuerpo => {
                cuerpo += item[itemCuerpo] + " | "
              })
              
              Popup=  this.createPopup(
                item[this.DataDialog.CargaDinamica.PopupDinamico.Titulo],
                cuerpo,
                this.DataDialog.CargaDinamica.PopupDinamico.botones,{extraData: item}  );

            }else if(this.DataDialog.CargaDinamica.Popup){
              Popup =  item[this.DataDialog.CargaDinamica.Popup] || "";
            }else{
              Popup =  "";
            }
            if(Lat != 0 && Lng != 0){
              this.DataDialog.Marcadores.push({
                Latitud: Lat,
                Longitud: Lng,
                Popup: Popup
              });
            }
            
                       
            if(this.DataDialog.CargaDinamica.IconoDinamico){
              this.DataDialog.CargaDinamica.IconoDinamico.forEach(IconoOp => {
                if(item[IconoOp.Campo] == IconoOp.Valor){
                  item.Icono = this.CrearIcono(IconoOp.Icono);
                }
              })
            }else if(this.DataDialog.CargaDinamica.IconoEstatico){
              item.Icono = this.CrearIcono(this.DataDialog.CargaDinamica.IconoEstatico.Imagen, this.DataDialog.CargaDinamica.IconoEstatico.parametros)
            }

            if(item.Icono){
              this.popupMarker = L.marker([Lat, Lng],{icon: item.Icono }).addTo(this.popupMap);
            }else{
              this.popupMarker = L.marker([Lat, Lng]).addTo(this.popupMap);
            }
      
            this.popupMarker.bindPopup(Popup, {
              closeOnClick: false,
              autoClose: false
            })
    
            
          })
    

          if(this.DataDialog.Rutas){
            this.crearRutas(this.DataDialog.Marcadores,this.DataDialog.AgregarPlanta);
          }
          if(this.DataDialog.Marcadores.length > 0){
            this.popupMap.setView({ lat:this.DataDialog.Marcadores[0].Latitud , lng: this.DataDialog.Marcadores[0].Longitud }, // Coordenadas obtenidas
              14 // Zoom opcional (puedes ajustarlo o mantener el mismo)
            );
          }
        }      
      })
    }else{
      this.DataDialog.Marcadores.forEach(item => {
        if(item.Latitud != 0 && item.Longitud != 0){
          let marker;
          if(item.Icono){
            marker = L.marker([item.Latitud, item.Longitud], {icon: item.Icono } ).addTo(this.popupMap);
          }else{
            marker = L.marker([item.Latitud, item.Longitud] ).addTo(this.popupMap);
          }
          
          if(item.Popup){
            marker.bindPopup(item.Popup, {
              closeOnClick: false,
              autoClose: false
            })
          }
          this.popupMarkers.push(marker);
        }
 
      })

      if(this.DataDialog.Marcadores.length > 0){
        let bounds = [];
        this.DataDialog.Marcadores.forEach(item => {
          if(item.Latitud != 0 && item.Longitud != 0){
            bounds.push({ lat: item.Latitud, lng: item.Longitud })
          }
        })
        this.popupMap.fitBounds(bounds);

      }

      if(this.DataDialog.Rutas){
        this.crearRutas(this.DataDialog.Marcadores, this.DataDialog.AgregarPlanta);
      }
    }
    if(this.DataDialog.MostrarPopUp){
      this.showPopup()
    }

  

    // this.popupMap.on('click', (e) => {
    //   if(this.data.isSoloLectura == false){
    //     if (this.popupMarker) {
    //       this.popupMap.removeLayer(this.popupMarker);
    //     }
    //     this.selectedLocation = e.latlng;
    //     this.popupMarker = L.marker(e.latlng).addTo(this.popupMap);
    //   }
    // });

  }

  // es la funcion anterior, funciona bien, pero si no se agrega la panta no asigna bien los puntos de inicio y fin
  crearRutas_2(marcadores: any[], AgregarPlanta?: boolean) {
    let rutas: any[] = [];
  
    const puntoInicial = L.latLng(-3.7722102000000004, -73.26553229999999);
    const puntoFinal = L.latLng(-3.7722102000000004, -73.26553229999999);
  
    if (AgregarPlanta) {
      rutas.push(puntoInicial);
    }
  
    let puntosRestantes = [...marcadores];
    let ultimoPunto = puntoInicial;
  
    while (puntosRestantes.length > 0) {
      let puntoMasCercanoIndex = 0;
      let distanciaMinima = this.calcularDistancia(ultimoPunto, puntosRestantes[0]);
  
      for (let i = 1; i < puntosRestantes.length; i++) {
        const distancia = this.calcularDistancia(ultimoPunto, puntosRestantes[i]);
        if (distancia < distanciaMinima) {
          distanciaMinima = distancia;
          puntoMasCercanoIndex = i;
        }
      }
  
      const puntoMasCercano = puntosRestantes.splice(puntoMasCercanoIndex, 1)[0];
      const latLng = L.latLng(puntoMasCercano.Latitud, puntoMasCercano.Longitud);
      rutas.push(latLng);
      ultimoPunto = latLng;
    }
  
    if (AgregarPlanta) {
      rutas.push(puntoFinal);
    }
  
    if (rutas.length < 2) {
      console.error("No hay suficientes puntos para crear una ruta.");
      return;
    }
  
    const routingControl = L.Routing.control({
      waypoints: rutas,
      router: L.Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1'
      }),
      plan: new L.Routing.Plan(rutas, {
        createMarker: () => null,
        routeWhileDragging: false
      }),
      routeWhileDragging: true,
      // lineOptions: { styles: [{ color: 'red', weight: 1, opacity: 0.5 }], extendToWaypoints: true, missingRouteTolerance: 1 }
    }).addTo(this.popupMap);
  
    routingControl.on('routesfound', (e) => {
      const route = e.routes[0];
      this.tramosInfo = [];
  
      const colores = ['red', 'blue', 'green', 'purple', 'orange', 'cyan'];
      const { waypointIndices, coordinates } = route;
  
      // Crear y decorar cada tramo con un color distinto
      for (let i = 0; i < waypointIndices.length - 1; i++) {
        const startIdx = waypointIndices[i];
        const endIdx = waypointIndices[i + 1];
  
        const tramoCoordinates = coordinates.slice(startIdx, endIdx + 1);
        const color = colores[i % colores.length];
  
        // Crear la polilínea para el tramo específico y asignar el color
        const polyline = L.polyline(tramoCoordinates, {
          color: "black",
          fillColor: "black",
          weight: 4,
          opacity: 0.9
        }).addTo(this.popupMap);
  
        // Decorar la polilínea con flechas del mismo color
        L.polylineDecorator(polyline, {
          patterns: [
            {
              offset: '5%',
              repeat: '15px',
              symbol: L.Symbol.arrowHead({
                pixelSize: 8,
                polygon: false,
                pathOptions: { stroke: true, color: color }
              })
            }
          ]
        }).addTo(this.popupMap);
      }
    });
  
    const el: HTMLElement = document.querySelector(".leaflet-routing-container");
    if (el) {
      el.style.display = "none";
    }
  }
  
  crearRutas(marcadores: any[], AgregarPlanta?: boolean) {
    let rutas: any[] = [];
  
    const puntoInicialPlanta = L.latLng(-3.7722102000000004, -73.26553229999999);
    const puntoFinalPlanta = L.latLng(-3.7722102000000004, -73.26553229999999);
  
    let ultimoPunto: any;
    let puntosRestantes = [...marcadores];
  
    if (AgregarPlanta) {
      rutas.push(puntoInicialPlanta);
      ultimoPunto = puntoInicialPlanta;
    } else {
      if (puntosRestantes.length === 0) {
        console.error("No hay marcadores para crear una ruta.");
        return;
      }
      // Usar el primer marcador como punto inicial si no se agrega la planta
      const primerPunto = puntosRestantes.shift(); // Remover el primer marcador de la lista
      ultimoPunto = L.latLng(primerPunto.Latitud, primerPunto.Longitud);
      rutas.push(ultimoPunto);
    }
  
    // Organizar los puntos restantes por cercanía
    while (puntosRestantes.length > 0) {
      let puntoMasCercanoIndex = 0;
      let distanciaMinima = this.calcularDistancia(ultimoPunto, puntosRestantes[0]);
  
      for (let i = 1; i < puntosRestantes.length; i++) {
        const distancia = this.calcularDistancia(ultimoPunto, puntosRestantes[i]);
        if (distancia < distanciaMinima) {
          distanciaMinima = distancia;
          puntoMasCercanoIndex = i;
        }
      }
  
      const puntoMasCercano = puntosRestantes.splice(puntoMasCercanoIndex, 1)[0];
      const latLng = L.latLng(puntoMasCercano.Latitud, puntoMasCercano.Longitud);
      rutas.push(latLng);
      ultimoPunto = latLng;
    }
  
    // Si AgregarPlanta es true, añadir el punto final como la planta
    if (AgregarPlanta) {
      rutas.push(puntoFinalPlanta);
    }
  
    if (rutas.length < 2) {
      console.error("No hay suficientes puntos para crear una ruta.");
      return;
    }
  
    const routingControl = L.Routing.control({
      waypoints: rutas,
      router: L.Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1'
      }),
      plan: new L.Routing.Plan(rutas, {
        createMarker: () => null,
        routeWhileDragging: false
      }),
      routeWhileDragging: true,
    }).addTo(this.popupMap);
  
    routingControl.on('routesfound', (e) => {
      const route = e.routes[0];
      this.tramosInfo = [];
  
      const colores = ['red', 'blue', 'green', 'purple', 'orange', 'cyan'];
      const { waypointIndices, coordinates } = route;
  
      // Crear y decorar cada tramo con un color distinto
      for (let i = 0; i < waypointIndices.length - 1; i++) {
        const startIdx = waypointIndices[i];
        const endIdx = waypointIndices[i + 1];
  
        const tramoCoordinates = coordinates.slice(startIdx, endIdx + 1);
        const color = colores[i % colores.length];
  
        // Crear la polilínea para el tramo específico y asignar el color
        const polyline = L.polyline(tramoCoordinates, {
          color: "black",
          fillColor: "black",
          weight: 4,
          opacity: 0.9
        }).addTo(this.popupMap);
  
        // Decorar la polilínea con flechas del mismo color
        L.polylineDecorator(polyline, {
          patterns: [
            {
              offset: '5%',
              repeat: '15px',
              symbol: L.Symbol.arrowHead({
                pixelSize: 8,
                polygon: false,
                pathOptions: { stroke: true, color: color }
              })
            }
          ]
        }).addTo(this.popupMap);
      }
    });
  
    const el: HTMLElement = document.querySelector(".leaflet-routing-container");
    if (el) {
      el.style.display = "none";
    }
  }
  
  
  // Cálculo de distancia entre dos puntos (en metros) usando la fórmula de Haversine
  calcularDistanciaa(puntoA: L.LatLng, puntoB: any): number {
    const R = 6371e3; // Radio de la Tierra en metros
    const lat1 = puntoA.lat * (Math.PI / 180);
    const lat2 = puntoB.lat * (Math.PI / 180);
    const deltaLat = (puntoB.lat - puntoA.lat) * (Math.PI / 180);
    const deltaLng = (puntoB.lng - puntoA.lng) * (Math.PI / 180);
  
    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
    return R * c; // Distancia en metros
  }
  calcularDistancia(puntoA: L.LatLng, puntoB: any): number {
    const latLngB = L.latLng(puntoB.Latitud, puntoB.Longitud);
    return puntoA.distanceTo(latLngB);
  }
 
  
  
  


crearRutas3(marcadores: any[], AgregarPlanta?: boolean) {
  let rutas: any[] = [];

  const puntoInicial = L.latLng(-3.7722102000000004, -73.26553229999999);
  const puntoFinal = L.latLng(-3.7722102000000004, -73.26553229999999);

  if (AgregarPlanta) {
    rutas.push(puntoInicial);
  }

  let puntosRestantes = [...marcadores];
  let ultimoPunto = puntoInicial;

  while (puntosRestantes.length > 0) {
    let puntoMasCercanoIndex = 0;
    let distanciaMinima = this.calcularDistancia(ultimoPunto, puntosRestantes[0]);

    for (let i = 1; i < puntosRestantes.length; i++) {
      const distancia = this.calcularDistancia(ultimoPunto, puntosRestantes[i]);
      if (distancia < distanciaMinima) {
        distanciaMinima = distancia;
        puntoMasCercanoIndex = i;
      }
    }

    const puntoMasCercano = puntosRestantes.splice(puntoMasCercanoIndex, 1)[0];
    const latLng = L.latLng(puntoMasCercano.Latitud, puntoMasCercano.Longitud);
    rutas.push(latLng);
    ultimoPunto = latLng;
  }

  if (AgregarPlanta) {
    rutas.push(puntoFinal);
  }

  const routingControl = L.Routing.control({
    waypoints: rutas,
    plan: new L.Routing.Plan(rutas, {
      createMarker: () => null,
      routeWhileDragging: false
    }),
    routeWhileDragging: true
  }).addTo(this.popupMap);

  routingControl.on('routesfound', (e) => {
    const route = e.routes[0];
    this.tramosInfo = [];

    // Colores predefinidos para los tramos
    const colores = ['red', 'blue', 'green', 'purple', 'orange', 'cyan'];

 
    this.calcularTramos( route);
    // Iterar sobre cada "leg" o tramo entre los puntos principales
    route.instructions.forEach((leg, index) => {
      const inicio = rutas[index];
      const fin = rutas[index + 1];

      // Obtener la distancia y el tiempo de cada tramo principal
      // const distancia = leg.distance;
      // const tiempo = leg.time;

      // // Guardar la información en tramosInfo
      // this.tramosInfo.push({
      //   distancia,
      //   tiempo,
      //   inicio: { lat: inicio.lat, lng: inicio.lng },
      //   fin: { lat: fin.lat, lng: fin.lng }
      // });
      // // console.log(this.tramosInfo);
      
      

      // Crear una polilínea para cada tramo principal con un color diferente
      const polyline = L.polyline([inicio, fin], {
        color: colores[index % colores.length],
        weight: 4,
        opacity: 0.7
      }).addTo(this.popupMap);

      // Agregar flechas en cada tramo
      L.polylineDecorator(polyline, {
        patterns: [
          {
            offset: '5%',
            repeat: '15px',
            symbol: L.Symbol.arrowHead({
              pixelSize: 8,
              polygon: false,
              pathOptions: { stroke: true, color: colores[index % colores.length] }
            })
          }
        ]
      }).addTo(this.popupMap);
    });
  });

  const el: HTMLElement = document.querySelector(".leaflet-routing-container");
  if (el) {
    el.style.display = "none";
  }
}

// Función para calcular la distancia entre dos puntos (en metros)
calcularDistancia3(puntoA: L.LatLng, puntoB: any): number {
  const latLngB = L.latLng(puntoB.Latitud, puntoB.Longitud);
  return puntoA.distanceTo(latLngB);
}

calcularTramos(route: any): void {
  this.tramosInfo = [];
  let distanciaAcumulada = 0;
  let tiempoAcumulado = 0;
  let inicio: any = null;
  const instructions = route.instructions;

  instructions.forEach((instruction) => {
    if (instruction.type === 'Head' || instruction.type === 'Continue') {
      if (!inicio) {
        // Guardar el punto de inicio utilizando las coordenadas correspondientes al índice
        inicio = route.coordinates[instruction.index];
      }
      // Acumular distancia y tiempo del tramo
      distanciaAcumulada += instruction.distance;
      tiempoAcumulado += instruction.time;
    } else if (instruction.type === 'WaypointReached' || instruction.type === 'DestinationReached') {
      if (inicio) {
        // Guardar el punto final utilizando las coordenadas correspondientes al índice
        const fin = route.coordinates[instruction.index];

        // Guardar la información de tramo con coordenadas reales
        this.tramosInfo.push({
          distancia: distanciaAcumulada,
          tiempo: tiempoAcumulado,
          inicio: { lat: inicio.lat, lng: inicio.lng },
          fin: { lat: fin.lat, lng: fin.lng }
        });

        // Reiniciar contadores y preparar para el siguiente tramo
        distanciaAcumulada = 0;
        tiempoAcumulado = 0;
        inicio = null;
      }
    }
  });

  console.log("Información de tramos calculada:", this.tramosInfo);
}



  getDistancia(){
    return "1 km"
  }

  getTiempo(){
    return "1 hora"
  }
  
  crearRutas2(marcadores: any[], AgregarPlanta?: boolean) {
    let rutas: any[] = [];
  
    // Punto de partida
    const puntoInicial = L.latLng(-3.7722102000000004, -73.26553229999999);
    const puntoFinal = L.latLng(-3.7722102000000004, -73.26553229999999);
  
    if (AgregarPlanta) {
      rutas.push(puntoInicial);
    }
  
    // Copiar marcadores para ordenar sin modificar el original
    let puntosRestantes = [...marcadores];
    let ultimoPunto = puntoInicial;
  
    // Optimización de la ruta
    while (puntosRestantes.length > 0) {
      let puntoMasCercanoIndex = 0;
      let distanciaMinima = this.calcularDistancia(ultimoPunto, puntosRestantes[0]);
  
      for (let i = 1; i < puntosRestantes.length; i++) {
        const distancia = this.calcularDistancia(ultimoPunto, puntosRestantes[i]);
        if (distancia < distanciaMinima) {
          distanciaMinima = distancia;
          puntoMasCercanoIndex = i;
        }
      }
  
      // Añadir el punto más cercano a la ruta y actualizar `ultimoPunto`
      const puntoMasCercano = puntosRestantes.splice(puntoMasCercanoIndex, 1)[0];
      rutas.push(L.latLng(puntoMasCercano.Latitud, puntoMasCercano.Longitud));
      ultimoPunto = L.latLng(puntoMasCercano.Latitud, puntoMasCercano.Longitud);
    }
  
    // Punto de llegada
    if (AgregarPlanta) {
      rutas.push(puntoFinal);
    }
  
    // Crear la ruta en el mapa
    L.Routing.control({
      waypoints: rutas,
      plan: new L.Routing.Plan(rutas, {
        createMarker: () => null,
        routeWhileDragging: false
      }),
      routeWhileDragging: true
    }).addTo(this.popupMap);
  
    const el: HTMLElement = document.querySelector(".leaflet-routing-container");
    if (el) {
      el.style.display = "none";
    }
  }
  
  calcularDistancia2(puntoA: L.LatLng, puntoB: any): number {
    const latLngB = L.latLng(puntoB.Latitud, puntoB.Longitud);
    return puntoA.distanceTo(latLngB);
  }
 
  
   //  crear popup para los marcadores
 
   createPopup(
    Titulo: string,
    Cuerpo: string,
    botones?: any[],
    options?: { includeCheckbox?: boolean, fnCheck?, extraData?: any }) {

    // MODELO DE BOTONES
    // botones =  [
    //   {
    //     Icono :  { Imagen, ancho, alto } ,
    //     onclick: function(e){
    //       e.preventDefault();
    //     }
    //   }
    // ]

    const div = document.createElement('div');

    if (options?.includeCheckbox) {
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.style.marginTop = '5px';
      checkbox.onchange = (e: Event) => {
        options?.fnCheck(e);
      };
      div.appendChild(checkbox);
    }

    const hTitulo = document.createElement('b');
    hTitulo.textContent = Titulo;
    hTitulo.style.fontSize = '12px';
    hTitulo.style.fontWeight = "bold"
    div.appendChild(hTitulo);

    const hCuerpo = document.createElement('div')
    hCuerpo.textContent = Cuerpo;
    hCuerpo.style.fontSize = '11px'
    div.appendChild(hCuerpo)

    const divbutton = document.createElement('div');
    divbutton.style.textAlign = "center"
    
    botones?.forEach(element => {
      const boton = document.createElement('span');
      boton.innerHTML = "<img src='../../../../assets/" + element["Icono"].Imagen + "' style='width: " + element["Icono"].Ancho + "; height:" + element["Icono"].Alto + "' />";
      boton.style.display = "inline-block";
      boton.style.width = element["Icono"].Ancho;
      boton.style.marginLeft = "5px";
      boton.style.cursor = "pointer";
      boton.style.marginTop = "5px";
      boton.onclick = ()=> element.onclick(options.extraData);
      divbutton.appendChild(boton);
    });
    div.appendChild(divbutton);

    return div;
  }

  CrearIcono(imagen: string, parametros?:any) {
    return L.icon({
      iconUrl: imagen,
      // iconUrl: '../../../assets/pin_ch.png', // Ruta al icono de pendientes
      iconSize: parametros?.iconSize ||  [25.5, 35],
      iconAnchor: parametros?.iconAnchor || [12, 32],
      popupAnchor: parametros?.iconPopupAnchor || [1, -24],
      shadowSize: parametros?.shadowSize || [41, 41]    
    });
  }

  showPopup() {
    // console.log(this.markers);
    
    this.popupMarkers.forEach((marker, index) => {
      if (this.MostrarDetalle == false) {
        marker.openPopup();
      } else {
        marker.closePopup();
      }
    });
    this.MostrarDetalle = !this.MostrarDetalle;
  }

  cerrar(): void {
    this.dialogRef.close();
  }

  onCancel(): void {
    this.dialogRef.close({ result: false });
  }

  onOk() {
    this.dialogRef.close({ result: true });
  }

}