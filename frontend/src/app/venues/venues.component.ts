import { Component } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { WebService } from '../web.service';
import { SharedService } from '../shared.service';

@Component({
  selector: 'app-venues',
  templateUrl: './venues.component.html',
  styleUrl: './venues.component.css'
})
export class VenuesComponent 
{
  constructor(public authService : AuthService,
              public webService : WebService,
              public sharedService : SharedService) {}

  ngOnInit()
  {

  }
}
