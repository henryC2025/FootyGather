import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameUpdateDialogComponent } from './game-update-dialog.component';

describe('GameUpdateDialogComponent', () => {
  let component: GameUpdateDialogComponent;
  let fixture: ComponentFixture<GameUpdateDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GameUpdateDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GameUpdateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
