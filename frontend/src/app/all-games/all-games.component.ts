import { Component } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { WebService } from '../web.service';
import { SharedService } from '../shared.service';

@Component({
  selector: 'app-all-games',
  templateUrl: './all-games.component.html',
  styleUrl: './all-games.component.css'
})
export class AllGamesComponent
{
    selected_sort_option: string = "default";
    search_query: string = '';
    search_results: any = [];
    all_games_list : any = [];
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

        this.all_games_list = this.webService.getAllCurrentGames(this.selected_sort_option, this.page);
        this.webService.getCountOfAllCurrentGames().subscribe((data: any) =>
        {
          const count_of_all_current_games = data.count_of_all_current_games;
          this.total_pages = Math.ceil(count_of_all_current_games / 12);
        });
    }

    search()
    {   
        if(this.search_query)
        {
            this.webService.searchAllCurrentGames(this.search_query).subscribe(
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
    }

    firstPage()
    {
        if(this.page > 1)
        {
            this.page = 1;
            sessionStorage['page'] = this.page;
            this.all_games_list = this.webService.getAllCurrentGames(this.selected_sort_option, this.page);
        }
    }

    lastPage()
    {
        if(this.page < this.total_pages)
        {
            this.page = this.total_pages;
            sessionStorage['page'] = this.page;
            this.all_games_list = this.webService.getAllCurrentGames(this.selected_sort_option, this.page);
        }
    }

    previousPage()
    {
        if(this.page > 1)
        {
            this.page = this.page - 1;
            sessionStorage['page'] = this.page;
            this.all_games_list = this.webService.getAllCurrentGames(this.selected_sort_option, this.page);
        }
    }

    nextPage()
    {
        this.page = this.page + 1;
        sessionStorage['page'] = this.page;
        this.all_games_list = this.webService.getAllCurrentGames(this.selected_sort_option, this.page);
    }

    goToPage(pageNum: number) 
    {
        this.page = pageNum;
        sessionStorage['page'] = this.page;
        this.all_games_list = this.webService.getAllCurrentGames(this.selected_sort_option, this.page);
    }

    onSortChange()
    {
        if (this.selected_sort_option === 'closest')
        {
            this.all_games_list = this.webService.getAllCurrentGames("closest", this.page);
            console.log('Sorting by Closest Distance');
        }
        else if (this.selected_sort_option === 'furthest')
        {
            this.all_games_list = this.webService.getAllCurrentGames("furthest", this.page);
            console.log('Sorting by Furthest Distance');
        }
        else if (this.selected_sort_option === 'default')
        {
            this.all_games_list = this.webService.getAllCurrentGames(this.selected_sort_option, this.page);
        }
    }
}
