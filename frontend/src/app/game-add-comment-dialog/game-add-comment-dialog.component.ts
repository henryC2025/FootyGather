import { Component, Inject } from '@angular/core';
import { WebService } from '../web.service';
import { AuthService } from '@auth0/auth0-angular';
import { SharedService } from '../shared.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-game-add-comment-dialog',
  templateUrl: './game-add-comment-dialog.component.html',
  styleUrl: './game-add-comment-dialog.component.css'
})
export class GameAddCommentDialogComponent
{
    user : any;
    comment_form : any;
    community_id : any;
    game_id : any;

    constructor(public authService : AuthService,
                public webService : WebService,
                public sharedService : SharedService,
                public router : Router,
                public route : ActivatedRoute,
                @Inject(MAT_DIALOG_DATA) public data : any,
                private fb : FormBuilder,
                public dialogRef : MatDialogRef<GameAddCommentDialogComponent>)
                {
                    this.comment_form = this.fb.group(
                    {
                        comment_content: ['', Validators.required],
                    })
                }
    ngOnInit()
    {
        this.game_id = this.data.game_id;
    }

    public onClose()
    {
        this.dialogRef.close();
    }

    public onClearComment()
    {
        this.comment_form.patchValue(
        {
            comment_content: "",
        });
    }

    public onSubmit()
    {
        if(this.comment_form.valid)
        {
            this.submitComment();
        }
        else
        {
            this.handleFormValidationErrors();
        }
    }

    private submitComment()
    {
        this.authService.user$.subscribe(user =>
        {
            this.user = user;
            const comment_data =
            {
                comment_oauth_id : user?.sub,
                comment_description : this.comment_form.get('comment_content')?.value,
                comment_user : user?.nickname,
            }

            this.authService.isAuthenticated$.subscribe(
            {
                next : (response : any) =>
                {
                    if(response === false)
                    {
                        this.sharedService.showNotification("Please sign in to access add a comment.", "error");
                        this.onClose();
                        return;
                    }

                    this.webService.addGameComment(this.game_id, comment_data).subscribe(
                    {
                        next : (response : any) =>
                        {
                            console.log(response);
                        },
                        error : () =>
                        {
                            this.sharedService.showNotification("Something went wrong!", "error");
                        },
                        complete: () =>
                        {
                            this.sharedService.showNotification("Comment added", "success");
                            this.onClose();
                            this.sharedService.game_comments_updated.next();
                        }
                    })
                }
            });
        });
    }

    private handleFormValidationErrors()
    {
        if(this.comment_form.get('comment_content')?.hasError('required'))
        {
            this.sharedService.showNotification("Please enter comment.", "error");
        }
    }
}
