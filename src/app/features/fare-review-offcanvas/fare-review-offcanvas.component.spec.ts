import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FareReviewOffcanvasComponent } from './fare-review-offcanvas.component';

describe('FareReviewOffcanvasComponent', () => {
  let component: FareReviewOffcanvasComponent;
  let fixture: ComponentFixture<FareReviewOffcanvasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FareReviewOffcanvasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FareReviewOffcanvasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
