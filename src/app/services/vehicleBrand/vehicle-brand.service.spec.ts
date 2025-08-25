import { TestBed } from '@angular/core/testing';

import { VehicleBrandService } from './vehicle-brand.service';

describe('VehicleBrandService', () => {
  let service: VehicleBrandService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VehicleBrandService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
