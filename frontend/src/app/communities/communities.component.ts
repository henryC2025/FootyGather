import { Component } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { WebService } from '../web.service';
import { SharedService } from '../shared.service';
import { Observable, catchError, concatMap, map, of, tap, throwError } from 'rxjs';

@Component({
  selector: 'app-communities',
  templateUrl: './communities.component.html',
  styleUrl: './communities.component.css'
})
export class CommunitiesComponent
{
    selectedSortOption: string = "closest";
    search_query: string = '';
    search_results: any = [];
    community_list : any = [];
    all_community_list : any = [];
    page : number = 1;
    total_pages : number = 1;
    user : any;
    is_admin: boolean = false;

    origin: string = '';
    destination: string = '';
    distance: string = '';
    errorMessage: string = '';
    lat : any | null;
    lng : any | null;

    constructor(public authService : AuthService,
                public webService : WebService,
                public sharedService : SharedService) {}

    ngOnInit()
    {
        // this.community_list = this.webService.getCommunities(this.page);
        this.community_list = this.webService.getAllCommunities();
        if (navigator.geolocation)
        {
            console.log("Geolocation is supported");
            navigator.permissions.query({ name: 'geolocation' }).then(permissionStatus =>
            {
                if (permissionStatus.state === 'granted')
                {
                    console.log('Geolocation permission granted');
                    navigator.geolocation.getCurrentPosition(position =>
                    {
                        this.lat = position.coords.latitude;
                        this.lng = position.coords.longitude;
                        this.getLocationName(this.lat, this.lng);
                        this.getCommunities();
                        this.community_list = this.webService.getCommunities(this.page);
                    });
                }
                else
                {
                    console.log('Geolocation permission not granted');
                    this.webService.getAllCommunities().subscribe((communityList: any) =>
                    {
                        this.all_community_list = communityList;
                        this.resetDistanceForAllCommunities();
                    });
                    this.community_list = this.webService.getCommunities(this.page);
                    console.log("Geolocation is not supported by this browser.");
                }
            });
        }
        else
        {
            console.log("Geolocation not supported!")
        }
        // if (navigator.geolocation)
        // {
        //     console.log("geo here")
        //     navigator.geolocation.getCurrentPosition(position =>
        //     {
        //         this.lat = position.coords.latitude;
        //         this.lng = position.coords.longitude;
        //         this.getLocationName(this.lat, this.lng);
        //         this.getCommunities();
        //         this.community_list = this.webService.getCommunities(this.page);
        //     });
        // }
        // else
        // {
        //     this.webService.getAllCommunities().subscribe((communityList: any) =>
        //     {
        //         this.all_community_list = communityList;
        //         this.resetDistanceForAllCommunities();
        //     });
        //     this.community_list = this.webService.getCommunities(this.page);
        //     console.log("Geolocation is not supported by this browser.");
        //     // Call reset distance from user to not supported
        // }

        if(sessionStorage['page'])
        {
            this.page = Number(sessionStorage['page']);
        }


        this.authService.user$.subscribe((userData: any) =>
        {
            this.user = userData;

            const userDetails =
            {
                oauth_id: userData?.sub,
            };

            if(this.user)
            {
                this.webService.getUserDetails(userDetails).subscribe((data: any) =>
                {
                    this.is_admin = (data.is_admin == "true");
                });
            }
        });
    }

    getLocationName(latitude: number, longitude: number)
    {
        this.webService.getAddressFromCoordinates(latitude, longitude).subscribe(response =>
        {
            if (response && response.status === 'OK')
            {
                const address = response.results[0].formatted_address;
                this.origin = address;
            }
            else
            {
                console.error('Error retrieving address:', response);
            }
        });
    }

    search()
    {   
        if(this.search_query)
        {
            this.webService.searchCommunity(this.search_query).subscribe(
            {
                next: (response : any) =>
                {
                    this.search_results = response;
                },
                error: (error) =>
                {
                    console.error('Error:', error);
                }
            })
        }
        else
        {
            console.log("Something went wrong!")
        }
    }

    firstPage()
    {
        if(this.page > 1)
        {
            this.page = 1;
            sessionStorage['page'] = this.page;
            this.community_list = this.webService.getCommunities(this.page);
        }
    }

    lastPage()
    {
        if(this.page < this.total_pages)
        {
            this.page = this.total_pages;
            sessionStorage['page'] = this.page;
            this.community_list = this.webService.getCommunities(this.page);
        }
    }

    previousPage()
    {
        if(this.page > 1)
        {
            this.page = this.page - 1;
            sessionStorage['page'] = this.page;
            this.community_list = this.webService.getCommunities(this.page);
        }
    }

    nextPage()
    {
        this.page = this.page + 1;
        sessionStorage['page'] = this.page;
        this.community_list = this.webService.getCommunities(this.page);
    }

    goToPage(pageNum: number) 
    {
        this.page = pageNum;
        sessionStorage['page'] = this.page;
        this.community_list = this.webService.getCommunities(this.page);
    }

    calculateCommunityDistance(destination: any)
    {
        this.destination = destination;
        console.log("Origin: " + this.origin);
        console.log("Destination: " + this.destination);
        if (!this.origin || !this.destination)
        {
            this.sharedService.showNotification('No origin or destination found', 'error');
        }

        return this.webService.calculateDistance(this.origin, this.destination).pipe(
            map((data: any) =>
            {
                if (data.status === 'OK' && data.rows.length > 0)
                {
                    const row = data.rows[0];
                    if (row && row.elements.length > 0)
                    {
                        const element = row.elements[0];
                        if (element.status === 'OK')
                        {
                            const distance_text = element.distance.text;
                            const distance_value = this.sharedService.metersToMiles(element.distance.value);
                            const duration_text = element.duration.text;
                            const duration_value = this.sharedService.metersToMiles(element.duration.value);
            
                        return {
                            distance: {
                            text: distance_text,
                            value: distance_value
                            },
                            duration: {
                            text: duration_text,
                            value: duration_value
                            }
                        };
                        }
                        else
                        {
                            console.error('Error calculating distance:', element.status);
                            return null;
                        }
                    }
                    else
                    {
                        console.error('No elements found in the response');
                        return null;
                    }
                } 
                else
                {
                    console.error('Invalid response received:', data);
                    return null;
                }
            }),
            catchError(error =>
            {
                console.error('Error calculating distance:', error);
                return throwError('Error calculating distance');
            })
        );
    }

    getCommunities()
    {
        this.webService.getAllCommunities().subscribe((communityList: any) =>
        {
            this.all_community_list = communityList;
            this.calculateAndSaveDistanceForCommunities();
        });
    }

    calculateAndSaveDistanceForCommunities()
    {
        if(this.all_community_list)
        {
            for (let i = 0; i < this.all_community_list.length; i++)
            {
                const community = this.all_community_list[i];
                this.calculateCommunityDistance(community.location).subscribe((distanceData: any) =>
                {
                    this.saveDistanceForCommunity(community._id, distanceData);
                });
            }
            console.log("Finished calculating distances!");
        }
    }

    saveDistanceForCommunity(community_id: string, distance_json_data : any)
    {
        const distance_value = distance_json_data.distance.value;

        const distance_data =
        {
            community_id : community_id,
            distance_from_user : distance_value
        }

        this.webService.saveCommunityDistanceFromUser(distance_data).subscribe(
        {
            next : () =>
            {
                console.log(`Distance saved for community ${community_id}`);
            },
            error : () =>
            {

            }
        })
    }

    resetDistanceForAllCommunities()
    {
        for (let i = 0; i < this.all_community_list.length; i++)
        {
            const community = this.all_community_list[i];
            this.resetDistanceForCommunity(community._id);
        }
    }

    resetDistanceForCommunity(community_id : string)
    {
        const data =
        {
            community_id : community_id
        }

        this.webService.resetCommunityDistanceFromUser(data).subscribe(
        {
            next : () =>
            {
                console.log("Distance reset for commnitiy: " + community_id);
            },
            error : (error : any) =>
            {
                console.log("Something went wrong resetting the communities!")
                console.log(error)
            }
        })
    }

    //  TO DO 
    onSortChange()
    {
        if (this.selectedSortOption === 'closest')
        {
            this.community_list = this.webService.getSortedCommunities("closest");
            // Handle sorting by closest distance
            console.log(this.community_list)
            console.log('Sorting by Closest Distance');
            // Call a method to sort by closest distance
        }
        else if (this.selectedSortOption === 'furthest')
        {
            this.community_list = this.webService.getSortedCommunities("furthest");
            // Handle sorting by furthest distance
            console.log(this.community_list)
            console.log('Sorting by Furthest Distance');
            // Call a method to sort by furthest distance
        }
      }

// COMMUNITIES
// - ObjectID
// - CommunityName
// - Description
// - Location (Area)
// - CreatorID
// - CreatedAt 
// - Games - array of game ids
// - FinishedGames - array of games ids
// - TotalPlayers - count of playes
// - Players - array of player ids
}
