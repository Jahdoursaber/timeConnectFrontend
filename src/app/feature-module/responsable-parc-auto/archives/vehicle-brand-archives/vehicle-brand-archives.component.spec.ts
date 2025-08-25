import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehicleBrandArchivesComponent } from './vehicle-brand-archives.component';

describe('VehicleBrandArchivesComponent', () => {
  let component: VehicleBrandArchivesComponent;
  let fixture: ComponentFixture<VehicleBrandArchivesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VehicleBrandArchivesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VehicleBrandArchivesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
