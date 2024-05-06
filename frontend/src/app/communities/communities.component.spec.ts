import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
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
            getCommunities: jasmine.createSpy().and.returnValue(of([])),
            getSortedCommunities: jasmine.createSpy().and.returnValue(of({})),
            searchCommunity: jasmine.createSpy().and.returnValue(of([])),
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

    it('should fetch communities on initialization', () =>
    {
        expect(webServiceMock.getAllCommunities).toHaveBeenCalled();
    });

    it('should calculate total pages when count of communities is fetched', () =>
    {
        expect(webServiceMock.getCountOfCommunities).toHaveBeenCalled();
        fixture.whenStable().then(() =>
        {
            expect(component.total_pages).toEqual(1);
        });
    });

    it('should navigate to next page correctly', () =>
    {
        component.page = 1;
        component.total_pages = 3;
        component.nextPage();
        expect(component.page).toBe(2);
        expect(sessionStorage['page']).toBe('2');
    });

    it('should search communities based on query', () =>
    {
        component.search_query = "test";
        component.search();
        expect(webServiceMock.searchCommunity).toHaveBeenCalledWith("test");
    });

    it('should reset search when query is empty', () =>
    {
        component.search_query = "";
        component.search();
        expect(webServiceMock.searchCommunity).not.toHaveBeenCalled();
    });

    it('should correctly sort communities when sort option changes', () =>
    {
        component.selected_sort_option = 'closest';
        component.onSortChange();

        expect(webServiceMock.getSortedCommunities).toHaveBeenCalledWith('closest');
        expect(webServiceMock.getSortedCommunities).toHaveBeenCalledTimes(1);
        expect(component.selected_sort_option).toBe('closest');
    });
});
