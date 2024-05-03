import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { GameComponent } from './game.component';
import { WebService } from '../web.service';
import { AuthService } from '@auth0/auth0-angular';
import { SharedService } from '../shared.service';
import { ActivatedRoute, Router } from '@angular/router';

describe('GameComponent', () =>
{
    let component: GameComponent;
    let fixture: ComponentFixture<GameComponent>;
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
            getUserDetails: jasmine.createSpy().and.returnValue(of([
            {
                oauth_id : 'test'
            }])),
            getAllCommunityGames: jasmine.createSpy().and.returnValue(of([])),
            getSortedGameComments: jasmine.createSpy().and.returnValue(of([])),
            getGamePlayerList: jasmine.createSpy().and.returnValue(of([])),
            getGameById: jasmine.createSpy().and.returnValue(of([
            {
                community: { community_id: '123' },
                status: 'current',
                date: new Date(),
                time: '18:00',
                creator: { oauth_id: 'auth0|123456' }
            }])),
            getGamePlayerCount: jasmine.createSpy().and.returnValue(of({ player_count: 22 })),
            joinGame: jasmine.createSpy().and.returnValue(of([])),
            leaveGame: jasmine.createSpy().and.returnValue(of([])),
            deleteGame: jasmine.createSpy().and.returnValue(of([])),
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
            declarations: [ GameComponent ],
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

        fixture = TestBed.createComponent(GameComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () =>
    {
        expect(component).toBeTruthy();
    });

    it('should initialize game details on ngOnInit', () =>
    {
        expect(webServiceMock.getGameById).toHaveBeenCalledWith('1');
        expect(webServiceMock.getGamePlayerList).toHaveBeenCalledWith('1');
        expect(webServiceMock.getGamePlayerCount).toHaveBeenCalledWith('1');
        expect(webServiceMock.getSortedGameComments).toHaveBeenCalledWith('1', 'newest');
    });

    it('should allow a user to join a game', () =>
    {
        spyOn(window, 'confirm').and.returnValue(true);
        component.onJoinGame();
        expect(webServiceMock.joinGame).toHaveBeenCalled();
    });

    it('should allow a user to leave a game', () =>
    {
        component.is_joined = true;
        spyOn(window, 'confirm').and.returnValue(true);
        component.onLeaveGame();
        expect(webServiceMock.leaveGame).toHaveBeenCalled();
    });

    it('should handle deleting a game by an admin or creator', () =>
    {
        component.is_admin = true;
        spyOn(window, 'confirm').and.returnValue(true);
        component.onDeleteGame();
        expect(webServiceMock.deleteGame).toHaveBeenCalled();
    });

    it('should handle errors when joining a game fails', () =>
    {
        spyOn(window, 'confirm').and.returnValue(true);
        webServiceMock.joinGame.and.returnValue(throwError(() => new Error('Failed to join')));
        component.onJoinGame();
        expect(sharedServiceMock.showNotification).toHaveBeenCalledWith('Failed to join the game. Please try again later.', 'error');
    });

    it('should handle user authentication and details', () =>
    {
        authServiceMock.isAuthenticated$ = of(true);
        component.ngOnInit();
        expect(webServiceMock.getUserDetails).toHaveBeenCalled(); 
    });
});
