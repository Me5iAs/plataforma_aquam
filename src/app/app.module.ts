import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material.module';
import { Routes, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from "@angular/forms"
import { gAuthGuard } from './guards/g-auth.guard';
import { gNoAuthGuard } from './guards/g-noauth.guard'

import { LoginComponent } from './components/pages/login/login.component';


import { ContentComponent } from './components/container/content/content.component';
import { FooterComponent } from './components/container/footer/footer.component';
import { NavbarComponent } from './components/container/navbar/navbar.component';
import { SidenavComponent } from './components/container/sidenav/sidenav.component';


/**
 * para instalar mapa:
 * - npm install leaflet
 * - npm install leaflet-routing-machine
 * - npm install @types/leaflet --save-dev
 * en styles.css -> @import url("https://unpkg.com/leaflet@1.9.4/dist/leaflet.css");
 */





const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate:[gNoAuthGuard] },
  { path: '', component:ContentComponent,canActivate:[gAuthGuard],  children:[
    { path: 'home',     loadChildren: () =>import("./components/pages/home/home.module").then(m => m.HomeModule), },
    { path: 'clientes',                     canActivate:[gAuthGuard],   loadChildren: () => import('./components/pages/clientes/clientes.module').then(m => m.ClientesModule) },
    { path: 'miperfil',                     canActivate:[gAuthGuard],   loadChildren: () => import('./components/pages/miperfil/miperfil.module').then(m => m.MiperfilModule) },
  
    // operacion
    { path: 'pedidos',                      canActivate:[gAuthGuard],   loadChildren: () => import('./components/pages/pedidos/pedidos.module').then(m => m.PedidosModule) },
    { path: 'nuevo_pedido',                 canActivate:[gAuthGuard],   loadChildren: () => import('./components/pages/nuevo-pedido/nuevo-pedido.module').then(m => m.NuevoPedidoModule) },
    { path: 'venta_planta',                 canActivate:[gAuthGuard],   loadChildren: () => import('./components/pages/venta-planta/venta-planta.module').then(m => m.VentaPlantaModule) },
    { path: 'pedidos_pnd',                  canActivate:[gAuthGuard],   loadChildren: () => import('./components/pages/pedidos-pendientes/pedidos-pendientes.module').then(m => m.PedidosPendientesModule) },
    { path: 'pedidos_enviados',             canActivate:[gAuthGuard],   loadChildren: () => import('./components/pages/pedidos-enviados/pedidos-enviados.module').then(m => m.PedidosEnviadosModule) },
    { path: 'pedidos_entregar',             canActivate:[gAuthGuard],   loadChildren: () => import('./components/pages/pedidos-entregar/pedidos-entregar.module').then(m => m.PedidosEntregarModule) },
    { path: 'envios',                       canActivate:[gAuthGuard],   loadChildren: () => import('./components/pages/envios/envios.module').then(m => m.EnviosModule) },
    { path: 'entregar/:IdPedido/:IdCliente',canActivate:[gAuthGuard],   loadChildren: () => import('./components/pages/entregar/entregar.module').then(m => m.EntregarModule) },
    { path: 'pedidos_rendir',               canActivate:[gAuthGuard],   loadChildren: () => import('./components/pages/pedidos-rendir/pedidos-rendir.module').then(m => m.PedidosRendirModule) },
    { path: 'aprobaciones',                 canActivate:[gAuthGuard],   loadChildren: () => import('./components/pages/aprobaciones/aprobaciones.module').then(m => m.AprobacionesModule) },
    { path: 'record_cliente/:IdCliente',    canActivate:[gAuthGuard],   loadChildren: () => import('./components/pages/record-cliente/record-cliente.module').then(m => m.RecordClienteModule) },
    { path: 'mapa_clientes',                canActivate:[gAuthGuard],   loadChildren: () => import('./components/pages/mapa-clientes/mapa-clientes.module').then(m => m.MapaClientesModule) },
    { path: 'users',                        canActivate:[gAuthGuard],   loadChildren: () => import('./components/pages/usuarios/usuarios.module').then(m => m.UsuariosModule) },
    { path: 'security',                     canActivate:[gAuthGuard],   loadChildren: () => import('./components/pages/seguridad/seguridad.module').then(m => m.SeguridadModule) },
    { path: 'productos',                    canActivate:[gAuthGuard],   loadChildren: () => import('./components/pages/productos/productos.module').then(m => m.ProductosModule) },
    { path: 'tarifarios',                   canActivate:[gAuthGuard],   loadChildren: () => import('./components/pages/tarifarios/tarifarios.module').then(m => m.TarifariosModule) },
    { path: 'vehiculos',                    canActivate:[gAuthGuard],   loadChildren: () => import('./components/pages/vehiculos/vehiculos.module').then(m => m.VehiculosModule) },   
    { path: 'gestion_operaciones',          canActivate:[gAuthGuard],   loadChildren: () => import('./components/pages/plan-contable/plan-contable.module').then(m => m.PlanContableModule) },
    { path: 'conf_operaciones',             canActivate:[gAuthGuard],   loadChildren: () => import('./components/pages/conf-operaciones/conf-operaciones.module').then(m => m.ConfOperacionesModule) },
    { path:  "", redirectTo:"home", pathMatch:"full"}
  ] },
  { path: '*', redirectTo: '/', pathMatch: 'full' },
  
  
  
  
  
 
  
  
  
  
  
  
]

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    SidenavComponent,
    FooterComponent,
    ContentComponent,
    LoginComponent,
    
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes, { useHash: true }),
    HttpClientModule,
    FormsModule,
    BrowserAnimationsModule,
    MaterialModule,
    ReactiveFormsModule,
    // gInputDialogModule
  ],
  exports:[
    ReactiveFormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
