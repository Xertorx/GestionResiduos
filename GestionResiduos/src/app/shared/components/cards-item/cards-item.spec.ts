import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardsItem } from './cards-item';

describe('CardsItem', () => {
  let component: CardsItem;
  let fixture: ComponentFixture<CardsItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardsItem]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardsItem);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
