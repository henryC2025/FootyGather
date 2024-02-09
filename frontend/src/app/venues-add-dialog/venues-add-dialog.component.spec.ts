import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VenuesAddDialogComponent } from './venues-add-dialog.component';

describe('VenuesAddDialogComponent', () => {
  let component: VenuesAddDialogComponent;
  let fixture: ComponentFixture<VenuesAddDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VenuesAddDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VenuesAddDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
