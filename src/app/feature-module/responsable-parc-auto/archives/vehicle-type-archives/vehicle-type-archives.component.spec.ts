import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehicleTypeArchivesComponent } from './vehicle-type-archives.component';

describe('VehicleTypeArchivesComponent', () => {
  let component: VehicleTypeArchivesComponent;
  let fixture: ComponentFixture<VehicleTypeArchivesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VehicleTypeArchivesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VehicleTypeArchivesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
