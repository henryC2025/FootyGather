import { Component } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { WebService } from '../web.service';
import { SharedService } from '../shared.service';

@Component({
  selector: 'app-communities',
  templateUrl: './communities.component.html',
  styleUrl: './communities.component.css'
})
export class CommunitiesComponent
{
    search_query: string = '';
    search_results: any = [];
    community_list : any = [];
    page : number = 1;
    total_pages : number = 1;
    user : any;
    is_admin: boolean = false;

    constructor(public authService : AuthService,
                public webService : WebService,
                public sharedService : SharedService) {}

    ngOnInit()
    {
        if(sessionStorage['page'])
        {
            this.page = Number(sessionStorage['page']);
        }
        
        this.community_list = this.webService.getCommunities(this.page);

        // this.webService.getCountOfCommunities().subscribe((data: any) =>
        // {
        //     const count_of_communities = parseInt(data);
        //     this.total_pages = Math.ceil(count_of_venues / 12);
        // });

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
                    console.log(data)
                    this.is_admin = (data.is_admin == "true");
                    console.log("Am I the admin - ", this.is_admin)
                });
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
