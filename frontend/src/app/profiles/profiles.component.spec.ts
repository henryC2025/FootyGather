import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfilesComponent } from './profiles.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '@auth0/auth0-angular';
import { SharedService } from '../shared.service';
import { WebService } from '../web.service';
import { of } from 'rxjs';

describe('ProfilesComponent', () =>
{
    let component: ProfilesComponent;
    let fixture: ComponentFixture<ProfilesComponent>;
    let authServiceMock: any;
    let webServiceMock: any;
    let sharedServiceMock: any;

    beforeEach(async () =>
    {
        authServiceMock =
        {
            user$: of({ sub: 'auth0|123456', nickname: 'testuser', email: 'test@example.com' }),
            isAuthenticated$: of(true)
        };
        webServiceMock =
        {
            getProfileUserDetails: jasmine.createSpy('getProfileUserDetails').and.returnValue(of({})),
            deleteUser: jasmine.createSpy('deleteUser').and.returnValue(of({})),
            deleteProfileImage: jasmine.createSpy('deleteProfileImage').and.returnValue(of({}))
        };
        sharedServiceMock =
        {
            showNotification: jasmine.createSpy('showNotification'),
            showUpdateUserDetailsDialog: jasmine.createSpy('showUpdateUserDetailsDialog')
        };

        await TestBed.configureTestingModule(
        {
            declarations: [ ProfilesComponent ],
            imports: [ HttpClientTestingModule, RouterTestingModule ],
            providers: [
                { provide: AuthService, useValue: authServiceMock },
                { provide: WebService, useValue: webServiceMock },
                { provide: SharedService, useValue: sharedServiceMock }
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
});
