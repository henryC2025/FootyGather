import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { VenuesAddDialogComponent } from './venues-add-dialog.component';
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

describe('VenuesAddDialogComponent', () =>
{
    let component: VenuesAddDialogComponent;
    let fixture: ComponentFixture<VenuesAddDialogComponent>;
    let sharedServiceMock : any
    let authServiceMock : any
    let webServiceMock : any
    let mockDialogRef =
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
            addVenueDetails: jasmine.createSpy('addVenueDetails').and.returnValue(of([])),
        };

        sharedServiceMock = 
        {
            showNotification: jasmine.createSpy(),
            venue_added: new Subject<void>()
        };

        await TestBed.configureTestingModule(
        {
            declarations: [VenuesAddDialogComponent],
            imports: 
            [
                FormsModule,
                ReactiveFormsModule,
                HttpClientTestingModule,
                RouterTestingModule,
                MatDialogModule,
                NgxGpAutocompleteModule
            ],
            providers: 
            [
                { provide: AuthService, useValue: authServiceMock },
                { provide: WebService, useValue: webServiceMock },
                { provide: SharedService, useValue: sharedServiceMock },
                { provide: Loader, useClass: MockLoader },
                { provide: MatDialogRef, useValue: {} },
                { provide: MatDialogRef, useValue: mockDialogRef },
                { provide: MAT_DIALOG_DATA, useValue: {} }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(VenuesAddDialogComponent);
        component = fixture.componentInstance;
        spyOn(sharedServiceMock.venue_added, 'next');
        fixture.detectChanges();
    });

    afterEach(() =>
    {
        if (sharedServiceMock.venue_added.next.calls)
        {
            sharedServiceMock.venue_added.next.calls.reset();
        }
    });

    it('should create', () =>
    {
        expect(component).toBeTruthy();
    });

    it('should submit venue details when form is valid and image is selected', () =>
    {
        component.venue_form.setValue(
        {
            venueName: 'Sample Venue',
            venueAddress: '123 Example St',
            venueDescription: 'Example Description',
            venue_image: new File([''], 'example.png', { type: 'image/png' }),
            venueContact: '1234567890'
        });
        
        component.selected_file = new File([''], 'example.png', { type: 'image/png' });
    
        spyOn(component, 'uploadImage').and.returnValue(of({ filePath: '/path/to/image', id: '123', fileName: 'example.png' }));
        spyOn(component, 'submitVenueDetails').and.callThrough();
    
        component.onSubmit();
    
        expect(component.uploadImage).toHaveBeenCalled();
        expect(component.submitVenueDetails).toHaveBeenCalled();
    });

    it('should close the dialog on onClose', () =>
    {
        component.onClose();
        expect(mockDialogRef.close).toHaveBeenCalled();
    });

    it('should emit venue added on successful submission', () =>
    {    
        component.submitVenueDetails();
    
        expect(sharedServiceMock.venue_added.next).toHaveBeenCalled();
    });
});
