import { TestBed } from '@angular/core/testing';

import { ToastUtilService } from './toast-util.service';

describe('ToastUtilService', () => {
  let service: ToastUtilService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastUtilService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
