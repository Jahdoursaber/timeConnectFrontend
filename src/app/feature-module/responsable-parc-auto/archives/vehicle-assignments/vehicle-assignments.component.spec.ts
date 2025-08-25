import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehicleAssignmentsComponent } from './vehicle-assignments.component';

describe('VehicleAssignmentsComponent', () => {
  let component: VehicleAssignmentsComponent;
  let fixture: ComponentFixture<VehicleAssignmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VehicleAssignmentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VehicleAssignmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
