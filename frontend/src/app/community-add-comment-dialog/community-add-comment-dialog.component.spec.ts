import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommunityAddCommentDialogComponent } from './community-add-comment-dialog.component';
import { AuthService } from '@auth0/auth0-angular';
import { WebService } from '../web.service';
import { SharedService } from '../shared.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

describe('CommunityAddCommentDialogComponent', () =>
{
    let component: CommunityAddCommentDialogComponent;
    let fixture: ComponentFixture<CommunityAddCommentDialogComponent>;

    const mockAuthService = { user$: of({}), isAuthenticated$: of(true) };
    const mockWebService = jasmine.createSpyObj('WebService', ['addCommunityComment']);
    const mockSharedService = jasmine.createSpyObj('SharedService', ['showNotification']);
    const mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    const mockActivatedRoute = { snapshot: { paramMap: jasmine.createSpy('get') } };
    const mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    const mockDialogData = {};
    const mockFormBuilder = new FormBuilder();

    beforeEach(async () =>
    {
        await TestBed.configureTestingModule(
        {
            declarations: [CommunityAddCommentDialogComponent],
            imports: [
              ReactiveFormsModule,
              MatIconModule,
              MatDialogModule,
              NoopAnimationsModule,
            ],
            providers: [
              { provide: AuthService, useValue: mockAuthService },
              { provide: WebService, useValue: mockWebService },
              { provide: SharedService, useValue: mockSharedService },
              { provide: Router, useValue: mockRouter },
              { provide: ActivatedRoute, useValue: mockActivatedRoute },
              { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
              { provide: MatDialogRef, useValue: mockDialogRef },
              { provide: FormBuilder, useValue: mockFormBuilder }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();
    });

    beforeEach(() =>
    {
        fixture = TestBed.createComponent(CommunityAddCommentDialogComponent);
        component = fixture.componentInstance;
        component.comment_form = mockFormBuilder.group({
          comment_content: ['', Validators.required]
        });
        fixture.detectChanges();
    });

    it('should create', () =>
    {
        expect(component).toBeTruthy();
    });

    it('should not submit comment if form is invalid', () =>
    {
        component.comment_form.controls.comment_content.setValue('');
        component.onSubmit();
        expect(mockWebService.addCommunityComment.calls.any()).toBeFalse();
    });
});
