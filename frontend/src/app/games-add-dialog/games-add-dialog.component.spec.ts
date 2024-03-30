import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GamesAddDialogComponent } from './games-add-dialog.component';

describe('GamesAddDialogComponent', () => {
  let component: GamesAddDialogComponent;
  let fixture: ComponentFixture<GamesAddDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GamesAddDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GamesAddDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
