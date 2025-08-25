import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehicleArchivesComponent } from './vehicle-archives.component';

describe('VehicleArchivesComponent', () => {
  let component: VehicleArchivesComponent;
  let fixture: ComponentFixture<VehicleArchivesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VehicleArchivesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VehicleArchivesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
