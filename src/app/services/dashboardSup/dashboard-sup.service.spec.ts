import { TestBed } from '@angular/core/testing';

import { DashboardSupService } from './dashboard-sup.service';

describe('DashboardSupService', () => {
  let service: DashboardSupService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DashboardSupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
