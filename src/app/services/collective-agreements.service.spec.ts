import { TestBed } from '@angular/core/testing';

import { CollectiveAgreementsService } from './collective-agreements.service';

describe('CollectiveAgreementsService', () => {
  let service: CollectiveAgreementsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CollectiveAgreementsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
