import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ProfileUpdateDialogComponent } from './profile-update-dialog.component';
import { AuthService } from '@auth0/auth0-angular';
import { WebService } from '../web.service';
import { SharedService } from '../shared.service';
import { Loader } from '@googlemaps/js-api-loader';
import { NgxGpAutocompleteModule } from '@angular-magic/ngx-gp-autocomplete';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

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

describe('ProfileUpdateDialogComponent', () =>
{
    let component: ProfileUpdateDialogComponent;
    let fixture: ComponentFixture<ProfileUpdateDialogComponent>;
    let webServiceMock : any;
    let sharedServiceMock : any;
    let authServiceMock : any;
    let dialogRefMock =
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
            getUserDetails: jasmine.createSpy('getUserDetails').and.returnValue(of(
            {
                first_name: 'Test',
                last_name: 'Test',
                description: 'Test user',
                location: 'Test location',
                experience: 'Experienced',
                sub_notifications: true,
                profile_image: 'path/to/image.jpg'
            })),
            updateUserDetails: jasmine.createSpy('updateUserDetails').and.returnValue(of({})),
            uploadProfileImage: jasmine.createSpy('uploadProfileImage').and.returnValue(of(
            {
                filePath: '/new/path/to/image.jpg',
                id: 'image123',
                fileName: 'profile.jpg'
            })),
            deleteProfileImage: jasmine.createSpy('deleteProfileImage').and.returnValue(of({}))
        }

        sharedServiceMock =
        {
            showNotification: jasmine.createSpy(),
        };

        await TestBed.configureTestingModule(
        {
            declarations: [ProfileUpdateDialogComponent],
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
                { provide: MatDialogRef, useValue: dialogRefMock },
                { provide: MAT_DIALOG_DATA, useValue: {} }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(ProfileUpdateDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () =>
    {
        expect(component).toBeTruthy();
    });

    it('should load user details and populate form on initialization', () =>
    {
        expect(webServiceMock.getUserDetails).toHaveBeenCalled();
        expect(component.user_details_form.value).toEqual(
        {
            first_name: 'Test',
            last_name: 'Test',
            description: 'Test user',
            location: 'Test location',
            experience: 'Experienced',
            sub_notifications: true,
            profile_image: 'path/to/image.jpg'
        });
    });

    it('should update user details and close dialog on submit', () =>
    {
        component.user_details_form.setValue(
        {
            first_name: 'Test',
            last_name: 'Test',
            description: 'Updated user',
            location: 'Updated location',
            experience: 'Beginner',
            sub_notifications: false,
            profile_image: 'path/to/newimage.jpg'
        });
        component.onSubmit();
        expect(webServiceMock.updateUserDetails).toHaveBeenCalled();
        expect(dialogRefMock.close).toHaveBeenCalled();
        expect(sharedServiceMock.showNotification).toHaveBeenCalledWith("User details updated", "success");
    });

    it('should handle form validation errors', () =>
    {
        component.user_details_form.setValue(
        {
            first_name: '',
            last_name: '',
            description: '',
            location: '',
            experience: '',
            sub_notifications: false,
            profile_image: null
        });
        component.onSubmit();
        expect(sharedServiceMock.showNotification).toHaveBeenCalledWith("Please enter your first name.", "error");
    });
});
