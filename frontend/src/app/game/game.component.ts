import { Component } from '@angular/core';
import { WebService } from '../web.service';
import { AuthService } from '@auth0/auth0-angular';
import { SharedService } from '../shared.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrl: './game.component.css'
})
export class GameComponent {

    game_id : any;
    game_details : any = [];
    user_details : any;
    user : any;
    player_list : any = [];
    player_count : any;
    is_joined : any = false;
    constructor(public authService : AuthService,
                public webService : WebService,
                public sharedService : SharedService,
                public route : ActivatedRoute,
                public router : Router) {}

    ngOnInit()
    {
        this.route.paramMap.subscribe(params =>
        {
            this.game_id = params.get('id');
        });

        this.initGame();
    }
    
    initGame()
    {
        this.getGameDetails()
        this.getUserDetails();
        this.getPlayerList();
        this.getPlayerCount();
    }

    getGameDetails()
    {
        if(this.game_id)
        {
            this.game_details = this.webService.getGameById(this.game_id);
            console.log(this.game_details)
        }
    }

    getPlayerCount()
    {
        this.webService.getGamePlayerCount(this.game_id).subscribe(
        {
            next : (data : any) =>
            {
                this.player_count = data.player_count;
            },
            error : () =>
            {
                console.log("An error occured retrieving game player count!");
            }
        })
    }

    getPlayerList()
    {
        this.player_list = this.webService.getGamePlayerList(this.game_id);
    }

    getUserDetails()
    {
        this.authService.user$.subscribe(user =>
        {
            this.authService.isAuthenticated$.subscribe(
            {
                next : () =>
                {
                    this.user = user;
                    const userDetails =
                    {
                        oauth_id: user?.sub,
                    };

                    if(this.user)
                    {
                        this.webService.getUserDetails(userDetails).subscribe(
                        {
                            next : (data : any) =>
                            {
                                this.user_details = data;
                            }
                        })
                    }
                }
            });
        });
    }

    onJoinGame()
    {
        if(this.user)
        {
            const prompt = window.confirm("Are you sure you want to join this game?");
            if(prompt)
            {
                const data =
                {
                    "user_id": this.user_details?._id,
                    "first_name" : this.user_details?.first_name,
                    "last_name" : this.user_details?.last_name,
                    "user_oauth_id": this.user?.sub,
                    "user_name": this.user?.nickname,
                    "email": this.user?.email
                }
                this.webService.joinGame(this.game_id, data).subscribe(
                {
                    next : (data : any) =>
                    {
                        this.sharedService.showNotification("You have joined the game.", "success");
                    },
                    error: (error) =>
                    {    
                        if(error.status === 409)
                        {
                            this.sharedService.showNotification("You are already part of this game.", "error");
                        }
                        else if(error.status === 403)
                        {
                            this.sharedService.showNotification("User is not a member of the community.", "error");
                        }
                        else if(error.status === 422)
                        {
                            this.sharedService.showNotification("The game is full.", "error");
                        }
                        else
                        {
                            this.sharedService.showNotification("Failed to join the game. Please try again later.", "error");
                        }
                    },
                    complete : () =>
                    {
                        this.initGame();
                    }
                })
            }
        }
        else
        {
            this.sharedService.showNotification("Please sign in to join a game!", "error");
        }
    }

    onLeaveGame()
    {
        if(this.user)
        {
            const prompt = window.confirm("Are you sure you want to leave the game?");
            if(prompt)
            {
                const data =
                {
                    "user_oauth_id": this.user?.sub,
                    "user_id": this.user_details?._id,
                    "user_name": this.user?.nickname,
                    "email": this.user?.email
                }
                this.webService.leaveGame(this.game_id, data).subscribe(
                {
                    next : () =>
                    {
                        this.sharedService.showNotification("You have left the game!", "success");
                    },
                    error : (error) =>
                    {
                        if(error.status === 500)
                        {
                            this.sharedService.showNotification("You are already part of this game.", "error");
                        }
                    },
                    complete : () =>
                    {
                        this.initGame();
                    }
                })
            }
        }
        else
        {
            this.sharedService.showNotification("Please sign in to leave a game!", "error");
        }
    }    
    // LEAVE GAME
    // UPDATE GAME
    // DELETE GAME
    // NOTIFICATIONS
}
