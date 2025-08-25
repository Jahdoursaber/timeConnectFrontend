import { TestBed } from '@angular/core/testing';

import { DashboardRpaService } from './dashboard-rpa.service';

describe('DashboardRpaService', () => {
  let service: DashboardRpaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DashboardRpaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
