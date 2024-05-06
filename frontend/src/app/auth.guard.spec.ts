import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { of } from 'rxjs';
import { AuthGuard } from './auth.guard';
import { AuthService } from '@auth0/auth0-angular';
import { SharedService } from './shared.service';
import { WebService } from './web.service';

class MockAuthService
{
    private _isAuthenticated$ = of(false);

    get isAuthenticated$()
    {
        return this._isAuthenticated$;
    }

    setIsAuthenticated$(value: boolean)
    {
        this._isAuthenticated$ = of(value);
    }

    user$ = of({});
}

class MockSharedService
{
    isUserFormCompleted()
    {
        return false;
    }
    showNotification(message: string, type: string) {}
}

class MockWebService
{
    authUser(userData: any)
    {
        return of({ code: '' });
    }
}

describe('AuthGuard', () =>
{
    let guard: AuthGuard;
    let authService: MockAuthService;
    let router: Router;

    const mockActivatedRouteSnapshot = {} as ActivatedRouteSnapshot;
    const mockRouterStateSnapshot = { url: '/test-url' } as RouterStateSnapshot;

    beforeEach(() =>
    {
        TestBed.configureTestingModule(
        {
            imports: [RouterTestingModule.withRoutes([])],
            providers: [
              AuthGuard,
              { provide: AuthService, useClass: MockAuthService },
              { provide: SharedService, useClass: MockSharedService },
              { provide: WebService, useClass: MockWebService },
            ],
        });

        guard = TestBed.inject(AuthGuard);
        authService = TestBed.inject(AuthService as any);
        router = TestBed.inject(Router);
    });

    it('should be created', () =>
    {
        expect(guard).toBeTruthy();
    });

    it('should block access for unauthenticated users', (done: DoneFn) =>
    {
        authService.setIsAuthenticated$(false);

        guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot).subscribe((result) =>
        {
            expect(result).toEqual(true);
            done();
        });
    });
});
