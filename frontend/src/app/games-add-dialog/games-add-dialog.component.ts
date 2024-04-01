import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '@auth0/auth0-angular';
import { WebService } from '../web.service';
import { SharedService } from '../shared.service';
import { ActivatedRoute, Router } from '@angular/router';
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
    user : any;
    user_details : any;
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
                public route : ActivatedRoute,
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
                        game_price: [0, [Validators.required, Validators.min(0)]],
                        game_date : ['', Validators.required],
                        game_time : ['', Validators.required],
                    })
                }

    ngOnInit()
    {
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

        this.initUser();
        this.community_id = this.data.community_id;
    }

    private initUser()
    {
        this.authService.user$.subscribe(user =>
        {
          this.user = user;
          this.authService.isAuthenticated$.subscribe(
          {
              next : (response : any) =>
              {
                  if(response === false)
                  {
                      this.sharedService.showNotification("Please sign in to add a game.", "error");
                      this.router.navigate(['/']);
                  }
                  if(this.user)
                  {
                      const form_data =
                      {
                          oauth_id : this.user?.sub,
                      }
                      this.webService.getUserDetails(form_data).subscribe(
                      {
                          next : (data : any) =>
                          {
                              this.user_details = data;
                          }
                      })
                  }
              }
          });
        });
    }

    public onSubmit()
    {
        if(this.game_form.valid)
        {
            this.submitGameDetails();
        }
        else
        {
            console.log("error")
            this.handleFormValidationErrors();
        }
    }

    public submitGameDetails()
    {
        const selected_venue = this.game_form.get('game_venue')?.value;
        const [venue_id, venue_name] = selected_venue.split(',');
        const form_data =
        {
            game_name : this.game_form.get('game_name')?.value,
            game_description : this.game_form.get('game_description')?.value,
            game_venue_id : venue_id,
            game_venue_name : venue_name,
            game_length : this.game_form.get('game_length')?.value,
            game_size : this.game_form.get('game_size')?.value,
            game_payment_type : this.game_form.get('game_payment_type')?.value,
            game_price : this.game_form.get('game_price')?.value,
            game_date : this.game_form.get('game_date')?.value,
            game_time : this.game_form.get('game_time')?.value,
            community_id : this.community_id,
            creator_oauth_id : this.user_details.oauth_id,
            creator_user_id : this.user_details._id,
            creator_user_name : this.user_details.user_name,
            creator_email : this.user_details.email
        }
        console.log(form_data)
        // CALL ADD GAME API
        this.webService.addNewGame(form_data, this.community_id).subscribe(
        {
            error : () =>
            {
                this.sharedService.showNotification("An error occured while adding a new game!", "error");
            },
            complete : () =>
            {
                this.sharedService.showNotification("Game added", "success");
                this.onClose();
                this.sharedService.game_added.next();
            }
        })
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

        if (this.game_form.get('game_price')?.hasError('min'))
        {
            this.sharedService.showNotification("The game price must be a positive value.", "error");
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