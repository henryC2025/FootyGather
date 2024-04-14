import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';  // Import FormsModule
import { of } from 'rxjs';
import { GamesComponent } from './games.component';
import { WebService } from '../web.service';
import { AuthService } from '@auth0/auth0-angular';
import { SharedService } from '../shared.service';
import { ActivatedRoute, Router } from '@angular/router';

describe('GamesComponent', () =>
{
    let component: GamesComponent;
    let fixture: ComponentFixture<GamesComponent>;
    let authServiceMock: any;
    let webServiceMock: any;
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
            getCurrentCommunityGames: jasmine.createSpy().and.returnValue(of([])),
            getPreviousCommunityGames: jasmine.createSpy().and.returnValue(of([])),
            getCommunityByID: jasmine.createSpy().and.returnValue(of([{ name: 'Community Name' }])),
            getCountOfCurrentCommunityGames: jasmine.createSpy().and.returnValue(of({ count_of_current_games: 5 })),
            getCountOfPreviousCommunityGames: jasmine.createSpy().and.returnValue(of({ count_of_previous_games: 3 }))
        };
        sharedServiceMock =
        {
            showNotification: jasmine.createSpy('showNotification')
        };
        routeMock =
        {
            paramMap: of({ get: () => '1' })
        };
        routerMock =
        {
            navigate: jasmine.createSpy('navigate')
        };

        await TestBed.configureTestingModule(
        {
            declarations: [ GamesComponent ],
            imports: [
                HttpClientTestingModule, 
                RouterTestingModule,
                FormsModule
            ],
            providers: [
                { provide: WebService, useValue: webServiceMock },
                { provide: AuthService, useValue: authServiceMock },
                { provide: SharedService, useValue: sharedServiceMock },
                { provide: ActivatedRoute, useValue: routeMock },
                { provide: Router, useValue: routerMock }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(GamesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
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
});
