import { Component } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { WebService } from '../web.service';
import { SharedService } from '../shared.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-venue',
  templateUrl: './venue.component.html',
  styleUrl: './venue.component.css'
})
export class VenueComponent {

    venue_list : any = []
    comments : any = []
    commentForm : any = []
    like_dislike_list : any = []
    username : any
    email : any
    like_count : any = 0;
    dislike_count : any = 0;
    user_id : any;
    oauth_id : any;
    isAdmin : any = false;
    user : any;
    venue_id : any;
    public isAuthenticated: boolean = false;

    constructor(public authService : AuthService,
                public webService : WebService,
                public sharedService : SharedService,
                public route : ActivatedRoute,
                public router : Router) {}

    ngOnInit()
    {
        this.venue_list = this.webService
            .getVenueByID(this.route.snapshot.params['id']
        );

        this.route.paramMap.subscribe(params =>
        {
            this.venue_id = params.get('id');
        });

        this.like_dislike_list = this.webService
            .getLikesDislikesFromVenue(this.route.snapshot.params['id']
        );

        this.getLikesDislikes(this.route.snapshot.params['id']);

        this.authService.user$.subscribe((user: any) =>
        {
            this.oauth_id = user?.sub;
            this.user = user;

            const userDetails =
            {
                oauth_id: user?.sub,
            };

            this.webService.getUserDetails(userDetails).subscribe((data: any) =>
            {
                this.isAdmin = data.is_admin;
                console.log(this.isAdmin);
            });
        });
    }

    onDeleteVenue(venue_id : any, image_id : any)
    {
        const prompt = window.confirm("Are you sure you want to delete this venue?");

        if(prompt)
        {
            this.deleteVenue(venue_id, image_id);
        }
    }

    deleteVenue(venue_id : any, image_id : any)
    {
        this.webService.deleteVenue(venue_id).subscribe(
        {
            next : (response) =>
            {
                this.webService.deleteVenueImage(image_id).subscribe(
                {
                    next : (response) =>
                    {

                    },
                    error : (error) =>
                    {

                    },
                    complete : () =>
                    {
                        console.log("Venue deleted!")
                        this.router.navigate(['/venues']);
                        // ADD NOTIFIER HERE
                    }
                })
            },
            error : (error) =>
            {

            }
        })
    }

    addLike(oauth_id : any)
    {
        const venue_id = this.route.snapshot.params['id'];

        if(venue_id && oauth_id)
        {
            this.webService.addLike(venue_id, oauth_id).subscribe({
                next: (response : any) =>
                {
                  console.log(response)
                  this.getLikesDislikes(venue_id);
                },
                error: (error) =>
                {
                  console.error('Something went wrong adding like:', error);
                }}
            );
        }
        else
        {
            console.log("Looks like some IDs are missing!")
        }
    }

    addDislike(oauth_id : any)
    {
        const venue_id = this.route.snapshot.params['id'];

        if(venue_id && oauth_id)
        {
            this.webService.addDislike(venue_id, oauth_id).subscribe({
                next: (response : any) =>
                {
                    console.log(response)
                    this.getLikesDislikes(venue_id);
                },
                error: (error) =>
                {
                    console.error('Something went wrong adding dislike:', error);
                }}
            );
        }
        else
        {
            console.log("Looks like some IDs are missing!")
            console.log("ERRORS" + this.oauth_id)
            console.log(venue_id)
        }
    }

    getLikesDislikes(venue_id : any)
    {
        this.webService.getLikesDislikesFromVenue(venue_id).subscribe({
            next: (response : any) =>
            {
                const likes = response.likes_dislikes.liked_users.length;
                const dislikes = response.likes_dislikes.disliked_users.length;
                this.like_count = likes
                this.dislike_count = dislikes
            },
            error: (error) =>
            {
                console.error('Something went wrong when getting likes and dislikes:', error);
            }}
        );
    }

}
