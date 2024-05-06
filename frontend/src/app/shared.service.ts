import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AuthService } from "@auth0/auth0-angular";
import { WebService } from "./web.service";
import { Router } from "@angular/router";
import { switchMap } from 'rxjs/operators';
import { EMPTY, Subject } from 'rxjs';
import { MatSnackBar } from "@angular/material/snack-bar";
import { NotifierComponent } from "./notifier/notifier.component";
import { VenuesAddDialogComponent } from './venues-add-dialog/venues-add-dialog.component';
import { MatDialog } from "@angular/material/dialog";
import { VenueUpdateDialogComponent } from "./venue-update-dialog/venue-update-dialog.component";
import { ProfileUpdateDialogComponent } from "./profile-update-dialog/profile-update-dialog.component";
import { CommunitiesAddDialogComponent } from "./communities-add-dialog/communities-add-dialog.component";
import { CommunityUpdateDialogComponent } from "./community-update-dialog/community-update-dialog.component";
import { CommunityAddCommentDialogComponent } from "./community-add-comment-dialog/community-add-comment-dialog.component";
import { GamesAddDialogComponent } from "./games-add-dialog/games-add-dialog.component";
import { GameUpdateDialogComponent } from "./game-update-dialog/game-update-dialog.component";
import { GameAddCommentDialogComponent } from "./game-add-comment-dialog/game-add-comment-dialog.component";

@Injectable()
export class SharedService
{
    community_added = new Subject<void>();
    community_comments_updated = new Subject<void>();
    venue_added = new Subject<void>();
    game_added = new Subject<void>();
    game_updated = new Subject<void>();
    game_comments_updated = new Subject<void>();
    private is_auth_called = false;
    private user_form_completed = false;
    private user : any;
    private is_authenticated : any;
    venue_data: any;
    community_data : any;

    constructor(private http : HttpClient,
                private snackBar : MatSnackBar,
                private dialog : MatDialog,
                public authService : AuthService,
                public webService : WebService,
                public router : Router) {}

    showAddVenueDialog()
    {
        const dialogRef = this.dialog.open(VenuesAddDialogComponent,
        {
            width: '400px',
            data: this.venue_data,
            hasBackdrop: true,
        });

        dialogRef.afterClosed().subscribe((result : any) =>
        {
            console.log('The dialog was closed');
        });
    }

    showAddCommunityCommentDialog(id : any)
    {
        const dialogRef = this.dialog.open(CommunityAddCommentDialogComponent,
        {
            width: '400px',
            data:
            {
                community_id : id
            },
            hasBackdrop: true,
        });

        dialogRef.afterClosed().subscribe((result : any) =>
        {
            console.log('The dialog was closed');
        });
    }

    showAddCommunityDialog()
    {
        const dialogRef = this.dialog.open(CommunitiesAddDialogComponent,
        {
            width: '400px',
            data: this.community_data,
            hasBackdrop: true,
        });

        dialogRef.afterClosed().subscribe((result : any) =>
        {
            console.log('The dialog was closed');
        });
    }

    showAddGameDialog(id : any, community_name : any)
    {
        const dialogRef = this.dialog.open(GamesAddDialogComponent,
        {
            width: '400px',
            data:
            {
                community_id : id,
                community_name : community_name,
            },
            hasBackdrop: true,
        });

        dialogRef.afterClosed().subscribe((result : any) =>
        {
            console.log('The dialog was closed');
        });
    }

    showUpdateVenueDialog(id : any)
    {
        const dialogRef = this.dialog.open(VenueUpdateDialogComponent,
        {
            width: '400px',
            data:
            {
                venue_id : id
            },
            hasBackdrop: true,
        });

        dialogRef.afterClosed().subscribe((result : any) =>
        {
            console.log('The dialog was closed');
        });
    }

    showUpdateGameDialog(id : any)
    {
        const dialogRef = this.dialog.open(GameUpdateDialogComponent,
        {
            width: '400px',
            data:
            {
                game_id : id
            },
            hasBackdrop: true,
        });

        dialogRef.afterClosed().subscribe((result : any) =>
        {
            console.log('The dialog was closed');
        });
    }

    showAddGameCommentDialog(id : any)
    {
        const dialogRef = this.dialog.open(GameAddCommentDialogComponent,
        {
            width: '400px',
            data:
            {
                game_id : id
            },
            hasBackdrop: true,
        });

        dialogRef.afterClosed().subscribe((result : any) =>
        {
            console.log('The dialog was closed');
        });
    }

    showUpdateCommunityDialog(id : any)
    {
        const dialogRef = this.dialog.open(CommunityUpdateDialogComponent,
        {
            width: '400px',
            data:
            {
                community_id : id
            },
            hasBackdrop: true,
        });

        dialogRef.afterClosed().subscribe((result : any) =>
        {
            console.log('The dialog was closed');
        });
    }

    showUpdateUserDetailsDialog()
    {
        const dialogRef = this.dialog.open(ProfileUpdateDialogComponent,
        {
            width: '400px',
            data:
            {
                
            },
            hasBackdrop: true,
        });

        dialogRef.afterClosed().subscribe((result : any) =>
        {
            console.log('The dialog was closed');
        });
    }

    showNotification(displayMessage : string, messageType : 'success' | 'error' )
    {
        this.snackBar.openFromComponent(NotifierComponent, 
        {
            data:
            {
                message: displayMessage,
                messageType : messageType
            },
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: messageType,
        })
    }

    setUserFormCompleted(value : boolean)
    {
        this.user_form_completed = value;
    }

    isUserFormCompleted()
    {
        return this.user_form_completed;
    }
    
    setAuthCalled(value : boolean)
    {
        this.is_auth_called = value;
    }

    getAuthCalled()
    {
        return this.is_auth_called;
    }

    resetAuthCalled()
    {
        this.is_auth_called = false;
    }

    authUser()
    {
        this.authService.isAuthenticated$.pipe(
            switchMap((isAuthenticated: boolean) =>
            {
                this.is_authenticated = isAuthenticated;

                if(this.is_authenticated)
                {
                    return this.authService.user$;
                }
                else
                {
                    console.log("Not authenticated");
                    return EMPTY;
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

                if(!this.getAuthCalled())
                {
                    return this.webService.authUser(userData);
                }
                else
                {
                    console.log("Auth already called!");
                    return EMPTY;
                }
            })
        ).subscribe(
        {
            next: (response: any) =>
            {
                console.log(response.code);

                if(response.code === "ASK_FOR_DETAILS")
                {
                    this.router.navigate(['/user-details']);
                }
                else
                {
                    this.setAuthCalled(true);
                }
            },
            error: (error) =>
            {
                console.error('Error sending user information:', error);
            },
        });
    }

    metersToMiles(meters : number)
    {
        const miles = meters / 1609.34;
        const roundedMiles = Math.round(miles * 100) / 100;
        return roundedMiles;
    }
}
