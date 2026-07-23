import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WatchPlayer } from './watch-player';

describe('WatchPlayer', () => {
  let component: WatchPlayer;
  let fixture: ComponentFixture<WatchPlayer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WatchPlayer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WatchPlayer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
