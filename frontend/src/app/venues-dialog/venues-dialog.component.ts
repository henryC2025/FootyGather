import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '@auth0/auth0-angular';
import { WebService } from '../web.service';
import { SharedService } from '../shared.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-venues-dialog',
  templateUrl: './venues-dialog.component.html',
  styleUrl: './venues-dialog.component.css'
})
export class VenuesDialogComponent {

    constructor(public authService : AuthService,
                public webService : WebService,
                public sharedService : SharedService,
                public router : Router,
                public dialogRef: MatDialogRef<VenuesDialogComponent>){}
    
    ngOnInit()
    {

    }

    onClose()
    {
        this.dialogRef.close();
    }
}
