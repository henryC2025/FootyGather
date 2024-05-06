import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { VenuesComponent } from './venues.component';
import { AuthService } from '@auth0/auth0-angular';
import { WebService } from '../web.service';
import { SharedService } from '../shared.service';
import { of } from 'rxjs';
import { FormsModule } from '@angular/forms';

describe('VenuesComponent', () =>
{
    let component: VenuesComponent;
    let fixture: ComponentFixture<VenuesComponent>;

    beforeEach(waitForAsync(() =>
    {
        const authServiceMock = 
        {
            user$: of
            ({
                sub: 'auth0|123456',
                nickname: 'testuser',
                email: 'test@example.com'
            })
        };

        const webServiceMock = 
        {
            getVenues: jasmine.createSpy('getVenues').and.returnValue(of([])),
            getCountOfVenues: jasmine.createSpy('getCountOfVenues').and.returnValue(of(1)),
            getUserDetails: jasmine.createSpy('getUserDetails').and.returnValue(of({ is_admin: true }))
        };

        const sharedServiceMock = 
        {
            showAddVenueDialog: jasmine.createSpy('showAddVenueDialog'),
            venue_added: of()
        };

        TestBed.configureTestingModule(
        {
            declarations: [VenuesComponent],
            imports: [FormsModule],
            providers: 
            [
                { provide: AuthService, useValue: authServiceMock },
                { provide: WebService, useValue: webServiceMock },
                { provide: SharedService, useValue: sharedServiceMock }
            ]
        }).compileComponents();
    }));

    beforeEach(() =>
    {
        fixture = TestBed.createComponent(VenuesComponent);
        component = fixture.componentInstance;
        sessionStorage.clear();
        sessionStorage.setItem('page', '1');
        fixture.detectChanges();
    });

    it('should create', () =>
    {
        expect(component).toBeTruthy();
    });

    it('should initialize with default values', waitForAsync(() =>
    {
        component.venue_list.subscribe((data : any) =>
        {
            expect(data).toEqual([]);
            fixture.detectChanges();
        });
    }));

    it('should call getVenues and getCountOfVenues on ngOnInit', waitForAsync(() =>
    {
        fixture.whenStable().then(() => 
        {
            expect(component.webService.getVenues).toHaveBeenCalledWith(1);
            expect(component.webService.getCountOfVenues).toHaveBeenCalled();
            expect(component.total_pages).toEqual(1);
        });

        component.ngOnInit();
        fixture.detectChanges();
    }));

    it('should call getUserDetails on ngOnInit', waitForAsync(() =>
    {
        fixture.whenStable().then(() => 
        {
            expect(component.webService.getUserDetails).toHaveBeenCalled();
            expect(component.is_admin).toBeFalse();
        });

        component.ngOnInit();
        fixture.detectChanges();
    }));

    it('should call showAddVenueDialog on onAddVenue', () =>
    {
        component.onAddVenue();
        expect(component.sharedService.showAddVenueDialog).toHaveBeenCalled();
    });
});
