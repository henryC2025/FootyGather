import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfilesComponent } from './profiles.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '@auth0/auth0-angular';
import { SharedService } from '../shared.service';
import { WebService } from '../web.service';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

describe('ProfilesComponent', () =>
{
    let component: ProfilesComponent;
    let fixture: ComponentFixture<ProfilesComponent>;
    let authServiceMock: any;
    let webServiceMock: any;
    let sharedServiceMock: any;
    let activatedRouteMock: any;

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
            getProfileUserDetails: jasmine.createSpy('getProfileUserDetails').and.returnValue(of(
            {
                id: 'user123',
                name: 'Test',
                email: 'test@example.com'
            })),
            deleteUser: jasmine.createSpy('deleteUser').and.returnValue(of({})),
            deleteProfileImage: jasmine.createSpy('deleteProfileImage').and.returnValue(of({}))
        };
        sharedServiceMock =
        {
            showNotification: jasmine.createSpy('showNotification'),
            showUpdateUserDetailsDialog: jasmine.createSpy('showUpdateUserDetailsDialog')
        };

        activatedRouteMock =
        {
            snapshot:
            {
                params: { id: 'user123' }
            }
        };


        await TestBed.configureTestingModule(
        {
            declarations: [ ProfilesComponent ],
            imports: [ HttpClientTestingModule, RouterTestingModule ],
            providers: [
                { provide: AuthService, useValue: authServiceMock },
                { provide: WebService, useValue: webServiceMock },
                { provide: SharedService, useValue: sharedServiceMock },
                { provide: ActivatedRoute, useValue: activatedRouteMock }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ProfilesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () =>
    {
        expect(component).toBeTruthy();
    });

    it('should load user details from the service on init', () =>
    {
        expect(webServiceMock.getProfileUserDetails).toHaveBeenCalledWith('user123');
        expect(component.user_details).toEqual(
        {
            id: 'user123',
            name: 'Test',
            email: 'test@example.com'
        });
    });

    it('should handle update user details', () =>
    {
        component.onUpdateUserDetails();
        expect(sharedServiceMock.showUpdateUserDetailsDialog).toHaveBeenCalled();
    });

    it('should delete user details upon confirmation', () =>
    {
        spyOn(window, 'confirm').and.returnValue(true);
        const oauth_id = 'auth0|123456';
        const image_id = 'img123';
        const image_path = 'path/to/image.jpg';
        component.onDeleteUser(oauth_id, image_id, image_path);
        expect(webServiceMock.deleteProfileImage).toHaveBeenCalledWith(image_id, image_path);
        expect(webServiceMock.deleteUser).toHaveBeenCalledWith(oauth_id);
    });

    it('should not delete user if not confirmed', () =>
    {
        spyOn(window, 'confirm').and.returnValue(false);
        const oauth_id = 'auth0|123456';
        const image_id = 'img123';
        const image_path = 'path/to/image.jpg';
        component.onDeleteUser(oauth_id, image_id, image_path);
        expect(webServiceMock.deleteProfileImage).not.toHaveBeenCalled();
        expect(webServiceMock.deleteUser).not.toHaveBeenCalled();
    });
});
