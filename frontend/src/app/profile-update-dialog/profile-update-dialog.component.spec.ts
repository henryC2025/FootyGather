import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileUpdateDialogComponent } from './profile-update-dialog.component';

describe('ProfileUpdateDialogComponent', () => {
  let component: ProfileUpdateDialogComponent;
  let fixture: ComponentFixture<ProfileUpdateDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProfileUpdateDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProfileUpdateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
