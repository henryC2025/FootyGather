import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GameUpdateDialogComponent } from './game-update-dialog.component';
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

describe('GameUpdateDialogComponent', () =>
{
    let component: GameUpdateDialogComponent;
    let fixture: ComponentFixture<GameUpdateDialogComponent>;
    let dialogRefMock : any;
    let webServiceMock : any;
    let sharedServiceMock : any;
    let authServiceMock : any;

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
            getAllVenues: jasmine.createSpy('getAllVenues').and.returnValue(of([
                { _id: '1', name: 'Stadium' },
                { _id: '2', name: 'Arena' }
            ])),
            getGameById: jasmine.createSpy('getGameById').and.returnValue(of({})),
            getGamePlayerCount: jasmine.createSpy().and.returnValue(of({ player_count: 5 })),
            updateGameDetails: jasmine.createSpy('updateGameDetails').and.returnValue(of({})),
        }

        sharedServiceMock =
        {
            showNotification: jasmine.createSpy(),
            game_updated:
            {
                next: jasmine.createSpy('next')
            }
        };

        await TestBed.configureTestingModule(
        {
            declarations: [GameUpdateDialogComponent],
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

        fixture = TestBed.createComponent(GameUpdateDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should close the dialog on onClose', () =>
    {
        component.onClose();
        expect(dialogRefMock.close).toHaveBeenCalled();
    });

    it('should populate the form with fetched game details', async(() =>
    {
        const mockGameData =
        {
            name: 'Football Match',
            description: 'An exciting game',
            venue_id: '1',
            venue_name: 'Stadium',
            length: '90',
            payment_type: 'Paid',
            size: '22',
            price: '10',
            date: '2022-09-15',
            time: '10:00'
        };
        webServiceMock.getGameById.and.returnValue(of([mockGameData]));
        component.ngOnInit();
        fixture.whenStable().then(() =>
        {
            expect(component.game_details_form.value).toEqual(
            {
                game_name: mockGameData.name,
                game_description: mockGameData.description,
                game_venue: `${mockGameData.venue_id},${mockGameData.venue_name}`,
                game_length: mockGameData.length,
                game_payment_type: mockGameData.payment_type,
                game_size: mockGameData.size,
                game_price: mockGameData.price,
                game_date: mockGameData.date,
                game_time: mockGameData.time,
            });
            expect(webServiceMock.getGameById).toHaveBeenCalledWith(component.data?.game_id);
        });
    }));

    it('should submit updated game details when form is valid and conditions are met', () =>
    {
        component.game_details_form.setValue(
        {
            game_name: 'New Game Name',
            game_description: 'New Description',
            game_venue: '1,Stadium',
            game_length: '90',
            game_payment_type: 'Free',
            game_size: 22,
            game_price: 10,
            game_date: '2023-01-01',
            game_time: '12:00'
        });
        component.current_player_size = 5;
        component.onSubmit();      
        expect(sharedServiceMock.showNotification).toHaveBeenCalledWith('Game details updated', 'success');
        expect(dialogRefMock.close).toHaveBeenCalled();
        expect(sharedServiceMock.game_updated.next).toHaveBeenCalled();
    });
    

    it('should prevent submission if the form is invalid', () =>
    {
        component.game_details_form.reset();
        component.onSubmit();
        expect(webServiceMock.updateGameDetails).not.toHaveBeenCalled();
    });
    
    it('should prevent game size reduction below current player size', () =>
    {
        component.game_details_form.setValue(
        {
            game_name: 'Existing Game',
            game_description: 'Existing Description',
            game_venue: '1,Stadium',
            game_length: '90',
            game_payment_type: 'Fee',
            game_size: 5,
            game_price: 50,
            game_date: '2023-01-01',
            game_time: '15:00'
        });
        component.current_player_size = 10;
        component.onSubmit();
        expect(sharedServiceMock.showNotification).toHaveBeenCalledWith(
            'Please remove players from the list before changing to smaller game size!', 'error'
        );
        expect(webServiceMock.updateGameDetails).not.toHaveBeenCalled();
    });
});
