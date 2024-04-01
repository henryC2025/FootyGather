import { Component } from '@angular/core';
import { WebService } from '../web.service';
import { AuthService } from '@auth0/auth0-angular';
import { SharedService } from '../shared.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-games',
  templateUrl: './games.component.html',
  styleUrl: './games.component.css'
})
export class GamesComponent {

    community_list : any;
    community_id : any;
    community_game_list : any;
    community_current_game_list : any;
    community_previous_game_list : any;
    page : number = 1;
    total_pages : number = 1;

    constructor(public authService : AuthService,
                public webService : WebService,
                public sharedService : SharedService,
                public route : ActivatedRoute,
                public router : Router) {}

    ngOnInit()
    {
        this.route.paramMap.subscribe(params =>
        {
            this.community_id = params.get('id');
            console.log(this.community_id);
        });

        if(sessionStorage['page'])
        {
            this.page = Number(sessionStorage['page']);
        }

        this.community_game_list = this.webService.getCommunityGames(this.community_id, this.page);
        this.webService.getCountOfAllCommunityGames(this.community_id).subscribe((data: any) =>
        {
            const count_of_games = parseInt(data);
            this.total_pages = Math.ceil(count_of_games / 12);
        });
    }

    getCommunityGames()
    {
        this.community_game_list = this.webService.getAllCommunityGames(this.community_id);
    }

    onAddGame()
    {
        this.sharedService.showAddGameDialog(this.community_id);
        this.sharedService.game_added.subscribe(() =>
        {
            this.community_game_list = this.webService.getAllCommunityGames(this.community_id);
        });
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
}
