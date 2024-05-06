import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AllGamesComponent } from './all-games.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '@auth0/auth0-angular';
import { SharedService } from '../shared.service';
import { WebService } from '../web.service';
import { of, throwError } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';

describe('AllGamesComponent', () =>
{
    let component: AllGamesComponent;
    let fixture: ComponentFixture<AllGamesComponent>;
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
            getAllCurrentGames: jasmine.createSpy('getAllCurrentGames').and.returnValue(of([])),
            getCountOfAllCurrentGames: jasmine.createSpy().and.returnValue(of({ count_of_current_games: 5 })),
            searchAllCurrentGames: jasmine.createSpy().and.returnValue(of([])),
        };
        sharedServiceMock =
        {
            showNotification: jasmine.createSpy('showNotification'),
        };

        await TestBed.configureTestingModule(
        {
            declarations: [ AllGamesComponent ],
            imports: [ HttpClientTestingModule, RouterTestingModule ],
            providers: [
                { provide: AuthService, useValue: authServiceMock },
                { provide: WebService, useValue: webServiceMock },
                { provide: SharedService, useValue: sharedServiceMock }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(AllGamesComponent);
        component = fixture.componentInstance;
        sessionStorage.clear();
        sessionStorage.setItem('page', '1');
        fixture.detectChanges();
    });

    it('should create', () =>
    {
        expect(component).toBeTruthy();
    });

    it('should fetch all current games and total count on initialization', () =>
    {
        expect(webServiceMock.getAllCurrentGames).toHaveBeenCalledWith('default', 1);
        expect(webServiceMock.getCountOfAllCurrentGames).toHaveBeenCalled();
    });

    it('should perform search and update search results', () =>
    {
        component.search_query = "football";
        component.search();
        expect(webServiceMock.searchAllCurrentGames).toHaveBeenCalledWith("football");
        expect(component.search_results).toEqual([]);
    });

    it('should fetch games with new sort option when onSortChange is called', () =>
    {
        component.selected_sort_option = 'closest';
        component.onSortChange();
        expect(webServiceMock.getAllCurrentGames).toHaveBeenCalledWith('closest', component.page);
    });
});
