import { TestBed } from '@angular/core/testing';

import { OtherRequestService } from './other-request.service';

describe('OtherRequestService', () => {
  let service: OtherRequestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OtherRequestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
