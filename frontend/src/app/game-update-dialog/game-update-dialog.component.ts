import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '@auth0/auth0-angular';
import { WebService } from '../web.service';
import { SharedService } from '../shared.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { map } from 'rxjs';

@Component({
  selector: 'app-game-update-dialog',
  templateUrl: './game-update-dialog.component.html',
  styleUrl: './game-update-dialog.component.css'
})
export class GameUpdateDialogComponent
{
    game_details_form : FormGroup;
    venue_list : any;
    user : any;
    game_id : any;
    minimum_date : any;
    current_venue : any;
    current_player_size : any;
    existing_game_data: any =
    {
        name: '',
        description: '',
        venue: '',
        length: '',
        payment_type: '',
        size: '',
        price: '',
        date: '',
        time: '',
    };

    constructor(public authService : AuthService,
                public webService : WebService,
                public sharedService : SharedService,
                public router : Router,
                @Inject(MAT_DIALOG_DATA) public data : any,
                public route : ActivatedRoute,
                private fb : FormBuilder,
                public dialogRef : MatDialogRef<GameUpdateDialogComponent>)
                {
                    this.game_details_form = this.fb.group(
                    {
                        game_name : ['', Validators.required],
                        game_description : ['', Validators.required],
                        game_venue : ['', Validators.required],
                        game_length : ['', Validators.required],
                        game_payment_type : ['', Validators.required],
                        game_size : ['', Validators.required],
                        game_price : [0, [Validators.required, Validators.min(0)]],
                        game_date : ['', Validators.required],
                        game_time : ['', Validators.required],
                    });
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
        this.game_id = this.data?.game_id;
        this.getGamePlayerCount();
        this.populateForm();
    }

    getGamePlayerCount()
    {
        this.webService.getGamePlayerCount(this.game_id).subscribe(
        {
            next : (data : any) =>
            {
                this.current_player_size = data.player_count;
            },
            error : () =>
            {
                console.log("An error occured retrieving game player count!");
            }
        })
    }

    populateForm()
    {
        this.webService.getGameById(this.data?.game_id).subscribe(
        {
            next : (data : any) =>
            {
                const game_name = data[0]?.name;
                const game_description = data[0]?.description;
                const game_venue_id = data[0]?.venue_id;
                const game_venue_name = data[0]?.venue_name;
                const game_length = data[0]?.length;
                const game_payment_type = data[0]?.payment_type;
                const game_size = data[0]?.size;
                const game_price = data[0]?.price;
                const game_date = data[0]?.date;
                const game_time = data[0]?.time;

                this.existing_game_data.name = game_name;
                this.existing_game_data.description = game_description;
                this.existing_game_data.venue = game_venue_name;
                this.existing_game_data.venue_id = game_venue_id;
                this.existing_game_data.venue_name = game_venue_name;
                this.existing_game_data.length = game_length;
                this.existing_game_data.payment_type = game_payment_type;
                this.existing_game_data.size = game_size;
                this.existing_game_data.price = game_price;
                this.existing_game_data.date = game_date;
                this.existing_game_data.time = game_time;

                this.game_details_form.patchValue(
                {
                    game_name : game_name,
                    game_description : game_description,
                    game_venue : game_venue_id + "," + game_venue_name,
                    game_length : game_length,
                    game_payment_type : game_payment_type,
                    game_size : game_size,
                    game_price : game_price,
                    game_date : game_date,
                    game_time : game_time,
                })
            },
            error : (error) =>
            {
                console.log(error);
            }
        })
    }

    public onSubmit()
    {
        if(this.game_details_form.valid)
        {
            const new_game_size = this.game_details_form.get('game_size')?.value;
            if(new_game_size < this.current_player_size)
            {
                this.sharedService.showNotification("Please remove players from the list before changing to smaller game size!", "error");
            }
            else
            {
                this.submitGameDetails();
            }
        }
        else
        {
            this.handleFormValidationErrors();
        }
    }

    private submitGameDetails()
    {
        const selected_venue = this.game_details_form.get('game_venue')?.value;
        const [venue_id, venue_name] = selected_venue.split(',');
        const form_data =
        {
            game_name : this.game_details_form.get('game_name')?.value,
            game_description : this.game_details_form.get('game_description')?.value,
            game_venue_id : venue_id,
            game_venue_name : venue_name,
            game_length : this.game_details_form.get('game_length')?.value,
            game_size : this.game_details_form.get('game_size')?.value,
            game_payment_type : this.game_details_form.get('game_payment_type')?.value,
            game_price : this.game_details_form.get('game_price')?.value,
            game_date : this.game_details_form.get('game_date')?.value,
            game_time : this.game_details_form.get('game_time')?.value,
        }
        console.log(form_data)
        this.webService.updateGameDetails(form_data, this.game_id).subscribe(
        {
            complete : () =>
            {
                this.sharedService.showNotification("Game details updated", "success");
                this.onClose();
                this.sharedService.game_updated.next();
            },
            error : (error) =>
            {
                console.log(error);
                this.sharedService.showNotification("An error occured updating game details!", "error");
            }
        })
    }

    public onClose()
    {
        this.dialogRef.close();
    }

    private handleFormValidationErrors()
    {
        if(this.game_details_form.get('game_name')?.hasError('required'))
        {
            this.sharedService.showNotification("Please enter the game name.", "error");
        }

        if(this.game_details_form.get('game_description')?.hasError('required'))
        {
            this.sharedService.showNotification("Please enter the game description.", "error");
        }

        if(this.game_details_form.get('game_venue')?.hasError('required'))
        {
            this.sharedService.showNotification("Please select a game venue.", "error");
        }

        if(this.game_details_form.get('game_length')?.hasError('required'))
        {
            this.sharedService.showNotification("Please enter the game length.", "error");
        }

        if(this.game_details_form.get('game_size')?.hasError('required'))
        {
            this.sharedService.showNotification("Please select the game size.", "error");
        }

        if(this.game_details_form.get('game_payment_type')?.hasError('required'))
        {
            this.sharedService.showNotification("Please select the payment type.", "error");
        }

        if(this.game_details_form.get('game_price')?.hasError('required'))
        {
            this.sharedService.showNotification("Please enter the game price.", "error");
        }

        if (this.game_details_form.get('game_price')?.hasError('min'))
        {
            this.sharedService.showNotification("The game price must be a positive value.", "error");
        }

        if(this.game_details_form.get('game_date')?.hasError('required'))
        {
            this.sharedService.showNotification("Please enter the game date.", "error");
        }

        if(this.game_details_form.get('game_time')?.hasError('required'))
        {
            this.sharedService.showNotification("Please enter the game starting time.", "error");
        }
    }
}
