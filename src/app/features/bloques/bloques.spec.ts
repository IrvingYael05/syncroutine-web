import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Bloques } from './bloques';

describe('Bloques', () => {
  let component: Bloques;
  let fixture: ComponentFixture<Bloques>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Bloques]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Bloques);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
