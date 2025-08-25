import { TestBed } from '@angular/core/testing';

import { ApeService } from './ape.service';

describe('ApeService', () => {
  let service: ApeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
