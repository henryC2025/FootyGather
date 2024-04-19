import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommunitiesComponent } from './communities.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '@auth0/auth0-angular';
import { SharedService } from '../shared.service';
import { WebService } from '../web.service';
import { of } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';

describe('CommunitiesComponent', () =>
{
    let component: CommunitiesComponent;
    let fixture: ComponentFixture<CommunitiesComponent>;
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
            getAllCommunities: jasmine.createSpy().and.returnValue(of([])),
            getCountOfCommunities: jasmine.createSpy().and.returnValue(of({ count_of_communities: 5 })),
        };
        sharedServiceMock =
        {
            showNotification: jasmine.createSpy('showNotification'),
            showUpdateUserDetailsDialog: jasmine.createSpy('showUpdateUserDetailsDialog')
        };

        await TestBed.configureTestingModule(
        {
            declarations: [ CommunitiesComponent ],
            imports: [ HttpClientTestingModule, RouterTestingModule ],
            providers: [
                { provide: AuthService, useValue: authServiceMock },
                { provide: WebService, useValue: webServiceMock },
                { provide: SharedService, useValue: sharedServiceMock }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(CommunitiesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () =>
    {
        expect(component).toBeTruthy();
    });

    it('should handle user subscription correctly', () =>
    {
        expect(component.user).toEqual({ sub: 'auth0|123456', nickname: 'testuser', email: 'test@example.com' });
    });
});
