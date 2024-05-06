import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '@auth0/auth0-angular';
import { SharedService } from '../shared.service';
import { WebService } from '../web.service';
import { of } from 'rxjs';
import { ProfileComponent } from './profile.component';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';

describe('ProfileComponent', () =>
{
    let component: ProfileComponent;
    let fixture: ComponentFixture<ProfileComponent>;
    let authServiceMock: any;
    let webServiceMock: any;
    let sharedServiceMock: any;

    beforeEach(async () =>
    {
        authServiceMock =
        {
            user$: of({ sub: 'auth0|123456', nickname: 'testuser', email: 'test@example.com' }),
            isAuthenticated$: of(true),
            logout: jasmine.createSpy('logout').and.returnValue(of({})),
        };
        webServiceMock =
        {
            getUserDetails: jasmine.createSpy('getUserDetails').and.returnValue(of(
            {
                _id: 'user123',
                name: 'John Doe'
            })),
            getPlayerCommunities: jasmine.createSpy('getPlayerCommunities').and.returnValue(of([])),
            getSortedPlayerCurrentGames: jasmine.createSpy('getSortedPlayerCurrentGames').and.returnValue(of([])),
            deleteProfileImage: jasmine.createSpy('deleteProfileImage').and.returnValue(of({})),
            deleteUser: jasmine.createSpy('deleteUser').and.returnValue(of({})),
        };
        sharedServiceMock =
        {
            showNotification: jasmine.createSpy('showNotification'),
            showUpdateUserDetailsDialog: jasmine.createSpy('showUpdateUserDetailsDialog'),
        };

        await TestBed.configureTestingModule(
        {
            declarations: [ProfileComponent],
            imports: [HttpClientTestingModule, RouterTestingModule],
            providers: [
                { provide: AuthService, useValue: authServiceMock },
                { provide: WebService, useValue: webServiceMock },
                { provide: SharedService, useValue: sharedServiceMock }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(ProfileComponent);
        component = fixture.componentInstance;
    });

    it('should create', () =>
    {
        expect(component).toBeTruthy();
    });

    it('should load user details on initialization', fakeAsync(() =>
    {
        fixture.detectChanges();
        tick(); 
        expect(webServiceMock.getUserDetails).toHaveBeenCalled();
    }));

    it('should fetch user details and player communities on initialization', fakeAsync(() =>
    {
        spyOn(component, 'initProfile');
        fixture.detectChanges();
        tick();
        expect(webServiceMock.getUserDetails).toHaveBeenCalledOnceWith({ oauth_id: 'auth0|123456' });
        expect(component.initProfile).toHaveBeenCalled();
        expect(webServiceMock.getPlayerCommunities).toHaveBeenCalledWith('user123');
    }));

    it('should handle authentication failure', () =>
    {
        authServiceMock.user$ = of(null);
        fixture = TestBed.createComponent(ProfileComponent);
        component = fixture.componentInstance;
        spyOn(component.router, 'navigate');
        fixture.detectChanges();
        expect(sharedServiceMock.showNotification).toHaveBeenCalledWith("Please sign in to access the profile page.", "error");
        expect(component.router.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should handle page navigation actions correctly', () =>
    {
        component.current_games_total_pages = 5;
        component.current_games_page = 3;
        component.lastGamesPage('current');
        expect(component.current_games_page).toBe(5);
        component.previousGamesPage('current');
        expect(component.current_games_page).toBe(4);
        component.nextGamesPage('current');
        expect(component.current_games_page).toBe(5);
    });

    it('should update user details when onUpdateUserDetails is called', () =>
    {
        component.onUpdateUserDetails();
        expect(sharedServiceMock.showUpdateUserDetailsDialog).toHaveBeenCalled();
    });
    
    it('should confirm before deleting user', () =>
    {
        spyOn(window, 'confirm').and.returnValue(true);
        component.onDeleteUser('auth0|123456', 'img123', '/path/to/image');
        expect(webServiceMock.deleteProfileImage).toHaveBeenCalledWith('img123', '/path/to/image');
        expect(webServiceMock.deleteUser).toHaveBeenCalledWith('auth0|123456');
    });
    
});
