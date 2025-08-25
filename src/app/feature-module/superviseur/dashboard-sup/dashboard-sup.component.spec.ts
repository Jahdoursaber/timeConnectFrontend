import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardSupComponent } from './dashboard-sup.component';

describe('DashboardSupComponent', () => {
  let component: DashboardSupComponent;
  let fixture: ComponentFixture<DashboardSupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DashboardSupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardSupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
