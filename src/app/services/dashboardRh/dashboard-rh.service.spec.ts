import { TestBed } from '@angular/core/testing';

import { DashboardRhService } from './dashboard-rh.service';

describe('DashboardRhService', () => {
  let service: DashboardRhService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DashboardRhService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
