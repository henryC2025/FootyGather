import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunitiesAddDialogComponent } from './communities-add-dialog.component';

describe('CommunitiesAddDialogComponent', () => {
  let component: CommunitiesAddDialogComponent;
  let fixture: ComponentFixture<CommunitiesAddDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CommunitiesAddDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CommunitiesAddDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
