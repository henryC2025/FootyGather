import { ComponentFixture, TestBed } from '@angular/core/testing';
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

describe('VenueUpdateDialogComponent', () =>
{
    let component: VenueUpdateDialogComponent;
    let fixture: ComponentFixture<VenueUpdateDialogComponent>;
    let mockWebService: jasmine.SpyObj<WebService>;

    beforeEach(async () =>
    {
        const authServiceMock =
        {
            user$: of(
            {
                sub: 'auth0|123456',
                nickname: 'testuser',
                email: 'test@example.com'
            }),
            isAuthenticated$: of(true)
        };

        mockWebService = jasmine.createSpyObj('WebService', ['getVenueByID', 'uploadVenueImage', 'updateVenueDetails', 'deleteVenueImage']);
        mockWebService.getVenueByID.and.returnValue(of({}));

        const sharedServiceMock =
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
                { provide: WebService, useValue: mockWebService },
                { provide: SharedService, useValue: sharedServiceMock },
                { provide: Loader, useClass: MockLoader },
                { provide: MatDialogRef, useValue: {} },
                { provide: MAT_DIALOG_DATA, useValue: {} }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(VenueUpdateDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
