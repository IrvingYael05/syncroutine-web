import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WatchDashboard } from './watch-dashboard';

describe('WatchDashboard', () => {
  let component: WatchDashboard;
  let fixture: ComponentFixture<WatchDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WatchDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WatchDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
