import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunityUpdateDialogComponent } from './community-update-dialog.component';

describe('CommunityUpdateDialogComponent', () => {
  let component: CommunityUpdateDialogComponent;
  let fixture: ComponentFixture<CommunityUpdateDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CommunityUpdateDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CommunityUpdateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
