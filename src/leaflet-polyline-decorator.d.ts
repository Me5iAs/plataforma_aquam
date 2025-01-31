import * as L from 'leaflet';

declare module 'leaflet' {
  function polylineDecorator(polyline: L.Polyline, options: any): any;

  namespace Symbol {
    function arrowHead(options: any): any;
  }
}
