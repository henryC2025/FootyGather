import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunityAddCommentDialogComponent } from './community-add-comment-dialog.component';

describe('CommunityAddCommentDialogComponent', () => {
  let component: CommunityAddCommentDialogComponent;
  let fixture: ComponentFixture<CommunityAddCommentDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CommunityAddCommentDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CommunityAddCommentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
