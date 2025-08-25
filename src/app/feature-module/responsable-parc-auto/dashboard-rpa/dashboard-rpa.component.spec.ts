import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardRpaComponent } from './dashboard-rpa.component';

describe('DashboardRpaComponent', () => {
  let component: DashboardRpaComponent;
  let fixture: ComponentFixture<DashboardRpaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DashboardRpaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardRpaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
