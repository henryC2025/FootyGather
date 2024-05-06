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
export class VenueComponent
{
    venue_list : any = [];
    like_dislike_list : any = [];;
    username : any;
    email : any;
    like_count : any = 0;
    dislike_count : any = 0;
    user_id : any;
    oauth_id : any;
    is_admin = false;
    user : any;
    venue_id : any;
    latitude : any;
    longitude : any;
    center: google.maps.LatLngLiteral;
    public is_authenticated: boolean = false;

    constructor(public authService : AuthService,
                public webService : WebService,
                public sharedService : SharedService,
                public route : ActivatedRoute,
                public router : Router)
                {
                    this.center =
                    {
                        lat: this.latitude,
                        lng: this.longitude
                    };
                }

    ngOnInit()
    {
        this.venue_list = this.webService
            .getVenueByID(this.route.snapshot.params['id']
        );

        this.route.paramMap.subscribe(params =>
        {
            this.venue_id = params.get('id');
            this.getVenueLocation();
        });

        this.like_dislike_list = this.webService
            .getLikesDislikesFromVenue(this.route.snapshot.params['id']
        );

        this.getLikesDislikes(this.route.snapshot.params['id']);

        if(this.authService.user$)
        {
            this.authService.user$.subscribe((user: any) =>
            {
                this.oauth_id = user?.sub;
                this.user = user;

                const userDetails =
                {
                    oauth_id: user?.sub,
                };

                if(this.oauth_id && this.user)
                {
                    this.webService.getUserDetails(userDetails).subscribe((data: any) =>
                    {
                        this.is_admin = (data.is_admin == "true");
                    });
                }
            });
        }

    }

    getVenueLocation()
    {
        this.webService.getVenueByID(this.venue_id).subscribe(
        {
            next : (data : any) =>
            {
                const address = data[0].address;
                this.webService.getCoordinatesFromAddress(address).subscribe(
                {
                    next : (data : any) =>
                    {
                        this.latitude = (data.results[0].geometry.location.lat);
                        this.longitude = (data.results[0].geometry.location.lng);
                        this.center =
                        {
                            lat: this.latitude,
                            lng: this.longitude
                        };
                    },
                    error : (error) =>
                    {
                        console.log("An error occured getting co-ordinates from address: ", error);
                    }
                })
            },
            error : (error) =>
            {
                console.log("An error occured getting venue details: ", error);
            }
        })
    }

    onUpdateVenue()
    {
        this.sharedService.showUpdateVenueDialog(this.route.snapshot.params['id']);
    }

    onDeleteVenue(venue_id : any, image_id : any, image_path : any)
    {
        const prompt = window.confirm("Are you sure you want to delete this venue?");

        if(prompt)
        {
            this.deleteVenue(venue_id, image_id, image_path);
        }
    }

    deleteVenue(venue_id : any, image_id : any, image_path : any)
    {
        const url = image_path;
        const parts = url.split('/');
        const image_path_code = parts[parts.length - 1];
        this.webService.deleteVenue(venue_id).subscribe(
        {
            next : () =>
            {
                this.webService.deleteVenueImage(image_id, image_path_code).subscribe(
                {
                    error : (error) =>
                    {
                        console.log("An error occured when attempting to delete venue: ", error);
                    },
                    complete : () =>
                    {
                        console.log("Venue deleted!")
                        this.router.navigate(['/venues']);
                    }
                })
            },
            error : (error) =>
            {
                console.log("An error occured when attempting to delete venue: ", error);
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
                    console.error('An error occurred when attempting to add a like:', error);
                }}
            );
        }
    }

    addDislike(oauth_id : any)
    {
        const venue_id = this.route.snapshot.params['id'];

        if(venue_id && oauth_id)
        {
            this.webService.addDislike(venue_id, oauth_id).subscribe(
            {
                next: () =>
                {
                    this.getLikesDislikes(venue_id);
                },
                error: (error) =>
                {
                    console.error('An error occurred when attempting to add a dislike:', error);
                }}
            );
        }
    }

    getLikesDislikes(venue_id : any)
    {
        this.webService.getLikesDislikesFromVenue(venue_id).subscribe(
        {
            next: (response : any) =>
            {
                const likes = response.likes_dislikes.liked_users.length;
                const dislikes = response.likes_dislikes.disliked_users.length;
                this.like_count = likes
                this.dislike_count = dislikes
            },
            error: (error) =>
            {
                console.error('An error occurred when attempting to retrieving likes and dislikes:', error);
            }}
        );
    }
}
