import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VenuesComponent } from './venues.component';

describe('VenuesComponent', () => {
  let component: VenuesComponent;
  let fixture: ComponentFixture<VenuesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VenuesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VenuesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
