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
    selected_sort_option: string = "default";
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
        if(sessionStorage['page'])
        {
            this.page = Number(sessionStorage['page']);
        }

        this.community_list = this.webService.getAllCommunities();
        this.webService.getCountOfCommunities().subscribe((data: any) =>
        {
            const count_of_venues = parseInt(data);
            this.total_pages = Math.ceil(count_of_venues / 12);
        });

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

    onAddCommunity()
    {
        this.sharedService.showAddCommunityDialog();
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
                        return null;
                    }
                } 
                else
                {
                    console.log("Calculating distance data...")
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
                if(community)
                {
                    this.calculateCommunityDistance(community.location).subscribe((distanceData: any) =>
                    {
                        if(distanceData)
                        {
                            this.saveDistanceForCommunity(community._id, distanceData);
                        }
                        else
                        {
                            console.log("Getting distance data...")
                        }
                    });
                }
                else
                {
                    console.log("Community data loading..")
                }
            }
            console.log("Finished calculating distances!");
        }
    }

    saveDistanceForCommunity(community_id: string, distance_json_data : any)
    {
        let distance_value = 0;
        let distance_data;
        if(distance_json_data.distance.value)
        {
            distance_value = distance_json_data.distance.value;
        }

        if(distance_value)
        {
            distance_data =
            {
                community_id : community_id,
                distance_from_user : distance_value
            }
        }
        else
        {
            distance_data =
            {
                community_id : community_id,
                distance_from_user : 0
            }
        }

        this.webService.saveCommunityDistanceFromUser(distance_data).subscribe(
        {
            next : () =>
            {
                console.log(`Distance saved for community ${community_id}`);
            },
            error : () =>
            {
                console.log("Something went wrong calculating community distance!")
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

    onSortChange()
    {
        if (this.selected_sort_option === 'closest')
        {
            this.community_list = this.webService.getSortedCommunities("closest");
            console.log('Sorting by Closest Distance');
        }
        else if (this.selected_sort_option === 'furthest')
        {
            this.community_list = this.webService.getSortedCommunities("furthest");
            console.log('Sorting by Furthest Distance');
        }
        else if (this.selected_sort_option === 'default')
        {
            this.community_list = this.webService.getCommunities(this.page);
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
