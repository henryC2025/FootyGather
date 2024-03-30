import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '@auth0/auth0-angular';
import { WebService } from '../web.service';
import { SharedService } from '../shared.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { map } from 'rxjs';

@Component({
  selector: 'app-games-add-dialog',
  templateUrl: './games-add-dialog.component.html',
  styleUrl: './games-add-dialog.component.css'
})
export class GamesAddDialogComponent {
    game_form : any;
    community_id : any;
    user_id : any;
    oauth_id : any;
    selected_game_length : any;
    creator_id : any;
    venue_list : any;
    community_player_list : any;
    current_game_count : any;
    minimum_date : any;

    constructor(public authService : AuthService,
                public webService : WebService,
                public sharedService : SharedService,
                public router : Router,
                @Inject(MAT_DIALOG_DATA) public data : any,
                private fb : FormBuilder,
                public dialogRef : MatDialogRef<GamesAddDialogComponent>)
                {
                    this.game_form = this.fb.group(
                    {
                        game_name: ['', Validators.required],
                        game_venue: ['', Validators.required],
                        game_description: ['', Validators.required],
                        game_length: ['', Validators.required],
                        game_payment_type: ['', Validators.required],
                        game_size: ['', Validators.required],
                        game_type: ['', Validators.required],
                        game_price: [0, [Validators.required, Validators.min(0)]],
                        game_date : ['', Validators.required],
                        game_time : ['', Validators.required],
                    })
                }

    ngOnInit()
    {
        //this.venue_list = this.webService.getAllVenues();
        this.webService.getAllVenues().subscribe((venues: any) =>
        {
            this.venue_list = venues.map((venue: any) => (
            {
                id: venue._id,
                name: venue.name
            }));
        });
        const today = new Date();
        this.minimum_date = today.toISOString().split('T')[0];
    }

    public onSubmit()
    {
        if(this.game_form.valid)
        {
            this.submitGameDetails();
        }
        else
        {
            this.handleFormValidationErrors();
        }
    }

    public submitGameDetails()
    {
        const form_data =
        {
            game_name : this.game_form.get('game_name')?.value,
            game_description : this.game_form.get('game_description')?.value,
            game_venue : this.game_form.get('game_venue')?.value,
            game_length : this.game_form.get('game_length')?.value,
            game_size : this.game_form.get('game_size')?.value,
            game_payment_type : this.game_form.get('game_payment_type')?.value,
            game_price : this.game_form.get('game_price')?.value,
            game_date : this.game_form.get('game_date')?.value,
            game_time : this.game_form.get('game_time')?.value,
            // object id
            // game_creator
            // game_created_at
            // timestamp
        }
        console.log(form_data)
    }

    public onClose()
    {
        this.dialogRef.close();
    }

    private handleFormValidationErrors()
    {
        if(this.game_form.get('game_name')?.hasError('required'))
        {
            this.sharedService.showNotification("Please enter the game name.", "error");
        }

        if(this.game_form.get('game_description')?.hasError('required'))
        {
            this.sharedService.showNotification("Please enter the game description.", "error");
        }

        if(this.game_form.get('game_venue')?.hasError('required'))
        {
            this.sharedService.showNotification("Please select a game venue.", "error");
        }

        if(this.game_form.get('game_length')?.hasError('required'))
        {
            this.sharedService.showNotification("Please enter the game length.", "error");
        }

        if(this.game_form.get('game_size')?.hasError('required'))
        {
            this.sharedService.showNotification("Please select the game size.", "error");
        }

        if(this.game_form.get('game_payment_type')?.hasError('required'))
        {
            this.sharedService.showNotification("Please select the payment type.", "error");
        }

        if(this.game_form.get('game_price')?.hasError('required'))
        {
            this.sharedService.showNotification("Please enter the game price.", "error");
        }

        if(this.game_form.get('game_date')?.hasError('required'))
        {
            this.sharedService.showNotification("Please enter the game date.", "error");
        }

        if(this.game_form.get('game_time')?.hasError('required'))
        {
            this.sharedService.showNotification("Please enter the game starting time.", "error");
        }
    }
}

// GAMES
// - ObjectID 
// - GameName f 
// - Descriptionf 
// - CommunityID
// - OrganizerID
// - PlayersList (UserID, UserName, Payed)
// - DateTime f
// - Length f
// - PaymentType f
// - GroupSize f
// - Venue (take id of venue) f
// - Price f
// - GameType f
// - CreatedAt
// - Timestamp
