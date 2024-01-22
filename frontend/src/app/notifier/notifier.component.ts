import { Component, Inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { SharedService } from '../shared.service';
import { AuthService } from '@auth0/auth0-angular';
import { WebService } from '../web.service';
import { Router } from '@angular/router';
import { MAT_SNACK_BAR_DATA, MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';

@Component({
  selector: 'app-notifier',
  templateUrl: './notifier.component.html',
  styleUrl: './notifier.component.css'
})
export class NotifierComponent {

    constructor(public authService : AuthService,
                public webService : WebService,
                public sharedService : SharedService,
                public router : Router,
                public snackBarRef : MatSnackBarRef<NotifierComponent>,
                @Inject(MAT_SNACK_BAR_DATA) public data : any){}
    
    ngOnInit()
    {

    }
}
