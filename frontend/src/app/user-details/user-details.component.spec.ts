import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { UserDetailsComponent } from './user-details.component';
import { AuthService } from '@auth0/auth0-angular';
import { WebService } from '../web.service';
import { SharedService } from '../shared.service';
import { Loader } from '@googlemaps/js-api-loader';
import { NgxGpAutocompleteModule } from '@angular-magic/ngx-gp-autocomplete';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';

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

describe('UserDetailsComponent', () =>
{
    let component: UserDetailsComponent;
    let fixture: ComponentFixture<UserDetailsComponent>;
    let authServiceMock : any;
    let webServiceMock : any;
    let sharedServiceMock : any;
    let routerMock : any;

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
            addNewUserDetails: jasmine.createSpy('addNewUserDetails').and.returnValue(of([])),
            uploadProfileImage: jasmine.createSpy().and.returnValue(of({ filePath: 'path/to/image.jpg', id: '123' })),
            uploadImage: jasmine.createSpy('uploadImage').and.returnValue(of([])),
        };

        sharedServiceMock =
        {
            showNotification: jasmine.createSpy(),
            showUpdateUserDetailsDialog: jasmine.createSpy(),
            setUserFormCompleted: jasmine.createSpy(),
            isUserFormCompleted: jasmine.createSpy(),
            setAuthCalled: jasmine.createSpy(),
            getAuthCalled: jasmine.createSpy().and.returnValue(true)
        };

        routerMock =
        {
            navigate: jasmine.createSpy('navigate')
        };

        await TestBed.configureTestingModule(
        {
            declarations: [UserDetailsComponent],
            imports: [
                FormsModule,
                ReactiveFormsModule,
                HttpClientTestingModule,
                RouterTestingModule,
                NgxGpAutocompleteModule
            ],
            providers: [
                { provide: AuthService, useValue: authServiceMock },
                { provide: WebService, useValue: webServiceMock },
                { provide: SharedService, useValue: sharedServiceMock },
                { provide: Loader, useClass: MockLoader }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
            }).compileComponents();

            fixture = TestBed.createComponent(UserDetailsComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        it('should create', () =>
        {
            expect(component).toBeTruthy();
        });

        it('should initialize with user data from AuthService', () =>
        {
            expect(component.user).toEqual(jasmine.objectContaining(
            {
                sub: 'auth0|123456',
                nickname: 'testuser',
                email: 'test@example.com'
            }));
        });

        it('should submit user details when form is valid', () =>
        {
            component.details_form.setValue(
            {
                location: 'Some location',
                description: 'Some description',
                firstName: 'John',
                lastName: 'Doe',
                experience: 'Expert',
                profilePicture: null,
                subscribeToNotifications: true
            });
            component.onSubmit();
            expect(webServiceMock.addNewUserDetails).toHaveBeenCalled();
            expect(sharedServiceMock.showNotification).toHaveBeenCalledWith("Details added, Thank you for Joining :)", "success");
        });

        it('should handle image file selection', () =>
        {
            spyOn(component, 'uploadImage').and.callThrough();
            const file = new File([''], 'filename.png', { type: 'image/png' });
            const event = { target: { files: [file] } };
            component.onFileSelected(event);
        });

        it('should handle errors during form submission', () =>
        {
            component.details_form.setValue(
            {
                location: 'Some location',
                description: 'Some description',
                firstName: 'John',
                lastName: 'Doe',
                experience: 'Expert',
                profilePicture: null,
                subscribeToNotifications: false
            });
            webServiceMock.addNewUserDetails.and.returnValue(throwError(() => new Error('Error submitting user details')));
            component.onSubmit();
            expect(sharedServiceMock.showNotification).toHaveBeenCalledWith("Error submitting user details", "error");
        });
});
