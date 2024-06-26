import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommunityAddCommentDialogComponent } from './community-add-comment-dialog.component';
import { AuthService } from '@auth0/auth0-angular';
import { WebService } from '../web.service';
import { SharedService } from '../shared.service';
import { Loader } from '@googlemaps/js-api-loader';
import { NgxGpAutocompleteModule } from '@angular-magic/ngx-gp-autocomplete';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { Subject, of } from 'rxjs';

class MockLoader
{
    load()
    {
        return Promise.resolve();
    }
    importLibrary()
    {
        return Promise.resolve();
    }
}

describe('CommunityAddCommentDialogComponent', () =>
{
    let component: CommunityAddCommentDialogComponent;
    let fixture: ComponentFixture<CommunityAddCommentDialogComponent>;
    let authServiceMock : any;
    let webServiceMock : any; 
    let sharedServiceMock : any;
    const mockDialogRef =
    {
        close: jasmine.createSpy('close')
    };

    beforeEach(async () =>
    {
        authServiceMock =
        {
            user$: of(
            {
                sub: 'auth0|123456',
                nickname: 'testuser',
                email: 'test@example.com'
            }),
            isAuthenticated$: of(true)
        };

        webServiceMock =
        {
            addCommunityComment: jasmine.createSpy('addCommunityComment').and.returnValue(of({})),
        }

        sharedServiceMock =
        {
            showNotification: jasmine.createSpy(),
            community_comments_updated: { next: jasmine.createSpy('next') }
        };

        await TestBed.configureTestingModule(
        {
            declarations: [CommunityAddCommentDialogComponent],
            imports: [
                FormsModule,
                ReactiveFormsModule,
                HttpClientTestingModule,
                RouterTestingModule,
                MatDialogModule,
                NgxGpAutocompleteModule
            ],
            providers: [
                { provide: AuthService, useValue: authServiceMock },
                { provide: WebService, useValue: webServiceMock },
                { provide: SharedService, useValue: sharedServiceMock },
                { provide: Loader, useClass: MockLoader },
                { provide: MatDialogRef, useValue: mockDialogRef },
                { provide: MAT_DIALOG_DATA, useValue: {} }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(CommunityAddCommentDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () =>
    {
        expect(component).toBeTruthy();
    });

    it('should validate the comment content as required', () =>
    {
        let commentControl = component.comment_form.get('comment_content');
        commentControl.setValue('');
        expect(commentControl.valid).toBeFalsy();
        expect(commentControl.errors['required']).toBeTruthy();
    });

    it('should not submit a comment if the form is invalid', () =>
    {
        component.comment_form.controls['comment_content'].setValue('');
        component.onSubmit();
        expect(component.comment_form.valid).toBeFalsy();
        expect(webServiceMock.addCommunityComment).not.toHaveBeenCalled();
    });

    it('should submit a comment if the form is valid and user is authenticated', () =>
    {
        component.comment_form.controls['comment_content'].setValue('Great place!');
        fixture.detectChanges();
        component.onSubmit();
        expect(component.comment_form.valid).toBeTruthy();
        expect(authServiceMock.isAuthenticated$).toBeTruthy();
        expect(webServiceMock.addCommunityComment).toHaveBeenCalled();
    });
});
