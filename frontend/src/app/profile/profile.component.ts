import { Component } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { SharedService } from '../shared.service';
import { WebService } from '../web.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})

export class ProfileComponent {

    constructor(public authService : AuthService,
                public webService : WebService,
                public sharedService : SharedService,
                public router : Router) {}

    user : any;
    user_details : any = [];

    ngOnInit()
    {
        this.authService.user$.subscribe(user =>
        {
            this.user = user;
            this.authService.isAuthenticated$.subscribe(
            {
                next : (response : any) =>
                {
                    if(response === false)
                    {
                        this.sharedService.showNotification("Please sign in to access the profile page.", "error");
                        this.router.navigate(['/']);
                    }

                    const form_data =
                    {
                        oauth_id : this.user?.sub,
                    }
                    console.log(form_data)
                    this.webService.getUserDetails(form_data).subscribe(
                    {
                        next : (data : any) =>
                        {
                            this.user_details = data;
                            console.log(this.user_details);
                        }
                    })
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
                        error : () =>
                        {
                            this.sharedService.showNotification("Something went wrong when deleting user!", "error");
                        }
                    })
                },
                error : () =>
                {
                    this.sharedService.showNotification("Something went wrong when deleting user image!", "error");
                }
            })
        }
    }
}
