import { Component } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { SharedService } from '../shared.service';
import { WebService } from '../web.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})

export class ContactComponent
{

  constructor(public authService : AuthService,
              public webService : WebService,
              public sharedService : SharedService) {}

  ngOnInit()
  {
    
  }
}