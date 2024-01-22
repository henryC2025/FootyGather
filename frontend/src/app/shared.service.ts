import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AuthService } from "@auth0/auth0-angular";
import { WebService } from "./web.service";
import { Router } from "@angular/router";
import { switchMap } from 'rxjs/operators';
import { EMPTY } from 'rxjs';
import { MatSnackBar } from "@angular/material/snack-bar";
import { NotifierComponent } from "./notifier/notifier.component";

@Injectable()
export class SharedService
{

    private isAuthCalled = false;
    private user : any;
    private oauthID : any;
    private isAuthenticated : any;

    constructor(private http : HttpClient,
                private snackBar : MatSnackBar,
                public authService : AuthService,
                public webService : WebService,
                public router : Router) {}

    showNotification(displayMessage : string, buttonText : string, messageType: 'success' | 'error' )
    {
        this.snackBar.openFromComponent(NotifierComponent, 
        {
            data:
            {
                message: displayMessage,
                buttonText : buttonText,
                messageType : messageType
            },
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: messageType,
        })
    }
    
    setAuthCalled(value : boolean)
    {
        this.isAuthCalled = value;
    }

    getAuthCalled()
    {
        return this.isAuthCalled;
    }

    resetAuthCalled()
    {
        this.isAuthCalled = false;
    }

    addAdditionalDetails()
    {

    }

    // SWITCH MAP USED TO MAKE SUBSCRIPTIONS CLEANER
    // ALLOW OBSERVERABLES TO EMIT ANOTHER OBSERVABLE
    authUser()
    {
        this.authService.isAuthenticated$.pipe(
            switchMap((isAuthenticated: boolean) =>
            {
                this.isAuthenticated = isAuthenticated;

                if (this.isAuthenticated)
                {
                    return this.authService.user$;
                }
                else
                {
                    console.log("Not authenticated");
                    return EMPTY; // Return an empty observable if not authenticated
                }
            }),
            switchMap((user) =>
            {
                this.user = user;
                console.log(this.user?.sub);

                const userData =
                {
                    oauth_id: this.user?.sub,
                };

                if (!this.getAuthCalled())
                {
                    return this.webService.authUser(userData);
                }
                else
                {
                    console.log("Auth already called!");
                    return EMPTY; // Return an empty observable if auth is already called
                }
            })
        ).subscribe(
        {
            next: (response: any) =>
            {
                console.log(response.code);

                if (response.code === "ASK_FOR_DETAILS")
                {
                    // window.alert("More Details Needed!");
                    this.router.navigate(['/user-details']);
                    // ONLY UPON SUCESSFULL REGISTRATION
                    // SET AUTHCALLED TO TRUE
                }
                else
                {
                    // TO DO: CARRY ON
                    this.setAuthCalled(true);
                    console.log("AUTH IS SET TO TRUE - INSIDE ELSE BLOCK");
                }
            },
            error: (error) =>
            {
                console.error('Error sending user information:', error);
            },
        });
    }
}
