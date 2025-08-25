import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TechnicienHistoryComponent } from './technicien-history.component';

describe('TechnicienHistoryComponent', () => {
  let component: TechnicienHistoryComponent;
  let fixture: ComponentFixture<TechnicienHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TechnicienHistoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TechnicienHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
