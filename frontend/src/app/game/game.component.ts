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
export class GameComponent
{
    game_id : any;
    game_details : any = [];
    game_status : any;
    user_details : any;
    community_id : any;
    comments_list : any;
    selected_sort_option: string = "default";
    user : any;
    player_list : any = [];
    player_count : any;
    is_player_in_community : any;
    is_joined : any = false;
    is_admin : any = false;
    is_creator : any = false;
    game_date : any;
    game_time : any;
    game_email_url : any;
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
            this.game_email_url = `http://localhost:4200/games/${this.game_id}`
        });

        this.initGame();
    }
    
    initGame()
    {
        this.getGameDetails();
        this.getUserDetails();
        this.getPlayerList();
        this.getPlayerCount();
        this.checkIsPlayerJoined();
        this.checkGameDetails();
        this.getGameComments();
    }

    getGameComments()
    {
        this.comments_list = this.webService.getSortedGameComments(this.game_id, "newest");
    }

    getGameDetails()
    {
        if(this.game_id)
        {
            this.game_details = this.webService.getGameById(this.game_id);
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
            error : (error) =>
            {
                console.log("An error occured retrieving game player count: ", error);
            }
        })
    }

    checkIsPlayerJoined()
    {
        this.webService.getGamePlayerList(this.game_id).subscribe(
        {
            next: (playerList: any) =>
            {
                this.is_joined = playerList.some((player : any) => player.oauth_id === this.user?.sub);
                console.log('Is User In Player List:', this.is_joined);
            },
            error: (error) =>
            {
                console.error('Error fetching player list:', error);
                this.is_joined = false;
            }
        });
    }

    checkGameDetails()
    {
        this.webService.getGameById(this.game_id).subscribe(
        {
            next: (data: any) =>
            {
                this.community_id = data[0].community.community_id;
                this.game_status = (data[0].status);
                this.game_date = data[0].date;
                this.game_time = data[0].time;
                if(this.user)
                {
                    this.is_creator = (data[0].creator.oauth_id == this.user?.sub)
                }
            },
            error: (error) =>
            {
                console.log("An error occured checking game details: ", error);
            }
        });
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
                                this.is_admin = (data.is_admin == "true");
                            }
                        })
                    }
                },
                error : (error) =>
                {
                    console.log("An error occured getting ser details: ", error);
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
                    next : () =>
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
                            console.log(error);
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

    onDeleteGame()
    {
        if(this.is_admin || this.is_creator)
        {
            const prompt = window.confirm("Are you sure you want to delete this game?");
            if(prompt)
            {
                this.webService.deleteGame(this.game_id).subscribe(
                {
                    complete : () =>
                    {
                        this.sharedService.showNotification("Game deleted", "success");
                        this.router.navigate([`/communities/${this.community_id}/games`]);
                    },
                    error : (error) =>
                    {
                        this.sharedService.showNotification("An error occured when attempting to delete a game!", "error");
                        console.log(error);
                    }
                })
            }
        }
        else
        {
            this.sharedService.showNotification("You must be an admin or creator of the game!", "error");
        }
    }

    onUpdateGame()
    {
        this.sharedService.showUpdateGameDialog(this.game_id);
        this.sharedService.game_updated.subscribe(() =>
        {
            this.initGame();
        });
    }

    onAddGameComment()
    {
        if(this.is_joined || this.is_creator)
        {
            this.sharedService.showAddGameCommentDialog(this.game_id);
            this.sharedService.game_comments_updated.subscribe(() =>
            {
                this.comments_list = this.webService.getSortedGameComments(this.game_id, "newest");
            });
        }
        else
        {
            this.sharedService.showNotification("Please join the game to enter a comment", "error");
        }
    }

    onDeleteGameComment(comment_id : any)
    {
        const prompt = window.confirm("Are you sure you to delete this comment?");
        if(prompt)
        {
            this.webService.deleteGameComment(this.game_id, comment_id).subscribe(
            {
                next : () =>
                {
                    this.comments_list = this.webService.getAllGameComments(this.game_id);
                    this.sharedService.showNotification("Game comment deleted", "success");
                },
                error : (error) =>
                {
                    console.log(error);
                    this.sharedService.showNotification("An error occured deleting game comment", "error");
                }
            })
        }
    }

    onFinishGame()
    {
        const prompt = window.confirm("Are you sure you want to finish this game (this can't be reverted)?");
        if (!prompt)
        {
            return;
        }
    
        const update_data =
        {
            'status': 'previous'
        };
        this.webService.updateGameStatus(this.game_id, update_data).subscribe(
        {
            next: () =>
            {
                this.webService.moveCurrentToPreviousGames(this.community_id, this.game_id).subscribe(
                {
                    next: () =>
                    {
                        this.sharedService.showNotification("Game has been moved to previous games", "success");
                        this.router.navigate([`/communities/${this.community_id}/games`]);
                    },
                    error: error =>
                    {
                        console.error(error);
                        this.sharedService.showNotification("An error occurred while moving the game to previous games!", "error");
                    }
                });
            },
            error: error =>
            {
                console.error(error);
                this.sharedService.showNotification("An error occurred updating the game status!", "error");
            }
        });
    }

    onSortCommentChange()
    {
        if (this.selected_sort_option === 'newest')
        {
            this.comments_list = this.webService.getSortedGameComments(this.game_id, "newest");
        }
        else if (this.selected_sort_option === 'oldest')
        {
            this.comments_list = this.webService.getSortedGameComments(this.game_id, "oldest");
        }
        else if (this.selected_sort_option === 'default')
        {
            this.comments_list = this.webService.getSortedGameComments(this.game_id, "newest");
        }
    }
    
    onRemovePlayer(user_id : any)
    {
        const prompt = window.confirm("Are you sure you want to remove this player?");
        if(prompt)
        {
            const user_data =
            {
                user_id : user_id
            }
            this.webService.removePlayerFromGame(this.game_id, user_data).subscribe(
            {
                complete : () =>
                {
                    this.sharedService.showNotification("Player has been removed from the game", "success");
                    this.initGame();
                },
                error : (error) =>
                {
                    console.log(error);
                    this.sharedService.showNotification("An error occured when removing player!", "error");
                }
            })
        }
    }

    onSendEmailToPlayers()
    {
        const prompt = window.confirm("Click OK to send an email to remind players of the game");
        if (prompt)
        {
            this.webService.getEligiblePlayersFromGame(this.game_id).subscribe(
            {
                next: (players : any) =>
                {
                    console.log(players)
                    this.prepareEmailToPlayers(players);
                },
                error: (error) =>
                {
                    console.error('Failed to load players', error);
                }
            })
        }
    }

    prepareEmailToPlayers(players: any[])
    {
        const emailData =
        {
            recipients: players.map(player => (
            {
                Email: player.email,
                Name: player.name
            })),
            game_url: this.game_email_url,
            game_date: this.game_date,
            game_time: this.game_time,
            subject: "Reminder: Upcoming Game!",
            message: "Don't forget about the upcoming game. Be ready!"
        };

        this.webService.sendEmailToPlayers(emailData).subscribe(
        {
            next: (response) =>
            {
                console.log(response)
                console.log('Email sent successfully');
            },
            error: (error) =>
            {
                console.error('Error sending email', error);
            },
            complete: () =>
            {
                console.log('Email sending process completed');
            }
        });
    }
}
