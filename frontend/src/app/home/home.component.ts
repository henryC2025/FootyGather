import { Component } from "@angular/core";
import { AuthService } from "@auth0/auth0-angular";
import { Router } from "@angular/router";
import { WebService } from "../web.service";
import { SharedService } from "../shared.service";

@Component({
    selector: 'app-home',
    templateUrl: 'home.component.html',
    styleUrls: ['home.component.css']
})

export class HomeComponent 
{
    constructor(public authService : AuthService,
                public webService : WebService,
                public sharedService : SharedService,
                public router : Router) {}

    ngOnInit()
    {
        //this.sharedService.authUser();
        // // DIRECT TO A PAGE
        // this.router.navigate(['/profile']);
    }

    testConnection()
    {
        this.webService.testConnection().subscribe(
            (response) =>
            {
                // The observable emitted a value (data)
                console.log('Data received:', response);
            },
            (error) =>
            {
                // Handle error if there is any
                console.error('Error fetching data:', error);
            }
        );
    }
}