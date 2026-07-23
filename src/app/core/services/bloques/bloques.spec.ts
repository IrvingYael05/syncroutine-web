import { TestBed } from '@angular/core/testing';

import { Bloques } from './bloques';

describe('Bloques', () => {
  let service: Bloques;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Bloques);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
