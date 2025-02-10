import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarPedidosComponent } from './editar-pedidos.component';

describe('EditarPedidosComponent', () => {
  let component: EditarPedidosComponent;
  let fixture: ComponentFixture<EditarPedidosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditarPedidosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditarPedidosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
