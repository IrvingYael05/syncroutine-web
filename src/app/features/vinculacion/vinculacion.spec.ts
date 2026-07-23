import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Vinculacion } from './vinculacion';

describe('Vinculacion', () => {
  let component: Vinculacion;
  let fixture: ComponentFixture<Vinculacion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Vinculacion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Vinculacion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
