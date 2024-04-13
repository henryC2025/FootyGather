import { Component } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { WebService } from '../web.service';
import { SharedService } from '../shared.service';
import { catchError, map, throwError } from 'rxjs';

@Component({
  selector: 'app-players',
  templateUrl: './players.component.html',
  styleUrl: './players.component.css'
})
export class PlayersComponent
{
    selected_sort_option: string = "default";
    search_query: string = '';
    search_player_results: any = [];
    player_list: any = [];
    page : number = 1;
    total_pages : number = 1;

    constructor(public authService : AuthService,
                public webService : WebService,
                public sharedService : SharedService) {}

    ngOnInit()
    {
        if(sessionStorage['page'])
        {
            this.page = Number(sessionStorage['page']);
        }

        this.player_list = this.webService.getAllPlayers(this.page);
        this.webService.getCountOfPlayers().subscribe((data: any) =>
        {
            const count_of_players = data.count_of_players
            this.total_pages = Math.ceil(count_of_players / 12);
        });
    }

    search()
    {   
        if(this.search_query)
        {
            this.webService.searchPlayers(this.search_query).subscribe(
            {
                next: (response : any) =>
                {
                    console.log(response);
                    this.search_player_results = response;
                },
                error: (error) =>
                {
                    console.error('Error:', error);
                    this.sharedService.showNotification("An error occured when searching for players!", "error");
                }
            })
        }
    }

    firstPage()
    {
        if(this.page > 1)
        {
            this.page = 1;
            sessionStorage['page'] = this.page;
            this.player_list = this.webService.getAllPlayers(this.page);
        }
    }

    lastPage()
    {
        if(this.page < this.total_pages)
        {
            this.page = this.total_pages;
            sessionStorage['page'] = this.page;
            this.player_list = this.webService.getAllPlayers(this.page);
        }
    }

    previousPage()
    {
        if(this.page > 1)
        {
            this.page = this.page - 1;
            sessionStorage['page'] = this.page;
            this.player_list = this.webService.getAllPlayers(this.page);
        }
    }

    nextPage()
    {
        this.page = this.page + 1;
        sessionStorage['page'] = this.page;
        this.player_list = this.webService.getAllPlayers(this.page);
    }

    goToPage(page_num: number) 
    {
        this.page = page_num;
        sessionStorage['page'] = this.page;
        this.player_list = this.webService.getAllPlayers(this.page);
    }
}
