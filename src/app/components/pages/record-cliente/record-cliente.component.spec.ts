import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordClienteComponent } from './record-cliente.component';

describe('RecordClienteComponent', () => {
  let component: RecordClienteComponent;
  let fixture: ComponentFixture<RecordClienteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecordClienteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecordClienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
