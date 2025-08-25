import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectiveAgreementsComponent } from './collective-agreements.component';

describe('CollectiveAgreementsComponent', () => {
  let component: CollectiveAgreementsComponent;
  let fixture: ComponentFixture<CollectiveAgreementsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CollectiveAgreementsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CollectiveAgreementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
