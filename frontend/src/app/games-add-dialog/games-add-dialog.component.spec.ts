import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GamesAddDialogComponent } from './games-add-dialog.component';
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

describe('GamesAddDialogComponent', () =>
{
    let component: GamesAddDialogComponent;
    let fixture: ComponentFixture<GamesAddDialogComponent>;
    let authServiceMock : any;
    let sharedServiceMock : any;
    let webServiceMock : any;
    let dialogRefMock : any;

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

        dialogRefMock =
        {
            close: jasmine.createSpy('close')
        };

        webServiceMock =
        {
            getAllVenues: jasmine.createSpy('getAllVenues').and.returnValue(of([])),
            getUserDetails: jasmine.createSpy('getUserDetails').and.returnValue(of(
            {
                oauth_id: 'some_oauth_id',
                _id: 'some_user_id',
                user_name: 'John Doe',
                email: 'john@example.com'
            })),
            addNewGame: jasmine.createSpy('addNewGame').and.returnValue(of({})),
            getEligiblePlayersFromCommunity: jasmine.createSpy('getEligiblePlayersFromCommunity').and.returnValue(of([])),
            sendEmailToPlayers: jasmine.createSpy('getEligiblePlayersFromCommunity').and.returnValue(of({})),
        }

        sharedServiceMock =
        {
            showNotification: jasmine.createSpy(),
            game_added: new Subject<void>(),
        };

        await TestBed.configureTestingModule(
        {
            declarations: [GamesAddDialogComponent],
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

        fixture = TestBed.createComponent(GamesAddDialogComponent);
        component = fixture.componentInstance;
        if (!jasmine.isSpy(webServiceMock.addNewGame))
        {
            spyOn(webServiceMock, 'addNewGame').and.returnValue(of({}));
        }
        fixture.detectChanges();
    });

    afterEach(() =>
    {
        if (webServiceMock.addNewGame.calls)
        {
            webServiceMock.addNewGame.calls.reset();
        }
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load venues on init', () =>
    {
        expect(webServiceMock.getAllVenues).toHaveBeenCalled();
    });

    it('should handle form submission and emit game added on successful game creation', fakeAsync(() =>
    {
        component.user_details =
        {
            oauth_id: 'some_oauth_id',
            _id: 'some_user_id',
            user_name: 'John Doe',
            email: 'john@example.com'
        };
    
        component.game_form.setValue(
        {
            game_name: 'Test Game',
            game_venue: '1,Venue 1',
            game_description: 'Fun game',
            game_length: '90',
            game_payment_type: 'Free',
            game_size: '5',
            game_price: 0,
            game_date: '2021-01-01',
            game_time: '10:00'
        });
    
        webServiceMock.getUserDetails.and.returnValue(of(
        {
            oauth_id: 'some_oauth_id',
            _id: 'some_user_id',
            user_name: 'John Doe',
            email: 'john@example.com'
        }));
    
        component.onSubmit();
        tick();
        expect(webServiceMock.addNewGame).toHaveBeenCalled();
    }));

    it('should validate required fields and show notifications for missing entries', () =>
    {
        component.onSubmit();
        expect(sharedServiceMock.showNotification).toHaveBeenCalledTimes(8);
    });

    it('should close the dialog on onClose', () =>
    {
        component.onClose();
        expect(dialogRefMock.close).toHaveBeenCalled();
    });
});
