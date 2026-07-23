import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WatchPin } from './watch-pin';

describe('WatchPin', () => {
  let component: WatchPin;
  let fixture: ComponentFixture<WatchPin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WatchPin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WatchPin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
