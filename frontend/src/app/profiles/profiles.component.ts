import { Component } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { SharedService } from '../shared.service';
import { WebService } from '../web.service';
import { ActivatedRoute, Route, Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profiles.component.html',
  styleUrls: ['./profiles.component.css']
})

export class ProfilesComponent
{
    user : any;
    user_details : any = [];

    constructor(public authService : AuthService,
                public webService : WebService,
                public sharedService : SharedService,
                public router : Router,
                public route : ActivatedRoute) {}

    ngOnInit()
    {
        this.authService.user$.subscribe(user =>
        {
            this.authService.isAuthenticated$.subscribe(
            {
                next : (response : any) =>
                {
                    if(response === false)
                    {
                        this.sharedService.showNotification("Please sign in to view other users.", "error");
                        this.router.navigate(['/']);
                    }
                    this.user = user;

                    if(this.user)
                    {
                        this.webService.getProfileUserDetails(this.route.snapshot.params['id']).subscribe(
                        {
                            next : (data : any) =>
                            {
                                this.user_details = data;
                            },
                            error : (error) =>
                            {
                                console.log("An error occured getting user details: ", error);
                            }
                        })
                    }
                },
                error : (error) =>
                {
                    console.log("An error occured when authenticating user: ", error);
                }
            });
        });
    }

    onUpdateUserDetails()
    {
        this.sharedService.showUpdateUserDetailsDialog();
    }

    onDeleteUser(oauth_id : any, image_id : any, image_path : any)
    {
        const prompt = window.confirm("Are you sure you want to delete your user details?");
        if(prompt)
        {
            this.webService.deleteProfileImage(image_id, image_path).subscribe(
            {
                next : () =>
                {
                    this.webService.deleteUser(oauth_id).subscribe(
                    {
                        next : () =>
                        {
                            this.authService.logout();
                            this.router.navigate(['/']);
                        },
                        error : (error) =>
                        {
                            this.sharedService.showNotification("Something went wrong when deleting user!", "error");
                            console.log(error);
                        }
                    })
                },
                error : (error) =>
                {
                    this.sharedService.showNotification("Something went wrong when deleting user image!", "error");
                    console.log(error);
                }
            })
        }
    }
}