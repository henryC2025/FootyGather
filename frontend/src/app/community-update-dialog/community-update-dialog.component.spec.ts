import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommunityUpdateDialogComponent } from './community-update-dialog.component';
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

describe('CommunityUpdateDialogComponent', () =>
{
    let component: CommunityUpdateDialogComponent;
    let fixture: ComponentFixture<CommunityUpdateDialogComponent>;
    let authServiceMock: any;
    let sharedServiceMock: any;
    let webServiceMock: any;
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
            getCommunityByID: jasmine.createSpy('getCommunityByID').and.returnValue(of(
            [{
                community_name: "Test Community",
                community_location: "Test Location",
                community_description: "Test Description",
                community_rules: "Test Rules",
                community_image: "test-image.jpg"
            }])),
            updateCommunityDetails: jasmine.createSpy('updateCommunityDetails').and.returnValue(of({})),
            uploadCommunityImage: jasmine.createSpy('uploadCommunityImage').and.returnValue(of({})),
            deleteCommunityImage: jasmine.createSpy('deleteCommunityImage').and.returnValue(of({})),
        }

        sharedServiceMock =
        {
            showNotification: jasmine.createSpy(),
        };

        await TestBed.configureTestingModule(
        {
            declarations: [CommunityUpdateDialogComponent],
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
                { provide: MAT_DIALOG_DATA, useValue: { } }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(CommunityUpdateDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () =>
    {
        expect(component).toBeTruthy();
    });

    it('should load community details on initialization', () =>
    {
        expect(webServiceMock.getCommunityByID).toHaveBeenCalled();
    });

    it('should handle image file selection correctly', () =>
    {
        const file = new File([''], 'new-image.jpg', { type: 'image/jpeg' });
        const event = { target: { files: [file] } };
        component.onFileSelected(event);
        expect(component.selected_file).toEqual(file);
    });
    
    it('should submit updated venue details', () =>
    {
        component.community_form.setValue(
        {
            community_name: "Test Community",
            community_location: "Test Location",
            community_description: "Test Description",
            community_rules: "Test Rules",
            community_image: "test-image.jpg"
        });
        component.submitUpdateCommunityDetails();
        expect(webServiceMock.updateCommunityDetails).toHaveBeenCalled();
        expect(dialogRefMock.close).toHaveBeenCalled();
        expect(sharedServiceMock.showNotification).toHaveBeenCalledWith("Community updated", "success");
    });
});
