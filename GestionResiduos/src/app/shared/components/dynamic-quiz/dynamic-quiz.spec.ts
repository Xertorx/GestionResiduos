import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicQuiz } from './dynamic-quiz';

describe('DynamicQuiz', () => {
  let component: DynamicQuiz;
  let fixture: ComponentFixture<DynamicQuiz>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynamicQuiz]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DynamicQuiz);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
