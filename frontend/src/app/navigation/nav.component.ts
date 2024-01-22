import { Component } from "@angular/core";
import { AuthService } from "@auth0/auth0-angular";
import { Router } from "@angular/router";
import { WebService } from "../web.service";
import { SharedService } from "../shared.service";

@Component({
    selector: 'app-nav',
    templateUrl: 'nav.component.html',
    styleUrls: ['nav.component.css']
})

export class NavComponent 
{
    constructor(public authService : AuthService,
                public webService : WebService,
                public sharedService : SharedService,
                public router : Router) {}

    ngOnInit()
    {
        
    }
}