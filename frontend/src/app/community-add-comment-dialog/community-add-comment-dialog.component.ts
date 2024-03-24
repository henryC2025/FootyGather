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
export class CommunityAddCommentDialogComponent {

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
                            //  Update comments list
                        }
                    })
                }
            });
        });
    }

    // private handleFormValidationErrors()
    // {
    //     if(this.community_form.get('community_name')?.hasError('required'))
    //     {
    //         this.sharedService.showNotification("Please enter the community name.", "error");
    //     }

    //     if(this.community_form.get('community_description')?.hasError('required'))
    //     {
    //         this.sharedService.showNotification("Please enter the community description.", "error");
    //     }

    //     if(this.community_form.get('community_rules')?.hasError('required'))
    //     {
    //         this.sharedService.showNotification("Please enter the rules for the community.", "error");
    //     }

    //     if(this.community_form.get('community_location')?.hasError('required'))
    //     {
    //         this.sharedService.showNotification("Please enter community location.", "error");
    //     }

    //     if(this.community_form.get('community_image')?.hasError('required'))
    //     {
    //         this.sharedService.showNotification("Please add an image for the community.", "error");
    //     }
    // }
}
