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
    community_current_games_list : any;
    community_previous_games_list : any;
    current_games_page : number = 1;
    previous_games_page : number = 1;
    current_games_total_pages : number = 1;
    previous_games_total_pages : number = 1;

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
        });

        if(sessionStorage['current_games_page'])
        {
            this.current_games_page = Number(sessionStorage['current_games_page']);
        }
        if(sessionStorage['previous_games_page'])
        {
            this.previous_games_page = Number(sessionStorage['previous_games_page']);
        }

        this.community_current_games_list = this.webService.getCurrentCommunityGames(this.community_id, this.current_games_page);
        this.community_previous_games_list = this.webService.getPreviousCommunityGames(this.community_id, this.previous_games_page);
        this.getPaginationSize();
    }

    getPaginationSize()
    {
        this.webService.getCountOfCurrentCommunityGames(this.community_id).subscribe(
        {
            next : (data: any) =>
            {
                if(data)
                {
                    const count_of_games = parseInt(data.count);
                    this.current_games_total_pages = Math.ceil(count_of_games / 5);
                }
            },
            error : (error) =>
            {
                console.error('Error fetching game count:', error)
            }
        });
    
        this.webService.getCountOfPreviousCommunityGames(this.community_id).subscribe(
        {
            next : (data: any) =>
            {
                if(data)
                {
                    const count_of_games = parseInt(data.count);
                    this.previous_games_total_pages = Math.ceil(count_of_games / 5);
                }
            },
            error : (error) =>
            {
                console.error('Error fetching game count:', error)
            }
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

    firstGamesPage(game_status : any)
    {
        if(game_status === "current")
        {
            if(this.current_games_page > 1)
            {
                this.current_games_page = 1;
                sessionStorage['current_games_page'] = this.current_games_page;
                this.community_current_games_list = this.webService.getCurrentCommunityGames(this.community_id, this.current_games_page);
            }
        }
        else
        {
            if(this.previous_games_page > 1)
            {
                this.previous_games_page = 1;
                sessionStorage['previous_games_page'] = this.previous_games_page;
                this.community_current_games_list = this.webService.getPreviousCommunityGames(this.community_id, this.previous_games_page);
            }
        }
    }

    lastGamesPage(game_status : any)
    {
        if(game_status === "current")
        {
            if(this.current_games_page < this.current_games_total_pages)
            {
                this.current_games_page = this.current_games_total_pages;
                sessionStorage['current_games_page'] = this.current_games_page;
                this.community_current_games_list = this.webService.getCurrentCommunityGames(this.community_id, this.current_games_page);
            }
        }
        else
        {
            if(this.previous_games_page < this.previous_games_total_pages)
            {
                this.previous_games_page = this.previous_games_total_pages;
                sessionStorage['previous_games_page'] = this.previous_games_page;
                this.community_previous_games_list = this.webService.getPreviousCommunityGames(this.community_id, this.previous_games_page);
            }
        }
    }

    previousGamesPage(game_status : any)
    {
        if(game_status === "current")
        {
            if(this.current_games_page > 1)
            {
                this.current_games_page = this.current_games_page - 1;
                sessionStorage['current_games_page'] = this.current_games_page;
                this.community_current_games_list = this.webService.getCurrentCommunityGames(this.community_id, this.current_games_page);
            }
        }
        else
        {
            if(this.previous_games_page > 1)
            {
                this.previous_games_page = this.previous_games_page - 1;
                sessionStorage['previous_games_page'] = this.previous_games_page;
                this.community_previous_games_list = this.webService.getPreviousCommunityGames(this.community_id, this.previous_games_page);
            }
        }
    }

    nextGamesPage(game_status : any)
    {
        if(game_status === "current")
        {
            this.current_games_page = this.current_games_page + 1;
            sessionStorage['current_games_page'] = this.current_games_page;
            this.community_current_games_list = this.webService.getCurrentCommunityGames(this.community_id, this.current_games_page);
        }
        else
        {
            this.previous_games_page = this.previous_games_page + 1;
            sessionStorage['previous_games_page'] = this.previous_games_page;
            this.community_previous_games_list = this.webService.getPreviousCommunityGames(this.community_id, this.previous_games_page);
        }
    }

    goToGamesPage(game_status : any, page_num: number) 
    {
        if(game_status === "current")
        {
            this.current_games_page = page_num;
            sessionStorage['current_games_page'] = this.current_games_page;
            this.community_current_games_list = this.webService.getCurrentCommunityGames(this.community_id, this.current_games_page);
        }
        else
        {
            this.previous_games_page = page_num;
            sessionStorage['previous_games_page'] = this.previous_games_page;
            this.community_previous_games_list = this.webService.getPreviousCommunityGames(this.community_id, this.previous_games_page);
        }
    }
}
