import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from '@auth0/auth0-angular';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { SharedService } from './shared.service';
import { WebService } from './web.service';

@Injectable(
{
    providedIn: 'root'
})

export class AuthGuard {

    constructor(private authService: AuthService,
                private sharedService: SharedService,
                private webService: WebService,
                private router: Router) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree>
    {
        return this.authService.isAuthenticated$.pipe(
            switchMap((isAuthenticated: boolean) =>
            {
                if(!isAuthenticated)
                {
                    return of(true);
                }

                return this.handleAuthenticatedUser();
            })
        );
    }

    private handleAuthenticatedUser(): Observable<boolean | UrlTree>
    {
        return this.authService.user$.pipe(
            take(1),
            switchMap((user) => this.handleUserDetails(user))
        );
    }

    private handleUserDetails(user: any): Observable<boolean | UrlTree>
    {
        const userData = { oauth_id: user?.sub };

        return this.webService.authUser(userData).pipe(
            tap((response: any) => console.log(response.code)),
            map((response: any) => this.handleAuthUserResponse(response))
        );
    }

    private handleAuthUserResponse(response: any): boolean | UrlTree
    {
        if(response.code === "DETAILS_REQUIRED")
        {
            const formCompleted = this.sharedService.isUserFormCompleted();

            if(!formCompleted)
            {
                this.sharedService.showNotification("Please complete the user details form.", "error");
                return this.router.createUrlTree(['/user-details']);
            }
        }
        return true;
    }
}
