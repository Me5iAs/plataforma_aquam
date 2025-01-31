import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MapaClientesComponent } from './mapa-clientes.component';

describe('MapaClientesComponent', () => {
  let component: MapaClientesComponent;
  let fixture: ComponentFixture<MapaClientesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MapaClientesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapaClientesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
