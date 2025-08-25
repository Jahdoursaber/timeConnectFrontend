import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvanceRequestComponent } from './advance-request.component';

describe('AdvanceRequestComponent', () => {
  let component: AdvanceRequestComponent;
  let fixture: ComponentFixture<AdvanceRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdvanceRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdvanceRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
