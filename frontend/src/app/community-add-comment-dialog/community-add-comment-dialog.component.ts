import { Component, Inject } from '@angular/core';
import { WebService } from '../web.service';
import { AuthService } from '@auth0/auth0-angular';
import { SharedService } from '../shared.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-community-add-comment-dialog',
  templateUrl: './community-add-comment-dialog.component.html',
  styleUrl: './community-add-comment-dialog.component.css'
})
export class CommunityAddCommentDialogComponent
{
    user : any;
    comment_form : any;
    community_id : any;

    constructor(public authService : AuthService,
                public webService : WebService,
                public sharedService : SharedService,
                public router : Router,
                public route : ActivatedRoute,
                @Inject(MAT_DIALOG_DATA) public data : any,
                private fb : FormBuilder,
                public dialogRef : MatDialogRef<CommunityAddCommentDialogComponent>)
                {
                    this.comment_form = this.fb.group(
                    {
                        comment_content: ['', Validators.required],
                    })
                }
    ngOnInit()
    {
        this.community_id = this.data.community_id;
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

                    this.webService.addCommunityComment(this.community_id, comment_data).subscribe(
                    {
                        error : (error) =>
                        {
                            this.sharedService.showNotification("Something when attempting to add a comment!", "error");
                            console.log(error);
                        },
                        complete: () =>
                        {
                            this.sharedService.showNotification("Comment has been successfully added", "success");
                            this.onClose();
                            this.sharedService.community_comments_updated.next();
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
