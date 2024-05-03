import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '@auth0/auth0-angular';
import { SharedService } from '../shared.service';
import { WebService } from '../web.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { CommunityComponent } from './community.component';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';

describe('CommunityComponent', () =>
{
    let component: CommunityComponent;
    let fixture: ComponentFixture<CommunityComponent>;
    let authServiceMock: any;
    let webServiceMock: any;
    let sharedServiceMock: any;
    let routerMock: any;
    let routeMock: any;

    beforeEach(async () =>
    {
        authServiceMock =
        {
            user$: of({ sub: 'auth0|123456', nickname: 'testuser', email: 'test@example.com' }),
            isAuthenticated$: of(true)
        };
        webServiceMock =
        {
            // getCommunityByID: jasmine.createSpy('getCommunityByID').and.returnValue(of([])),
            getCommunityByID: jasmine.createSpy('getCommunityByID').and.returnValue(of([
            {
                id: '1',
                creator_oauth_id: 'auth0|123456',
                name: 'Sample Community',
                description: 'A great place to engage',
                rules: 'Be kind',
                location: 'Virtual',
                image: ['path/to/image.jpg', '', ''],
                players: [{ user_id: '123', nickname: 'PlayerOne', email: 'player@example.com' }],
                comments: [{ id: 'c1', content: 'Nice community!' }]
            }])),
            getSortedCommunityComments: jasmine.createSpy('getSortedCommunityComments').and.returnValue(of([])),
            deleteCommunity: jasmine.createSpy('deleteCommunity').and.returnValue(of({})),
            deleteCommunityImage: jasmine.createSpy('deleteCommunityImage').and.returnValue(of({})),
            joinCommunity: jasmine.createSpy('joinCommunity').and.returnValue(of({})),
            leaveCommunity: jasmine.createSpy('leaveCommunity').and.returnValue(of({})),
        };
        sharedServiceMock =
        {
            showNotification: jasmine.createSpy('showNotification'),
        };
        routerMock =
        {
            navigate: jasmine.createSpy('navigate')
        };
        routeMock =
        {
            snapshot:
            {
                params: { id: '1' }
            },
            paramMap: of(new Map([['id', '1']]))
        };

        await TestBed.configureTestingModule(
        {
            declarations: [ CommunityComponent ],
            imports: [ HttpClientTestingModule, RouterTestingModule ],
            providers: [
                { provide: AuthService, useValue: authServiceMock },
                { provide: WebService, useValue: webServiceMock },
                { provide: SharedService, useValue: sharedServiceMock },
                { provide: Router, useValue: routerMock },
                { provide: ActivatedRoute, useValue: routeMock }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(CommunityComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () =>
    {
        expect(component).toBeTruthy();
    });

    it('should handle delete community if user is an admin or creator', () =>
    {
        component.is_admin = true;
        component.creator_id = 'auth0|123456';
        spyOn(window, 'confirm').and.returnValue(true);

        component.onDeleteCommunity('1', 'imageId', 'imagePath');
        expect(webServiceMock.deleteCommunity).toHaveBeenCalledWith('1');
    });

    it('should initialize community details on ngOnInit', () =>
    {
        expect(webServiceMock.getCommunityByID).toHaveBeenCalledWith('1');
    });

    it('should handle joining a community', () =>
    {
        component.is_authenticated = true;
        component.is_player_joined = false;
        spyOn(window, 'confirm').and.returnValue(true);

        component.onJoinCommunity();

        expect(webServiceMock.joinCommunity).toHaveBeenCalled();
        expect(sharedServiceMock.showNotification).not.toHaveBeenCalledWith("Please sign in to join a community", "error");
    });

    it('should handle leaving a community', () =>
    {
        component.is_player_joined = true;
        spyOn(window, 'confirm').and.returnValue(true);
        component.onLeaveCommunity();
        expect(webServiceMock.leaveCommunity).toHaveBeenCalled();
    });

    it('should allow an admin or creator to delete a community', () =>
    {
        component.is_admin = true;
        spyOn(window, 'confirm').and.returnValue(true);
        component.onDeleteCommunity('1', 'imageId', 'imagePath');

        expect(webServiceMock.deleteCommunity).toHaveBeenCalledWith('1');
        expect(routerMock.navigate).toHaveBeenCalledWith(['/communities']);
    });
});
