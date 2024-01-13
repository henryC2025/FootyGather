import { Component } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { Router } from '@angular/router';
import { WebService } from '../web.service';
import { SharedService } from '../shared.service';

@Component({
  selector : 'app-auth',
  templateUrl : 'auth.component.html',
  styleUrls : ['auth.component.css']
})

export class AuthComponent 
{
  constructor(public authService : AuthService,
              public webService : WebService,
              public sharedService : SharedService,
              public router : Router) {}

  ngOnInit()
  {
    
  }

  loginWithRedirect(): void
  {
    this.authService.loginWithRedirect(
    {
        appState: { target: this.router.url }
    })
  }

  logout(): void
  {
    this.authService.logout();
  }
}
