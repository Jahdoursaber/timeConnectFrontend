import { TestBed } from '@angular/core/testing';

import { RequestAdvanceService } from './request-advance.service';

describe('RequestAdvanceService', () => {
  let service: RequestAdvanceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RequestAdvanceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
