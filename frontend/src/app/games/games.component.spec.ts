import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { GamesComponent } from './games.component';
import { WebService } from '../web.service';
import { AuthService } from '@auth0/auth0-angular';
import { SharedService } from '../shared.service';
import { ActivatedRoute, Router } from '@angular/router';

describe('GamesComponent', () =>
{
    let component: GamesComponent;
    let fixture: ComponentFixture<GamesComponent>;
    let webServiceMock: any;
    let authServiceMock: any;
    let sharedServiceMock: any;
    let routeMock: any;
    let routerMock: any;

    beforeEach(async () =>
    {
        authServiceMock =
        {
            user$: of({ sub: 'auth0|123456', nickname: 'testuser', email: 'test@example.com' }),
            isAuthenticated$: of(true)
        };
        webServiceMock =
        {
            getAllCommunityGames: jasmine.createSpy().and.returnValue(of([])),
            getSortedCurrentCommunityGames: jasmine.createSpy().and.returnValue(of([])),
            getSortedPreviousCommunityGames: jasmine.createSpy().and.returnValue(of([])),
            getCurrentCommunityGames: jasmine.createSpy().and.returnValue(of([])),
            getPreviousCommunityGames: jasmine.createSpy().and.returnValue(of([])),
            getCommunityByID: jasmine.createSpy().and.returnValue(of([{ name: 'Community Name' }])),
            getCountOfCurrentCommunityGames: jasmine.createSpy().and.returnValue(of({ count_of_current_games: 20 })),
            getCountOfPreviousCommunityGames: jasmine.createSpy().and.returnValue(of({ count_of_previous_games: 15 }))
        };
        sharedServiceMock =
        {
            showNotification: jasmine.createSpy('showNotification'),
            showAddGameDialog: jasmine.createSpy('showAddGameDialog'),
            game_added: of(null)
        };
        routeMock =
        {
            paramMap: of({ get: () => '1' })
        };
        routerMock =
        {
            navigate: jasmine.createSpy('navigate')
        };

        await TestBed.configureTestingModule({
            declarations: [ GamesComponent ],
            imports: [
                HttpClientTestingModule, 
                RouterTestingModule,
                FormsModule
            ],
            providers: [
                { provide: AuthService, useValue: authServiceMock },
                { provide: WebService, useValue: webServiceMock },
                { provide: SharedService, useValue: sharedServiceMock },
                { provide: ActivatedRoute, useValue: routeMock },
                { provide: Router, useValue: routerMock }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(GamesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        webServiceMock.getCountOfCurrentCommunityGames.and.returnValue(throwError({ error: 'Error fetching count' }));
    });

    it('should create', () =>
    {
        expect(component).toBeTruthy();
    });

    it('should initialize community on init', () =>
    {
        expect(webServiceMock.getCommunityByID).toHaveBeenCalledWith('1');
        expect(component.community_id).toEqual('1');
    });

    it('should sort current games when sort option changes', () =>
    {
        component.community_id = '1';
        component.current_games_page = 1;
        component.selected_current_sort_option = 'closest_date';
    
        component.onSortCurrentGamesChange();
        expect(webServiceMock.getSortedCurrentCommunityGames).toHaveBeenCalledWith('1', 'closest_date', 1);
        expect(component.community_current_games_list).toBeTruthy();
    });
    
    it('should sort previous games when sort option changes', () =>
    {
        component.community_id = '1';
        component.previous_games_page = 1;
        component.selected_previous_sort_option = 'furthest_date';
    
        component.onSortPreviousGamesChange();
        expect(webServiceMock.getSortedPreviousCommunityGames).toHaveBeenCalledWith('1', 'furthest_date', 1);
        expect(component.community_previous_games_list).toBeTruthy();
    });

    it('should add a game and refresh the game list', () =>
    {
        spyOn(component, 'getCommunityGames').and.callThrough();
        component.community_id = '1';
        component.community_name = 'Community One';
        component.onAddGame();
        expect(sharedServiceMock.showAddGameDialog).toHaveBeenCalledWith('1', 'Community One');
    });
});
