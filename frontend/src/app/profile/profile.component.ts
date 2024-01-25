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

    ngOnInit()
    {
        this.authService.user$.subscribe(user =>
        {
            this.user = user;
        });

        this.authService.isAuthenticated$.subscribe(response =>
        {
            if(response === false)
            {
                this.sharedService.showNotification("Please sign in to access the profile page.", "error");
                this.router.navigate(['/']);
            }
        });
    }
}
