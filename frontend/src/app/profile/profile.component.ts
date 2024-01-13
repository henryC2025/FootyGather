import { Component } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { SharedService } from '../shared.service';
import { WebService } from '../web.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})

export class ProfileComponent {

  constructor(public authService : AuthService,
              public webService : WebService,
              public sharedService : SharedService) {}
  
  user : any;

  ngOnInit()
  {
    this.authService.user$.subscribe(user => {
      this.user = user;
    });
  }
  
}
