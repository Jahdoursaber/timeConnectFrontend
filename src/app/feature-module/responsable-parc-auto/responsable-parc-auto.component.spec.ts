import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResponsableParcAutoComponent } from './responsable-parc-auto.component';

describe('ResponsableParcAutoComponent', () => {
  let component: ResponsableParcAutoComponent;
  let fixture: ComponentFixture<ResponsableParcAutoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ResponsableParcAutoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResponsableParcAutoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
