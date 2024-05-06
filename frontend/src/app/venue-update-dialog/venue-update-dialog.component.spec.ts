import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { VenueUpdateDialogComponent } from './venue-update-dialog.component';
import { AuthService } from '@auth0/auth0-angular';
import { WebService } from '../web.service';
import { SharedService } from '../shared.service';
import { Loader } from '@googlemaps/js-api-loader';
import { NgxGpAutocompleteModule } from '@angular-magic/ngx-gp-autocomplete';
import { CUSTOM_ELEMENTS_SCHEMA, Input, NO_ERRORS_SCHEMA } from '@angular/core';
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

describe('VenueUpdateDialogComponent', () =>
{
    let component: VenueUpdateDialogComponent;
    let fixture: ComponentFixture<VenueUpdateDialogComponent>;
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
            getVenueByID: jasmine.createSpy('getVenueByID').and.returnValue(of(
            {
                venue_name: 'Venue',
                venue_address: 'Address',
                venue_description: 'Description',
                venue_contact: 'Contact',
                venue_image: 'Image.jpg'
            })),
            uploadVenueImage: jasmine.createSpy('uploadVenueImage').and.returnValue(of({})),
            updateVenueDetails: jasmine.createSpy('updateVenueDetails').and.returnValue(of({})),
            deleteVenueImage: jasmine.createSpy('deleteVenueImage').and.returnValue(of({})),
        }

        sharedServiceMock =
        {
            showNotification: jasmine.createSpy(),
        };

        await TestBed.configureTestingModule(
        {
            declarations: [VenueUpdateDialogComponent],
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

        fixture = TestBed.createComponent(VenueUpdateDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () =>
    {
        expect(component).toBeTruthy();
    });

    it('should handle image file selection correctly', () =>
    {
        const blob = new Blob([''], { type: 'image/jpeg' });
        const file = new File([blob], 'test.jpg', { type: 'image/jpeg' });
        const event = { target: { files: [file] } };
        component.onFileSelected(event);
        expect(component.selected_file).toEqual(file);
    });

    it('should submit updated venue details', () =>
    {
        component.venue_form.setValue(
        {
            venueName: 'Updated Venue',
            venueAddress: 'Updated Address',
            venueDescription: 'Updated Description',
            venueImage: null,
            venueContact: 'Updated Contact'
        });
        component.onSubmit();
        expect(webServiceMock.updateVenueDetails).toHaveBeenCalled();
        expect(dialogRefMock.close).toHaveBeenCalled();
        expect(sharedServiceMock.showNotification).toHaveBeenCalledWith("Venue details successfully updated", "success");
    });
});