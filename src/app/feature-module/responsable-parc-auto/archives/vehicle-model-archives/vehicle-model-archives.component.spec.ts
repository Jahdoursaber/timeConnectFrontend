import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehicleModelArchivesComponent } from './vehicle-model-archives.component';

describe('VehicleModelArchivesComponent', () => {
  let component: VehicleModelArchivesComponent;
  let fixture: ComponentFixture<VehicleModelArchivesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VehicleModelArchivesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VehicleModelArchivesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
