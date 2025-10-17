import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EcoPoints } from './eco-points';

describe('EcoPoints', () => {
  let component: EcoPoints;
  let fixture: ComponentFixture<EcoPoints>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EcoPoints]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EcoPoints);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
