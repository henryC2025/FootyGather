import { Component } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { WebService } from '../web.service';
import { SharedService } from '../shared.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrl: './user-details.component.css'
})
export class UserDetailsComponent {

    detailsForm: FormGroup;
    user : any;

    constructor(public authService : AuthService,
                public webService : WebService,
                public sharedService : SharedService,
                public router : Router,
                private fb: FormBuilder)
                {
                    this.detailsForm = this.fb.group(
                    {
                        // Add more fields for football-related details
                        location: ['', Validators.required],
                        description: [''],
                        experience: [''],
                        subscribeToNotifications: [false],
                    });
                }
                
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
                window.alert("Please sign in to access this page")
                this.router.navigate(['/']);
            }
        });
    }


    onSubmit()
    {
        console.log("Details Added!")
        const subscribeToNotificationsValue = this.detailsForm?.get('subscribeToNotifications')?.value;
        console.log(subscribeToNotificationsValue);
    }

}
