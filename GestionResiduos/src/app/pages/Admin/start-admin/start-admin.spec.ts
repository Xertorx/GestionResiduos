import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StartAdmin } from './start-admin';

describe('StartAdmin', () => {
  let component: StartAdmin;
  let fixture: ComponentFixture<StartAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StartAdmin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StartAdmin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
