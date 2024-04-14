import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayersComponent } from './players.component';
import { FormsModule } from '@angular/forms';  // Needed for ngModel
import { WebService } from '../web.service';
import { AuthService } from '@auth0/auth0-angular';
import { SharedService } from '../shared.service';
import { of } from 'rxjs';

describe('PlayersComponent', () => 
{
    let component: PlayersComponent;
    let fixture: ComponentFixture<PlayersComponent>;
    let webServiceMock: any;
    let authServiceMock: any;
    let sharedServiceMock: any;

    beforeEach(async () => 
    {
        webServiceMock =
        {
            getAllPlayers: jasmine.createSpy('getAllPlayers').and.returnValue(of([])),
            getCountOfPlayers: jasmine.createSpy('getCountOfPlayers').and.returnValue(of({ count_of_players: 120 })),
            searchPlayers: jasmine.createSpy('searchPlayers').and.returnValue(of([]))
        };
        authServiceMock =
        {
            user$: of(
            {
                sub: 'auth0|123456',
                nickname: 'testuser',
                email: 'test@example.com'
            })
        };
        sharedServiceMock =
        {
            showNotification: jasmine.createSpy('showNotification')
        };

        await TestBed.configureTestingModule(
        {
            declarations: [ PlayersComponent ],
            imports: [ FormsModule ],
            providers: [
                { provide: WebService, useValue: webServiceMock },
                { provide: AuthService, useValue: authServiceMock },
                { provide: SharedService, useValue: sharedServiceMock }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(PlayersComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => 
    {
        expect(component).toBeTruthy();
    });

    it('should handle search correctly', () => 
    {
        component.search_query = 'John';
        component.search();
        expect(webServiceMock.searchPlayers).toHaveBeenCalledWith('John');
        expect(component.search_player_results).toEqual([]);
    });

    it('should navigate to first page', () => 
    {
        component.page = 2;
        component.firstPage();
        expect(component.page).toBe(1);
        expect(sessionStorage['page']).toBe('1');
        expect(webServiceMock.getAllPlayers).toHaveBeenCalledWith(1);
    });
});
