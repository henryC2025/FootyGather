import { Component } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { SharedService } from '../shared.service';
import { WebService } from '../web.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})

export class ProfileComponent {

    constructor(public authService : AuthService,
                public webService : WebService,
                public sharedService : SharedService,
                public router : Router) {}

    selected_current_sort_option: string = "default";
    selected_previous_sort_option: string = "default";
    user_current_games_list : any;
    user_previous_games_list : any;
    current_games_page : number = 1;
    previous_games_page : number = 1;
    current_games_total_pages : number = 1;
    previous_games_total_pages : number = 1;
    user : any;
    user_details : any = [];
    player_communities : any = [];

    ngOnInit()
    {
        this.authService.user$.subscribe(user =>
        {
            this.user = user;
            this.authService.isAuthenticated$.subscribe(
            {
                next : (response : any) =>
                {
                    if(response === false)
                    {
                        this.sharedService.showNotification("Please sign in to access the profile page.", "error");
                        this.router.navigate(['/']);
                    }

                    if(this.user)
                    {
                        const form_data =
                        {
                            oauth_id : this.user?.sub,
                        }
                        this.webService.getUserDetails(form_data).subscribe(
                        {
                            next : (data : any) =>
                            {
                                this.user_details = data;
                                this.getPlayerGames(this.user_details._id);
                                this.initProfile();
                            }
                        })
                    }
                }
            });
        });
    }

    initProfile()
    {
        if(sessionStorage['user_current_games_page'])
        {
            this.current_games_page = Number(sessionStorage['user_current_games_page']);
        }
        if(sessionStorage['user_previous_games_page'])
        {
            this.previous_games_page = Number(sessionStorage['user_previous_games_page']);
        }
        this.user_current_games_list = this.webService.getSortedPlayerCurrentGames(
            this.user_details._id, "closest_date", this.current_games_page);
        this.user_previous_games_list = this.webService.getSortedPlayerPreviousGames(
            this.user_details._id, "closest_date", this.previous_games_page);
        this.getPaginationSize();
        this.player_communities = this.webService.getPlayerCommunities(this.user_details._id);
        console.log(this.player_communities)
    }

    getPaginationSize()
    {
        this.webService.getPlayerCurrentGamesCount(this.user_details._id).subscribe(
        {
            next : (data: any) =>
            {
                if(data)
                {
                    const count_of_games = parseInt(data.current_games_count);
                    this.current_games_total_pages = Math.ceil(count_of_games / 5);
                }
            },
            error : (error) =>
            {
                console.error('Error fetching game count:', error)
            }
        });
    
        this.webService.getPlayerPreviousGamesCount(this.user_details._id).subscribe(
        {
            next : (data: any) =>
            {
                if(data)
                {
                    const count_of_games = parseInt(data.previous_games_count);
                    this.previous_games_total_pages = Math.ceil(count_of_games / 5);
                }
            },
            error : (error) =>
            {
                console.error('Error fetching game count:', error)
            }
        });
    }

    getPlayerGames(user_id : any)
    {
        this.user_current_games_list = this.webService.getCurrentGamesOfPlayer(user_id);
        this.user_previous_games_list = this.webService.getPreviousGamesOfPlayer(user_id);
    }

    onUpdateUserDetails()
    {
        this.sharedService.showUpdateUserDetailsDialog();
    }

    onDeleteUser(oauth_id : any, image_id : any, image_path : any)
    {
        const prompt = window.confirm("Are you sure you want to delete your user details?");
        if(prompt)
        {
            this.webService.deleteProfileImage(image_id, image_path).subscribe(
            {
                next : () =>
                {
                    this.webService.deleteUser(oauth_id).subscribe(
                    {
                        next : () =>
                        {
                            this.authService.logout();
                            this.router.navigate(['/']);
                        },
                        error : () =>
                        {
                            this.sharedService.showNotification("Something went wrong when deleting user!", "error");
                        }
                    })
                },
                error : () =>
                {
                    this.sharedService.showNotification("Something went wrong when deleting user image!", "error");
                }
            })
        }
    }

    firstGamesPage(game_status : any)
    {
        if(game_status === "current")
        {
            if(this.current_games_page > 1)
            {
                this.current_games_page = 1;
                sessionStorage['user_current_games_page'] = this.current_games_page;
                this.user_current_games_list = this.webService.getSortedPlayerCurrentGames(
                    this.user_details._id, this.selected_current_sort_option, this.current_games_page);
            }
        }
        else
        {
            if(this.previous_games_page > 1)
            {
                this.previous_games_page = 1;
                sessionStorage['user_previous_games_page'] = this.previous_games_page;
                this.user_previous_games_list = this.webService.getSortedPlayerPreviousGames(
                    this.user_details._id, this.selected_previous_sort_option, this.current_games_page);
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
                sessionStorage['user_current_games_page'] = this.current_games_page;
                this.user_current_games_list = this.webService.getSortedPlayerCurrentGames(
                    this.user_details._id, this.selected_current_sort_option, this.current_games_page);
            }
        }
        else
        {
            if(this.previous_games_page < this.previous_games_total_pages)
            {
                this.previous_games_page = this.previous_games_total_pages;
                sessionStorage['user_previous_games_page'] = this.previous_games_page;
                this.user_previous_games_list = this.webService.getSortedPlayerPreviousGames(
                    this.user_details._id, this.selected_previous_sort_option, this.current_games_page);
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
                sessionStorage['user_current_games_page'] = this.current_games_page;
                this.user_current_games_list = this.webService.getSortedPlayerCurrentGames(
                    this.user_details._id, this.selected_current_sort_option, this.current_games_page);
            }
        }
        else
        {
            if(this.previous_games_page > 1)
            {
                this.previous_games_page = this.previous_games_page - 1;
                sessionStorage['user_previous_games_page'] = this.previous_games_page;
                this.user_previous_games_list = this.webService.getSortedPlayerPreviousGames(
                    this.user_details._id, this.selected_previous_sort_option, this.current_games_page);
            }
        }
    }

    nextGamesPage(game_status : any)
    {
        if(game_status === "current")
        {
            this.current_games_page = this.current_games_page + 1;
            sessionStorage['user_current_games_page'] = this.current_games_page;
            this.user_current_games_list = this.webService.getSortedPlayerCurrentGames(
                this.user_details._id, this.selected_current_sort_option, this.current_games_page);
        }
        else
        {
            this.previous_games_page = this.previous_games_page + 1;
            sessionStorage['user_previous_games_page'] = this.previous_games_page;
            this.user_previous_games_list = this.webService.getSortedPlayerPreviousGames(
                this.user_details._id, this.selected_previous_sort_option, this.current_games_page);
        }
    }

    goToGamesPage(game_status : any, page_num: number) 
    {
        if(game_status === "current")
        {
            this.current_games_page = page_num;
            sessionStorage['user_current_games_page'] = this.current_games_page;
            this.user_current_games_list = this.webService.getSortedPlayerCurrentGames(
                this.user_details._id, this.selected_current_sort_option, this.current_games_page);
        }
        else
        {
            this.previous_games_page = page_num;
            sessionStorage['user_previous_games_page'] = this.previous_games_page;
            this.user_previous_games_list = this.webService.getSortedPlayerPreviousGames(
                this.user_details._id, this.selected_previous_sort_option, this.current_games_page);
        }
    }

    onSortCurrentGamesChange()
    {
        if (this.selected_current_sort_option === 'closest_date')
        {
            this.user_current_games_list = this.webService.getSortedPlayerCurrentGames(
                this.user_details._id, "closest_date", this.current_games_page);
        }
        else if (this.selected_current_sort_option === 'furthest_date')
        {
            this.user_current_games_list = this.webService.getSortedPlayerCurrentGames(
                this.user_details._id, "furthest_date", this.current_games_page);
        }
        else if (this.selected_current_sort_option === 'default')
        {
            this.user_current_games_list = this.webService.getSortedPlayerCurrentGames(
                this.user_details._id, "closest_date", this.current_games_page);
        }
    }

    onSortPreviousGamesChange()
    {
        if (this.selected_previous_sort_option === 'closest_date')
        {
            this.user_previous_games_list = this.webService.getSortedPlayerPreviousGames(
                this.user_details._id, "closest_date", this.previous_games_page);
        }
        else if (this.selected_previous_sort_option === 'furthest_date')
        {
            this.user_previous_games_list = this.webService.getSortedPlayerPreviousGames(
                this.user_details._id, "furthest_date", this.previous_games_page);
        }
        else if (this.selected_previous_sort_option === 'default')
        {
            this.user_previous_games_list = this.webService.getSortedPlayerPreviousGames(
                this.user_details._id, "closest_date", this.previous_games_page);
        }
    }
}
