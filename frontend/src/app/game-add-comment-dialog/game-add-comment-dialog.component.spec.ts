import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameAddCommentDialogComponent } from './game-add-comment-dialog.component';

describe('GameAddCommentDialogComponent', () => {
  let component: GameAddCommentDialogComponent;
  let fixture: ComponentFixture<GameAddCommentDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GameAddCommentDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GameAddCommentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
