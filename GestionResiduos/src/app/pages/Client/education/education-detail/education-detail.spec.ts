import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EducationDetail } from './education-detail';

describe('EducationDetail', () => {
  let component: EducationDetail;
  let fixture: ComponentFixture<EducationDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EducationDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EducationDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
