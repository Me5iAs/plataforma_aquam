import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PedidosRendirComponent } from './pedidos-rendir.component';

describe('PedidosRendirComponent', () => {
  let component: PedidosRendirComponent;
  let fixture: ComponentFixture<PedidosRendirComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PedidosRendirComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PedidosRendirComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
