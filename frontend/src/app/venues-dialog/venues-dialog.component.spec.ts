import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VenuesDialogComponent } from './venues-dialog.component';

describe('VenuesDialogComponent', () => {
  let component: VenuesDialogComponent;
  let fixture: ComponentFixture<VenuesDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VenuesDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VenuesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
