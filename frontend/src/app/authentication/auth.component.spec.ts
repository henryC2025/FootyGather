import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthComponent } from './auth.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '@auth0/auth0-angular';
import { SharedService } from '../shared.service';
import { WebService } from '../web.service';
import { of } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';

describe('AuthComponent', () =>
{
    let component: AuthComponent;
    let fixture: ComponentFixture<AuthComponent>;
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

        };
        sharedServiceMock =
        {
            showNotification: jasmine.createSpy('showNotification'),
        };

        await TestBed.configureTestingModule(
        {
            declarations: [ AuthComponent ],
            imports: [ HttpClientTestingModule, RouterTestingModule ],
            providers: [
                { provide: AuthService, useValue: authServiceMock },
                { provide: WebService, useValue: webServiceMock },
                { provide: SharedService, useValue: sharedServiceMock }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(AuthComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () =>
    {
        expect(component).toBeTruthy();
    });
});
