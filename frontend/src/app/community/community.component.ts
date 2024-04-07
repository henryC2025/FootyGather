import { Component } from '@angular/core';
import { WebService } from '../web.service';
import { AuthService } from '@auth0/auth0-angular';
import { SharedService } from '../shared.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-community',
  templateUrl: './community.component.html',
  styleUrl: './community.component.css'
})
export class CommunityComponent
{
    selected_sort_option: string = "default";
    community_id : any; 
    community_list : any = [];
    comments_list : any = [];
    user_name : any;
    email : any;
    user_id : any;
    oauth_id : any;
    user : any;
    user_details : any;
    creator_id : any;
    is_creator = false;
    is_admin = false;
    total_players : any;
    player_list : any = [];
    is_player_joined : boolean = false;
    public is_authenticated : boolean = false;

    constructor(public authService : AuthService,
                public webService : WebService,
                public sharedService : SharedService,
                public route : ActivatedRoute,
                public router : Router) {}

    ngOnInit()
    {
        this.initCommunity();

        if(this.authService.user$)
        {
            console.log(this.authService.user$)
            this.authService.user$.subscribe((user: any) =>
            {
                this.oauth_id = user?.sub;
                this.user = user;

                const userDetails =
                {
                    oauth_id: user?.sub,
                };

                if(this.oauth_id && this.user)
                {
                    this.is_authenticated = true;
                    this.webService.getUserDetails(userDetails).subscribe((data: any) =>
                    {
                        this.user_details = data;
                        this.is_admin = (data.is_admin == "true");
                        console.log("Is admin: ", this.is_admin);
                    });
                }
            });
        }
    }

    initCommunity()
    {
        this.community_list = this.webService
            .getCommunityByID(this.route.snapshot.params['id']
        );

        this.getCommunityDetails();

        this.route.paramMap.subscribe(params =>
        {
            this.community_id = params.get('id');
            this.comments_list = this.webService.getSortedCommunityComments(this.community_id, "newest");
        });
    }

    getCommunityDetails()
    {
        this.webService.getCommunityByID(this.route.snapshot.params['id']).subscribe(
        {
            next: (data: any) =>
            {
                console.log(data);
                this.creator_id = data[0].creator_oauth_id;
                this.total_players = data[0].players.length;
                this.player_list = data[0].players;

                const user_oauth_id = this.user?.sub;

                if(this.creator_id === user_oauth_id)
                {
                    this.is_creator = true;
                }
                console.log("is creator: " + this.is_creator)
                if (user_oauth_id)
                {
                    this.is_player_joined = this.player_list.some((player : any) => player.oauth_id === user_oauth_id);
                }
                else
                {
                    this.is_player_joined = false;
                }
            },
            error: () =>
            {
                console.log("Something went wrong retrieving community creator ID!");
            },
            complete: () =>
            {
                console.log(this.is_player_joined)
            }
        });
    }

    onJoinCommunity()
    {
        console.log("TESTING: " + this.is_authenticated)
        if(this.is_authenticated === true)
        {
            console.log(this.is_player_joined);
            if(!this.is_player_joined)
            {
                const prompt = window.confirm("Are you sure you want to join?");
                if(prompt)
                {
                    const data =
                    {
                        user_oauth_id : this.user?.sub,
                        user_id : this.user_details?._id,
                        user_nickname : this.user?.nickname,
                        user_email : this.user?.email
                    }
    
                    if(data)
                    {
                        this.webService.joinCommunity(data, this.route.snapshot.params['id']).subscribe(
                        {
                            next : () =>
                            {
                                console.log("User joined the community");
                                this.initCommunity();
                            },
                            error : () =>
                            {
                                console.log("Something went wrong!");
                            }
                        })
                    }
                }
            }
        }
        else
        {
            this.sharedService.showNotification("Please sign in to join a community", "error");
        }
    }

    onLeaveCommunity()
    {
        if(this.is_player_joined)
        {
            const prompt = window.confirm("Are you sure you want to leave?");
            if(prompt)
            {
                const data =
                {
                    user_oauth_id : this.user?.sub
                }
                console.log(data.user_oauth_id)
                if(data)
                {
                    this.webService.leaveCommunity(data, this.route.snapshot.params['id']).subscribe(
                    {
                        next : () =>
                        {
                            console.log("User has left the community");
                            this.initCommunity();
                        },
                        error : () =>
                        {
                            console.log("An error occured when trying to leave community!");
                        }
                    })
                }
            }
        }
    }

    onRemoveFromCommunity(player_oauth_id : any)
    {
        const prompt = window.confirm("Are you sure you want to remove this player?");
        if(prompt)
        {
            const data =
            {
                user_oauth_id : player_oauth_id
            }
   
            if(data)
            {
                this.webService.leaveCommunity(data, this.route.snapshot.params['id']).subscribe(
                {
                    next : () =>
                    {
                        console.log("User has been removed from the community");
                        this.initCommunity();
                    },
                    error : () =>
                    {
                        console.log("An issue occured when removing player from community!");
                    }
                })
            }
        }
        else
        {
            console.log("left")
        }
    }

    onAddCommunityComment()
    {
        if(this.is_player_joined)
        {
            this.sharedService.showAddCommunityCommentDialog(this.route.snapshot.params['id']);
            this.sharedService.community_comments_updated.subscribe(() =>
            {
                this.comments_list = this.webService.getSortedCommunityComments(this.community_id, "newest");
            });
        }
        else
        {
            this.sharedService.showNotification("Please join the community to enter a comment", "error");
        }
    }

    onDeleteCommunityComment(comment_id : any)
    {
        const prompt = window.confirm("Are you sure you to delete this comment?");
        if(prompt)
        {
            this.webService.deleteCommunityComment(this.community_id, comment_id).subscribe(
            {
                next : () =>
                {
                    this.comments_list = this.webService.getCommunityComments(this.community_id);
                },
                error : () =>
                {
    
                }
            })
        }
    }

    onSortCommentChange()
    {
        if (this.selected_sort_option === 'newest')
        {
            this.comments_list = this.webService.getSortedCommunityComments(this.community_id, "newest");
        }
        else if (this.selected_sort_option === 'oldest')
        {
            this.comments_list = this.webService.getSortedCommunityComments(this.community_id, "oldest");
        }
        else if (this.selected_sort_option === 'default')
        {
            this.comments_list = this.webService.getSortedCommunityComments(this.community_id, "newest");
        }
    }

    onUpdateCommunity()
    {
        this.sharedService.showUpdateCommunityDialog(this.route.snapshot.params['id']);
    }

    onDeleteCommunity(community_id : any, image_id : any, image_path : any)
    {
        if((this.creator_id === this.user?.sub &&
            this.creator_id !== undefined &&
            this.user?.sub !== undefined) || this.is_admin)
        {
            const prompt = window.confirm("Are you sure you want to delete this community?");
    
            if(prompt)
            {
                this.deleteCommunity(community_id, image_id, image_path);
            }
        }
        else
        {
            this.sharedService.showNotification("Only the community creator or admin can delete a community", "error");
        }
    }

    deleteCommunity(community_id : any, image_id : any, image_path : any)
    {
        const url = image_path;
        const parts = url.split('/');
        const image_path_code = parts[parts.length - 1];
        if(image_path !== "FILEPATH")
        {
            this.webService.deleteCommunity(community_id).subscribe(
            {
                next : () =>
                {
                    this.webService.deleteCommunityImage(image_id, image_path_code).subscribe(
                    {
                        error : (error) =>
                        {
                            this.sharedService.showNotification("An error occured when deleting community", "error");
                            console.log(error);
                        },
                        complete : () =>
                        {
                            console.log("Community deleted!")
                            this.router.navigate(['/communities']);
                            this.sharedService.showNotification("Community deleted", "success");
                        }
                    })
                },
                error : (error) =>
                {
                    this.sharedService.showNotification("An error occured when deleting community", "error");
                    console.log(error);
                }
            })
        }
        else
        {
            console.log("Community deleted!")
            this.router.navigate(['/communities']);
            this.sharedService.showNotification("Community deleted", "success");
        }
    }
}
