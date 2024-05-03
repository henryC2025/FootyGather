import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VenueComponent } from './venue.component';
import { WebService } from '../web.service';
import { AuthService } from '@auth0/auth0-angular';
import { SharedService } from '../shared.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

describe('VenueComponent', () =>
{
    let component: VenueComponent;
    let fixture: ComponentFixture<VenueComponent>;
    let webServiceMock: any;
    let authServiceMock: any;
    let sharedServiceMock: any;
    let routeMock: any;
    let routerMock: any;

    beforeEach(async () =>
    {
        webServiceMock =
        {
            getVenueByID: jasmine.createSpy('getVenueByID').and.returnValue(of([])),
            getLikesDislikesFromVenue: jasmine.createSpy('getLikesDislikesFromVenue').and.returnValue(of(
            {
                likes: 10,
                dislikes: 5
            })),
            deleteVenue: jasmine.createSpy('deleteVenue').and.returnValue(of([])),
            deleteVenueImage: jasmine.createSpy('deleteVenueImage').and.returnValue(of([])),
            addLike: jasmine.createSpy('addLike').and.returnValue(of([])),
            addDislike: jasmine.createSpy('addDislike').and.returnValue(of([]))
        };

        authServiceMock =
        {
            user$: of({ sub: 'auth0|123456', nickname: 'testuser', email: 'test@example.com' })
        };

        sharedServiceMock =
        {
            showNotification: jasmine.createSpy('showNotification'),
            showUpdateVenueDialog: jasmine.createSpy('showUpdateVenueDialog')
        };

        routeMock =
        {
            snapshot:
            {
                params:
                {
                    id: '1'
                }
            },
            paramMap: of(new Map([['id', '1']]))
        };

        routerMock =
        {
            navigate: jasmine.createSpy('navigate')
        };

        await TestBed.configureTestingModule({
            declarations: [VenueComponent],
            providers: [
                { provide: WebService, useValue: webServiceMock },
                { provide: AuthService, useValue: authServiceMock },
                { provide: SharedService, useValue: sharedServiceMock },
                { provide: ActivatedRoute, useValue: routeMock },
                { provide: Router, useValue: routerMock }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(VenueComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () =>
    {
        expect(component).toBeTruthy();
    });

    it('should load venue details on initialization', () =>
    {
        expect(webServiceMock.getVenueByID).toHaveBeenCalledWith('1');
        expect(component.venue_list).toBeTruthy();
    });

    it('should handle delete venue confirmation correctly', () =>
    {
        spyOn(window, 'confirm').and.returnValue(true);
        component.onDeleteVenue('1', '123', 'path/to/image');
        expect(webServiceMock.deleteVenue).toHaveBeenCalledWith('1');
        expect(routerMock.navigate).toHaveBeenCalledWith(['/venues']);
    });
});
