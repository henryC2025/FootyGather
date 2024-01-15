import { Component } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { WebService } from '../web.service';
import { SharedService } from '../shared.service';

@Component({
  selector: 'app-communities',
  templateUrl: './communities.component.html',
  styleUrl: './communities.component.css'
})
export class CommunitiesComponent
{
  constructor(public authService : AuthService,
              public webService : WebService,
              public sharedService : SharedService) {}

  ngOnInit()
  {

  }
}
