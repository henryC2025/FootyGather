import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VenueUpdateDialogComponent } from './venue-update-dialog.component';

describe('VenueUpdateDialogComponent', () => {
  let component: VenueUpdateDialogComponent;
  let fixture: ComponentFixture<VenueUpdateDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VenueUpdateDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VenueUpdateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
