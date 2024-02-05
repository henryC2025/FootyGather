import { Component } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { WebService } from '../web.service';
import { SharedService } from '../shared.service';

@Component({
  selector: 'app-venues',
  templateUrl: './venues.component.html',
  styleUrl: './venues.component.css'
})
export class VenuesComponent 
{
    search_query: string = '';
    search_results: any = [];
    venue_list : any = [];
    page : number = 1;
    total_pages : number = 1;
    user : any;
    isAdmin : any = false;

    constructor(public authService : AuthService,
                public webService : WebService,
                public sharedService : SharedService) {}

    ngOnInit()
    {
        if(sessionStorage['page'])
        {
            this.page = Number(sessionStorage['page']);
        }
        this.venue_list = this.webService.getVenues(this.page);

        this.webService.getCountOfVenues().subscribe((data: any) =>
        {
            const count_of_venues = parseInt(data);
            this.total_pages = Math.ceil(count_of_venues / 12);
            console.log(this.total_pages)
        });

        this.authService.user$.subscribe((userData: any) =>
        {
            this.user = userData;

            const userDetails =
            {
                oauth_id: userData?.sub,
            };

            this.webService.getUserDetails(userDetails).subscribe((data: any) =>
            {
                this.isAdmin = data.is_admin;
                console.log(this.isAdmin);
            });
        });
    }

    search()
    {   
        if(this.search_query)
        {
            this.webService.searchGame(this.search_query).subscribe(
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
            this.venue_list = this.webService.getVenues(this.page);
        }
    }

    lastPage()
    {
        if(this.page < this.total_pages)
        {
            this.page = this.total_pages;
            sessionStorage['page'] = this.page;
            this.venue_list = this.webService.getVenues(this.page);
        }
    }

    previousPage()
    {
        if(this.page > 1)
        {
            this.page = this.page - 1;
            sessionStorage['page'] = this.page;
            this.venue_list =
                this.webService.getVenues(this.page);
        }
    }

    nextPage()
    {
        this.page = this.page + 1;
        sessionStorage['page'] = this.page;
        this.venue_list =
            this.webService.getVenues(this.page);
    }

    goToPage(pageNum: number) 
    {
        this.page = pageNum;
        sessionStorage['page'] = this.page;
        this.venue_list =
            this.webService.getVenues(this.page);
    }
}
