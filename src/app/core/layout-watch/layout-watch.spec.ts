import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutWatch } from './layout-watch';

describe('LayoutWatch', () => {
  let component: LayoutWatch;
  let fixture: ComponentFixture<LayoutWatch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutWatch]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LayoutWatch);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
