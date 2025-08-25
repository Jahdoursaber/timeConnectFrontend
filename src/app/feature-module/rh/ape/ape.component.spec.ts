import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApeComponent } from './ape.component';

describe('ApeComponent', () => {
  let component: ApeComponent;
  let fixture: ComponentFixture<ApeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ApeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
