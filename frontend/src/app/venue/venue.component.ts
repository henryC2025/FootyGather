import { Component } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { WebService } from '../web.service';
import { SharedService } from '../shared.service';
import { ActivatedRoute } from '@angular/router';

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
    public isAuthenticated: boolean = false;

    constructor(public authService : AuthService,
                public webService : WebService,
                public sharedService : SharedService,
                public route : ActivatedRoute,) {}

    ngOnInit()
    {
        this.venue_list = this.webService
            .getVenueByID(this.route.snapshot.params['id']
        );

        this.authService.user$.subscribe(user =>
        {
            this.oauth_id = user?.sub;
        });

        this.like_dislike_list = this.webService
          .getLikesDislikesFromVenue(this.route.snapshot.params['id']
        );

        this.getLikesDislikes(this.route.snapshot.params['id'])
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
